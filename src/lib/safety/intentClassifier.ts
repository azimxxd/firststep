import type { Intent } from "@/types/safety";

const intentPatterns: Array<[Intent, RegExp]> = [
  ["SELF_HARM_RISK", /не хочу жить|хочу умереть|суицид|убить себя|өзімді өлтіремін|өзіме зиян/i],
  ["PANIC", /паник|панич|не могу дышать|5-4-3-2-1/i],
  ["ANXIETY", /тревог|тревож|страшно|волнуюсь|пережива|беспокоюсь|қорқам|уайым/i],
  ["ACADEMIC_STRESS", /экзамен|уч[её]б|сесс|долг|оценк|завал|университет|емтихан/i],
  ["LONELINESS", /одинок|одна|никого не знаю|скучаю|жалғыз|досым жоқ/i],
  ["BULLYING", /травят|буллинг|издеваются|обижают|қорқытады|мазақ/i],
  ["FAMILY_PRESSURE", /родител|семья|мама|папа|давят|ата-анам|отбасым/i],
  ["GENERAL_DISTRESS", /плохо|тяжело|груст|устал|не справля|больно|қиын|мұң/i],
];

export function classifyIntent(message: string): Intent[] {
  const intents = intentPatterns.filter(([, pattern]) => pattern.test(message)).map(([intent]) => intent);
  return intents.length ? intents : ["UNKNOWN"];
}
