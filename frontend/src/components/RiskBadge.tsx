interface RiskResult {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  reasons: string[];
}

const colors = {
  low:      { bg: "rgba(34, 255, 194, 0.1)", border: "rgba(34, 255, 194, 0.3)", text: "#22ffc2", label: "Bajo" },
  medium:   { bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.3)", text: "#fbbf24", label: "Medio" },
  high:     { bg: "rgba(255, 77, 109, 0.1)", border: "rgba(255, 77, 109, 0.3)", text: "#ff4d6d", label: "Alto" },
  critical: { bg: "rgba(236, 72, 153, 0.1)", border: "rgba(236, 72, 153, 0.3)", text: "#ec4899", label: "Crítico" },
};

const barColors = {
  low:      "#22ffc2",
  medium:   "#fbbf24",
  high:     "#ff4d6d",
  critical: "#ec4899",
};

export function RiskBadge({ risk }: { risk: RiskResult }) {
  const color = colors[risk.level];

  return (
    <div style={{
      background: color.bg,
      border: `1px solid ${color.border}`,
      borderRadius: 12,
      padding: "16px 20px",
      marginTop: 16,
      marginBottom: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ color: "#8fb2c9", fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
          🛡️ RISK SCORE
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: color.text }}>{risk.score}</span>
          <span style={{
            padding: "3px 10px", borderRadius: 999,
            background: color.bg, border: `1px solid ${color.border}`,
            color: color.text, fontWeight: "bold", fontSize: 13,
          }}>{color.label}</span>
        </div>
      </div>

      <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, height: 8, marginBottom: 12 }}>
        <div style={{
          width: `${risk.score}%`, height: "100%", borderRadius: 8,
          background: barColors[risk.level],
          boxShadow: `0 0 8px ${barColors[risk.level]}`,
          transition: "width 0.6s ease",
        }} />
      </div>

      <ul style={{ margin: 0, paddingLeft: 18, color: "#c8d8e0", fontSize: 12, lineHeight: 1.8 }}>
        {risk.reasons.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}
