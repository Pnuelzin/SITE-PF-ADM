import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { supabase } from '../lib/supabase';
import { Save, Store, Layout, CreditCard, Loader2 } from 'lucide-react';
import { maskCurrency, maskPhone, currencyToNumber } from '../lib/formatters';

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    store_name: '',
    whatsapp_number: '',
    is_open: true,
    min_order_value: '',
    hero_title: '',
    hero_subtitle: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

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
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
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

  if (loading) return <AdminLayout>Carregando...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="animate-fade">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.875rem' }}>Configurações</h1>
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} 
            Salvar Alterações
          </button>
        </header>

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          {/* Perfil e Funcionamento */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)' }}>
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
          <div className="card">
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
          <div className="card">
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
    </AdminLayout>
  );
};

export default AdminSettings;
