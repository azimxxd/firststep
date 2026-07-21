import { NextResponse } from "next/server";
import { crisisResponse, generateSafeResponse } from "@/lib/ai/provider";
import { getDeploymentReadiness } from "@/lib/config/runtime";
import { scrubPii } from "@/lib/privacy/piiScrubber";
import { analyzeMessage } from "@/lib/safety/safetyEngine";
import { classifyIntent } from "@/lib/safety/intentClassifier";
import { chooseIntervention } from "@/lib/safety/safetyRouter";
import { checkChatRateLimit } from "@/lib/security/rateLimit";
import type { ConversationContext, Intent, Language } from "@/types/safety";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_MESSAGE_CHARS = 2000;
const MAX_BODY_BYTES = 24_000;
const MAX_HISTORY_ITEMS = 6;
const MAX_HISTORY_ITEM_CHARS = 700;
const MAX_HISTORY_TOTAL_CHARS = 3_000;
const sessionIdPattern = /^[a-z0-9-]{8,128}$/i;

function firstMeaningfulIntent(intents: Intent[]): Intent {
  return intents.find((intent) => intent !== "UNKNOWN") || "UNKNOWN";
}

function buildConversationContext(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  currentIntents: Intent[],
): ConversationContext {
  const previousUserIntents = history
    .filter((item) => item.role === "user")
    .map((item) => firstMeaningfulIntent(classifyIntent(item.content)));
  const previousPrimaryIntent = [...previousUserIntents].reverse().find((intent) => intent !== "UNKNOWN");
  const currentPrimaryIntent = firstMeaningfulIntent(currentIntents);
  const continuedFromContext = currentPrimaryIntent === "UNKNOWN" && Boolean(previousPrimaryIntent);
  const primaryIntent = continuedFromContext ? previousPrimaryIntent! : currentPrimaryIntent;
  const topics = [...new Set([...previousUserIntents, ...currentIntents])]
    .filter((intent) => intent !== "UNKNOWN")
    .filter((intent) => intent !== primaryIntent)
    .slice(-3);
  if (primaryIntent !== "UNKNOWN") topics.push(primaryIntent);

  return {
    primaryIntent,
    previousPrimaryIntent,
    topics,
    topicShift: Boolean(
      previousPrimaryIntent
      && currentPrimaryIntent !== "UNKNOWN"
      && currentPrimaryIntent !== previousPrimaryIntent,
    ),
    continuedFromContext,
    turnNumber: previousUserIntents.length + 1,
  };
}

