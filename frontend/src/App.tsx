import { useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Login";

const API_URL = import.meta.env.VITE_API_URL;

type Tab = "email" | "phone";

function Home() {
  const [tab, setTab] = useState<Tab>("email");

  // Email state
  const [email, setEmail] = useState("");
  const [emailResult, setEmailResult] = useState<any>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Phone state
  const [phone, setPhone] = useState("");
  const [phoneResult, setPhoneResult] = useState<any>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const searchEmail = async () => {
    if (!email) return;
    setEmailLoading(true);
    setEmailError(null);
    setEmailResult(null);
    try {
      const res = await axios.post(`${API_URL}/api/check`, { email });
      setEmailResult(res.data);
    } catch (err: any) {
      setEmailError(err.response?.data?.error || "Error al conectar con el servidor");
    } finally {
      setEmailLoading(false);
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
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>🔍 OSINT Checker</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid #ddd" }}>
        {(["email", "phone"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 24px",
              border: "none",
              borderBottom: tab === t ? "2px solid #0070f3" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
              fontWeight: tab === t ? "bold" : "normal",
              color: tab === t ? "#0070f3" : "#666",
              fontSize: 16,
              marginBottom: -2,
            }}
          >
            {t === "email" ? "📧 Correo" : "📱 Teléfono"}
          </button>
        ))}
      </div>

      {/* Email Tab */}
      {tab === "email" && (
        <div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchEmail()}
              style={{ flex: 1, padding: 10, fontSize: 16 }}
            />
            <button onClick={searchEmail} disabled={emailLoading} style={{ padding: "10px 20px", fontSize: 16 }}>
              {emailLoading ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {emailError && <p style={{ color: "red" }}>⚠️ {emailError}</p>}

          {emailResult && (
            <div style={{ marginTop: 24 }}>
              <h2>Resultados para: {emailResult.email}</h2>

              <h3>🔓 Filtraciones</h3>
              {emailResult.breaches
                ? <pre style={{ background: "#f4f4f4", padding: 12, overflow: "auto" }}>{JSON.stringify(emailResult.breaches, null, 2)}</pre>
                : <p style={{ color: "green" }}>✅ Sin filtraciones encontradas</p>}

              <h3>📊 Reputación</h3>
              {emailResult.reputation ? (
                <ul>
                  <li>Reputación: <strong>{emailResult.reputation.reputation}</strong></li>
                  <li>Sospechoso: <strong>{emailResult.reputation.suspicious ? "Sí" : "No"}</strong></li>
                  <li>Spam: <strong>{emailResult.reputation.details?.spam ? "Sí" : "No"}</strong></li>
                  <li>Desechable: <strong>{emailResult.reputation.details?.disposable ? "Sí" : "No"}</strong></li>
                </ul>
              ) : <p>Sin datos de reputación</p>}

              <h3>👤 Gravatar</h3>
              {emailResult.gravatar?.entry?.[0] ? (
                <div>
                  {emailResult.gravatar.entry[0].thumbnailUrl && (
                    <img src={emailResult.gravatar.entry[0].thumbnailUrl} alt="avatar" style={{ borderRadius: "50%" }} />
                  )}
                  <p>{emailResult.gravatar.entry[0].displayName || "Sin nombre público"}</p>
                </div>
              ) : <p>Sin perfil en Gravatar</p>}
            </div>
          )}
        </div>
      )}

      {/* Phone Tab */}
      {tab === "phone" && (
        <div>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>
            Incluye el código de país. Ejemplo: <strong>+521234567890</strong>
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="tel"
              placeholder="+521234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPhone()}
              style={{ flex: 1, padding: 10, fontSize: 16 }}
            />
            <button onClick={searchPhone} disabled={phoneLoading} style={{ padding: "10px 20px", fontSize: 16 }}>
              {phoneLoading ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {phoneError && <p style={{ color: "red" }}>⚠️ {phoneError}</p>}

          {phoneResult && (
            <div style={{ marginTop: 24 }}>
              <h2>Resultados para: {phoneResult.phone}</h2>

              <h3>📋 Metadata del número</h3>
              <ul>
                <li>Válido: <strong>{phoneResult.metadata.valid ? "Sí" : "No"}</strong></li>
                <li>País: <strong>{phoneResult.metadata.country || "Desconocido"}</strong></li>
                <li>Tipo: <strong>{phoneResult.metadata.numberType || "Desconocido"}</strong></li>
                <li>Formato internacional: <strong>{phoneResult.metadata.formatted}</strong></li>
              </ul>

              <h3>🔓 Filtraciones</h3>
              {phoneResult.breaches
                ? <pre style={{ background: "#f4f4f4", padding: 12, overflow: "auto" }}>{JSON.stringify(phoneResult.breaches, null, 2)}</pre>
                : <p style={{ color: "green" }}>✅ Sin filtraciones encontradas</p>}
            </div>
          )}
        </div>
      )}
    </div>
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
