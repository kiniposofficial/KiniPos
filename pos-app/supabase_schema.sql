-- ========================================================
-- KINIPOS MICRO DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Salin dan Jalankan skrip ini di SQL Editor Supabase Anda
-- ========================================================

-- 1. TABEL PRODUK / MENU
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'Lainnya',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL RIWAYAT TRANSAKSI
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total NUMERIC NOT NULL DEFAULT 0,
  cost_total NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  pay_method TEXT DEFAULT 'CASH', -- 'CASH' | 'QRIS'
  paid NUMERIC DEFAULT 0,
  change NUMERIC DEFAULT 0,
  wa_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS) demi keamanan data antar pedagang
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- POLICY UNTUK PRODUK
CREATE POLICY "Pedagang hanya bisa akses produk milik sendiri" 
ON public.products FOR ALL 
USING (auth.uid() = user_id);

-- POLICY UNTUK TRANSAKSI
CREATE POLICY "Pedagang hanya bisa akses transaksi milik sendiri" 
ON public.transactions FOR ALL 
USING (auth.uid() = user_id);
