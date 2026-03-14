import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search, X, ChevronDown } from 'lucide-react';
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
  const { addToCart, cart, isCartOpen, setIsCartOpen } = useCart();

  const fetchData = async () => {
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('name');
      const { data: prods } = await supabase.from('products').select('*').eq('available', true).order('name');
      
      if (cats) setCategories(cats);
      if (prods) setProducts(prods);
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
              width: '90%', maxWidth: '450px', backgroundColor: 'var(--white)', 
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
                backgroundColor: 'rgba(255,255,255,0.9)', color: 'black', cursor: 'pointer',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer' }}
            >
              <ShoppingCart size={20} />
              <span>{cart.length}</span>
            </button>
            <Link to="/admin/login" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Painel Admin</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container animate-fade">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                <span style={{ fontSize: '1.2rem' }}>✨</span> Destaque da Semana
              </div>
              <h1>Qual o pedido de hoje?</h1>
              <p>Sua fome atendida da melhor forma, sabor inesquecível e entrega rápida!</p>
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

      <main id="products-grid" className="main-content container animate-fade" style={{ padding: '80px 20px 40px' }}>
        <div className="reveal" style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <div className="search-bar" style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou descrição..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 45px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--white)', boxShadow: 'var(--shadow)' }}
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="card reveal" 
              style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} 
              onClick={() => setSelectedProduct(product)}
            >
              <div style={{ height: '220px', backgroundColor: '#f1f5f9', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden' }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                    Sem Imagem
                  </div>
                )}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', fontWeight: '700' }}>{product.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '20px', flex: 1, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {product.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)' }}>
                  R$ {product.price.toFixed(2)}
                </span>
                <button 
                  onClick={() => {
                    addToCart(product);
                    setIsCartOpen(true);
                  }}
                  className="btn-primary" 
                  style={{ padding: '10px 24px', borderRadius: '14px', fontWeight: '700' }}
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
