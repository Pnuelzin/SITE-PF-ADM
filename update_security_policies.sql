-- SECURITY UPDATE: Row Level Security (RLS) Policies
-- These policies ensure that only authorized admins can manage the database,
-- while customers can only view products and place orders.

-- 1. Reset existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read categories" ON categories;
DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow public read delivery_areas" ON delivery_areas;
DROP POLICY IF EXISTS "Allow public insert orders" ON orders;
DROP POLICY IF EXISTS "Allow public insert order_items" ON order_items;
DROP POLICY IF EXISTS "Allow all categories" ON categories;
DROP POLICY IF EXISTS "Allow all products" ON products;
DROP POLICY IF EXISTS "Allow all orders" ON orders;
DROP POLICY IF EXISTS "Allow all order_items" ON order_items;
DROP POLICY IF EXISTS "Allow all delivery_areas" ON delivery_areas;

-- 2. PUBLIC POLICIES (Everyone can see products and buy)
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (available = true);
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Items" ON order_items FOR INSERT WITH CHECK (true);

-- 3. ADMIN POLICIES (Only logged-in users can manage data)
-- Use auth.role() = 'authenticated' to check if user is logged in via Supabase Auth
CREATE POLICY "Admin Categories" ON categories 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Products" ON products 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Orders" ON orders 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin Order Items" ON order_items 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. STORAGE SECURITY (Product Images)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Deletes" ON storage.objects;

-- Everyone can see images
CREATE POLICY "Public Read Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- Only authenticated admins can upload images
CREATE POLICY "Admin Upload Images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');

-- Only authenticated admins can update images
CREATE POLICY "Admin Update Images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'products');

-- Only authenticated admins can delete images
CREATE POLICY "Admin Delete Images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'products');
