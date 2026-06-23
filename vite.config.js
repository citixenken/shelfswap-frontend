import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// Placeholder values from .env.example / .env.local that must never be baked
// into a build — they make Clerk fail to load (failed_to_load_clerk_js_timeout).
const PLACEHOLDER_CLERK_KEYS = [
  "pk_test_REPLACE_WITH_YOUR_KEY",
  "your_vite_clerk_publishable_key_here",
];

// A valid Clerk publishable key decodes (base64, after the pk_test_/pk_live_
// prefix) to the Frontend API host followed by `$` (e.g. "clerk.example.com$").
const isValidClerkKey = (key) => {
  const match = /^pk_(test|live)_([A-Za-z0-9+/=]+)$/.exec(key);
  if (!match) return false;
  try {
    const host = Buffer.from(match[2], "base64").toString("utf8");
    return host.includes(".") && host.endsWith("$");
  } catch {
    return false;
  }
};

// Fail the production build early when the Clerk key is missing/placeholder/
// malformed, so a broken-auth bundle can never reach production.
function validateClerkPublishableKey(mode) {
  return {
    name: "shelfswap:validate-clerk-key",
    apply: "build",
    config() {
      const env = loadEnv(mode, process.cwd(), "VITE_");
      const key = (env.VITE_CLERK_PUBLISHABLE_KEY || "").trim();
      if (!key) {
        throw new Error(
          "\n[ShelfSwap] Build aborted: VITE_CLERK_PUBLISHABLE_KEY is not set.\n" +
            "Provide your real Clerk publishable key before building so production auth works.\n" +
            "See ENV_VARS.md / DEPLOYMENT.md.\n",
        );
      }
      if (PLACEHOLDER_CLERK_KEYS.includes(key) || !isValidClerkKey(key)) {
        throw new Error(
          `\n[ShelfSwap] Build aborted: VITE_CLERK_PUBLISHABLE_KEY is a placeholder or malformed value ("${key}").\n` +
            "Replace it with your real Clerk publishable key (pk_test_… / pk_live_…) from https://dashboard.clerk.com.\n" +
            "This guard prevents shipping a build where Clerk fails to load (failed_to_load_clerk_js_timeout).\n",
        );
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), validateClerkPublishableKey(mode)],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    // Production optimizations
    minify: "terser",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"],
          clerk: ["@clerk/vue"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
