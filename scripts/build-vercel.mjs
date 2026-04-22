import { createRequire } from "node:module";
import { mkdir, rm, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { execSync } from "node:child_process";

globalThis.require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function buildApi() {
  const apiDir = path.resolve(root, "api");
  await rm(apiDir, { recursive: true, force: true });
  await mkdir(apiDir, { recursive: true });

  await esbuild({
    entryPoints: [
      path.resolve(root, "artifacts/api-server/src/serverless.ts"),
    ],
    platform: "node",
    target: "node20",
    bundle: true,
    format: "esm",
    outfile: path.resolve(apiDir, "_app.mjs"),
    logLevel: "info",
    external: ["*.node", "pg-native"],
    sourcemap: false,
    banner: {
      js: `import { createRequire as __bcr } from 'node:module';
import __bp from 'node:path';
import __bu from 'node:url';
globalThis.require = __bcr(import.meta.url);
globalThis.__filename = __bu.fileURLToPath(import.meta.url);
globalThis.__dirname = __bp.dirname(globalThis.__filename);`,
    },
  });
}

async function writeHandler() {
  const file = path.resolve(root, "api/index.mjs");
  const code = `import app from "./_app.mjs";
export default function handler(req, res) {
  return app(req, res);
}
`;
  const { writeFile } = await import("node:fs/promises");
  await writeFile(file, code, "utf8");
}

async function buildFrontend() {
  process.env.NODE_ENV = "production";
  process.env.BASE_PATH = "/";
  execSync("pnpm --filter @workspace/datawave run build", {
    stdio: "inherit",
    cwd: root,
    env: { ...process.env },
  });
  const outDir = path.resolve(root, "dist");
  await rm(outDir, { recursive: true, force: true });
  await cp(path.resolve(root, "artifacts/datawave/dist/public"), outDir, {
    recursive: true,
  });
}

console.log("→ Building API bundle…");
await buildApi();
await writeHandler();
console.log("→ Building frontend…");
await buildFrontend();
console.log("✓ Vercel build complete");
