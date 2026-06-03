"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, ClipboardList, Plus, User, Bell, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", icon: Calendar, label: "Calendrier" },
  { href: "/reservations", icon: ClipboardList, label: "Mes réservations" },
  { href: "/nouvelle", icon: Plus, label: "Nouvelle réservation" },
  { href: "/profil", icon: User, label: "Profil" },
];

const ADMIN_EMAILS = ["seninfosec@gmail.com"];

interface SessionUser {
  name: string;
  email: string;
  avatarInitials: string;
}

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setUser(data));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed top-0 left-0 flex flex-col w-64 h-screen border-r border-border bg-card shrink-0 z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <span className="text-xl font-bold text-brand tracking-tight">Afcac-expo-meet</span>
        <p className="text-xs text-muted-foreground mt-0.5">Gestion de réservations</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Admin link — visible uniquement pour les admins */}
        {user && ADMIN_EMAILS.includes(user.email.toLowerCase()) && (
          <Link href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2 border",
              path === "/admin"
                ? "bg-brand text-white border-brand"
                : "text-brand border-brand/30 hover:bg-brand-light"
            )}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Panel Admin
          </Link>
        )}
      </nav>

      {/* Bottom — user + logout */}
      <div className="px-3 pb-4 border-t border-border pt-3 flex flex-col gap-0.5">
        {/* Notifications */}
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full">
          <Bell className="w-4 h-4 shrink-0" />
          Notifications
          <span className="ml-auto bg-brand text-white text-xs rounded-full px-1.5 py-0.5 leading-none">3</span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Se déconnecter
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-3 mt-1 border-t border-border">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.avatarInitials ?? "??"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
