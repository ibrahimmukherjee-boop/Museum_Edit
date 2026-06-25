#!/usr/bin/env node
/**
 * Pull GLM-5.2 for the Leonardo Museum CORTEX polish layer.
 * Uses Ollama cloud tag (no 240GB local download).
 *
 * Usage: npm run setup:glm
 * Requires: ollama installed, `ollama login` for cloud models.
 */
import { execSync, spawnSync } from "node:child_process";

const MODEL = process.env.GLM_MODEL ?? "glm-5.2:cloud";
const FALLBACK = "qwen2.5:7b-instruct-q4_K_M";

function hasOllama() {
  return spawnSync("which", ["ollama"], { encoding: "utf8" }).status === 0;
}

if (!hasOllama()) {
  console.error("Ollama not found. Install from https://ollama.com");
  process.exit(1);
}

console.log(`Pulling ${MODEL} for CORTEX polish…`);
console.log("(Cloud models need: ollama login)\n");

try {
  execSync(`ollama pull ${MODEL}`, { stdio: "inherit" });
  console.log(`\n✓ ${MODEL} ready`);
} catch {
  console.warn(`\n⚠ Could not pull ${MODEL}. Trying fallback ${FALLBACK}…`);
  try {
    execSync(`ollama pull ${FALLBACK}`, { stdio: "inherit" });
    console.log(`\n✓ Using fallback ${FALLBACK}`);
    console.log(`  Set model name in Parlor → Settings to "${FALLBACK}"`);
  } catch {
    console.error("\n✗ Pull failed. Run `ollama login` then retry.");
    process.exit(1);
  }
}

console.log("\nCORTEX pipeline: curated answer → GLM polish → visitor");
console.log("Start museum: npm run serve");
