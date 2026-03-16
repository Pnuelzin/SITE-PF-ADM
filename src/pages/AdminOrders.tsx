import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem, OrderStatus } from '../types';
import { ShoppingBag, MapPin, Phone, User, Calendar, CreditCard } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<(Order & { items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    fetchOrders();
    
    const channel = supabase
      .channel('orders_realtime')
      .on('postgres_changes' as any, { event: 'INSERT', table: 'orders', schema: 'public' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const fullOrders = await Promise.all(
        ordersData.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*, product:products(*)')
            .eq('order_id', order.id);
          return { ...order, items: items || [] };
        })
      );

      setOrders(fullOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) alert(error.message);
    fetchOrders();
  };

  const clearHistory = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
      if (error) throw error;
      setOrders([]);
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Erro ao limpar histórico.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const styles: Record<OrderStatus, any> = {
      pending: { bg: '#fef3c7', text: '#d97706', label: 'Em Análise' },
      approved: { bg: '#dbeafe', text: '#2563eb', label: 'Aprovado' },
      delivered: { bg: '#dcfce7', text: '#15803d', label: 'Entregue' },
      cancelled: { bg: '#fee2e2', text: '#dc2626', label: 'Cancelado' },
    };
    const s = styles[status] || styles.pending;
    return (
      <span style={{ backgroundColor: s.bg, color: s.text, padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
        {s.label}
      </span>
    );
  };

  const translatePayment = (method: string) => {
    const methods: any = { pix: 'Pix', card: 'Cartão', cash: 'Dinheiro' };
    return methods[method] || method;
  };

  if (loading && orders.length === 0) return <AdminLayout>Carregando...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="animate-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '1.875rem', margin: 0 }}>Pedidos</h1>
          {orders.length > 0 && (
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="btn-outline"
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '8px 16px' }}
            >
              Limpar Histórico
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.125rem' }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(order.created_at).toLocaleString('pt-BR')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CreditCard size={14} /> {translatePayment(order.payment_method)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {order.status === 'pending' && (
                    <button onClick={() => updateStatus(order.id, 'approved')} className="btn-primary" style={{ backgroundColor: 'var(--primary)', padding: '8px 16px', fontSize: '0.875rem', flex: '1 1 auto' }}>Aprovar</button>
                  )}
                  {order.status === 'approved' && (
                    <button onClick={() => updateStatus(order.id, 'delivered')} className="btn-primary" style={{ backgroundColor: 'var(--success)', padding: '8px 16px', fontSize: '0.875rem', flex: '1 1 auto' }}>Entregue</button>
                  )}
                  {(order.status === 'pending' || order.status === 'approved') && (
                    <button onClick={() => updateStatus(order.id, 'cancelled')} className="btn-outline" style={{ color: 'var(--danger)', padding: '8px 16px', fontSize: '0.875rem', borderColor: 'var(--danger)', flex: '1 1 auto' }}>Cancelar</button>
                  )}
                </div>
              </div>

              <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18} color="var(--text-muted)" /> <strong>{order.customer_name}</strong></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={18} color="var(--text-muted)" /> {order.customer_phone}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <MapPin size={18} color="var(--text-muted)" /> 
                    <span>{order.customer_location}</span>
                  </div>
                  {order.payment_method === 'cash' && order.change_needed > 0 && (
                    <div style={{ padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '8px', fontSize: '0.875rem' }}>
                      <strong style={{ color: 'var(--warning)' }}>Troco para:</strong> R$ {order.change_needed.toFixed(2)}
                      <br />
                      <strong style={{ color: 'var(--warning)' }}>Valor do troco:</strong> R$ {(order.change_needed - order.total_price).toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="orders-items-list" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '12px' }}>Itens do Pedido</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span>{item.quantity}x {item.product?.name || 'Produto Removido'}</span>
                        <span>R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)', fontSize: '1.125rem' }}>R$ {order.total_price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <div>Nenhum pedido encontrado.</div>
            </div>
          )}
        </div>
      </div>

      {showClearConfirm && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 4000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-scale" style={{ width: '90%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Você realmente deseja apagar o histórico dos pedidos?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                onClick={() => setShowClearConfirm(false)} 
                className="btn-outline"
                style={{ width: '100%' }}
              >
                Cancelar
              </button>
              <button 
                onClick={clearHistory} 
                className="btn-primary"
                style={{ width: '100%', backgroundColor: 'var(--danger)' }}
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;

