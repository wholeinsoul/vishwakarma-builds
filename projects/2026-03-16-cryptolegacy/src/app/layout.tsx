import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoLegacy — Crypto Inheritance Made Simple",
  description:
    "Protect your crypto assets with encrypted recovery plans and a dead man's switch. Your loved ones get access when they need it most.",
  keywords: [
    "crypto inheritance",
    "dead mans switch",
    "crypto recovery",
    "bitcoin inheritance",
    "cryptocurrency estate planning",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
