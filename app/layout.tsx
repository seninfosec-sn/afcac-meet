import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import AppShell from "@/components/AppShell";
import { Toaster } from "sonner";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Afcac-expo-meet — Gestion de réservations",
  description: "Application de réservation bilatérale et de salles",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={barlow.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <StoreProvider>
          <AppShell>{children}</AppShell>
          <Toaster position="bottom-right" richColors closeButton />
        </StoreProvider>
      </body>
    </html>
  );
}
