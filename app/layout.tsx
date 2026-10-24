import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";
import InstallPrompt from "@/components/InstallPrompt";
import { SITE } from "@/lib/site";

// Font build time pe download hoke site ke saath self-host hota hai
// (Google ko runtime request nahi = fast + privacy friendly).
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// Default metadata for the whole site. Individual pages override title/description.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s`, // pages already append "| CalcIvy" via buildMetadata
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b110e" },
  ],
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
            __html: "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__installEvent=e;window.dispatchEvent(new Event('calcivy:installable'))});",
          }}
        />
        {/* AdSense loader — only injected AFTER you set adsensePublisherId in lib/site.ts.
            Google needs this script on every page for ads + for site verification. */}
        {SITE.adsensePublisherId ? (
          <Script
            id="adsense-init"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsensePublisherId}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <InstallPrompt />
        {/* Offline support sirf live (production) build me. Dev me chunk names same rehte
            hain, to cached purani JS se page toot jaata - isliye dev me SW hata dete hain. */}
        <Script id="sw-register" strategy="lazyOnload">
          {process.env.NODE_ENV === "production"
            ? `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){})}`
            : `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(x){x.unregister()})});if(window.caches){caches.keys().then(function(k){k.forEach(function(n){caches.delete(n)})})}}`}
        </Script>
      </body>
    </html>
  );
}
