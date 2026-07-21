import { languageInstruction, SAFE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { localScenarioResponse } from "@/lib/ai/localScenarios";
import type { Language, RiskLevel } from "@/types/safety";

export interface GenerateInput {
  message: string;
  language: Language;
  riskLevel: RiskLevel;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AIProvider {
  generateSafeResponse(input: GenerateInput): Promise<string>;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
type ChatCompletionPayload = {
  choices?: Array<{
    message?: {
      content?: unknown;
      reasoning_content?: unknown;
    };
  }>;
};

const RESPONSE_CONTRACT = "Return only the final answer, never hidden reasoning or XML. Use 2-4 short sentences, one meaningful question at most, and one practical next step.";

function normalizeModelResponse(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\|im_start\|>[\s\S]*?<\|im_end\|>/gi, "")
    .trim();
}

function validateModelResponse(value: unknown): string {
  const content = normalizeModelResponse(value);
  if (!content || content.length > 900) throw new Error("AI provider returned an unsafe response shape");
  if (/\b(diagnos|prescrib|medication|лекарств|диагноз|назначен|лечить)\w*/i.test(content)) {
    throw new Error("AI provider returned disallowed clinical language");
  }
  return content;
}

function buildMessages(input: GenerateInput, addNoThink = false): ChatMessage[] {
  const history: ChatMessage[] = (input.history || []).map((item) => ({ role: item.role, content: item.content }));
  const userContent = addNoThink && !input.message.endsWith("/no_think")
    ? `${input.message}\n/no_think`
    : input.message;
  return [
    { role: "system", content: `${SAFE_SYSTEM_PROMPT}\n${languageInstruction(input.language, input.riskLevel)}\n${RESPONSE_CONTRACT}` },
    ...history,
    { role: "user", content: userContent },
  ];
}

export class DemoAIProvider implements AIProvider {
  async generateSafeResponse(input: GenerateInput): Promise<string> {
    return localScenarioResponse(input);
  }
}

export class OpenAICompatibleProvider implements AIProvider {
  async generateSafeResponse(input: GenerateInput): Promise<string> {
    const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 15000));
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.AI_API_KEY}` },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 220,
          messages: buildMessages(input),
        }),
      });
      if (!response.ok) throw new Error(`AI provider error: ${response.status}`);
      const payload = (await response.json()) as ChatCompletionPayload;
      return validateModelResponse(payload.choices?.[0]?.message?.content);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export class HuggingFaceProvider implements AIProvider {
  private readonly baseUrl = (process.env.HF_BASE_URL || "https://router.huggingface.co/v1").replace(/\/$/, "");
  private readonly models = [
    process.env.HF_MODEL || "Qwen/Qwen3-8B",
    process.env.HF_FALLBACK_MODEL || "Qwen/Qwen3-4B-Instruct-2507",
  ].filter((model, index, all) => model && all.indexOf(model) === index);

  async generateSafeResponse(input: GenerateInput): Promise<string> {
    let lastError: unknown;
    for (const model of this.models) {
      try {
        return await this.generateWithModel(model, input);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Hugging Face providers unavailable");
  }

  private async generateWithModel(model: string, input: GenerateInput): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.HF_TIMEOUT_MS || 12000));
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          max_tokens: Math.min(Math.max(Number(process.env.HF_MAX_TOKENS || 240), 80), 320),
          messages: buildMessages(input, true),
        }),
      });
      if (!response.ok) throw new Error(`Hugging Face provider error: ${response.status}`);
      const payload = (await response.json()) as ChatCompletionPayload;
      return validateModelResponse(payload.choices?.[0]?.message?.content);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function getAIProvider(): AIProvider {
  if (process.env.HF_TOKEN?.trim()) return new HuggingFaceProvider();
  return process.env.AI_API_KEY?.trim() ? new OpenAICompatibleProvider() : new DemoAIProvider();
}

export async function generateSafeResponse(input: GenerateInput): Promise<string> {
  try {
    return await getAIProvider().generateSafeResponse(input);
  } catch {
    // Provider outages must never turn a safe support route into an application error.
    return new DemoAIProvider().generateSafeResponse(input);
  }
}

export function crisisResponse(language: Language): string {
  return language === "kk"
    ? "Саған қазір өте ауыр болуы мүмкін. Мұны жалғыз көтерме: сенетін адамыңа қазір хабарлас немесе жергілікті жедел қызметке жүгін. Төмендегі қауіпсіздік қадамдарының бірін таңда."
    : "Похоже, тебе сейчас может быть очень тяжело. Не оставайся с этим в одиночку: свяжись с человеком, которому доверяешь, или обратись в местные экстренные службы. Выбери один из безопасных шагов ниже.";
}
