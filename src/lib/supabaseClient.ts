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

// Create Supabase client with safety check
const config = getSupabaseConfig();
const supabaseUrl = config.url && config.url.startsWith('http') ? config.url : 'https://placeholder-project.supabase.co';
const supabaseKey = config.key || 'placeholder-key';

if (!config.url || !config.key) {
  console.warn('Supabase configuration missing or invalid! Using placeholder client.');
} else {
  console.log('Supabase client initialized successfully');
}

let supabaseInstance;
try {
  supabaseInstance = createClient(supabaseUrl, supabaseKey);
} catch (e) {
  console.error('Failed to create Supabase client:', e);
  // Fallback to minimal placeholder to prevent module crash
  supabaseInstance = {
    channel: () => ({ 
      on: () => ({ 
        on: () => ({ 
          subscribe: () => ({}) 
        }) 
      }),
      subscribe: () => ({})
    }),
    from: () => ({ select: () => ({ data: [], error: null }) })
  } as any;
}

export const supabase = supabaseInstance;

// Export config for debugging
export { getSupabaseConfig };
