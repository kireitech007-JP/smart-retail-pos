import { createClient } from '@supabase/supabase-js';

// Fungsi untuk mendapatkan Supabase config
const getSupabaseConfig = () => {
  const storeSettings = localStorage.getItem('storeSettings');
  if (storeSettings) {
    const settings = JSON.parse(storeSettings);
    console.log('Supabase config from localStorage:', {
      url: settings.supabaseUrl ? '***configured***' : 'missing',
      key: settings.supabaseKey ? '***configured***' : 'missing'
    });
    return {
      url: settings.supabaseUrl || '',
      key: settings.supabaseKey || ''
    };
  }
  console.warn('No storeSettings found in localStorage');
  return { url: '', key: '' };
};

// Create Supabase client
const supabaseUrl = getSupabaseConfig().url;
const supabaseKey = getSupabaseConfig().key;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing!');
  console.log('Current localStorage settings:', localStorage.getItem('storeSettings'));
} else {
  console.log('Supabase client initialized successfully');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Export config for debugging
export { getSupabaseConfig };
