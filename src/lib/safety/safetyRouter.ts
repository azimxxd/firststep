import type { Intent, InterventionType, RiskLevel, SafetyRoute } from "@/types/safety";

export function routeSafety(riskLevel: RiskLevel): { route: SafetyRoute; generationAllowed: boolean } {
  if (riskLevel === "HIGH") return { route: "HUMAN_ESCALATION", generationAllowed: false };
  if (riskLevel === "MEDIUM") return { route: "GENTLE_SUPPORT", generationAllowed: true };
  return { route: "SAFE_SUPPORT", generationAllowed: true };
}

export function chooseIntervention(intents: Intent[]): { type: InterventionType } | undefined {
  const priority: Array<[Intent, InterventionType]> = [
    ["PANIC", "GROUNDING"],
    ["ANXIETY", "BREATHING"],
    ["LONELINESS", "REACH_OUT"],
    ["ACADEMIC_STRESS", "NEXT_STEP"],
    ["GENERAL_DISTRESS", "REFLECTION"],
  ];
  const selected = priority.find(([intent]) => intents.includes(intent));
  return selected ? { type: selected[1] } : undefined;
}
