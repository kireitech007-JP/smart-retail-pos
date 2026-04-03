-- Supabase Database Setup Script for Smart Retail POS
-- Run this script in Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    error_result JSON;
BEGIN
    -- Execute the dynamic SQL query
    FOR query_result IN EXECUTE sql_query LOOP
        -- Convert each row to JSON
        json_result := row_to_json(query_result);
        RETURN NEXT json_result;
    END LOOP;
    
    RETURN;
EXCEPTION WHEN OTHERS THEN
    -- Return error information if query fails
    error_result := json_build_object(
        'error', SQLERRM,
        'sqlstate', SQLSTATE
    );
    RETURN NEXT error_result;
END;
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;
GRANT EXECUTE ON FUNCTION execute_sql TO service_role;

-- Categories table
CREATE TABLE IF NOT EXISTS kategori (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Units table
CREATE TABLE IF NOT EXISTS satuan (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Units (store locations) table
CREATE TABLE IF NOT EXISTS unit (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  alamat TEXT,
  telepon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS pengguna (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user',
  unit_id TEXT REFERENCES unit(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS produk (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(10,2),
  hpp DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  category_id TEXT REFERENCES kategori(id),
  unit_id TEXT REFERENCES satuan(id),
  supplier TEXT,
  unit_store_id TEXT REFERENCES unit(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transaksi (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  cashier_name TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal DECIMAL(10,2),
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL,
  payment_type TEXT, -- 'cash', 'transfer', 'credit'
  cash_paid DECIMAL(10,2),
  cash_change DECIMAL(10,2),
  dp DECIMAL(10,2) DEFAULT 0,
  unit_id TEXT REFERENCES unit(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaksi_items (
  id TEXT PRIMARY KEY,
  transaksi_id TEXT REFERENCES transaksi(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES produk(id),
  product_name TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit TEXT,
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debts (Piutang) table
CREATE TABLE IF NOT EXISTS piutang (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'unpaid', -- 'unpaid', 'partial', 'paid'
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  unit_id TEXT REFERENCES unit(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cash in table
CREATE TABLE IF NOT EXISTS kas_masuk (
  id TEXT PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  cashier_name TEXT,
  unit_id TEXT REFERENCES unit(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS pengeluaran (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  unit_id TEXT REFERENCES unit(id),
  cashier_id TEXT REFERENCES pengguna(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  cashier_id TEXT REFERENCES pengguna(id),
  unit_id TEXT REFERENCES unit(id),
  opening_time TIMESTAMP WITH TIME ZONE NOT NULL,
  closing_time TIMESTAMP WITH TIME ZONE,
  opening_cash DECIMAL(10,2) DEFAULT 0,
  closing_cash DECIMAL(10,2),
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_cash_in DECIMAL(10,2) DEFAULT 0,
  total_expenses DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table (if needed)
CREATE TABLE IF NOT EXISTS laporan (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  date_from TIMESTAMP WITH TIME ZONE,
  date_to TIMESTAMP WITH TIME ZONE,
  data JSONB, -- Store report data as JSON
  unit_id TEXT REFERENCES unit(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_produk_unit_store ON produk(unit_store_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_unit ON transaksi(unit_id);
CREATE INDEX IF NOT EXISTS idx_transaksi_date ON transaksi(date);
CREATE INDEX IF NOT EXISTS idx_transaksi_items_transaksi_id ON transaksi_items(transaksi_id);
CREATE INDEX IF NOT EXISTS idx_piutang_unit ON piutang(unit_id);
CREATE INDEX IF NOT EXISTS idx_piutang_status ON piutang(status);
CREATE INDEX IF NOT EXISTS idx_kas_masuk_unit ON kas_masuk(unit_id);
CREATE INDEX IF NOT EXISTS idx_pengeluaran_unit ON pengeluaran(unit_id);
CREATE INDEX IF NOT EXISTS idx_sessions_cashier ON sessions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sessions_unit ON sessions(unit_id);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE satuan ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE piutang ENABLE ROW LEVEL SECURITY;
ALTER TABLE kas_masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengeluaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - customize as needed)
-- Categories
CREATE POLICY "Enable all operations on kategori" ON kategori FOR ALL USING (true);

-- Units
CREATE POLICY "Enable all operations on satuan" ON satuan FOR ALL USING (true);

-- Store Units
CREATE POLICY "Enable all operations on unit" ON unit FOR ALL USING (true);

-- Users
CREATE POLICY "Enable all operations on pengguna" ON pengguna FOR ALL USING (true);

-- Products
CREATE POLICY "Enable all operations on produk" ON produk FOR ALL USING (true);

-- Transactions
CREATE POLICY "Enable all operations on transaksi" ON transaksi FOR ALL USING (true);

-- Transaction Items
CREATE POLICY "Enable all operations on transaksi_items" ON transaksi_items FOR ALL USING (true);

-- Debts
CREATE POLICY "Enable all operations on piutang" ON piutang FOR ALL USING (true);

-- Cash In
CREATE POLICY "Enable all operations on kas_masuk" ON kas_masuk FOR ALL USING (true);

-- Expenses
CREATE POLICY "Enable all operations on pengeluaran" ON pengeluaran FOR ALL USING (true);

-- Sessions
CREATE POLICY "Enable all operations on sessions" ON sessions FOR ALL USING (true);

-- Reports
CREATE POLICY "Enable all operations on laporan" ON laporan FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_kategori_updated_at BEFORE UPDATE ON kategori FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_satuan_updated_at BEFORE UPDATE ON satuan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unit_updated_at BEFORE UPDATE ON unit FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pengguna_updated_at BEFORE UPDATE ON pengguna FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produk_updated_at BEFORE UPDATE ON produk FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaksi_updated_at BEFORE UPDATE ON transaksi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transaksi_items_updated_at BEFORE UPDATE ON transaksi_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_piutang_updated_at BEFORE UPDATE ON piutang FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kas_masuk_updated_at BEFORE UPDATE ON kas_masuk FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pengeluaran_updated_at BEFORE UPDATE ON pengeluaran FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_laporan_updated_at BEFORE UPDATE ON laporan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO kategori (id, nama) VALUES 
  ('cat1', 'Makanan'),
  ('cat2', 'Minuman'),
  ('cat3', 'Snack')
ON CONFLICT (id) DO NOTHING;

INSERT INTO satuan (id, nama) VALUES 
  ('sat1', 'Pcs'),
  ('sat2', 'Kg'),
  ('sat3', 'Liter')
ON CONFLICT (id) DO NOTHING;

INSERT INTO unit (id, nama, alamat, telepon) VALUES 
  ('unit1', 'Toko Utama', 'Jl. Merdeka No. 1', '08123456789')
ON CONFLICT (id) DO NOTHING;

COMMIT;
