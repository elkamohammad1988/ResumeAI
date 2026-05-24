import type { NextConfig } from "next";

// OWASP recommended security headers. Applied to every route. Tweak the CSP
// connect-src if you add new backend hosts (e.g. analytics, third-party APIs).
const securityHeaders = [
  // Clickjacking — also enforced via CSP frame-ancestors below for modern browsers.
  { key: "X-Frame-Options", value: "DENY" },
  // MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful browser features we don't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Force HTTPS (Vercel sets this too — explicit defense in depth).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // CSP — restrict where the page can load resources from.
  // - 'unsafe-inline' is required for Next.js styling/runtime; future work:
  //   migrate to nonce-based CSP (Next 13.4+ supports it via middleware).
  // - connect-src includes Supabase, Stripe, and Google Generative AI (server
  //   actions hit these from the browser-rendered page).
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://generativelanguage.googleapis.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable the X-Powered-By: Next.js header — minor info disclosure.
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Stripe webhook MUST allow framing from Stripe (set via CSP frame-src
      // above) but should not advertise these defenses to attackers probing
      // POST-only routes. No special override needed.
    ];
  },
};

export default nextConfig;
