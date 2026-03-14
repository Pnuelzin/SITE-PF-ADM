import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { maskCurrency, currencyToNumber } from '../lib/formatters';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: prods } = await supabase.from('products').select('*').order('name');
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    if (prods) setProducts(prods);
    if (cats) {
      setCategories(cats);
      if (cats.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: cats[0].id }));
      }
    }
    setLoading(false);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: maskCurrency((product.price * 100).toFixed(0)),
        image_url: product.image_url,
        category_id: product.category_id,
        available: product.available
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category_id: categories[0]?.id || '',
        available: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: currencyToNumber(formData.price)
    };

    if (editingProduct) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.from('products').insert([payload]);
      if (error) alert(error.message);
    }

    setIsModalOpen(false);
    fetchData();
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      if (data) {
        setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      }
    } catch (error: any) {
      alert('Erro ao enviar imagem: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este produto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert(error.message);
      fetchData();
    }
  };

  if (loading) return <AdminLayout>Carregando...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="animate-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.875rem' }}>Gestão de Produtos</h1>
          <button onClick={() => handleOpenModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} /> Novo Produto
          </button>
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '16px 20px' }}>Produto</th>
                <th style={{ padding: '16px 20px' }}>Categoria</th>
                <th style={{ padding: '16px 20px' }}>Preço</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {product.image_url ? <img src={product.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={20} color="#cbd5e1" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {categories.find(c => c.id === product.category_id)?.name || '-'}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>
                    R$ {product.price.toFixed(2)}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {product.available ? (
                      <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}><Check size={16} /> Ativo</span>
                    ) : (
                      <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}><X size={16} /> Inativo</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleOpenModal(product)} className="btn-outline" style={{ padding: '6px', color: 'var(--primary)' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(product.id)} className="btn-outline" style={{ padding: '6px', color: 'var(--danger)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card animate-fade" style={{ width: '100%', maxWidth: '500px', maxHeight: '100%', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '24px' }}>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Nome</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Descrição</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Preço (R$)</label>
                  <input type="text" required value={formData.price} onChange={e => setFormData({...formData, price: maskCurrency(e.target.value)})} placeholder="0,00" />
                </div>
                <div className="input-group">
                  <label>Categoria</label>
                  <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Imagem do Produto</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{ 
                    border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '30px',
                    textAlign: 'center',
                    backgroundColor: dragActive ? 'rgba(37, 99, 235, 0.05)' : '#f8fafc',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  
                  {uploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Enviando imagem...</span>
                    </div>
                  ) : formData.image_url ? (
                    <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                      <img 
                        src={formData.image_url} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                        alt="Preview" 
                      />
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, image_url: '' })); }}
                        style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '50%', padding: '4px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Upload size={24} />
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', color: 'var(--primary)' }}>Clique para enviar</span> ou arraste a imagem
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG ou WEBP (Max. 2MB)</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={formData.available} onChange={e => setFormData({...formData, available: e.target.checked})} style={{ width: 'auto' }} />
                <label style={{ marginBottom: 0 }}>Produto disponível para venda</label>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
