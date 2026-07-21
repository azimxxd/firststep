import { NextResponse } from "next/server";
import { crisisResponse, generateSafeResponse } from "@/lib/ai/provider";
import { scrubPii } from "@/lib/privacy/piiScrubber";
import { analyzeMessage } from "@/lib/safety/safetyEngine";
import type { Language } from "@/types/safety";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: unknown; sessionId?: unknown; language?: unknown; history?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    const language: Language = body.language === "kk" ? "kk" : "ru";
    if (!message || message.length > 2000 || !sessionId) {
      return NextResponse.json({ error: "Message, sessionId and a message under 2000 characters are required." }, { status: 400 });
    }

    const analysis = analyzeMessage(message);
    const history = Array.isArray(body.history)
      ? body.history
        .filter((item): item is { role: string; content: string } => typeof item === "object" && item !== null && typeof (item as { role?: unknown }).role === "string" && typeof (item as { content?: unknown }).content === "string")
        .slice(-6)
        .map((item) => ({ role: item.role === "assistant" ? "assistant" as const : "user" as const, content: scrubPii(item.content).scrubbedMessage }))
      : [];
    const responseMessage = analysis.generationAllowed
      ? await generateSafeResponse({ message: analysis.scrubbedMessage, language, riskLevel: analysis.riskLevel, history })
      : crisisResponse(language);

    return NextResponse.json({
      message: responseMessage,
      safety: {
        riskLevel: analysis.riskLevel,
        intents: analysis.intents,
        generationAllowed: analysis.generationAllowed,
        route: analysis.route,
        piiDetected: analysis.piiDetected,
      },
      intervention: analysis.intervention,
    });
  } catch {
    return NextResponse.json({ error: "Unable to process this message safely." }, { status: 500 });
  }
}
