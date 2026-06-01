// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Development-only: proxy `/api` to the backend to avoid CORS issues.
  // Requests to `/api/*` from the dev server will be forwarded to http://localhost:9090
  // Remove or adjust when deploying to production (backend should handle CORS or same-origin).
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "http://localhost:9090",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
});
