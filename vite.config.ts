import vinext from "vinext";
import { defineConfig } from "vite";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { configureToolEnvironment } from "./scripts/tool-environment.mjs";
import { sites } from "./scripts/vite/sites-vite-plugin";
import { connectorPreview } from "./scripts/vite/connector-preview-plugin.mjs";

// Without an explicit ID, Wrangler inherits this Worker's DB binding or provisions one.
const databaseId = process.env.DEAL_D1_DATABASE_ID?.trim();
if (databaseId && (
  !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(databaseId) ||
  databaseId === "00000000-0000-4000-8000-000000000000" ||
  databaseId === "00000000-0000-0000-0000-000000000000"
)) {
  throw new Error("DEAL_D1_DATABASE_ID must be the UUID of your Cloudflare D1 database. Leave it unset for automatic binding.");
}

// Sites supplies its own manifest. GitHub uploads can use the visible root copy.
const sitesManifest = resolve(".openai", "hosting.json");
const hostingManifestPath = existsSync(sitesManifest) ? sitesManifest : resolve("hosting.json");
const { d1, r2 } = JSON.parse(readFileSync(hostingManifestPath, "utf8")) as {
  d1: string | null;
  r2: string | null;
};

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const managedLinux = readExecutionProfile() === "managed-linux";

const bindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          ...(databaseId ? { database_id: databaseId } : {}),
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async ({ command }) => {
  configureToolEnvironment(process.cwd());

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      ...(managedLinux
        ? { host: "0.0.0.0", allowedHosts: ["terminal.local"] }
        : {}),
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites({ mockAuth: !managedLinux, hostingManifestPath }),
      connectorPreview(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          ...bindingConfig,
          ...(command === "serve"
            ? {
                services: [
                  {
                    binding: "CONNECTORS",
                    service: "sites-connector-preview",
                    entrypoint: "ConnectorPreview",
                  },
                ],
              }
            : {}),
        },
        ...(command === "serve"
          ? {
              auxiliaryWorkers: [
                {
                  config: {
                    name: "sites-connector-preview",
                    main: "./scripts/connector-preview/worker.mjs",
                    compatibility_date: "2026-05-15",
                  },
                },
              ],
            }
          : {}),
      }),
    ],
  };
});
