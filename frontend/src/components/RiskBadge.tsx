interface RiskResult {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  reasons: string[];
}

const colors = {
  low:      { bg: "#d1fae5", text: "#065f46", label: "Bajo" },
  medium:   { bg: "#fef3c7", text: "#92400e", label: "Medio" },
  high:     { bg: "#fee2e2", text: "#991b1b", label: "Alto" },
  critical: { bg: "#fce7f3", text: "#9d174d", label: "Crítico" },
};

export function RiskBadge({ risk }: { risk: RiskResult }) {
  const color = colors[risk.level];

  return (
    <div style={{ marginTop: 16 }}>
      <h3>🛡️ Risk Score</h3>

      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        background: color.bg,
        color: color.text,
        padding: "12px 20px",
        borderRadius: 12,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 32, fontWeight: "bold" }}>{risk.score}</span>
        <span style={{ fontSize: 18, fontWeight: "bold" }}>{color.label}</span>
      </div>

      {/* Barra de progreso */}
      <div style={{ background: "#e5e7eb", borderRadius: 8, height: 10, maxWidth: 300, marginBottom: 12 }}>
        <div style={{
          width: `${risk.score}%`,
          height: "100%",
          borderRadius: 8,
          background:
            risk.level === "critical" ? "#ec4899" :
            risk.level === "high" ? "#ef4444" :
            risk.level === "medium" ? "#f59e0b" : "#10b981",
          transition: "width 0.5s ease",
        }} />
      </div>

      <ul style={{ paddingLeft: 20, color: "#374151" }}>
        {risk.reasons.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}