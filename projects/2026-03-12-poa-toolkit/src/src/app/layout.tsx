import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ConcretePOA - Bank POA Requirements Tracker",
  description:
    "Track Power of Attorney requirements for major US banks. Document checklists, submission tracking, and community rejection reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-navy-600 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-bold text-lg">ConcretePOA</p>
                <p className="text-navy-200 text-sm">
                  Bank POA Requirements Tracker
                </p>
              </div>
              <p className="text-navy-200 text-sm">
                Disclaimer: This tool provides general guidance only. Always
                verify requirements directly with each bank.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
