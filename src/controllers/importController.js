import xlsx from 'xlsx';
import { supabase } from '../config/supabase.js';
import { validateProduct } from '../validators/productValidator.js';

export const importExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(worksheet);

  const products = [];
  const errors = [];

  for (const row of data) {
    try {
      const { error, value } = validateProduct({
        name: row.name,
        brand: row.brand,
        model: row.model,
        imei: row.imei,
        quantity: parseInt(row.quantity),
        price: parseFloat(row.price)
      });

      if (error) {
        errors.push({ row, error: error.details });
        continue;
      }

      products.push({ ...value, user_id: req.user.uid });
    } catch (error) {
      errors.push({ row, error: error.message });
    }
  }

  if (products.length > 0) {
    const { data: insertedProducts, error } = await supabase
      .from('products')
      .insert(products)
      .select();

    if (error) throw error;

    res.json({
      success: true,
      imported: insertedProducts.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'No valid products found in the Excel file',
      errors
    });
  }
};