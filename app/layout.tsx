import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-code",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube Transcript API",
  description: "Simple API for pulling timestamped transcripts from public YouTube videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${headingFont.variable} ${monoFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:rgba(246,247,245,0.9)] backdrop-blur">
          <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
            <Link href="/" className="text-sm font-semibold tracking-wide text-[var(--brand-strong)]">
              YouTube Transcript API
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]">
                Dashboard
              </Link>
              <Link href="/login" className="rounded-md px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--foreground)]">
                Log in
              </Link>
              <Link href="/signup" className="rounded-md bg-[var(--brand)] px-3 py-1.5 font-medium text-white transition hover:bg-[var(--brand-strong)]">
                Sign up
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
