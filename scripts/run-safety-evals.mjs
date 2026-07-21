import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { classifyIntent } from "../src/lib/safety/intentClassifier.ts";
import { classifyRisk } from "../src/lib/safety/riskClassifier.ts";
import { chooseIntervention } from "../src/lib/safety/safetyRouter.ts";
import { scrubPii } from "../src/lib/privacy/piiScrubber.ts";

const datasetPath = fileURLToPath(new URL("../docs/evals/student-stress-safety.jsonl", import.meta.url));
const rows = (await readFile(datasetPath, "utf8"))
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const failures = [];

for (const row of rows) {
  const risk = classifyRisk(row.message).level;
  const intents = classifyIntent(row.message);

  if (risk !== row.expectedRisk) failures.push(`${row.id}: risk ${risk}, expected ${row.expectedRisk}`);

  for (const expectedIntent of row.expectedIntents || []) {
    if (!intents.includes(expectedIntent)) {
      failures.push(`${row.id}: missing intent ${expectedIntent}; got ${intents.join(", ")}`);
    }
  }
}

const piiCases = [
  { input: "Напиши мне на student@example.com", marker: "[EMAIL_REDACTED]" },
  { input: "Мой номер +7 777 123 45 67", marker: "[PHONE_REDACTED]" },
];

for (const [index, test] of piiCases.entries()) {
  const result = scrubPii(test.input);
  if (!result.scrubbedMessage.includes(test.marker)) {
    failures.push(`pii-${index + 1}: expected ${test.marker}; got ${result.scrubbedMessage}`);
  }
}

const interventionCases = [
  { intents: ["ANXIETY"], turn: 1, expected: "BREATHING" },
  { intents: ["ANXIETY"], turn: 2, expected: "GROUNDING" },
  { intents: ["ACADEMIC_STRESS"], turn: 2, expected: "STUDY_RESET" },
  { intents: ["ACADEMIC_STRESS"], turn: 3, expected: "SCREEN_BREAK" },
];

for (const [index, test] of interventionCases.entries()) {
  const result = chooseIntervention(test.intents, test.turn)?.type;
  if (result !== test.expected) {
    failures.push(`intervention-${index + 1}: expected ${test.expected}; got ${result || "none"}`);
  }
}

if (failures.length) {
  console.error(`Safety evals failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Safety evals passed: ${rows.length} routing cases, ${piiCases.length} PII cases, ${interventionCases.length} intervention cases.`);
}
