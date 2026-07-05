#!/usr/bin/env node
/** Write deploy/leonardo-museum.modelfile for inspection / manual ollama create. */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { buildLeonardoModelfile, LEONARDO_OLLAMA_MODEL } = await import("../src/cortex/leonardoModel.ts");

mkdirSync(join(root, "deploy"), { recursive: true });
const out = join(root, "deploy", "leonardo-museum.modelfile");
writeFileSync(out, buildLeonardoModelfile(), "utf8");
console.log(`Wrote ${LEONARDO_OLLAMA_MODEL} modelfile → ${out}`);
