import assert from "node:assert/strict";
import { getDeploymentReadiness } from "../src/lib/config/runtime.ts";

const productionMissing = getDeploymentReadiness({ VERCEL_ENV: "production" });
assert.equal(productionMissing.ready, false);
assert.deepEqual(productionMissing.missing.sort(), ["aiProvider", "distributedRateLimit", "rateLimitHashSecret"]);

const productionReady = getDeploymentReadiness({
  VERCEL_ENV: "production",
  HF_TOKEN: "test-only-token",
  UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "test-only-token",
  RATE_LIMIT_HASH_SECRET: "0123456789abcdef0123456789abcdef",
});
assert.equal(productionReady.ready, true);
assert.deepEqual(productionReady.missing, []);

const vercelMarketplaceReady = getDeploymentReadiness({
  VERCEL_ENV: "production",
  GROQ_API_KEY: "test-only-token",
  KV_REST_API_URL: "https://example.upstash.io",
  KV_REST_API_TOKEN: "test-only-token",
  RATE_LIMIT_HASH_SECRET: "0123456789abcdef0123456789abcdef",
});
assert.equal(vercelMarketplaceReady.ready, true);
assert.deepEqual(vercelMarketplaceReady.missing, []);

const previewWithoutExternalControls = getDeploymentReadiness({ VERCEL_ENV: "preview" });
assert.equal(previewWithoutExternalControls.ready, true);
assert.equal(previewWithoutExternalControls.controlsRequired, false);

console.log("Production config evals passed: fail-closed production and permissive preview verified.");
