import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Login.css';

type Mode = 'login' | 'register';

export default function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error');
        return;
      }

      if (mode === 'register') {
        setSuccess('Cuenta creada. Ahora inicia sesión.');
        setMode('login');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        return;
      }

      login(data.token, remember);
      navigate('/');
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-grid" />
      <div className="login-scanline" />

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <img src="/logo.png" alt="GhostNet" style={{ width: 60, height: 60, objectFit: 'contain' }} />
          </div>
          <h1 className="login-title">Ghost<span>Net</span></h1>
          <p className="login-subtitle">Digital Intelligence Platform</p>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', marginBottom: 24, borderBottom: '1px solid #1a3a3a' }}>
          {(['login', 'register'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'none',
                border: 'none',
                borderBottom: mode === m ? '2px solid #00e5ff' : '2px solid transparent',
                color: mode === m ? '#00e5ff' : '#556',
                cursor: 'pointer',
                fontFamily: 'inherit',
                letterSpacing: '0.1em',
                fontSize: 13,
                marginBottom: -1,
              }}
            >
              {m === 'login' ? 'ACCEDER' : 'REGISTRARSE'}
            </button>
          ))}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="email">CORREO</label>
            <div className="login-input-wrap">
              <input
                id="email"
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="operador@ghostnet.io"
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
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                placeholder="••••••••"
              />
              <span className="login-input-line" />
            </div>
          </div>

          {mode === 'register' && (
            <div className="login-field">
              <label className="login-label" htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA</label>
              <div className="login-input-wrap">
                <input
                  id="confirmPassword"
                  className="login-input"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                />
                <span className="login-input-line" />
              </div>
            </div>
          )}

          {error && (
            <div className="login-error">
              <span className="login-error-dot" />
              {error}
            </div>
          )}

          {success && (
            <div style={{ color: '#00e5ff', fontSize: 13, marginBottom: 12, letterSpacing: '0.05em' }}>
              ✓ {success}
            </div>
          )}

          {mode === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ accentColor: '#00e5ff', width: 16, height: 16, cursor: 'pointer' }}
              />
              <label
                htmlFor="remember"
                style={{ color: '#556', fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer' }}
              >
                GUARDAR SESIÓN EN ESTE DISPOSITIVO
              </label>
            </div>
          )}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                <span>{mode === 'login' ? 'ACCEDER' : 'CREAR CUENTA'}</span>
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