import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Partypop - AI Kids' Birthday Party Planner",
  description: "Plan the perfect kids' birthday party in minutes with AI-powered planning, themed templates, and RSVP tracking.",
  openGraph: {
    title: "Partypop - AI Kids' Birthday Party Planner",
    description: "Plan the perfect kids' birthday party in minutes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white no-print">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-2xl">🎉</span>
              <span className="bg-gradient-to-r from-party-pink to-party-purple bg-clip-text text-transparent">
                Partypop
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/themes" className="text-sm text-gray-600 hover:text-gray-900">
                Themes
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                My Parties
              </Link>
              <Link
                href="/plan/new"
                className="rounded-lg bg-party-pink px-4 py-2 text-sm font-medium text-white hover:bg-pink-600"
              >
                Plan a Party
              </Link>
            </div>
          </div>
        </nav>
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>
        <footer className="border-t bg-gray-50 py-8 no-print">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
            <p>
              🎉 Partypop — AI-powered kids&apos; birthday party planning.
            </p>
            <p className="mt-1">Made with love for busy parents everywhere.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
