import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, DollarSign, Smartphone, User, CheckCircle, MapPin, Target } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { CartItem } from '../types';
import { maskPhone, maskCurrency, currencyToNumber } from '../lib/formatters';

// Corrigir ícone do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const Checkout: React.FC = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>([-23.5505, -46.6333]);
  const [settings, setSettings] = useState<any>(null);


  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    paymentMethod: 'pix' as 'pix' | 'card' | 'cash',
    changeAmount: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*').eq('id', 'main').single();
    if (data) setSettings(data);
  };

  // Função para obter endereço do texto a partir de coordenadas
  const updateAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await resp.json();
      if (data.display_name) {
        setFormData(prev => ({ ...prev, location: data.display_name }));
      }
    } catch (e) {
      console.error("Erro na geocodificação reversa", e);
    }
  };

  // Componente para lidar com cliques no mapa
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setMapPosition([e.latlng.lat, e.latlng.lng]);

        updateAddressFromCoords(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  // Componente para centralizar o mapa na posição atual
  const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center]);
    return null;
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setMapPosition([latitude, longitude]);

        updateAddressFromCoords(latitude, longitude);
      });
    } else {
      alert("Geolocalização não suportada pelo seu navegador.");
    }
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
          customer_location: formData.location,
          lat: mapPosition[0],
          lng: mapPosition[1],
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

      setFinished(true);
      clearCart();
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
      <header className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="logo">
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </Link>
          <div style={{ fontWeight: '600' }}>Finalizar Pedido</div>
          <div style={{ width: '40px' }}></div>
        </div>
      </header>

      <main className="main-content container animate-fade" style={{ padding: '40px 16px' }}>
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
              <MapPin size={20} color="var(--primary)" /> Endereço de Entrega
            </h2>
            
            <div className="input-group">
              <label>Rua, Número e Bairro</label>
              <input 
                type="text" 
                required 
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="Ex: Rua das Flores, 123 - Bairro Centro"
              />
            </div>

            <button 
              type="button"
              onClick={() => {
                const mapEl = document.getElementById('map-container');
                mapEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="btn-outline"
              style={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                padding: '12px',
                borderStyle: 'dashed',
                color: 'var(--primary)',
                borderColor: 'var(--primary)',
                backgroundColor: 'rgba(37,99,235,0.05)',
                marginBottom: '10px'
              }}
            >
              <MapPin size={20} />
              <span style={{ fontWeight: '700' }}>Marcar Localização exata no Mapa</span>
            </button>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Confirme no mapa abaixo:</span>
                <button 
                  type="button" 
                  onClick={handleGetCurrentLocation}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--primary)', background: 'none', fontWeight: 'bold' }}
                >
                  <Target size={14} /> Usar GPS
                </button>
              </div>
              
              <div id="map-container" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <ChangeView center={mapPosition} />
                  <MapEvents />
                  <Marker position={mapPosition} />
                </MapContainer>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                * Clique no mapa para confirmar o ponto exato da entrega.
              </p>
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
              <div className="input-group animate-fade">
                <label>Precisa de troco para quanto?</label>
                <input 
                  type="text" 
                  value={formData.changeAmount}
                  onChange={e => setFormData({...formData, changeAmount: maskCurrency(e.target.value)})}
                  placeholder="0,00"
                />
              </div>
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
            disabled={loading || cart.length === 0 || !settings?.is_open || (settings && total < settings.min_order_value)}
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
