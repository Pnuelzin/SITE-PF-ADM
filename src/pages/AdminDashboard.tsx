import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle, Package, XCircle, TrendingUp } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total_price, 0)
  };

  const chartData = [
    { name: 'Pendente', value: stats.pending, color: 'var(--warning)' },
    { name: 'Aprovado', value: stats.approved, color: 'var(--primary)' },
    { name: 'Entregue', value: stats.delivered, color: 'var(--success)' },
    { name: 'Cancelado', value: stats.cancelled, color: 'var(--danger)' },
  ];

  const StatCard = ({ icon, label, value, color }: any) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
      <div style={{ backgroundColor: `${color}15`, color: color, padding: '15px', borderRadius: '12px' }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{value}</div>
      </div>
    </div>
  );

  if (loading) return <AdminLayout>Carregando...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="animate-fade">
        <h1 style={{ fontSize: '1.875rem', marginBottom: '30px' }}>Dashboard de Vendas</h1>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <StatCard icon={<Clock size={24} />} label="Em Análise" value={stats.pending} color="#f59e0b" />
          <StatCard icon={<CheckCircle size={24} />} label="Aprovados" value={stats.approved} color="#2563eb" />
          <StatCard icon={<Package size={24} />} label="Entregues" value={stats.delivered} color="#22c55e" />
          <StatCard icon={<XCircle size={24} />} label="Cancelados" value={stats.cancelled} color="#ef4444" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Status dos Pedidos</h2>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-main)', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-main)', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderColor: 'var(--border)', 
                      color: 'var(--text-main)',
                      borderRadius: '8px'
                    }} 
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <TrendingUp size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
            <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Receita Total (Entregues)</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
              R$ {stats.totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
