import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rodinné recepty",
  description: "Recepty extrahované z fotek Instagramu, s převodem CZ/g ↔ EN/cups.",
  manifest: "/manifest.json",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>
        <ServiceWorkerRegister />
        <header className="border-b border-orange-100 bg-white/80 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto max-w-3xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold text-brand-700 text-lg">
              🍲 Rodinné recepty
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/recipes/new" className="text-brand-600 hover:text-brand-700 font-medium">
                + Nový recept
              </Link>
              <LogoutButton />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
