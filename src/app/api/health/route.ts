import { NextResponse } from "next/server";
import { getDeploymentReadiness } from "@/lib/config/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const readiness = getDeploymentReadiness();
  return NextResponse.json(
    {
      status: readiness.ready ? "ok" : "not_ready",
      service: "firststep",
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local",
      controlsRequired: readiness.controlsRequired,
      checks: readiness.checks,
      missing: readiness.missing,
    },
    {
      status: readiness.ready ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
