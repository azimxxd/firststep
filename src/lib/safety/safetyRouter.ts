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

/**
 * Turn-aware intervention choice for a whole conversation.
 *
 * `classifyIntent` returns `["UNKNOWN"]` rather than an empty array, so callers
 * must strip it before asking for an intervention — otherwise a short reply
 * such as "да" carries no topic and yields nothing. The conversation's primary
 * intent is folded in so those replies inherit the topic already being discussed.
 */
export function selectIntervention(intents: Intent[], primaryIntent: Intent, turnNumber: number) {
  const candidates = intents.filter((intent) => intent !== "UNKNOWN");
  if (primaryIntent !== "UNKNOWN" && !candidates.includes(primaryIntent)) candidates.push(primaryIntent);
  return chooseIntervention(candidates, turnNumber);
}
