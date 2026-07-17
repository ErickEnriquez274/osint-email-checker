import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Login.css';

type Mode = 'login' | 'register' | 'forgot' | 'verify';

export default function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [remember, setRemember] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const clearMessages = () => { setError(''); setSuccess(''); };

  const changeMode = (next: Mode) => {
    setMode(next);
    clearMessages();
    setPassword('');
    setConfirmPassword('');
    setCode('');
    setUsername('');  // <- agrega esto
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

if (mode === 'forgot') {
  setLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/password/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Ocurrió un error.');
    setSuccess('Si el correo existe recibirás un enlace en breve.');
  } catch {
    setError('No se pudo conectar con el servidor.');
  } finally {
    setLoading(false);
  }
  return;
}
    if (mode === 'verify') {
      if (code.length !== 6) return setError('Ingresa el código de 6 dígitos.');
      if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
      if (password !== confirmPassword) return setError('Las contraseñas no coinciden.');
      setError('El cambio de contraseña requiere conectar el endpoint de recuperación del backend.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...(mode === 'register' && { username }) }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Ocurrió un error.');

      if (mode === 'register') {
        setSuccess('Cuenta creada. Ya puedes iniciar sesión.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        return;
      }
      login(data.token, remember);
      navigate('/');
    } catch {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const isRecovery = mode === 'forgot' || mode === 'verify';

  return (
    <main className="login-root">
      <div className="login-ambient login-ambient-one" />
      <div className="login-ambient login-ambient-two" />
      <div className="login-grid" />
      <div className="login-signal-field" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="login-background-ghost" aria-hidden="true">
        <img src="/ghost-runner.png" alt="" />
      </div>
      <div className="login-right-radar" aria-hidden="true">
        <span className="radar-ring ring-one" /><span className="radar-ring ring-two" /><span className="radar-ring ring-three" />
        <span className="radar-sweep" /><span className="radar-point point-one" /><span className="radar-point point-two" />
        <small>GN // SIGNAL 07</small>
      </div>

      <section className="login-layout">
        <div className="login-intro">
          <div className="login-eyebrow"><span /> INTELIGENCIA DIGITAL</div>
          <h2>Investiga tu huella.<br /><strong>Protege tu identidad.</strong></h2>
          <p>Una plataforma OSINT para descubrir exposición digital, analizar señales de riesgo y tomar decisiones con contexto.</p>
          <div className="login-features">
            <article><span>01</span><div><b>¿Qué es OSINT?</b><p>Inteligencia obtenida de fuentes públicas para conocer tu exposición digital.</p></div></article>
            <article><span>02</span><div><b>Detecta filtraciones</b><p>Comprueba si un correo aparece relacionado con brechas o servicios en línea.</p></div></article>
            <article><span>03</span><div><b>Reduce tus riesgos</b><p>Interpreta las señales encontradas y toma medidas para proteger tus cuentas.</p></div></article>
          </div>
        </div>

        <div className="login-card">
          <svg className="login-ghost-trail" aria-hidden="true">
            <rect pathLength="100" />
          </svg>
          <div className="login-ghost-runner" aria-hidden="true">
            <img src="/ghost-runner.png" alt="" />
          </div>
          <header className="login-header" translate="no">
            <img className="login-logo-circle notranslate" src="/logo.png" alt="GhostNet" />
            <div>
              <h1 className="login-title notranslate"><span className="login-ghost">Ghost</span><span className="login-net">Net</span></h1>
              <p className="login-subtitle">Digital Intelligence Platform</p>
            </div>
          </header>

          {!isRecovery && (
            <div className="login-tabs" role="tablist">
              <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => changeMode('login')}>Iniciar sesión</button>
              <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => changeMode('register')}>Registrarse</button>
            </div>
          )}

          {isRecovery && (
            <div className="recovery-heading">
              <button type="button" onClick={() => changeMode('login')} aria-label="Volver">←</button>
              <div><h3>{mode === 'forgot' ? 'Recuperar acceso' : 'Verifica tu correo'}</h3><p>{mode === 'forgot' ? 'Te enviaremos un código de seguridad.' : `Código enviado a ${email}`}</p></div>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {mode !== 'verify' && (
              <label className="login-field">Correo electrónico
                <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="nombre@correo.com" />
              </label>
            )}
            {mode === 'register' && (
  <label className="login-field">Nombre de usuario
    <input className="login-input" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Tu nombre de usuario" minLength={3} />
  </label>
)}
            {(mode === 'login' || mode === 'register') && (
              <label className="login-field">Contraseña
                <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required placeholder="Mínimo 8 caracteres" />
              </label>
            )}

            {mode === 'verify' && (
              <>
                <label className="login-field">Código de verificación
                  <input className="login-input code-input" inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} required placeholder="000000" />
                </label>
                <label className="login-field">Nueva contraseña
                  <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 8 caracteres" />
                </label>
              </>
            )}

            {(mode === 'register' || mode === 'verify') && (
              <label className="login-field">Confirmar contraseña
                <input className="login-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Repite tu contraseña" />
              </label>
            )}

            {mode === 'login' && (
              <div className="login-options">
                <label><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Recordarme</label>
                <button type="button" onClick={() => changeMode('forgot')}>¿Olvidaste tu contraseña?</button>
              </div>
            )}

            {error && <div className="login-message error">{error}</div>}
            {success && <div className="login-message success">{success}</div>}

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? <span className="login-spinner" /> : <><span>{mode === 'login' ? 'Acceder' : mode === 'register' ? 'Crear cuenta' : mode === 'forgot' ? 'Solicitar código' : 'Cambiar contraseña'}</span><b>→</b></>}
            </button>
          </form>

          <footer className="login-footer"><span /> Conexión cifrada y acceso restringido</footer>
        </div>
      </section>
    </main>
  );
}
