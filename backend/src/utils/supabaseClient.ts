try {
  const { data, error } = await supabase.from('your_table').select('*').limit(1);
  if (error) {
    console.error('Supabase bağlantı hatası:', error);
  } else {
    console.log('Supabase bağlantısı başarılı:', data);
  }
} catch (err) {
  console.error('Beklenmeyen hata:', err);
} 