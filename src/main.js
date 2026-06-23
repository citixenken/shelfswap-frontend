import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./index.css";

import { clerkPlugin } from "@clerk/vue";

const PUBLISHABLE_KEY = (
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ""
).trim();

// Placeholder values shipped in .env.example / .env.local. They are not real
// keys: Clerk can't derive a Frontend API host from them, so clerk.browser.js
// never loads and auth fails with `failed_to_load_clerk_js_timeout`.
const PLACEHOLDER_KEYS = new Set([
  "pk_test_REPLACE_WITH_YOUR_KEY",
  "your_vite_clerk_publishable_key_here",
]);

// A valid Clerk publishable key is `pk_test_<base64>` / `pk_live_<base64>`, where
// the base64 segment decodes to the Frontend API host followed by `$`
// (e.g. "clerk.example.com$"). Validate it so misconfiguration fails loudly and
// early instead of leaving the app in a half-broken, hard-to-debug state.
const isValidClerkKey = (key) => {
  const match = /^pk_(test|live)_([A-Za-z0-9+/=]+)$/.exec(key);
  if (!match) return false;
  try {
    const host = atob(match[2]);
    return host.includes(".") && host.endsWith("$");
  } catch {
    return false;
  }
};

// Render a clear, self-contained message instead of a blank/half-broken page so
// the failure is obvious in any environment, including production.
const renderConfigError = (detail) => {
  const root = document.getElementById("app");
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:#fff7ed;color:#1f2937;">
      <div style="max-width:520px;background:#fff;border:1px solid #fed7aa;border-radius:12px;padding:28px;box-shadow:0 10px 25px rgba(0,0,0,.08);">
        <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;">Authentication isn't configured</h1>
        <p style="margin:0 0 12px;line-height:1.5;color:#4b5563;">
          Sign-in and account features are unavailable because the Clerk publishable key is missing or invalid.
        </p>
        <p style="margin:0 0 16px;line-height:1.5;color:#4b5563;">
          Set a valid <code style="background:#f3f4f6;padding:2px 6px;border-radius:6px;">VITE_CLERK_PUBLISHABLE_KEY</code>
          from the Clerk dashboard <strong>at build time</strong>, then rebuild and redeploy.
        </p>
        <p style="margin:0;font-size:13px;color:#9ca3af;">${detail}</p>
      </div>
    </div>
  `;
};

if (
  !PUBLISHABLE_KEY ||
  PLACEHOLDER_KEYS.has(PUBLISHABLE_KEY) ||
  !isValidClerkKey(PUBLISHABLE_KEY)
) {
  const reason = !PUBLISHABLE_KEY
    ? "VITE_CLERK_PUBLISHABLE_KEY is not set."
    : "VITE_CLERK_PUBLISHABLE_KEY is a placeholder or malformed value.";
  console.error(
    `[ShelfSwap] Auth disabled: ${reason} ` +
      "Provide a real Clerk publishable key (pk_test_… / pk_live_…) via VITE_CLERK_PUBLISHABLE_KEY " +
      "before building. See ENV_VARS.md / DEPLOYMENT.md.",
  );
  renderConfigError(reason);
} else {
  createApp(App)
    .use(router)
    .use(clerkPlugin, {
      publishableKey: PUBLISHABLE_KEY,
    })
    .mount("#app");
}
