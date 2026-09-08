import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";

/**
 * Loads environment variables from `.env.local` then `.env` (relative to baseDir).
 * Existing process.env values are never overridden. Simple KEY=VALUE parsing only.
 *
 * @param {string} [baseDir] Directory to look for env files in (defaults to cwd).
 */
export function loadEnv(baseDir = process.cwd()) {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(baseDir, file);
    if (!existsSync(path)) {
      continue;
    }

    const content = readFileSync(path, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const eqIndex = line.indexOf("=");
      if (eqIndex === -1) {
        continue;
      }

      const key = line.slice(0, eqIndex).trim();
      if (!key) {
        continue;
      }

      if (key in process.env) {
        continue;
      }

      let value = line.slice(eqIndex + 1).trim();
      if (value.length >= 2) {
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
      }

      process.env[key] = value;
    }
  }
}