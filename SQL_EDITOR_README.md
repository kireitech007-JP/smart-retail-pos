# SQL Editor untuk Supabase

## Overview

SQL Editor adalah aplikasi web yang memungkinkan Anda untuk mengeksekusi query SQL langsung ke database Supabase dengan antarmuka yang user-friendly.

## Fitur

### 🎯 Fitur Utama
- **SQL Editor dengan Syntax Highlighting** - Editor teks dengan highlight sintaks SQL
- **Eksekusi Query Real-time** - Jalankan query SQL langsung ke database Supabase
- **Hasil Query dalam Tabel** - Tampilkan hasil query dalam format tabel yang mudah dibaca
- **Simpan & Load Query** - Simpan query favorit dan muat kembali dengan mudah
- **Import/Export Query** - Backup dan restore query yang tersimpan

### 🔧 Fitur Tambahan
- **Performance Metrics** - Tampilkan waktu eksekusi dan jumlah baris hasil
- **Error Handling** - Pesan error yang informatif untuk debugging
- **Responsive Design** - Bekerja di desktop dan mobile
- **Dark Mode Support** - Mendukung tema gelap/terang

## Cara Setup

### 1. Environment Variables
Pastikan Anda memiliki environment variables berikut di file `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Function
Jalankan SQL function berikut di Supabase SQL Editor:

```sql
-- Function untuk mengeksekusi SQL query secara dinamis
-- HATI-HATI: Function ini memberikan akses penuh ke database
-- Gunakan hanya untuk development dan testing
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS TABLE(result JSON)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    query_result RECORD;
    json_result JSON;
BEGIN
    -- Execute the dynamic SQL query
    FOR query_result IN EXECUTE sql_query LOOP
        -- Convert each row to JSON
        json_result := row_to_json(query_result);
        RETURN NEXT;
    END LOOP;
    
    RETURN;
EXCEPTION WHEN OTHERS THEN
    -- Return error information if query fails
    RETURN NEXT SELECT json_build_object(
        'error', SQLERRM,
        'sqlstate', SQLSTATE
    )::JSON;
END;
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql TO service_role;
```

### 3. Akses SQL Editor
Login dengan role `superadmin` untuk mengakses SQL Editor, atau tambahkan routing kustom di `App.tsx`.

## Cara Penggunaan

### Menulis Query
1. Buka SQL Editor
2. Ketik query SQL di textarea editor
3. Syntax highlighting otomatis akan muncul

### Menjalankan Query
1. Klik tombol "Execute Query" atau tekan Ctrl+Enter
2. Tunggu hasil query muncul di bawah editor
3. Hasil akan ditampilkan dalam format tabel

### Menyimpan Query
1. Ketik nama query di input field
2. Klik tombol "Save"
3. Query akan disimpan di localStorage browser

### Memuat Query Tersimpan
1. Buka tab "Saved Queries"
2. Klik "Load" pada query yang ingin dipakai
3. Query akan dimuat ke editor

### Import/Export Query
- **Export**: Klik tombol "Export" untuk download semua query tersimpan
- **Import**: Klik tombol "Import" dan pilih file JSON query

## Contoh Query

### Basic SELECT
```sql
SELECT * FROM users LIMIT 10;
```

### JOIN Query
```sql
SELECT u.nama, p.nama_produk, dp.harga
FROM users u
JOIN detail_penjualan dp ON u.id = dp.user_id
JOIN produk p ON dp.produk_id = p.id
WHERE u.status = 'active'
ORDER BY dp.tanggal DESC;
```

### Aggregate Functions
```sql
SELECT 
    k.nama as kategori,
    COUNT(p.id) as jumlah_produk,
    AVG(p.harga) as rata_harga
FROM kategori k
LEFT JOIN produk p ON k.id = p.kategori_id
GROUP BY k.id, k.nama
ORDER BY jumlah_produk DESC;
```

### INSERT Data
```sql
INSERT INTO kategori (id, nama) 
VALUES ('cat_001', 'Minuman'), ('cat_002', 'Makanan');
```

### UPDATE Data
```sql
UPDATE produk 
SET harga = harga * 1.1 
WHERE kategori_id = 'cat_001';
```

## Security Notes

⚠️ **PERINGATAN KEAMANAN**

- Function `execute_sql` memberikan akses penuh ke database
- Gunakan hanya untuk environment development/testing
- Jangan gunakan di production environment
- Pastikan hanya user terpercaya yang memiliki akses
- Pertimbangkan untuk membatasi query yang diizinkan

## Troubleshooting

### Error "Function execute_sql does not exist"
- Pastikan Anda sudah menjalankan SQL function setup di Supabase
- Check apakah function memiliki permission yang benar

### Error "Permission denied"
- Pastikan user memiliki role `authenticated` atau `service_role`
- Check function permissions di Supabase

### Query tidak mengembalikan hasil
- Pastikan syntax SQL benar
- Check apakah tabel yang diakses ada
- Verify user memiliki akses ke tabel tersebut

### Performance Issues
- Gunakan LIMIT untuk query SELECT besar
- Hindari query yang terlalu kompleks
- Consider indexing untuk tabel yang sering diquery

## Development

### File Structure
```
src/
├── components/
│   └── database/
│       ├── SqlEditor.tsx          # Main SQL Editor component
│       └── SyntaxHighlighter.tsx   # Syntax highlighting component
├── pages/
│   └── SqlEditorPage.tsx          # SQL Editor page wrapper
└── App.tsx                        # App routing
```

### Customization
- **Syntax Highlighting**: Edit `SyntaxHighlighter.tsx`
- **UI Components**: Edit `SqlEditor.tsx`
- **Routing**: Edit `App.tsx`

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - see LICENSE file for details.
