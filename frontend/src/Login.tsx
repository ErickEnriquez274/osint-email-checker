import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Credenciales incorrectas');
        return;
      }

      login(data.token);
      navigate('/');
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Animated grid background */}
      <div className="login-grid" />
      <div className="login-scanline" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1.5" />
              <line x1="20" y1="2" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" />
              <line x1="20" y1="28" x2="20" y2="38" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2" y1="20" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" />
              <line x1="28" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="login-title">OSINT<span>MAIL</span></h1>
          <p className="login-subtitle">Email Intelligence Platform</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="username">USUARIO</label>
            <div className="login-input-wrap">
              <input
                id="username"
                className="login-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                placeholder="operador_01"
              />
              <span className="login-input-line" />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">CONTRASEÑA</label>
            <div className="login-input-wrap">
              <input
                id="password"
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
              <span className="login-input-line" />
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span className="login-error-dot" />
              {error}
            </div>
          )}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                <span>ACCEDER</span>
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="login-footer">
          Acceso restringido · Solo personal autorizado
        </p>
      </div>
    </div>
  );
}
