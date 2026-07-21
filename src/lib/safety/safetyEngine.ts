import { scrubPii } from "@/lib/privacy/piiScrubber";
import { classifyIntent } from "@/lib/safety/intentClassifier";
import { classifyRisk } from "@/lib/safety/riskClassifier";
import { chooseIntervention, routeSafety } from "@/lib/safety/safetyRouter";
import type { SafetyAnalysis } from "@/types/safety";

export interface AnalyzedMessage extends SafetyAnalysis {
  scrubbedMessage: string;
}

export function analyzeMessage(message: string): AnalyzedMessage {
  const { scrubbedMessage, detected } = scrubPii(message);
  const risk = classifyRisk(scrubbedMessage);
  const intents = classifyIntent(scrubbedMessage);
  const routing = routeSafety(risk.level);

  // Safety-critical rule: the deterministic result is authoritative for HIGH risk.
  return {
    scrubbedMessage,
    riskLevel: risk.level,
    intents,
    confidence: risk.confidence,
    piiDetected: detected,
    recommendedAction: risk.level === "HIGH" ? "Connect to human support" : "Offer concise support",
    ...routing,
    intervention: risk.level === "HIGH" ? undefined : chooseIntervention(intents),
  };
}
