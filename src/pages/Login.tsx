import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError('Credenciais inválidas. Verifique o nome e a senha.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg-main)',
      backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)',
      padding: '20px'
    }}>
      <div className="card animate-fade" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: 'rgba(37, 99, 235, 0.1)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: 'var(--primary)'
          }}>
            <Lock size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>Acesso Administrativo</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Entre com suas credenciais para gerenciar a loja</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fee2e2', 
            padding: '12px', 
            borderRadius: '8px', 
            color: 'var(--danger)', 
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> Usuário
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={16} /> Senha
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              padding: '14px', 
              fontSize: '1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              marginTop: '10px'
            }}
          >
            <LogIn size={20} /> Entrar no Painel
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            onClick={() => navigate('/')} 
            style={{ background: 'none', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '500' }}
          >
            Voltar para a loja
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
