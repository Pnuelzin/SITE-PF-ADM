import React from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { Settings } from 'lucide-react';

const AdminSettings: React.FC = () => {
  return (
    <AdminLayout>
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Settings size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
        <h1>Configurações do Sistema</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure sua loja, horários de funcionamento e métodos de pagamento aceitos.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
