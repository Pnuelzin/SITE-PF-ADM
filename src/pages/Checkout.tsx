import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, DollarSign, Smartphone, User, CheckCircle, MapPin } from 'lucide-react';
import type { CartItem } from '../types';
import { maskPhone, maskCurrency, currencyToNumber } from '../lib/formatters';

const Checkout: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    roomName: '',
    roomNumber: '',
    paymentMethod: 'pix' as 'pix' | 'card' | 'cash',
    changeAmount: '',
    noChange: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').eq('id', 'main').single();
    if (data) setSettings(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (settings && !settings.is_open) {
      alert("A loja está fechada no momento. Por favor, tente novamente mais tarde.");
      return;
    }

    if (settings && total < settings.min_order_value) {
      alert(`O valor mínimo para o pedido é R$ ${settings.min_order_value.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_location: `Turma: ${formData.roomName} | Sala: ${formData.roomNumber}`,
          payment_method: formData.paymentMethod,
          change_needed: formData.paymentMethod === 'cash' ? currencyToNumber(formData.changeAmount) : 0,
          total_price: total,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item: CartItem) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // WhatsApp Message Integration
      const whatsappNumber = '558481032681';
      const itemsText = cart.map((item: CartItem) => `- ${item.quantity}x ${item.name}: R$ ${(item.price * item.quantity).toFixed(2)}`).join('%0A');
      
      const getPaymentInfo = () => {
        if (formData.paymentMethod === 'pix') return 'Pix';
        if (formData.paymentMethod === 'card') return 'Cartão';
        if (formData.paymentMethod === 'cash') {
          const change = currencyToNumber(formData.changeAmount);
          if (formData.noChange || change === 0) return 'Dinheiro (Sem troco)';
          return `Dinheiro (Troco para R$ ${change.toFixed(2)})`;
        }
        return '';
      };

      const message = `*NOVO PEDIDO - SITE AD MAIORAIS*%0A%0A` +
        `*DADOS DO CLIENTE:*%0A` +
        `• *Nome:* ${formData.name}%0A` +
        `• *Telefone:* ${formData.phone}%0A` +
        `• *Turma:* ${formData.roomName}%0A` +
        `• *Sala:* ${formData.roomNumber}%0A%0A` +
        `*ITENS DO PEDIDO:*%0A${itemsText}%0A%0A` +
        `*PAGAMENTO:* ${getPaymentInfo()}%0A%0A` +
        `*VALOR TOTAL:* R$ ${total.toFixed(2)}%0A%0A` +
        `_Pedido realizado via site._`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      setFinished(true);
      clearCart();

      // Redirecionar para o WhatsApp (mais confiável em dispositivos móveis/iOS)
      window.location.href = whatsappUrl;
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (finished) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '20px' }} />
        <h1 style={{ marginBottom: '10px' }}>Pedido Recebido!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Obrigado por escolher a SaborAdmin. Seu pedido já está sendo analisado.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Voltar para a Loja</button>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <header className="navbar scrolled" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '56px', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Link 
            to="/" 
            className="btn-outline" 
            style={{ 
              position: 'absolute', 
              left: '0', 
              padding: '6px 12px', 
              fontSize: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              borderRadius: '8px',
              minHeight: 'unset',
              height: '32px'
            }}
          >
            <ArrowLeft size={16} />
            <span className="hide-mobile">Voltar</span>
          </Link>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: 'var(--white)' }}>
            Finalizar Pedido
          </h2>
        </div>
      </header>

      <main className="main-content container animate-fade" style={{ padding: '80px 16px 40px' }}>
        <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '40px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="var(--primary)" /> Seus Dados
              </h2>
              <div className="input-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Seu nome"
                />
              </div>
              <div className="input-group">
                <label>Telefone</label>
                <input 
                  type="tel" 
                  required 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})}
                  placeholder="(00) 0 0000-0000"
                />
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--primary)" /> Localização na Escola
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label>NOME DA TURMA</label>
                <input 
                  type="text" 
                  required 
                  value={formData.roomName}
                  onChange={e => setFormData({...formData, roomName: e.target.value})}
                  placeholder="Ex: 3º Ano A, 9º B"
                />
              </div>
              <div className="input-group">
                <label>NÚMERO DA SALA</label>
                <input 
                  type="text" 
                  required 
                  value={formData.roomNumber}
                  onChange={e => setFormData({...formData, roomNumber: e.target.value})}
                  placeholder="Ex: 101, B2"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="var(--primary)" /> Pagamento
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <button 
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: 'pix'})}
                className={formData.paymentMethod === 'pix' ? 'btn-primary' : 'btn-outline'}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
              >
                <Smartphone size={24} />
                <span>Pix</span>
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: 'card'})}
                className={formData.paymentMethod === 'card' ? 'btn-primary' : 'btn-outline'}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
              >
                <CreditCard size={24} />
                <span>Cartão</span>
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                className={formData.paymentMethod === 'cash' ? 'btn-primary' : 'btn-outline'}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
              >
                <DollarSign size={24} />
                <span>Dinheiro</span>
              </button>
            </div>

            {formData.paymentMethod === 'cash' && (
              <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label>Precisa de troco para quanto?</label>
                  <input 
                    type="text" 
                    disabled={formData.noChange}
                    value={formData.changeAmount}
                    onChange={e => setFormData({...formData, changeAmount: maskCurrency(e.target.value)})}
                    placeholder="0,00"
                    style={{ opacity: formData.noChange ? 0.5 : 1 }}
                  />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.noChange}
                    onChange={e => setFormData({...formData, noChange: e.target.checked, changeAmount: e.target.checked ? '' : formData.changeAmount})}
                  />
                  Não preciso de troco
                </label>
              </div>
            )}
            {formData.paymentMethod === 'cash' && !formData.noChange && currencyToNumber(formData.changeAmount) === 0 && (
              <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '12px', fontWeight: 'bold' }}>
                * Por favor, informe o valor do troco ou selecione "Não preciso de troco" para continuar.
              </p>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              padding: '16px', 
              fontSize: '1.125rem',
              backgroundColor: (!settings?.is_open || (settings && total < settings.min_order_value)) ? 'var(--text-muted)' : 'var(--primary)',
              opacity: loading || cart.length === 0 ? 0.7 : 1
            }} 
            disabled={loading || cart.length === 0 || !settings?.is_open || (settings && total < settings.min_order_value) || (formData.paymentMethod === 'cash' && !formData.noChange && currencyToNumber(formData.changeAmount) === 0)}
          >
            {loading ? 'Processando...' : 
             !settings?.is_open ? 'LOJA FECHADA' : 
             (settings && total < settings.min_order_value) ? `MÍNIMO R$ ${settings.min_order_value.toFixed(2)}` :
             `Confirmar Pedido - R$ ${total.toFixed(2)}`}
          </button>
        </form>

        <div className="card checkout-summary-sticky" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Resumo do Carrinho</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {cart.map((item: CartItem) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.quantity}x {item.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>R$ {item.price.toFixed(2)} cada</div>
                </div>
                <div style={{ fontWeight: '600' }}>R$ {(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            {cart.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Carrinho vazio</p>}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Total</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
);
};

export default Checkout;

