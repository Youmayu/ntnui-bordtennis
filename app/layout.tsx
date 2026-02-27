import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NTNUI Bordtennis",
  description: "Registrering og info for treninger ved Dragvoll Idrettssenter.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold tracking-tight hover:text-primary">
              NTNUI Bordtennis
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link className="hover:underline" href="/schedule">Timeplan</Link>
              <Link className="hover:underline" href="/register">Påmelding</Link>
              <Link className="hover:underline" href="/about">Om oss</Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
            <div>NTNU Dragvoll Idrettssenter</div>
            <div className="mt-1">© {new Date().getFullYear()} NTNUI Bordtennis</div>
          </div>
        </footer>
      </body>
    </html>
  );
}