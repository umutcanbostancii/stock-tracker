import { supabase } from '../config/supabase.js';
import { validateProduct } from '../validators/productValidator.js';

export const getProducts = async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', req.user.uid);

  if (error) throw error;
  res.json(data);
};

export const getProductById = async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.uid)
    .single();

  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Product not found' });
  
  res.json(data);
};

export const createProduct = async (req, res) => {
  const { error: validationError, value } = validateProduct(req.body);
  if (validationError) throw validationError;

  const { data, error } = await supabase
    .from('products')
    .insert([{ ...value, user_id: req.user.uid }])
    .select()
    .single();

  if (error) throw error;
  res.status(201).json(data);
};

export const updateProduct = async (req, res) => {
  const { error: validationError, value } = validateProduct(req.body);
  if (validationError) throw validationError;

  const { data, error } = await supabase
    .from('products')
    .update(value)
    .eq('id', req.params.id)
    .eq('user_id', req.user.uid)
    .select()
    .single();

  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Product not found' });

  res.json(data);
};

export const deleteProduct = async (req, res) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.uid);

  if (error) throw error;
  res.status(204).send();
};