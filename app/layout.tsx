import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
import InstallPrompt from "@/components/InstallPrompt";
import ValueFirstInstall from "@/components/ValueFirstInstall";
import { SITE } from "@/lib/site";
import AnalyticsConsent from "@/components/AnalyticsConsent";

// Bundled font: builds and page loads do not require a Google Fonts connection.
const sans = localFont({
  src: "../public/fonts/plus-jakarta-sans-latin.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-sans",
  fallback: ["Arial", "sans-serif"],
});

// Default metadata for the whole site. Individual pages override title/description.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s`, // pages already append "| HomeMoney Calc" via buildMetadata
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {/* Install prompt ka event React load hone se pehle aa sakta hai — yahin pakad ke rakhte hain */}
        <script
          dangerouslySetInnerHTML={{
            __html: "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__installEvent=e;window.dispatchEvent(new Event('hmc:installable'))});",
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2 focus:text-ink focus:shadow-lift">
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
        <InstallPrompt />
        <ValueFirstInstall />
        <AnalyticsConsent />
        {/* Offline support sirf live (production) build me. Dev me chunk names same rehte
            hain, to cached purani JS se page toot jaata - isliye dev me SW hata dete hain. */}
        <Script id="sw-register" strategy="lazyOnload">
          {process.env.NODE_ENV === "production"
            ? `if('serviceWorker' in navigator&&location.pathname.indexOf('/embed/')!==0){navigator.serviceWorker.register('/sw.js').catch(function(){})}`
            : `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})});if(window.caches){caches.keys().then(function(k){k.forEach(function(n){caches.delete(n)})})}}`}
        </Script>
      </body>
    </html>
  );
}
