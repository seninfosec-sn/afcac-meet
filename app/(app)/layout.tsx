"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center px-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="ml-3 font-semibold text-sm text-brand">Afcac-expo-meet</span>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="overflow-y-auto p-4 pt-[3.75rem] md:p-0 md:ml-64 md:m-[40px]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
