import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface CheckResult {
  email: string;
  breaches: any;
  reputation: any;
  gravatar: any;
  checkedAt: string;
}

function App() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post<CheckResult>(`${API_URL}/api/check`, { email });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1>🔍 OSINT Email Checker</h1>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          style={{ flex: 1, padding: "10px", fontSize: 16 }}
        />
        <button onClick={search} disabled={loading} style={{ padding: "10px 20px", fontSize: 16 }}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: 16 }}>⚠️ {error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Resultados para: {result.email}</h2>

          <section>
            <h3>🔓 Filtraciones (XposedOrNot)</h3>
            {result.breaches
              ? <pre style={{ background: "#f4f4f4", padding: 12 }}>{JSON.stringify(result.breaches, null, 2)}</pre>
              : <p style={{ color: "green" }}>✅ No se encontraron filtraciones</p>}
          </section>

          <section>
            <h3>📊 Reputación (EmailRep)</h3>
            {result.reputation ? (
              <ul>
                <li>Reputación: <strong>{result.reputation.reputation}</strong></li>
                <li>Sospechoso: <strong>{result.reputation.suspicious ? "Sí" : "No"}</strong></li>
                <li>Spam: <strong>{result.reputation.details?.spam ? "Sí" : "No"}</strong></li>
                <li>Desechable: <strong>{result.reputation.details?.disposable ? "Sí" : "No"}</strong></li>
              </ul>
            ) : <p>Sin datos de reputación</p>}
          </section>

          <section>
            <h3>👤 Perfil Gravatar</h3>
            {result.gravatar?.entry?.[0] ? (
              <div>
                {result.gravatar.entry[0].thumbnailUrl && (
                  <img src={result.gravatar.entry[0].thumbnailUrl} alt="avatar" style={{ borderRadius: "50%" }} />
                )}
                <p>{result.gravatar.entry[0].displayName || "Sin nombre público"}</p>
                <p>{result.gravatar.entry[0].aboutMe || ""}</p>
              </div>
            ) : <p>Sin perfil público en Gravatar</p>}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;