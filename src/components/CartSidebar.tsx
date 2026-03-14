import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Minus, Plus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CartSidebar: React.FC = () => {
  const { cart, total, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [settings, setSettings] = React.useState<any>(null);

  React.useEffect(() => {
    if (isCartOpen) {
      fetchSettings();
    }
  }, [isCartOpen]);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').eq('id', 'main').single();
    if (data) setSettings(data);
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        onClick={() => setIsCartOpen(false)}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 1100, 
          transition: 'opacity 0.3s ease'
        }} 
      />

      <div 
        className="animate-fade cart-sidebar-container"
        style={{ 
          position: 'fixed', 
          top: 0, 
          right: 0, 
          width: '100%', 
          maxWidth: '450px', 
          height: '100%', 
          backgroundColor: 'var(--white)', 
          zIndex: 1200, 
          boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={24} color="var(--primary)" /> Seu Carrinho
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p>Seu carrinho está vazio</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="btn-outline"
                style={{ marginTop: '20px' }}
              >
                Ver Cardápio
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '8px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>{item.name}</div>
                    <div style={{ color: 'var(--primary)', fontWeight: '700', marginBottom: '8px' }}>R$ {(item.price * item.quantity).toFixed(2)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: '20px', padding: '4px 8px' }}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{ padding: '4px', display: 'flex' }}
                        >
                          <Minus size={16} />
                        </button>
                        <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '4px', display: 'flex' }}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ color: 'var(--danger)', padding: '8px' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '24px', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
            {settings && settings.min_order_value > total && (
              <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertTriangle size={18} />
                <span>Valor mínimo: R$ {settings.min_order_value.toFixed(2)}</span>
              </div>
            )}
            {!settings?.is_open && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.875rem', fontWeight: 'bold', textAlign: 'center' }}>
                LOJA FECHADA NO MOMENTO
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Subtotal</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>R$ {total.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => {
                if (!settings?.is_open) return;
                setIsCartOpen(false);
                navigate('/checkout');
              }}
              disabled={!settings?.is_open || (settings && total < settings.min_order_value)}
              className="btn-primary" 
              style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '1.125rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px',
                backgroundColor: (!settings?.is_open || (settings && total < settings.min_order_value)) ? 'var(--text-muted)' : 'var(--primary)'
              }}
            >
              {!settings?.is_open ? 'Loja Fechada' : 'Finalizar Pedido'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
