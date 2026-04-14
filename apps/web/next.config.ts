import type { NextConfig } from "next";

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

console.log("[next.config] loaded, cwd=", process.cwd());

const nextConfig: NextConfig = {
  // Pin turbopack root to this app so it doesn't pick up an unrelated
  // lockfile higher up in C:\Users\JBOO\.
  // Pin both the turbopack root and the file-tracing root to this app's
  // directory to (a) silence the multi-lockfile warning caused by an
  // unrelated package-lock.json in C:\Users\JBOO\ and (b) keep file tracing
  // scoped to the web app.
  turbopack: {
    root: "C:\\Users\\JBOO\\dreams\\apps\\web",
  },
  outputFileTracingRoot: "C:\\Users\\JBOO\\dreams\\apps\\web",
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
