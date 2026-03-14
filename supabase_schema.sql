-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create delivery_areas table
CREATE TABLE delivery_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_location TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  payment_method TEXT NOT NULL, -- 'pix', 'card', 'cash'
  change_needed NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'delivered', 'cancelled'
  total_price NUMERIC NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert some initial categories
INSERT INTO categories (name, icon) VALUES 
('Bolos', 'Cake'),
('Café', 'Coffee'),
('Pizza', 'Pizza'),
('Doces', 'Candy'),
('Salgados', 'Croissant'),
('Bebidas', 'Beer')
ON CONFLICT (name) DO NOTHING;

-- RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read delivery_areas" ON delivery_areas FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Admin policies
CREATE POLICY "Allow all categories" ON categories USING (true) WITH CHECK (true);
CREATE POLICY "Allow all products" ON products USING (true) WITH CHECK (true);
CREATE POLICY "Allow all orders" ON orders USING (true) WITH CHECK (true);
CREATE POLICY "Allow all order_items" ON order_items USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delivery_areas" ON delivery_areas USING (true) WITH CHECK (true);

-- ==========================================
-- STORAGE SETUP
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Allow Public Uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products');

CREATE POLICY "Allow Public Deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'products');
