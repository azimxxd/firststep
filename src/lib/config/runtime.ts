export interface DeploymentReadiness {
  ready: boolean;
  controlsRequired: boolean;
  checks: {
    aiProvider: boolean;
    distributedRateLimit: boolean;
    rateLimitHashSecret: boolean;
  };
  missing: string[];
}

function present(value: string | undefined) {
  return Boolean(value?.trim());
}

export function productionControlsRequired(env: NodeJS.ProcessEnv = process.env) {
  return env.REQUIRE_PRODUCTION_CONTROLS === "true" || env.VERCEL_ENV === "production";
}

export function getDeploymentReadiness(env: NodeJS.ProcessEnv = process.env): DeploymentReadiness {
  const controlsRequired = productionControlsRequired(env);
  const checks = {
    aiProvider: present(env.HF_TOKEN) || present(env.AI_API_KEY),
    distributedRateLimit: present(env.UPSTASH_REDIS_REST_URL) && present(env.UPSTASH_REDIS_REST_TOKEN),
    rateLimitHashSecret: (env.RATE_LIMIT_HASH_SECRET?.trim().length || 0) >= 32,
  };
  const missing = controlsRequired
    ? Object.entries(checks).filter(([, ready]) => !ready).map(([name]) => name)
    : [];

  return {
    ready: missing.length === 0,
    controlsRequired,
    checks,
    missing,
  };
}
