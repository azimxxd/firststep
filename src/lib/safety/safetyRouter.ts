import type { Intent, InterventionType, RiskLevel, SafetyRoute } from "@/types/safety";

export function routeSafety(riskLevel: RiskLevel): { route: SafetyRoute; generationAllowed: boolean } {
  if (riskLevel === "HIGH") return { route: "HUMAN_ESCALATION", generationAllowed: false };
  if (riskLevel === "MEDIUM") return { route: "GENTLE_SUPPORT", generationAllowed: true };
  return { route: "SAFE_SUPPORT", generationAllowed: true };
}

export function chooseIntervention(intents: Intent[], turnNumber = 1): { type: InterventionType } | undefined {
  const priority: Array<[Intent, InterventionType[]]> = [
    ["PANIC", ["GROUNDING", "BREATHING"]],
    ["ANXIETY", ["BREATHING", "GROUNDING", "SCREEN_BREAK"]],
    ["LONELINESS", ["REACH_OUT", "REFLECTION"]],
    ["ACADEMIC_STRESS", ["NEXT_STEP", "STUDY_RESET", "SCREEN_BREAK"]],
    ["GENERAL_DISTRESS", ["REFLECTION", "BREATHING", "STUDY_RESET"]],
  ];
  const selected = priority.find(([intent]) => intents.includes(intent));
  if (!selected) return undefined;
  const variants = selected[1];
  const variantIndex = (Math.max(1, turnNumber) - 1) % variants.length;
  return { type: variants[variantIndex] };
}