function jsonResponse(payload: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const requestHeaders = { "X-Request-ID": requestId };
  const log = (event: string, fields: Record<string, string | number | boolean | undefined> = {}) => {
    console.info(JSON.stringify({ event, requestId, durationMs: Date.now() - startedAt, ...fields }));
  };

  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      log("chat_rejected", { status: 413, reason: "body_too_large" });
      return jsonResponse({ error: "Request body is too large.", requestId }, 413, requestHeaders);
    }

    const body = (await request.json()) as { message?: unknown; sessionId?: unknown; language?: unknown; history?: unknown };
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    const language: Language = body.language === "kk" ? "kk" : "ru";
    if (!message || message.length > MAX_MESSAGE_CHARS || !sessionIdPattern.test(sessionId)) {
      log("chat_rejected", { status: 400, reason: "invalid_request" });
      return jsonResponse({ error: "A valid message and anonymous session are required.", requestId }, 400, requestHeaders);
    }

    const analysis = analyzeMessage(message);
    if (!analysis.generationAllowed) {
      const conversation = buildConversationContext([], analysis.intents);
      log("chat_completed", {
        status: 200,
        riskRoute: analysis.route,
        primaryIntent: conversation.primaryIntent,
        provider: "none",
        fallback: false,
        piiDetected: analysis.piiDetected.length > 0,
      });
      return jsonResponse({
        message: crisisResponse(language),
        safety: {
          riskLevel: analysis.riskLevel,
          intents: analysis.intents,
          generationAllowed: analysis.generationAllowed,
          route: analysis.route,
          piiDetected: analysis.piiDetected,
        },
        conversation,
        requestId,
      }, 200, requestHeaders);
    }

    const readiness = getDeploymentReadiness();
    if (!readiness.ready) {
      log("chat_rejected", {
        status: 503,
        reason: "production_controls_unavailable",
        missingControls: readiness.missing.join(","),
      });
      return jsonResponse({
        error: "Production safety controls are temporarily unavailable.",
        code: "PRODUCTION_CONTROLS_UNAVAILABLE",
        requestId,
      }, 503, requestHeaders);
    }

    const rateLimit = await checkChatRateLimit(request);
    const rateLimitHeaders: Record<string, string> = {};
    if (rateLimit.configured) {
      rateLimitHeaders["X-RateLimit-Limit"] = String(rateLimit.limit);
      rateLimitHeaders["X-RateLimit-Remaining"] = String(rateLimit.remaining);
    }
    if (!rateLimit.allowed) {
      const status = rateLimit.reason === "limited" ? 429 : 503;
      log("chat_rejected", { status, reason: rateLimit.reason, rateLimitConfigured: rateLimit.configured });
      return jsonResponse({
        error: status === 429
          ? "Too many requests. Please wait before trying again."
          : "Production safety controls are temporarily unavailable.",
        code: status === 429 ? "RATE_LIMITED" : "PRODUCTION_CONTROLS_UNAVAILABLE",
        requestId,
      }, status, {
        ...requestHeaders,
        ...rateLimitHeaders,
        "Retry-After": String(rateLimit.retryAfterSeconds),
      });
    }

    let historyTotal = 0;
    const history = (Array.isArray(body.history)
      ? body.history
        .filter((item): item is { role: "user" | "assistant"; content: string } => {
          if (typeof item !== "object" || item === null) return false;
          const role = (item as { role?: unknown }).role;
          const content = (item as { content?: unknown }).content;
          return (role === "user" || role === "assistant") && typeof content === "string";
        })
        .slice(-MAX_HISTORY_ITEMS)
        .map((item) => ({
          role: item.role,
          content: scrubPii(item.content.trim().slice(0, MAX_HISTORY_ITEM_CHARS)).scrubbedMessage,
        }))
        .reverse()
        .filter((item) => {
          if (!item.content || historyTotal + item.content.length > MAX_HISTORY_TOTAL_CHARS) return false;
          historyTotal += item.content.length;
          return true;
        })
        .reverse()
      : []);
    const conversation = buildConversationContext(history, analysis.intents);
    const generated = await generateSafeResponse({
      message: analysis.scrubbedMessage,
      sessionId,
      language,
      riskLevel: analysis.riskLevel,
      intents: analysis.intents,
      conversation,
      history,
    });

    log("chat_completed", {
      status: 200,
      riskRoute: analysis.route,
      primaryIntent: conversation.primaryIntent,
      topicShift: conversation.topicShift,
      provider: generated.provider,
      fallback: generated.fallback,
      strategy: generated.strategy,
      piiDetected: analysis.piiDetected.length > 0,
      rateLimitConfigured: rateLimit.configured,
    });

    return jsonResponse({
      message: generated.message,
      safety: {
        riskLevel: analysis.riskLevel,
        intents: analysis.intents,
        generationAllowed: analysis.generationAllowed,
        route: analysis.route,
        piiDetected: analysis.piiDetected,
      },
      intervention: analysis.intervention
        || (analysis.generationAllowed && conversation.continuedFromContext
          ? chooseIntervention([conversation.primaryIntent])
          : undefined),
      conversation,
      requestId,
    }, 200, { ...requestHeaders, ...rateLimitHeaders });
  } catch {
    console.error(JSON.stringify({ event: "chat_failed", requestId, durationMs: Date.now() - startedAt, status: 500 }));
    return jsonResponse({ error: "Unable to process this message safely.", requestId }, 500, requestHeaders);
  }
}
