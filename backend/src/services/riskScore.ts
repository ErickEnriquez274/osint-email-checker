interface RiskInput {
  breaches: any;
  reputation?: any;
  numberType?: string;
  country?: string;
  sitesCount?: number;
}

export interface RiskResult {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  reasons: string[];
}

export const calculateRiskScore = (input: RiskInput): RiskResult => {
  let score = 0;
  const reasons: string[] = [];

  // --- Filtraciones ---
  if (input.breaches) {
    const breachCount = input.breaches.BreachMetrics?.passwordsstored?.[0]?.PasswordsStored || 0;
    if (breachCount > 0) {
      score += 40;
      reasons.push(`Encontrado en ${breachCount} filtraciones de contraseñas`);
    }
    if (input.breaches.ExposedBreaches) {
      score += 20;
      reasons.push("Datos personales expuestos en brechas conocidas");
    }
  }

  // --- Reputación de email ---
  if (input.reputation) {
    if (input.reputation.suspicious) {
      score += 20;
      reasons.push("Correo marcado como sospechoso");
    }
    if (input.reputation.details?.spam) {
      score += 15;
      reasons.push("Asociado a actividad de spam");
    }
    if (input.reputation.details?.disposable) {
      score += 10;
      reasons.push("Correo desechable/temporal");
    }
    if (input.reputation.details?.blacklisted) {
      score += 20;
      reasons.push("Correo en lista negra");
    }
  }

  // --- Sitios registrados (Holehe) ---
  if (input.sitesCount) {
    if (input.sitesCount >= 20) {
      score += 30;
      reasons.push(`Huella digital muy amplia: registrado en ${input.sitesCount} sitios`);
    } else if (input.sitesCount >= 10) {
      score += 20;
      reasons.push(`Huella digital amplia: registrado en ${input.sitesCount} sitios`);
    } else if (input.sitesCount >= 5) {
      score += 10;
      reasons.push(`Registrado en ${input.sitesCount} sitios públicos`);
    } else if (input.sitesCount > 0) {
      score += 5;
      reasons.push(`Registrado en ${input.sitesCount} sitios públicos`);
    }
  }

  // --- Tipo de número ---
  if (input.numberType === "VOIP") {
    score += 15;
    reasons.push("Número VOIP (mayor riesgo de anonimato)");
  }
  if (input.numberType === "PAGER") {
    score += 10;
    reasons.push("Tipo de número inusual");
  }

  score = Math.min(score, 100);

  const level =
    score >= 75 ? "critical" :
    score >= 50 ? "high" :
    score >= 25 ? "medium" : "low";

  if (reasons.length === 0) {
    reasons.push("No se encontraron indicadores de riesgo");
  }

  return { score, level, reasons };
};