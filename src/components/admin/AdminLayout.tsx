import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Coffee, Moon, Sun, Menu, X as CloseIcon, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const menuItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Pedidos' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Produtos' },
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
    <div className="admin-layout" style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-main)', overflow: 'hidden' }}>
      {/* Sidebar Desktop & Mobile */}
      <aside 
        className="admin-sidebar"
        style={{ 
          width: isMobile ? '100%' : '280px', 
          background: 'var(--bg-card)', 
          borderRight: '1px solid var(--border)', 
          padding: '24px', 
          display: isMobile && !isMobileMenuOpen ? 'none' : 'flex', 
          flexDirection: 'column',
          boxShadow: 'var(--shadow)',
          position: isMobile ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 3000,
          height: '100vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <Link to="/" className="logo" onClick={closeMenu}>
            <Coffee size={24} /> <span>Admin</span>
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={toggleTheme} 
              className="theme-toggle btn-no-min"
              style={{ width: '36px', height: '36px' }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {isMobile && (
              <button 
                onClick={closeMenu}
                style={{ background: 'transparent', color: 'var(--text-main)' }}
              >
                <CloseIcon size={24} />
              </button>
            )}
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'auto' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMenu}
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
          
          <button 
            onClick={handleLogoutClick}
            className="btn-outline" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              color: 'var(--danger)', 
              borderColor: 'transparent', 
              marginTop: '12px',
              width: '100%',
              justifyContent: 'flex-start'
            }}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Header */}
      {isMobile && (
        <header 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '60px', 
            background: 'var(--bg-card)', 
            borderBottom: '1px solid var(--border)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '0 20px',
            zIndex: 2500
          }}
        >
          <div className="logo" style={{ fontSize: '1.2rem' }}>
            <Coffee size={20} /> <span>Admin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link 
              to="/" 
              style={{ 
                color: 'var(--text-main)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '5px',
                opacity: 0.8
              }}
              title="Voltar para a Loja"
            >
              <ArrowLeft size={24} />
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ background: 'transparent', color: 'var(--text-main)', padding: '5px' }}
            >
              <Menu size={28} />
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="admin-main" style={{ flex: 1, padding: isMobile ? '80px 20px 40px' : '40px', overflowY: 'auto' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: isMobile ? '0' : '0' }}>
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
          backgroundColor: 'rgba(0,0,0,0.7)', 
          zIndex: 4000, 
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
