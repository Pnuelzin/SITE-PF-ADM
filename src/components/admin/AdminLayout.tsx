import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, MapPin, Settings, LogOut, Coffee, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Pedidos' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Produtos' },
    { path: '/admin/locations', icon: <MapPin size={20} />, label: 'Localizações' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Configurações' },
  ];

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--bg-card)', 
        borderRight: '1px solid var(--border)', 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <Link to="/" className="logo">
            <Coffee size={24} /> <span>Admin</span>
          </Link>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            style={{ width: '36px', height: '36px' }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'btn-primary' : 'btn-outline'}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px 16px', 
                textDecoration: 'none',
                border: location.pathname === item.path ? 'none' : '1px solid transparent'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogoutClick}
          className="btn-outline" 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)', borderColor: 'transparent' }}
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0' }}>
          {children}
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 2000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card animate-fade" style={{ width: '90%', maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: '#fee2e2', 
              color: 'var(--danger)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 20px' 
            }}>
              <LogOut size={30} />
            </div>
            <h2 style={{ marginBottom: '12px', fontSize: '1.5rem' }}>Encerrar Sessão?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              Você tem certeza que deseja sair da área administrativa?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="btn-outline"
                style={{ width: '100%' }}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmLogout} 
                className="btn-primary"
                style={{ width: '100%', backgroundColor: 'var(--danger)' }}
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
