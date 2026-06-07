import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
  onLogin: (token: string, email: string) => void;
}

export function Auth({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/${mode}`, { email, password });
      onLogin(res.data.token, res.data.email);
    } catch (err: unknown) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", fontFamily: "sans-serif", padding: "0 20px" }}>
      <h1 style={{ textAlign: "center" }}>🔍 OSINT Checker</h1>

      <div style={{ display: "flex", marginBottom: 24, borderBottom: "2px solid #ddd" }}>
        {(["login", "register"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "10px", border: "none",
            borderBottom: mode === m ? "2px solid #0070f3" : "2px solid transparent",
            background: "none", cursor: "pointer",
            fontWeight: mode === m ? "bold" : "normal",
            color: mode === m ? "#0070f3" : "#666",
            marginBottom: -2,
          }}>
            {m === "login" ? "Iniciar sesión" : "Registrarse"}
          </button>
        ))}
      </div>

      <input
        type="email" placeholder="correo@ejemplo.com" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 12, boxSizing: "border-box" }}
      />
      <input
        type="password" placeholder="Contraseña (mín. 8 caracteres)" value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        style={{ width: "100%", padding: 10, fontSize: 16, marginBottom: 12, boxSizing: "border-box" }}
      />

      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      <button onClick={submit} disabled={loading} style={{
        width: "100%", padding: 12, fontSize: 16,
        background: "#0070f3", color: "white", border: "none",
        borderRadius: 8, cursor: "pointer",
      }}>
        {loading ? "Cargando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
      </button>
    </div>
  );
}