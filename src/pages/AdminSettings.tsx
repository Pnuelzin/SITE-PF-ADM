import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { supabase } from '../lib/supabase';
import { Save, Store, Layout, CreditCard, Loader2, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { maskCurrency, maskPhone, currencyToNumber } from '../lib/formatters';
import type { Category } from '../types';

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{id: string, name: string} | null>(null);
  const [formData, setFormData] = useState({
    store_name: '',
    whatsapp_number: '',
    is_open: true,
    min_order_value: '',
    hero_title: '',
    hero_subtitle: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSettings(),
      fetchCategories()
    ]);
    setLoading(false);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').eq('id', 'main').single();
    if (data) {
      setFormData({
        store_name: data.store_name,
        whatsapp_number: maskPhone(data.whatsapp_number),
        is_open: data.is_open,
        min_order_value: maskCurrency((data.min_order_value * 100).toFixed(0)),
        hero_title: data.hero_title,
        hero_subtitle: data.hero_subtitle
      });
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('settings').update({
      ...formData,
      min_order_value: currencyToNumber(formData.min_order_value),
      updated_at: new Date()
    }).eq('id', 'main');

    if (error) alert('Erro ao salvar: ' + error.message);
    else alert('Configurações salvas com sucesso!');
    setSaving(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const { error } = await supabase.from('categories').insert([{ name: newCategoryName.trim() }]);
    if (error) {
      alert('Erro ao adicionar categoria: ' + error.message);
    } else {
      setNewCategoryName('');
      fetchCategories();
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    if (!name.trim()) return;
    const { error } = await supabase.from('categories').update({ name: name.trim() }).eq('id', id);
    if (error) {
      alert('Erro ao atualizar categoria: ' + error.message);
    } else {
      setEditingCategory(null);
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Deseja excluir esta categoria? Isso pode afetar produtos vinculados.')) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir categoria: ' + error.message);
      } else {
        fetchCategories();
      }
    }
  };

  if (loading) return <AdminLayout>Carregando...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="animate-fade">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <h1 style={{ fontSize: '1.875rem', color: 'var(--text-main)' }}>Configurações</h1>
          <button onClick={handleSaveSettings} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
            Salvar Alterações
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Categorias de Produtos */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Layout size={20} color="var(--primary)" /> Categorias de Produtos
            </h2>
            
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Nova categoria..." 
                value={newCategoryName} 
                onChange={e => setNewCategoryName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                <Plus size={18} /> Adicionar
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{ 
                  background: 'var(--bg-main)', 
                  padding: '12px 16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  {editingCategory?.id === cat.id ? (
                    <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                      <input 
                        autoFocus
                        type="text" 
                        value={editingCategory.name} 
                        onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        onKeyDown={e => e.key === 'Enter' && handleUpdateCategory(cat.id, editingCategory.name)}
                        style={{ flex: 1, padding: '4px 8px', fontSize: '0.9rem' }}
                      />
                      <button 
                        onClick={() => handleUpdateCategory(cat.id, editingCategory.name)} 
                        className="btn-no-min"
                        style={{ color: 'var(--success)', background: 'transparent', padding: '4px', display: 'flex' }}
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingCategory(null)} 
                        className="btn-no-min"
                        style={{ color: 'var(--danger)', background: 'transparent', padding: '4px', display: 'flex' }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>{cat.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => setEditingCategory({ id: cat.id, name: cat.name })} 
                          className="btn-no-min"
                          style={{ color: 'var(--primary)', background: 'transparent', padding: '6px', display: 'flex' }} 
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)} 
                          className="btn-no-min"
                          style={{ color: 'var(--danger)', background: 'transparent', padding: '6px', display: 'flex' }} 
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveSettings} style={{ display: 'contents' }}>
            {/* Perfil e Funcionamento */}
            <div className="card" style={{ height: 'fit-content' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Store size={20} color="var(--primary)" /> Perfil e Funcionamento
              </h2>
              <div className="input-group">
                <label>Nome da Loja</label>
                <input type="text" value={formData.store_name} onChange={e => setFormData({...formData, store_name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>WhatsApp para Pedidos</label>
                <input 
                  type="text" 
                  placeholder="(00) 0 0000-0000" 
                  value={formData.whatsapp_number} 
                  onChange={e => setFormData({...formData, whatsapp_number: maskPhone(e.target.value)})} 
                />
              </div>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-main)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <input 
                  type="checkbox" 
                  id="is_open" 
                  checked={formData.is_open} 
                  onChange={e => setFormData({...formData, is_open: e.target.checked})} 
                  style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                />
                <label htmlFor="is_open" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 'bold', color: formData.is_open ? 'var(--success)' : 'var(--danger)' }}>
                  {formData.is_open ? 'LOJA ABERTA (Recebendo Pedidos)' : 'LOJA FECHADA (Site Apenas Catálogo)'}
                </label>
              </div>
            </div>

            {/* Personalização do Site */}
            <div className="card" style={{ height: 'fit-content' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layout size={20} color="var(--primary)" /> Personalização do Site (Hero)
              </h2>
              <div className="input-group">
                <label>Título Principal</label>
                <input type="text" value={formData.hero_title} onChange={e => setFormData({...formData, hero_title: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Subtítulo / Descrição</label>
                <textarea rows={3} value={formData.hero_subtitle} onChange={e => setFormData({...formData, hero_subtitle: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
            </div>

            {/* Regras Financeiras */}
            <div className="card" style={{ height: 'fit-content' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="var(--primary)" /> Regras de Checkout
              </h2>
              <div className="input-group">
                <label>Valor Mínimo para Pedido (R$)</label>
                <input type="text" value={formData.min_order_value} onChange={e => setFormData({...formData, min_order_value: maskCurrency(e.target.value)})} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Clientes não poderão finalizar o pedido se o total for menor que este valor.
              </p>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
