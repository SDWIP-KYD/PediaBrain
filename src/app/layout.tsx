import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { GlobalSearch } from "@/components/global-search";
import { QuickCapture } from "@/components/quick-capture";
import { Brain } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PediaBrain",
  description: "Personal Medical PKM - Knowledge Management untuk Dokter Anak",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex bg-background text-foreground overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 lg:ml-56 min-h-screen overflow-x-hidden">
          <div className="flex items-center justify-between px-4 pt-3 lg:px-6 lg:pt-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight hover:opacity-80 transition-opacity lg:hidden">
              <Brain className="h-5 w-5 text-neon" />
              <span>Pedia-Brain</span>
            </Link>
            <div className="hidden lg:block" />
            <GlobalSearch />
          </div>
          <div className="px-4 py-4 lg:px-6 lg:py-6 max-w-5xl">
            {children}
          </div>
        </main>
        <QuickCapture />
      </body>
    </html>
  );
}
