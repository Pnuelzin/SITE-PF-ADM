import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import { MapPin, Plus, Trash2, Navigation, Save, Search, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { maskCurrency, currencyToNumber } from '../lib/formatters';

// Corrigir ícone padrão do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface DeliveryArea {
  id: string;
  name: string;
  lat: number;
  lng: number;
  delivery_fee: number;
}

const AdminLocations: React.FC = () => {
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [tempMarker, setTempMarker] = useState<{lat: number, lng: number} | null>(null);
  const [newName, setNewName] = useState('');
  const [newFee, setNewFee] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-23.5505, -46.6333]);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('delivery_areas').select('*').order('name');
    if (!error && data) setAreas(data);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setTempMarker({ lat: parseFloat(lat), lng: parseFloat(lon) });
        setIsAdding(true);
      } else {
        alert('Endereço não encontrado.');
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveArea = async () => {
    if (!tempMarker || !newName) return;

    const payload = {
      name: newName,
      lat: tempMarker.lat,
      lng: tempMarker.lng,
      delivery_fee: currencyToNumber(newFee)
    };

    const { error } = await supabase.from('delivery_areas').insert([payload]);
    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setTempMarker(null);
      setNewName('');
      setNewFee('');
      setIsAdding(false);
      fetchAreas();
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm('Excluir esta área de entrega?')) return;
    const { error } = await supabase.from('delivery_areas').delete().eq('id', id);
    if (!error) fetchAreas();
  };

  const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center]);
    return null;
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (isAdding) setTempMarker(e.latlng);
      },
    });
    return null;
  };

  return (
    <AdminLayout>
      <div className="animate-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', marginBottom: '8px' }}>Áreas de Entrega</h1>
            <p style={{ color: 'var(--text-muted)' }}>Gerencie os locais e taxas de entrega persistidos no banco.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <input 
                type="text" 
                placeholder="Pesquisar endereço..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', padding: '8px 12px', outline: 'none', width: '250px' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px' }} disabled={isSearching}>
                {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              </button>
            </form>
            
            <button 
              onClick={() => setIsAdding(!isAdding)} 
              className={isAdding ? "btn-outline" : "btn-primary"}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isAdding ? "Cancelar" : <><Plus size={20} /> Nova Área</>}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px', height: '600px' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
            {isAdding && (
              <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 1000, background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '10px' }}>
                  {tempMarker ? "📋 Detalhes da nova área" : "📍 Clique no mapa ou use a busca"}
                </div>
                {tempMarker && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input type="text" placeholder="Nome (ex: Centro)" value={newName} onChange={e => setNewName(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', flex: 2 }} />
                    <input type="text" placeholder="Taxa R$" value={newFee} onChange={e => setNewFee(maskCurrency(e.target.value))} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', flex: 1 }} />
                    <button onClick={handleSaveArea} className="btn-primary" style={{ padding: '8px 16px' }}><Save size={16} /> Salvar</button>
                  </div>
                )}
              </div>
            )}
            
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ChangeView center={mapCenter} />
              <MapEvents />
              {areas.map(area => (
                <Marker key={area.id} position={[area.lat, area.lng]}>
                  <Popup><strong>{area.name}</strong><br />Taxa: R$ {Number(area.delivery_fee).toFixed(2)}</Popup>
                </Marker>
              ))}
              {tempMarker && <Marker position={[tempMarker.lat, tempMarker.lng]} />}
            </MapContainer>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} /> Áreas Salvas
            </h2>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? <div style={{ textAlign: 'center' }}><Loader2 className="animate-spin" /></div> : areas.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Nenhuma área.</p> : areas.map(area => (
                <div key={area.id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{area.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>R$ {Number(area.delivery_fee).toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => setMapCenter([area.lat, area.lng])} style={{ color: 'var(--primary)', background: 'transparent', padding: '6px' }}><MapPin size={16} /></button>
                    <button onClick={() => handleDeleteArea(area.id)} style={{ color: 'var(--danger)', background: 'transparent', padding: '6px' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLocations;
