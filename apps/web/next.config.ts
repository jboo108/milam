import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

// TODO(Day 5): wire serwist PWA via withSerwist({ swSrc, swDest }) wrapper
// (serwist + @serwist/next already installed). Leaving stubbed until manifest
// + offline shell are designed.

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' on script-src tightened post-hackathon (data-security review)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://explorer.solana.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

// Pin the turbopack + file-tracing roots to *this file's* directory so the
// build works identically on Windows dev and Linux Docker. `import.meta.url`
// resolves to the Next config path at build time, and dirname gives us the
// app root without hardcoding platform-specific strings.
const appRoot = dirname(fileURLToPath(import.meta.url));

console.log("[next.config] loaded, cwd=", process.cwd(), "appRoot=", appRoot);

const nextConfig: NextConfig = {
  turbopack: { root: appRoot },
  outputFileTracingRoot: appRoot,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
