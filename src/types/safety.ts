export type Language = "ru" | "kk";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type Intent =
  | "GENERAL_DISTRESS"
  | "ANXIETY"
  | "ACADEMIC_STRESS"
  | "LONELINESS"
  | "BULLYING"
  | "FAMILY_PRESSURE"
  | "PANIC"
  | "SELF_HARM_RISK"
  | "UNKNOWN";

export type SafetyRoute = "SAFE_SUPPORT" | "GENTLE_SUPPORT" | "HUMAN_ESCALATION";

export type InterventionType =
  | "BREATHING"
  | "GROUNDING"
  | "NEXT_STEP"
  | "REACH_OUT"
  | "REFLECTION";

export interface SafetyAnalysis {
  riskLevel: RiskLevel;
  intents: Intent[];
  confidence: number;
  piiDetected: string[];
  recommendedAction: string;
  generationAllowed: boolean;
  route: SafetyRoute;
  intervention?: { type: InterventionType };
}

export interface ConversationContext {
  primaryIntent: Intent;
  previousPrimaryIntent?: Intent;
  topics: Intent[];
  topicShift: boolean;
  continuedFromContext: boolean;
  turnNumber: number;
}

export interface ChatResponse {
  message: string;
  safety: Pick<SafetyAnalysis, "riskLevel" | "intents" | "generationAllowed" | "route"> & {
    piiDetected: string[];
  };
  intervention?: { type: InterventionType };
  conversation: ConversationContext;
}
