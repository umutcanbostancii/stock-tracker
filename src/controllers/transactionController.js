import { supabase } from '../config/supabase.js';
import { validateTransaction } from '../validators/transactionValidator.js';
import { updatePlatformStocks } from '../services/platformService.js';

export const getTransactions = async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', req.user.uid);

  if (error) throw error;
  res.json(data);
};

export const createTransaction = async (req, res) => {
  const { error: validationError, value } = validateTransaction(req.body);
  if (validationError) throw validationError;

  // Start a Supabase transaction
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('quantity')
    .eq('id', value.product_id)
    .eq('user_id', req.user.uid)
    .single();

  if (productError) throw productError;
  if (!product) throw new Error('Product not found');

  const newQuantity = value.type === 'stok_giris' 
    ? product.quantity + value.quantity 
    : product.quantity - value.quantity;

  if (newQuantity < 0) {
    throw new Error('Insufficient stock');
  }

  // Create transaction record
  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert([{ ...value, user_id: req.user.uid }])
    .select()
    .single();

  if (transactionError) throw transactionError;

  // Update product quantity
  const { error: updateError } = await supabase
    .from('products')
    .update({ quantity: newQuantity })
    .eq('id', value.product_id)
    .eq('user_id', req.user.uid);

  if (updateError) throw updateError;

  // Update stock on all platforms
  if (value.type !== 'stok_giris') {
    await updatePlatformStocks(value.product_id, newQuantity);
  }

  res.status(201).json(transaction);
};