export type PiiType = "PHONE" | "EMAIL";

export interface ScrubResult {
  scrubbedMessage: string;
  detected: PiiType[];
}

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phonePattern = /(?<!\w)(?:\+?\d[\s().-]?){9,14}\b/g;

export function scrubPii(message: string): ScrubResult {
  const detected = new Set<PiiType>();
  let scrubbedMessage = message.replace(emailPattern, () => {
    detected.add("EMAIL");
    return "[EMAIL_REDACTED]";
  });

  scrubbedMessage = scrubbedMessage.replace(phonePattern, () => {
    detected.add("PHONE");
    return "[PHONE_REDACTED]";
  });

  return { scrubbedMessage, detected: [...detected] };
}
