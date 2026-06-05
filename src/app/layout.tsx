import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { GlobalSearch } from "@/components/global-search";
import { QuickCapture } from "@/components/quick-capture";
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
        <div className="flex-1 lg:ml-56 min-h-screen flex flex-col overflow-x-hidden">
          <header className="sticky top-0 z-40 flex items-center gap-2 px-3 py-2 lg:px-6 border-b border-border bg-background/95 backdrop-blur min-h-[48px]">
            <Navbar />
            <div className="flex items-center gap-2 shrink-0">
              <GlobalSearch />
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden">
            <div className="px-4 py-4 lg:px-6 lg:py-6 max-w-5xl">
              {children}
            </div>
          </main>
        </div>
        <QuickCapture />
      </body>
    </html>
  );
}
