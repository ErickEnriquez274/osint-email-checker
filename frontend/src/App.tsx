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

function GhostNetBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "brand-lockup compact" : "brand-lockup"} translate="no">
      <img src="/logo.png" alt="GhostNet" className="brand-logo logo-circle" translate="no" />
      <div className="brand-text-wrap" translate="no">
        <h1 className="brand-title notranslate" translate="no">
          <span className="ghost-word">Ghost</span><span className="net-word">Net</span>
        </h1>
        {!compact && <p className="brand-subtitle">DIGITAL INTELLIGENCE PLATFORM</p>}
      </div>
    </div>
  );
}

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
        `http://localhost:5000/check?email=${encodeURIComponent(email)}`
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
      setDorkError(err.response?.data?.error || "Error al ejecutar el dork");
    } finally { setDorkLoading(false); }
  };

  const visibleDorkResults = dorkShowAll ? dorkResults : dorkResults.slice(0, 5);

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "analizar", label: "Analizar", icon: "⌕" },
  { id: "resultados", label: "Resultados", icon: "◴" },
  { id: "sitios", label: "Sitios", icon: "◎" },
];

  // ── PANEL: Scanner (Analizar) ──
  const scannerPanel = (
    <section className="scanner-card">
      <div className="panel-heading">
        <span>Centro de análisis</span>
        <small>Dorking · Email · Teléfono</small>
      </div>
      <div className="tabs">
        {(["email", "phone", "dork"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? "tab active" : "tab"}>
            {t === "email" ? "📧 CORREO" : t === "phone" ? "📱 TELÉFONO" : "🔎 DORKING"}
          </button>
        ))}
      </div>
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
          <h2 className="notranslate" translate="no">GHOSTNET</h2>
          <p>Email Security Checker</p>
        </div>
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {navItems.map(item => (
            <button key={item.id} type="button"
              className={view === item.id ? "active" : ""}
              onClick={() => goTo(item.id)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-orb">●</div>
          <div>
            <strong>Usuario</strong>
            <span>En línea</span>
          </div>
        </div>
      </aside>

      <section className="ghostnet-main">
        <button className="logout-button" onClick={logout}>⏻ CERRAR SESIÓN</button>

{view === "dashboard" && (
          <>
            <header className="hero-panel">
              <GhostNetBrand />
              <p className="hero-copy">
                Analiza correos y teléfonos para identificar filtraciones, reputación y presencia en sitios registrados.
              </p>
              <div className="status-row">
                <span>🛡️ Protegido</span>
                <span>OSINT activo</span>
                <span>Monitoreo web</span>
              </div>
            </header>

            <div className="dashboard-grid">
              <div className="dashboard-card"><span>📧</span><strong>{emailResult ? 1 : 0}</strong><p>Correos analizados</p></div>
              <div className="dashboard-card"><span>🌐</span><strong>{sites.length}</strong><p>Sitios encontrados</p></div>
              <div className="dashboard-card"><span>📱</span><strong>{phoneResult ? 1 : 0}</strong><p>Teléfonos consultados</p></div>
              <div className="dashboard-card"><span>🛡️</span><strong>{hasResults ? "Activo" : "Listo"}</strong><p>Estado del sistema</p></div>
            </div>

            <section className="scanner-card">
              <div className="panel-heading">
                <span>💡 ¿Sabías que...?</span>
                <small>Huella digital</small>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
                {[
                  { icon: "🔍", title: "Tu huella digital es más grande de lo que crees", text: "Cada vez que te registras en un sitio web, comentas en un foro o usas tu correo, dejas un rastro. Con el tiempo, esa información puede aparecer en bases de datos públicas o filtraciones." },
                  { icon: "🛡️", title: "Las filtraciones son más comunes de lo esperado", text: "Miles de millones de credenciales han sido expuestas. Sitios como LinkedIn, Adobe y Yahoo han sufrido brechas que comprometieron datos de millones de usuarios." },
                  { icon: "🔑", title: "Un correo comprometido puede dar acceso a todo", text: "Si usas el mismo correo y contraseña en varios sitios, una sola filtración puede comprometer todas tus cuentas. Usa contraseñas únicas y un gestor de contraseñas." },
                  { icon: "🌐", title: "Google sabe más de ti de lo que imaginas", text: "A través de técnicas de Google Dorking, investigadores pueden encontrar tu información en sitios públicos, documentos indexados o bases de datos expuestas accidentalmente." },
                ].map((tip, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 16, alignItems: "flex-start",
                    padding: "14px 16px", borderRadius: 10,
                    background: "rgba(0, 229, 255, 0.05)",
                    border: "1px solid rgba(0, 229, 255, 0.12)",
                  }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{tip.icon}</span>
                    <div>
                      <strong style={{ color: "#d7e9f4", fontSize: 14, display: "block", marginBottom: 4 }}>{tip.title}</strong>
                      <p style={{ color: "#8fb2c9", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{tip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="security-note" style={{ marginTop: 20 }}>
              <div className="security-icon">🚀</div>
              <article>
                <h3>¿Listo para analizar tu huella digital?</h3>
                <p>Ve a <strong>Analizar</strong> para comenzar. Puedes buscar por correo o número de teléfono.</p>
                <div className="security-grid">
                  <button onClick={() => goTo("analizar")} style={{
                    background: "rgba(0, 229, 255, 0.12)", border: "1px solid rgba(0, 229, 255, 0.3)",
                    borderRadius: 8, color: "#00e5ff", padding: "10px 16px",
                    cursor: "pointer", fontWeight: 700, fontSize: 13,
                  }}>📧 Analizar correo</button>
                  <button onClick={() => goTo("analizar")} style={{
                    background: "rgba(0, 229, 255, 0.12)", border: "1px solid rgba(0, 229, 255, 0.3)",
                    borderRadius: 8, color: "#00e5ff", padding: "10px 16px",
                    cursor: "pointer", fontWeight: 700, fontSize: 13,
                  }}>🔎 Hacer Dorking</button>
                </div>
              </article>
            </section>
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