import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Pumpline — Find Trusted Septic Services Near You",
    template: "%s | Pumpline",
  },
  description:
    "Find and compare septic service providers in your county. Read reviews, compare pricing, and connect with trusted local professionals.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://pumpline.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)] antialiased bg-zinc-950 text-zinc-100 min-h-screen flex flex-col`}
      >
        <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
          <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-bold text-orange-500 hover:text-orange-400 transition-colors"
            >
              Pumpline
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/checklist"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Free Checklist
              </Link>
              <Link
                href="/for-providers"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                For Providers
              </Link>
              <Link
                href="/about"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                About
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-zinc-800 bg-zinc-950 mt-auto">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold text-orange-500 mb-3">
                  Pumpline
                </h3>
                <p className="text-sm text-zinc-400">
                  Helping rural homeowners find trusted septic service providers
                  since 2026.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  Resources
                </h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li>
                    <Link
                      href="/checklist"
                      className="hover:text-orange-500 transition-colors"
                    >
                      Septic Maintenance Checklist
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/for-providers"
                      className="hover:text-orange-500 transition-colors"
                    >
                      List Your Business
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-orange-500 transition-colors"
                    >
                      About Pumpline
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">
                  Popular Areas
                </h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li>
                    <Link
                      href="/county/travis-county-tx"
                      className="hover:text-orange-500 transition-colors"
                    >
                      Travis County, TX
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/county/wake-county-nc"
                      className="hover:text-orange-500 transition-colors"
                    >
                      Wake County, NC
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/county/polk-county-fl"
                      className="hover:text-orange-500 transition-colors"
                    >
                      Polk County, FL
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
              &copy; {new Date().getFullYear()} Pumpline. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
