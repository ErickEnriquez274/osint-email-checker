import { useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";
import { RiskBadge } from "./components/RiskBadge";
import { SpaceBackground } from "./components/SpaceBackground";

const API_URL = import.meta.env.VITE_API_URL;

type Tab = "email" | "phone";

function Home() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("email");

  const [email, setEmail] = useState("");
  const [emailResult, setEmailResult] = useState<any>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [sitesLoading, setSitesLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [phoneResult, setPhoneResult] = useState<any>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const searchEmail = async () => {
    if (!email) return;
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
          return;
        }
        setSites(prev => [...prev, data]);
      };

      eventSource.onerror = () => {
        eventSource.close();
        setSitesLoading(false);
      };
    } catch {
      setSitesLoading(false);
    }
  };

  const searchPhone = async () => {
    if (!phone) return;
    setPhoneLoading(true);
    setPhoneError(null);
    setPhoneResult(null);
    try {
      const res = await axios.post(`${API_URL}/api/phone`, { phone });
      setPhoneResult(res.data);
    } catch (err: any) {
      setPhoneError(err.response?.data?.error || "Error al conectar con el servidor");
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <>
      <SpaceBackground />

      {/* Botón cerrar sesión */}
      <div style={{ position: "fixed", top: 16, right: 24, zIndex: 100 }}>
        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            fontSize: 12,
            cursor: "pointer",
            background: "linear-gradient(135deg, #0a1628, #0d2137)",
            border: "1px solid #00e5ff55",
            borderRadius: 6,
            color: "#00e5ff",
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            boxShadow: "0 0 12px rgba(0,229,255,0.15), inset 0 0 12px rgba(0,229,255,0.05)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,229,255,0.4), inset 0 0 12px rgba(0,229,255,0.1)";
            (e.target as HTMLButtonElement).style.borderColor = "#00e5ff";
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(0,229,255,0.15), inset 0 0 12px rgba(0,229,255,0.05)";
            (e.target as HTMLButtonElement).style.borderColor = "#00e5ff55";
          }}
        >
          ⏻ CERRAR SESIÓN
        </button>
      </div>

      {/* Contenido principal */}
      <div style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: "0 20px",
        position: "relative",
        zIndex: 1,
        fontFamily: "monospace",
        color: "#c8d8e0",
      }}>

        {/* Título */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 24px 0" }}>
          <img
            src="/logo.png"
            alt="GhostNet"
            style={{ width: 64, height: 64, objectFit: "contain", borderRadius: "50%" }}
          />
          <h1 style={{ margin: 0, fontFamily: "monospace", letterSpacing: "0.1em", color: "#c8d8e0" }}>
            GHOST<span style={{ color: "#00e5ff", textShadow: "0 0 12px #00e5ff" }}>NET</span>
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid #1e2a35" }}>
          {(["email", "phone"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "10px 24px",
                border: "none",
                borderBottom: tab === t ? "2px solid #00e5ff" : "2px solid transparent",
                background: "none",
                cursor: "pointer",
                fontWeight: tab === t ? "bold" : "normal",
                color: tab === t ? "#00e5ff" : "#4a6070",
                fontSize: 14,
                fontFamily: "monospace",
                letterSpacing: "0.1em",
                marginBottom: -1,
              }}
            >
              {t === "email" ? "📧 CORREO" : "📱 TELÉFONO"}
            </button>
          ))}
        </div>

        {/* Email Tab */}
        {tab === "email" && (
          <div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                placeholder="ghostnet@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchEmail()}
                style={{
                  flex: 1, padding: 10, fontSize: 14,
                  background: "#0d1117", border: "1px solid #1e2a35",
                  color: "#c8d8e0", fontFamily: "monospace",
                  outline: "none", borderRadius: 4,
                }}
              />
              <button
                onClick={searchEmail}
                disabled={emailLoading}
                style={{
                  padding: "10px 20px", fontSize: 13,
                  background: "linear-gradient(135deg, #0a1628, #0d2137)",
                  border: "1px solid #00e5ff55", borderRadius: 4,
                  color: "#00e5ff", fontFamily: "monospace",
                  letterSpacing: "0.1em", cursor: "pointer",
                }}
              >
                {emailLoading ? "BUSCANDO..." : "BUSCAR"}
              </button>
            </div>

            {emailError && (
              <p style={{ color: "#ff4d6d", fontFamily: "monospace", fontSize: 13 }}>⚠️ {emailError}</p>
            )}

            {(emailResult || sites.length > 0) && (
              <div style={{ marginTop: 24 }}>
                <h2 style={{ color: "#00e5ff", fontSize: 16, letterSpacing: "0.1em" }}>
                  RESULTADOS: {emailResult?.email || email}
                </h2>

                {emailResult.risk && <RiskBadge risk={emailResult.risk} />}

                <h3 style={{ color: "#4a6070", fontSize: 13, letterSpacing: "0.15em" }}>🔓 FILTRACIONES</h3>
                {emailResult.breaches
                  ? <pre style={{ background: "#0d1117", border: "1px solid #1e2a35", padding: 12, overflow: "auto", color: "#c8d8e0", fontSize: 12 }}>{JSON.stringify(emailResult.breaches, null, 2)}</pre>
                  : <p style={{ color: "#00e5ff" }}>✅ Sin filtraciones encontradas</p>}

                <h3 style={{ color: "#4a6070", fontSize: 13, letterSpacing: "0.15em" }}>📊 REPUTACIÓN</h3>
                {emailResult.reputation ? (
                  <ul style={{ color: "#c8d8e0", fontSize: 13, lineHeight: 2 }}>
                    <li>Reputación: <strong style={{ color: "#00e5ff" }}>{emailResult.reputation.reputation}</strong></li>
                    <li>Sospechoso: <strong style={{ color: emailResult.reputation.suspicious ? "#ff4d6d" : "#00e5ff" }}>{emailResult.reputation.suspicious ? "Sí" : "No"}</strong></li>
                    <li>Spam: <strong style={{ color: emailResult.reputation.details?.spam ? "#ff4d6d" : "#00e5ff" }}>{emailResult.reputation.details?.spam ? "Sí" : "No"}</strong></li>
                    <li>Desechable: <strong style={{ color: emailResult.reputation.details?.disposable ? "#ff4d6d" : "#00e5ff" }}>{emailResult.reputation.details?.disposable ? "Sí" : "No"}</strong></li>
                  </ul>
                ) : <p style={{ color: "#4a6070" }}>Sin datos de reputación</p>}

                <h3 style={{ color: "#4a6070", fontSize: 13, letterSpacing: "0.15em" }}>👤 GRAVATAR</h3>
                {emailResult.gravatar?.entry?.[0] ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {emailResult.gravatar.entry[0].thumbnailUrl && (
                      <img src={emailResult.gravatar.entry[0].thumbnailUrl} alt="avatar" style={{ borderRadius: "50%", border: "1px solid #00e5ff44" }} />
                    )}
                    <p style={{ color: "#c8d8e0" }}>{emailResult.gravatar.entry[0].displayName || "Sin nombre público"}</p>
                  </div>
                ) : <p style={{ color: "#4a6070" }}>Sin perfil en Gravatar</p>}

                <h3 style={{ color: "#4a6070", fontSize: 13, letterSpacing: "0.15em" }}>
                  🌐 SITIOS REGISTRADOS ({sites.length})
                  {sitesLoading && (
                    <span style={{ color: "#00e5ff", marginLeft: 8, fontSize: 11 }}>
                      escaneando...
                    </span>
                  )}
                </h3>
                {sites.length > 0 ? (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                    gap: 12,
                    marginTop: 8,
                    marginBottom: 24,
                  }}>
                    {sites.map((s: any) => (
                      <a
                        key={s.domain}
                        href={`https://${s.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#0d1117",
                            border: "1px solid #1e2a35",
                            borderRadius: 6,
                            padding: "8px 12px",
                            cursor: "pointer",
                            transition: "border-color 0.2s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = "#00e5ff55")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e2a35")}
                        >
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`}
                            alt={s.site}
                            style={{ width: 20, height: 20 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span style={{ color: "#c8d8e0", fontSize: 12, fontFamily: "monospace" }}>
                            {s.site}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : sitesLoading ? (
                  <p style={{ color: "#4a6070", fontSize: 12 }}>🔍 Escaneando 121 sitios...</p>
                ) : (
                  <p style={{ color: "#4a6070" }}>Sin sitios encontrados</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Phone Tab */}
        {tab === "phone" && (
          <div>
            <p style={{ color: "#4a6070", fontSize: 13, marginBottom: 8, fontFamily: "monospace" }}>
              Incluye el código de país. Ejemplo: <strong style={{ color: "#00e5ff" }}>+521234567890</strong>
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="tel"
                placeholder="+521234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPhone()}
                style={{
                  flex: 1, padding: 10, fontSize: 14,
                  background: "#0d1117", border: "1px solid #1e2a35",
                  color: "#c8d8e0", fontFamily: "monospace",
                  outline: "none", borderRadius: 4,
                }}
              />
              <button
                onClick={searchPhone}
                disabled={phoneLoading}
                style={{
                  padding: "10px 20px", fontSize: 13,
                  background: "linear-gradient(135deg, #0a1628, #0d2137)",
                  border: "1px solid #00e5ff55", borderRadius: 4,
                  color: "#00e5ff", fontFamily: "monospace",
                  letterSpacing: "0.1em", cursor: "pointer",
                }}
              >
                {phoneLoading ? "BUSCANDO..." : "BUSCAR"}
              </button>
            </div>

            {phoneError && (
              <p style={{ color: "#ff4d6d", fontFamily: "monospace", fontSize: 13 }}>⚠️ {phoneError}</p>
            )}

            {phoneResult && (
              <div style={{ marginTop: 24 }}>
                <h2 style={{ color: "#00e5ff", fontSize: 16, letterSpacing: "0.1em" }}>
                  RESULTADOS: {phoneResult.phone}
                </h2>

                {phoneResult.risk && <RiskBadge risk={phoneResult.risk} />}

                <h3 style={{ color: "#4a6070", fontSize: 13, letterSpacing: "0.15em" }}>📋 METADATA</h3>
                <ul style={{ color: "#c8d8e0", fontSize: 13, lineHeight: 2 }}>
                  <li>Válido: <strong style={{ color: "#00e5ff" }}>{phoneResult.metadata.valid ? "Sí" : "No"}</strong></li>
                  <li>País: <strong style={{ color: "#00e5ff" }}>{phoneResult.metadata.country || "Desconocido"}</strong></li>
                  <li>Tipo: <strong style={{ color: "#00e5ff" }}>{phoneResult.metadata.numberType || "Desconocido"}</strong></li>
                  <li>Formato: <strong style={{ color: "#00e5ff" }}>{phoneResult.metadata.formatted}</strong></li>
                </ul>

                <h3 style={{ color: "#4a6070", fontSize: 13, letterSpacing: "0.15em" }}>🔓 FILTRACIONES</h3>
                {phoneResult.breaches
                  ? <pre style={{ background: "#0d1117", border: "1px solid #1e2a35", padding: 12, overflow: "auto", color: "#c8d8e0", fontSize: 12 }}>{JSON.stringify(phoneResult.breaches, null, 2)}</pre>
                  : <p style={{ color: "#00e5ff" }}>✅ Sin filtraciones encontradas</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;