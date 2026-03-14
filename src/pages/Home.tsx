import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import CartSidebar from '../components/CartSidebar';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart, cart, isCartOpen, setIsCartOpen } = useCart();

  useEffect(() => {
    fetchData();

    // Lógica para Animação de Scroll (Reveal)
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [loading]); // Re-executa após carregar os produtos

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

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className={`app-layout ${isCartOpen ? 'cart-open' : ''}`}>
      <CartSidebar />
      <header className="navbar hero-active">
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
              <h1>O que vamos pedir hoje?</h1>
              <p>Sua fome atendida com os melhores ingredientes, sabor inigualável e entrega ultra rápida.</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button 
                  onClick={() => {
                    const el = document.getElementById('products-grid');
                    if (el) {
                      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
                      const offsetPosition = elementPosition - 80;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="btn-primary" 
                  style={{ backgroundColor: 'white', color: 'var(--primary)', padding: '14px 28px', fontSize: '1rem' }}
                >
                  Ver Cardápio
                </button>
              </div>
            </div>
            <div className="hero-image-container">
              <img src="/hero_food_premium.png" alt="Hero Food" />
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
            <div key={product.id} className="card reveal" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', backgroundColor: '#f1f5f9', borderRadius: '8px', marginBottom: '16px', overflow: 'hidden' }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                    Sem Imagem
                  </div>
                )}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{product.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px', flex: 1 }}>{product.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                  R$ {product.price.toFixed(2)}
                </span>
                <button 
                  onClick={() => {
                    addToCart(product);
                    setIsCartOpen(true);
                  }}
                  className="btn-primary" 
                  style={{ padding: '8px 20px', borderRadius: '12px' }}
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
