import { useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import { RiskBadge } from "./components/RiskBadge";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

type Tab = "email" | "phone" | "dork";
type View = "dashboard" | "analizar" | "resultados" | "sitios";

function Home() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("email");
  const [view, setView] = useState<View>("dashboard");

  // Email state
  const [email, setEmail] = useState("");
  const [emailResult, setEmailResult] = useState<any>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);

  // Phone state
  const [phone, setPhone] = useState("");
  const [phoneResult, setPhoneResult] = useState<any>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Dork state
  const [dorkQuery, setDorkQuery] = useState("");
  const [dorkResults, setDorkResults] = useState<any[]>([]);
  const [dorkLoading, setDorkLoading] = useState(false);
  const [dorkError, setDorkError] = useState<string | null>(null);
  const [dorkTotal, setDorkTotal] = useState(0);
  const [dorkShowAll, setDorkShowAll] = useState(false);
  const [dorkLocation, setDorkLocation] = useState("");

  const hasResults = Boolean(emailResult || phoneResult || sites.length > 0 || sitesLoading);

  const goTo = (nextView: View) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── SEARCH EMAIL con Holehe + Risk Score recalculo ──
  const searchEmail = async () => {
    if (!email) return;
    goTo("resultados");
    setEmailLoading(true);
    setEmailError(null);
    setEmailResult(null);
    setSites([]);
    setSitesLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/check`, { email });
      setEmailResult(res.data);
    } catch (err: any) {
      setEmailError(err.response?.data?.error || "Error al conectar con el servidor");
      setSitesLoading(false);
      return;
    } finally {
      setEmailLoading(false);
    }

    try {
      const eventSource = new EventSource(
        `${import.meta.env.VITE_HOLEHE_URL || 'http://localhost:5000'}/check?email=${encodeURIComponent(email)}`
      );
      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.done) {
          eventSource.close();
          setSitesLoading(false);
          setSites(prev => {
            const count = prev.length;
            if (count > 0) {
              axios.post(`${API_URL}/api/check/riskscore`, { email, sitesCount: count })
                .then(res => setEmailResult((p: any) => ({ ...p, risk: res.data })))
                .catch(() => {});
            }
            return prev;
          });
          return;
        }
        setSites(prev => [...prev, data]);
      };
      eventSource.onerror = () => { eventSource.close(); setSitesLoading(false); };
    } catch { setSitesLoading(false); }
  };

  const searchPhone = async () => {
    if (!phone) return;
    goTo("resultados");
    setPhoneLoading(true);
    setPhoneError(null);
    setPhoneResult(null);
    try {
      const res = await axios.post(`${API_URL}/api/phone`, { phone });
      setPhoneResult(res.data);
    } catch (err: any) {
      setPhoneError(err.response?.data?.error || "Error al conectar con el servidor");
    } finally { setPhoneLoading(false); }
  };

  const searchDork = async () => {
    if (!dorkQuery) return;
    setDorkLoading(true);
    setDorkError(null);
    setDorkResults([]);
    setDorkTotal(0);
    setDorkShowAll(false);
    try {
      const res = await axios.post(`${API_URL}/api/dork`, {
        query: dorkQuery,
        location: dorkLocation || undefined,
      });
      setDorkResults(res.data.results || []);
      setDorkTotal(res.data.total || 0);
    } catch (err: any) {
      setDorkError(err.response?.data?.error || "Error al ejecutar la búsqueda avanzada");
    } finally { setDorkLoading(false); }
  };

  const visibleDorkResults = dorkShowAll ? dorkResults : dorkResults.slice(0, 5);

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Inicio", icon: "⌂" },
  { id: "analizar", label: "Analizar", icon: "⌕" },
  { id: "resultados", label: "Resultados", icon: "◴" },
  { id: "sitios", label: "Sitios", icon: "◎" },
];

  // ── PANEL: Scanner (Analizar) ──
  const scannerPanel = (
    <section className="scanner-card">
      <div className="panel-heading">
        <span>Centro de análisis</span>
        <small>Búsqueda avanzada · Correo · Teléfono</small>
      </div>
      <div className="tabs">
        {(["email", "phone", "dork"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? "tab active" : "tab"}>
            {t === "email" ? "📧 CORREO" : t === "phone" ? "📱 TELÉFONO" : "🔎 BÚSQUEDA WEB"}
          </button>
        ))}
      </div>
      <div className="analysis-workbench">
        <div className="analysis-form-zone">
      {tab === "email" && (
        <div className="scan-section">
          <div className="input-row">
            <input type="email" placeholder="ghostnet@ejemplo.com" value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchEmail()} />
            <button onClick={searchEmail} disabled={emailLoading}>
              {emailLoading ? "BUSCANDO..." : "ANALIZAR"}
            </button>
          </div>
          {emailError && <p className="error-text">⚠️ {emailError}</p>}
        </div>
      )}
      {tab === "phone" && (
        <div className="scan-section">
          <p className="helper-text">Incluye el código de país. Ejemplo: <strong>+521234567890</strong></p>
          <div className="input-row">
            <input type="tel" placeholder="+521234567890" value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPhone()} />
            <button onClick={searchPhone} disabled={phoneLoading}>
              {phoneLoading ? "BUSCANDO..." : "ANALIZAR"}
            </button>
          </div>
          {phoneError && <p className="error-text">⚠️ {phoneError}</p>}
        </div>
      )}
{tab === "dork" && (
        <div className="scan-section">
          <div className="input-row" style={{ marginBottom: 10 }}>
            <input type="text" placeholder='intitle:"index of" password filetype:txt'
              value={dorkQuery}
              onChange={(e) => setDorkQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchDork()} />
            <button onClick={searchDork} disabled={dorkLoading}>
              {dorkLoading ? "BUSCANDO..." : "EJECUTAR"}
            </button>
          </div>

          <select value={dorkLocation} onChange={(e) => setDorkLocation(e.target.value)}
            style={{
              width: "100%", padding: "10px 12px", marginBottom: 12,
              background: "rgba(0, 5, 15, 0.78)", border: "1px solid rgba(0, 229, 255, 0.28)",
              color: dorkLocation ? "#d7e9f4" : "rgba(215, 233, 244, .46)",
              borderRadius: 10, outline: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13,
            }}>
            <option value="">🌍 Búsqueda global</option>
            <optgroup label="México">
              <option value="Mexico City, Mexico">Ciudad de México</option>
              <option value="Cancun, Quintana Roo, Mexico">Cancún</option>
              <option value="Guadalajara, Jalisco, Mexico">Guadalajara</option>
              <option value="Monterrey, Nuevo Leon, Mexico">Monterrey</option>
              <option value="Puebla, Puebla, Mexico">Puebla</option>
              <option value="Tijuana, Baja California, Mexico">Tijuana</option>
              <option value="Merida, Yucatan, Mexico">Mérida</option>
            </optgroup>
            <optgroup label="Estados Unidos">
              <option value="New York, New York, United States">Nueva York</option>
              <option value="Los Angeles, California, United States">Los Ángeles</option>
              <option value="Miami, Florida, United States">Miami</option>
            </optgroup>
            <optgroup label="España">
              <option value="Madrid, Spain">Madrid</option>
              <option value="Barcelona, Catalonia, Spain">Barcelona</option>
            </optgroup>
          </select>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {[
              { label: "📧 Correos expuestos", query: 'filetype:txt "email" "password"' },
              { label: "📄 Docs filtrados", query: 'filetype:pdf OR filetype:doc "confidential"' },
              { label: "🔑 Contraseñas", query: 'intitle:"index of" "passwords.txt"' },
              { label: "📷 Cámaras", query: 'intitle:"webcamXP" OR intitle:"Live View"' },
              { label: "🗄️ Bases de datos", query: 'intitle:"index of" ".sql" OR ".db"' },
              { label: "🔓 Paneles admin", query: 'intitle:"admin panel" OR inurl:"/admin/login"' },
              { label: "📱 Datos personales", query: 'filetype:xls "phone" "email" "address"' },
              { label: "📋 Pastes", query: 'filetype:txt "username" "password" site:pastebin.com' },
            ].map((d, i) => (
              <button key={i} onClick={() => setDorkQuery(d.query)}
                style={{
                  padding: "6px 10px", fontSize: 11,
                  background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.22)",
                  borderRadius: 6, color: "#bcefff", cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0, 229, 255, 0.16)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(0, 229, 255, 0.08)"; }}
              >
                {d.label}
              </button>
            ))}
          </div>

          {dorkError && <p className="error-text">⚠️ {dorkError}</p>}

          {dorkResults.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p className="muted-text" style={{ fontSize: 12, marginBottom: 10 }}>🌐 {dorkTotal} resultados</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {visibleDorkResults.map((r: any, i: number) => (
                  <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div className="result-card" style={{ margin: 0, cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <img src={`https://www.google.com/s2/favicons?domain=${r.displayLink}&sz=16`} alt="" style={{ width: 16, height: 16 }} />
                        <span style={{ color: "var(--cyan)", fontSize: 11 }}>{r.displayLink}</span>
                      </div>
                      <p style={{ color: "#d7e9f4", margin: "0 0 4px", fontSize: 13, fontWeight: 600 }}>{r.title}</p>
                      <p className="muted-text" style={{ margin: 0, fontSize: 11, lineHeight: 1.5 }}>{r.snippet}</p>
                    </div>
                  </a>
                ))}
              </div>
              {!dorkShowAll && dorkResults.length > 5 && (
                <button onClick={() => setDorkShowAll(true)} style={{
                  width: "100%", marginTop: 10, padding: "12px",
                  background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.28)",
                  borderRadius: 10, color: "var(--cyan)", fontWeight: 700, cursor: "pointer", fontSize: 12,
                }}>
                  VER TODOS LOS RESULTADOS ({dorkResults.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}
        </div>

        <aside className="analysis-guide" aria-label="Guía del análisis">
          <div className="guide-orbit" aria-hidden="true">
            <span>{tab === "email" ? "@" : tab === "phone" ? "#" : "⌕"}</span>
          </div>
          <span className="guide-kicker">{tab === "dork" ? "CONSULTA ESPECIALIZADA" : "ANÁLISIS DE IDENTIDAD"}</span>
          <h3>{tab === "email" ? "¿Qué puede revelar un correo?" : tab === "phone" ? "¿Qué puede revelar un teléfono?" : "Construye una búsqueda precisa"}</h3>
          <p>
            {tab === "email"
              ? "GhostNet cruza señales públicas para ayudarte a entender la exposición asociada a una dirección de correo."
              : tab === "phone"
                ? "Obtén contexto técnico del número y revisa si existen señales de riesgo asociadas."
                : "Combina operadores para encontrar información pública específica y reducir resultados irrelevantes."}
          </p>

          <div className="guide-findings">
            {(tab === "email"
              ? ["Cuentas y servicios vinculados", "Reputación y señales de riesgo", "Perfiles públicos disponibles"]
              : tab === "phone"
                ? ["País y formato internacional", "Tipo y validez del número", "Posibles señales de exposición"]
                : ["Documentos indexados", "Rutas y paneles públicos", "Resultados por ubicación"]
            ).map((item) => <div key={item}><span>✓</span>{item}</div>)}
          </div>

          <div className="guide-example">
            <small>EJEMPLO RÁPIDO</small>
            {tab === "email" && <button onClick={() => setEmail("nombre.apellido@dominio.com")}><code>nombre.apellido@dominio.com</code><span>Usar →</span></button>}
            {tab === "phone" && <button onClick={() => setPhone("+525512345678")}><code>+52 55 1234 5678</code><span>Usar →</span></button>}
            {tab === "dork" && <button onClick={() => setDorkQuery('site:ejemplo.com filetype:pdf')}><code>site:ejemplo.com filetype:pdf</code><span>Usar →</span></button>}
          </div>

          <div className="responsible-note">
            <span>i</span>
            <p><strong>Uso responsable</strong>Consulta únicamente información propia o aquella para la que tengas autorización.</p>
          </div>
        </aside>
      </div>
    </section>
  );

  // ── PANEL: Resultados ──
  const resultsPanel = (
    <section className="results-area">
      <div className="panel-heading">
        <span>Resultados del análisis</span>
        <small>{hasResults ? "Datos encontrados" : "Aún sin búsqueda"}</small>
      </div>

      {!hasResults && (
        <div className="empty-state">
          <div>🔎</div>
          <h3>No hay resultados todavía</h3>
          <p>Entra a Analizar, escribe un correo o teléfono y presiona ANALIZAR.</p>
          <button onClick={() => goTo("analizar")}>Ir a analizar</button>
        </div>
      )}

      {(emailResult || sites.length > 0 || sitesLoading) && (
        <>
          <h2>RESULTADOS: {emailResult?.email || email}</h2>

          {/* ── RISK SCORE con tus correcciones ── */}
          {emailResult?.risk && <RiskBadge risk={emailResult.risk} />}

          <div className="stats-grid">
            <div className="stat-card"><span>🔓</span><strong>{emailResult?.breaches ? "Detectado" : "0"}</strong><p>Filtraciones</p></div>
            <div className="stat-card"><span>🌐</span><strong>{sites.length}</strong><p>Sitios registrados</p></div>
            <div className="stat-card"><span>📊</span><strong>{emailResult?.reputation?.reputation || "N/A"}</strong><p>Reputación</p></div>
            <div className="stat-card"><span>👤</span><strong>{emailResult?.gravatar?.entry?.[0] ? "Sí" : "No"}</strong><p>Perfil público</p></div>
          </div>

          <div className="result-card">
            <h3>🔓 FILTRACIONES</h3>
            {emailResult?.breaches
              ? <pre>{JSON.stringify(emailResult.breaches, null, 2)}</pre>
              : <p className="ok-text">✅ Sin filtraciones encontradas</p>}
          </div>

          <div className="result-card">
            <h3>📊 REPUTACIÓN</h3>
            {emailResult?.reputation ? (
              <ul>
                <li>Reputación: <strong>{emailResult.reputation.reputation}</strong></li>
                <li>Sospechoso: <strong style={{ color: emailResult.reputation.suspicious ? "#ff4d6d" : "inherit" }}>{emailResult.reputation.suspicious ? "Sí" : "No"}</strong></li>
                <li>Spam: <strong style={{ color: emailResult.reputation.details?.spam ? "#ff4d6d" : "inherit" }}>{emailResult.reputation.details?.spam ? "Sí" : "No"}</strong></li>
                <li>Desechable: <strong style={{ color: emailResult.reputation.details?.disposable ? "#ff4d6d" : "inherit" }}>{emailResult.reputation.details?.disposable ? "Sí" : "No"}</strong></li>
              </ul>
            ) : <p className="muted-text">Sin datos de reputación</p>}
          </div>

          <div className="result-card">
            <h3>👤 GRAVATAR</h3>
            {emailResult?.gravatar?.entry?.[0] ? (
              <div className="gravatar-row">
                {emailResult.gravatar.entry[0].thumbnailUrl && (
                  <img className="logo-circle" src={emailResult.gravatar.entry[0].thumbnailUrl} alt="avatar" />
                )}
                <p>{emailResult.gravatar.entry[0].displayName || "Sin nombre público"}</p>
              </div>
            ) : <p className="muted-text">Sin perfil en Gravatar</p>}
          </div>
        </>
      )}

      {phoneResult && (
        <>
          <h2>RESULTADOS: {phoneResult.phone}</h2>
          {phoneResult.risk && <RiskBadge risk={phoneResult.risk} />}
          <div className="result-card">
            <h3>📋 METADATA</h3>
            <ul>
              <li>Válido: <strong>{phoneResult.metadata.valid ? "Sí" : "No"}</strong></li>
              <li>País: <strong>{phoneResult.metadata.country || "Desconocido"}</strong></li>
              <li>Tipo: <strong>{phoneResult.metadata.numberType || "Desconocido"}</strong></li>
              <li>Formato: <strong>{phoneResult.metadata.formatted}</strong></li>
            </ul>
          </div>
          <div className="result-card">
            <h3>🔓 FILTRACIONES</h3>
            {phoneResult.breaches
              ? <pre>{JSON.stringify(phoneResult.breaches, null, 2)}</pre>
              : <p className="ok-text">✅ Sin filtraciones encontradas</p>}
          </div>
        </>
      )}
    </section>
  );

  // ── PANEL: Sitios (Holehe) ──
  const sitesPanel = (
    <section className="result-card sites-panel">
      <div className="panel-heading">
        <span>🌐 Sitios registrados</span>
        <small>{sitesLoading ? "Escaneando..." : `${sites.length} encontrados`}</small>
      </div>
      {sites.length > 0 ? (
        <div className="sites-grid">
          {sites.map((s: any) => (
            <a key={s.domain} href={`https://${s.domain}`} target="_blank" rel="noopener noreferrer">
              <img className="site-icon" src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`} alt={s.site}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span>{s.site}</span>
            </a>
          ))}
        </div>
      ) : sitesLoading ? (
        <p className="muted-text">🔍 Escaneando 121 sitios...</p>
      ) : (
        <div className="empty-state small">
          <div>🌐</div>
          <h3>Aún no hay sitios</h3>
          <p>Realiza un análisis de correo para ver los sitios donde aparece registrado.</p>
          <button onClick={() => goTo("analizar")}>Analizar correo</button>
        </div>
      )}
    </section>
  );

  return (
    <main className="ghostnet-shell">
      <div className="network-overlay" />

      <aside className="ghostnet-sidebar">
        <div className="sidebar-brand" translate="no">
          <img className="logo-circle" src="/logo.png" alt="GhostNet" translate="no" />
          <div>
            <h2 className="notranslate" translate="no"><span>Ghost</span><b>Net</b></h2>
            <p>CENTRO OSINT</p>
          </div>
        </div>
        <div className="sidebar-section-label">ESPACIO DE TRABAJO</div>
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {navItems.map(item => (
            <button key={item.id} type="button"
              data-tooltip={`Ir a ${item.label}`}
              className={view === item.id ? "active" : ""}
              onClick={() => goTo(item.id)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-system-card">
          <span className="system-pulse" />
          <div>
            <strong>Sistema operativo</strong>
            <small>Servicios de análisis disponibles</small>
          </div>
        </div>
        <div className="sidebar-user">
          <div className="user-orb">GN</div>
          <div>
            <strong>Operador GhostNet</strong>
            <span>Sesión segura</span>
          </div>
        </div>
      </aside>

      <section className="ghostnet-main">
        <header className="workspace-header">
          <div>
            <span className="workspace-kicker">INTELIGENCIA DIGITAL / {view.toUpperCase()}</span>
            <h1>{view === "dashboard" ? "Centro de operaciones" : view === "analizar" ? "Nueva investigación" : view === "resultados" ? "Evidencia recopilada" : "Presencia digital"}</h1>
          </div>
          <div className="workspace-actions">
            <div className="live-status"><span /> RED SEGURA</div>
            <button className="logout-button" data-tooltip="Cerrar la sesión actual" onClick={logout}>SALIR</button>
          </div>
        </header>

        {view === "dashboard" && (
          <>
            <header className="hero-panel">
              <div className="hero-content">
                <span className="eyebrow">PLATAFORMA DE INTELIGENCIA GHOSTNET</span>
                <h2>Descubre lo que la red sabe.</h2>
                <p className="hero-copy">
                  Investiga identidades digitales, detecta exposición de datos y convierte señales dispersas en evidencia útil.
                </p>
                <div className="hero-actions">
                  <button className="primary-action" data-tooltip="Comenzar una nueva búsqueda" onClick={() => { setTab("email"); goTo("analizar"); }}>Iniciar análisis <span>→</span></button>
                  <button className="secondary-action" data-tooltip="Abrir la evidencia de esta sesión" onClick={() => goTo("resultados")}>Ver resultados</button>
                </div>
              </div>
              <div className="hero-radar" aria-hidden="true">
                <div className="radar-ring ring-one" />
                <div className="radar-ring ring-two" />
                <div className="radar-cross horizontal" />
                <div className="radar-cross vertical" />
                <div className="radar-sweep" />
                <div className="radar-core" />
                <span className="radar-label">ESCANEANDO</span>
              </div>
            </header>

            <div className="dashboard-grid">
              <div className="dashboard-card"><div className="metric-icon">@</div><p>Correos analizados</p><strong>{emailResult ? 1 : 0}</strong><small>En esta sesión</small></div>
              <div className="dashboard-card"><div className="metric-icon">◎</div><p>Perfiles vinculados</p><strong>{sites.length}</strong><small>Coincidencias verificadas</small></div>
              <div className="dashboard-card"><div className="metric-icon">#</div><p>Teléfonos consultados</p><strong>{phoneResult ? 1 : 0}</strong><small>En esta sesión</small></div>
              <div className="dashboard-card status-metric"><div className="metric-icon">✓</div><p>Estado del sistema</p><strong>{hasResults ? "Activo" : "Listo"}</strong><small><span className="status-dot" /> Todos los servicios</small></div>
            </div>

            <div className="dashboard-columns">
            <section className="scanner-card intelligence-card">
              <div className="panel-heading">
                <div><span>Inteligencia preventiva</span><p>Claves para proteger tu identidad digital</p></div>
                <small>GUÍA RÁPIDA</small>
              </div>
              <div className="intel-list">
                {[
                  { icon: "01", title: "Tu huella crece con cada registro", text: "Correos, alias y perfiles forman conexiones que pueden revelar más información de la esperada." },
                  { icon: "02", title: "Una filtración puede abrir varias puertas", text: "Reutilizar credenciales convierte una sola brecha en un riesgo para todas tus cuentas." },
                  { icon: "03", title: "La información pública también es evidencia", text: "Documentos indexados y perfiles olvidados pueden exponer datos sensibles sin que lo notes." },
                ].map((tip, i) => (
                  <div className="intel-item" key={i}>
                    <span>{tip.icon}</span>
                    <div>
                      <strong>{tip.title}</strong>
                      <p>{tip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="security-note quick-actions-card">
              <div className="panel-heading">
                <div><span>Acciones rápidas</span><p>Elige un punto de partida</p></div>
              </div>
              <button data-tooltip="Buscar exposición asociada a una dirección de correo" onClick={() => { setTab("email"); goTo("analizar"); }}><span>@</span><div><strong>Rastrear correo</strong><small>Exposición y cuentas vinculadas</small></div><b>→</b></button>
              <button data-tooltip="Consultar origen y riesgo de un número telefónico" onClick={() => { setTab("phone"); goTo("analizar"); }}><span>#</span><div><strong>Investigar teléfono</strong><small>Origen, formato y filtraciones</small></div><b>→</b></button>
              <button data-tooltip="Ejecutar una búsqueda avanzada en fuentes públicas" onClick={() => { setTab("dork"); goTo("analizar"); }}><span>⌕</span><div><strong>Ejecutar búsqueda avanzada</strong><small>Consultas especializadas en la web</small></div><b>→</b></button>
            </section>
            </div>
          </>
        )}

        {view === "analizar" && scannerPanel}
        {view === "resultados" && resultsPanel}
        {view === "sitios" && sitesPanel}
      </section>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
