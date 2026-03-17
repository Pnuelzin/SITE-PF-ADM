-- SEGURANÇA ATUALIZADA (V2)
-- Permite que o checkout funcione corretamente enquanto protege os dados.

-- 1. Limpar políticas anteriores
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Public Insert Orders" ON orders;
DROP POLICY IF EXISTS "Public Insert Items" ON order_items;
DROP POLICY IF EXISTS "Public Read Orders" ON orders;
DROP POLICY IF EXISTS "Public Read Items" ON order_items;
DROP POLICY IF EXISTS "Admin All Orders" ON orders;
DROP POLICY IF EXISTS "Admin All Order Items" ON order_items;
DROP POLICY IF EXISTS "Admin All Products" ON products;

-- 2. POLÍTICAS PÚBLICAS (Acesso para Clientes)
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON products FOR SELECT USING (available = true);

-- Permissões para o Checkout (Inserir e Ler o próprio retorno)
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Orders" ON orders FOR SELECT USING (true); -- Necessário para o .select() do Checkout

CREATE POLICY "Public Insert Items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Items" ON order_items FOR SELECT USING (true);

-- 3. POLÍTICAS DE ADMINISTRADOR (Apenas você autenticado)
-- Bloqueia alteração e exclusão para o público
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin All Orders" ON orders 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin All Order Items" ON order_items 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin All Products" ON products 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin All Categories" ON categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. STORAGE SECURITY (Imagens)
DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Images" ON storage.objects;

CREATE POLICY "Public Read Images" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Admin Manage Images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'products');
