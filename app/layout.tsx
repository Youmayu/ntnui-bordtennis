import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NTNUI Bordtennis",
  description: "Registrering og info for treninger ved Dragvoll Idrettssenter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b border-[color:rgba(37,26,20,0.08)] bg-[rgba(251,245,239,0.78)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-[color:rgb(37,26,20)] transition hover:text-[color:rgb(163,50,31)]"
            >
              NTNUI Bordtennis
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                className="rounded-full px-4 py-2 font-medium text-[color:rgb(74,58,52)] transition hover:bg-white/70 hover:text-[color:rgb(37,26,20)]"
                href="/schedule"
              >
                Timeplan
              </Link>
              <Link
                className="rounded-full bg-[color:rgb(163,50,31)] px-4 py-2 font-semibold text-white shadow-[0_10px_24px_rgba(163,50,31,0.22)] transition hover:bg-[color:rgb(145,43,25)]"
                href="/register"
              >
                Påmelding
              </Link>
              <Link
                className="rounded-full px-4 py-2 font-medium text-[color:rgb(74,58,52)] transition hover:bg-white/70 hover:text-[color:rgb(37,26,20)]"
                href="/unregister"
              >
                Avmelding
              </Link>
              <Link
                className="rounded-full px-4 py-2 font-medium text-[color:rgb(74,58,52)] transition hover:bg-white/70 hover:text-[color:rgb(37,26,20)]"
                href="/about"
              >
                Om oss
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">{children}</main>

        <footer className="border-t border-[color:rgba(37,26,20,0.08)]">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-[color:rgb(113,91,83)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium text-[color:rgb(74,58,52)]">NTNU Dragvoll Idrettssenter</div>
            </div>
            <div>© {new Date().getFullYear()} NTNUI Bordtennis</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
