import { supabase } from '../config/supabase.js';

export const getProducts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', req.user.uid)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.uid)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...req.body, user_id: req.user.uid }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.uid)
      .single();

    if (!existingProduct) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.uid)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { data: existingProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.uid)
      .single();

    if (!existingProduct) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.uid);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 