import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, Search, X, ChevronDown, Moon, Sun, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import CartSidebar from '../components/CartSidebar';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();
  const { addToCart, cart, isCartOpen, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('available', true).order('name');
      const { data: sets } = await supabase.from('settings').select('*').eq('id', 'main').single();
      
      if (cats) setCategories(cats);
      if (prods) setProducts(prods);
      if (sets) setSettings(sets);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lógica de Animação que roda sempre que a lista filtrada ou o estado de loading mudar
  useEffect(() => {
    if (loading) return;

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    // Timeout curto para garantir que o React terminou de renderizar os novos elementos do grid
    const timeoutId = setTimeout(() => {
      const revealElements = document.querySelectorAll('.reveal');
      revealElements.forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [loading, selectedCategory, searchQuery, products]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div className="loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Carregando delícias...</div>;

  return (
    <div className={`app-layout ${isCartOpen ? 'cart-open' : ''}`}>
      <CartSidebar />
      
      {/* Detalhes do Produto Modal */}
      {selectedProduct && (
        <div 
          onClick={() => setSelectedProduct(null)}
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            backdropFilter: 'blur(10px)', animation: 'fadeIn 0.3s ease'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ 
              width: '90%', maxWidth: '450px', backgroundColor: 'var(--bg-card)', 
              borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)',
              transform: 'scale(1)', animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              position: 'relative'
            }}
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              style={{ 
                position: 'absolute', top: '15px', right: '15px', zIndex: 10,
                width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '300px', overflow: 'hidden' }}>
                <img 
                  src={selectedProduct.image_url || '/placeholder.png'} 
                  alt={selectedProduct.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '24px' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px', lineHeight: '1.2' }}>
                  {selectedProduct.name}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
                  {selectedProduct.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '2px' }}>PREÇO</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>
                      R$ {selectedProduct.price.toFixed(2)}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      setIsCartOpen(true);
                      setSelectedProduct(null);
                    }}
                    className="btn-primary" 
                    style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '1rem', fontWeight: '700' }}
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className={`navbar ${isScrolled ? 'scrolled' : 'hero-active'}`}>
        <div className="container navbar-content">
          <Link to="/" className="logo">
            <img src="/image/Vector.svg" alt="Logo" style={{ height: '40px', width: 'auto' }} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Theme Toggle - Always Visible */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', borderRadius: '12px', padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Cart Button - Always Visible */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', padding: '8px 12px' }}
            >
              <ShoppingCart size={20} />
              <span>{cart.length}</span>
            </button>

            <div className="hide-mobile">
              <Link to="/admin/login" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginLeft: '8px' }}>Painel Admin</Link>
            </div>

            <button 
              className="show-mobile"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ background: 'transparent', color: 'white', padding: '4px' }}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMobileMenuOpen && (
          <div className="show-mobile animate-fade" style={{ 
            position: 'absolute', 
            top: '100%', 
            left: 0, 
            width: '100%', 
            background: 'rgba(37, 99, 235, 0.95)', 
            backdropFilter: 'blur(10px)',
            flexDirection: 'column',
            padding: '20px',
            gap: '15px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Navegação</div>
            <Link 
              to="/admin/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: 'white', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', textAlign: 'center' }}
            >
              Painel Admin
            </Link>
          </div>
        )}
      </header>

      <section className="hero">
        <div className="container animate-fade">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <span style={{ fontSize: '1.2rem' }}>✨</span> Destaque da Semana
              </div>
              {!settings?.is_open && (
                <div style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '10px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold', display: 'inline-block', animation: 'pulse 2s infinite' }}>
                  🚫 LOJA FECHADA NO MOMENTO
                </div>
              )}
              <h1>{settings?.hero_title || 'Qual vai ser o pedido de hoje?'}</h1>
              <p>{settings?.hero_subtitle || 'Sua fome atendida da melhor forma, sabor inesquecível e entrega rápida!'}</p>
              <div 
                className="scroll-indicator"
                onClick={() => {
                  const el = document.getElementById('products-grid');
                  if (el) {
                    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - 80;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                  }
                }}
              >
                <div className="scroll-indicator-text">Cardápio logo abaixo</div>
                <div className="scroll-indicator-icon">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave"></div>
      </section>

      <main id="products-grid" className="main-content container animate-fade responsive-main">
        <div className="reveal" style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <div className="search-bar" style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou descrição..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 45px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-card)', color: 'var(--text-main)', boxShadow: 'var(--shadow)' }}
            />
          </div>
        </div>

        <div className="reveal" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '30px' }}>
          <button 
            onClick={() => setSelectedCategory(null)}
            className={!selectedCategory ? 'btn-primary' : 'btn-outline'}
            style={{ whiteSpace: 'nowrap' }}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'}
              style={{ whiteSpace: 'nowrap' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="card card-product reveal" 
              onClick={() => setSelectedProduct(product)}
            >
              <div className="product-image-container">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                    Sem Imagem
                  </div>
                )}
              </div>
              <h3 className="product-title">{product.name}</h3>
              <p className="product-description">
                {product.description}
              </p>
              <div className="price-button-container" onClick={e => e.stopPropagation()}>
                <span className="price-tag">
                  R$ {product.price.toFixed(2)}
                </span>
                <button 
                  onClick={() => {
                    addToCart(product);
                    setIsCartOpen(true);
                  }}
                  className="btn-primary btn-buy" 
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              <Search size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontSize: '1.25rem' }}>Nenhum produto encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
