import type { RiskLevel } from "@/types/safety";

const highRiskPatterns = [
  /не хочу жить/i,
  /хочу умереть/i,
  /покончу с собой/i,
  /убить себя/i,
  /суицид/i,
  /порезать себя/i,
  /причинить себе вред/i,
  /самоповреж/i,
  /(?:want to|going to|plan to) (?:die|kill myself)/i,
  /self[- ]?harm/i,
  /өмір сүргім келмейді/i,
  /өзімді өлтіремін/i,
  /өзіме зиян/i,
];

const mediumRiskPatterns = [
  /не справляюсь/i,
  /не выдерживаю/i,
  /очень тяжело/i,
  /безысход/i,
  /сильн(ая|ую) тревог/i,
  /тревожн|тревог|не могу успокоиться|страшно|волнуюсь|переживаю/i,
  /паник/i,
  /одинок/i,
  /травят|буллинг|издеваются/i,
  /қатты уайым/i,
  /жалғыз/i,
  /шыдай алмай/i,
];

export function classifyRisk(message: string): { level: RiskLevel; confidence: number } {
  if (highRiskPatterns.some((pattern) => pattern.test(message))) {
    return { level: "HIGH", confidence: 0.98 };
  }
  if (mediumRiskPatterns.some((pattern) => pattern.test(message))) {
    return { level: "MEDIUM", confidence: 0.84 };
  }
  return { level: "LOW", confidence: 0.72 };
}
