"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ClipboardList, Plus, User, Bell, LogOut, ShieldCheck, Check, Users, CalendarClock, DoorOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef, useCallback } from "react";

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

interface AppNotification {
  id: string;
  type: "invitation" | "confirmed" | "cancelled" | "proposed" | "room_created";
  title: string;
  message: string;
  reservation_id: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<AppNotification["type"], React.ReactNode> = {
  invitation:   <Users className="w-4 h-4 text-brand" />,
  confirmed:    <Check className="w-4 h-4 text-green-600" />,
  cancelled:    <X className="w-4 h-4 text-red-500" />,
  proposed:     <CalendarClock className="w-4 h-4 text-amber-500" />,
  room_created: <DoorOpen className="w-4 h-4 text-olive-dark" />,
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const path = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) setNotifications(await res.json());
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setUser(data));
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 2_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [panelOpen]);

  async function handleOpenPanel() {
    setPanelOpen(prev => !prev);
    if (!panelOpen && unreadCount > 0) {
      await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.replace("/login");
  }

  return (
    <aside className={cn(
      "fixed top-0 left-0 flex flex-col w-64 h-screen border-r border-border bg-card shrink-0 z-40",
      "transition-transform duration-300 ease-in-out",
      open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-brand tracking-tight">OFFICIAL BILATERAL MEETINGS PLATFORM</span>
          <p className="text-xs text-muted-foreground mt-0.5">Gestion de réservations</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
          aria-label="Fermer le menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href}
              onClick={onClose}
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

        {/* Admin link */}
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

      {/* Bottom — notifications + logout + user */}
      <div className="px-3 pb-4 border-t border-border pt-3 flex flex-col gap-0.5 relative" ref={panelRef}>
        {/* Notification panel */}
        {panelOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 mx-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold">Notifications</span>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Aucune notification</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={cn("flex gap-3 px-4 py-3", !n.read && "bg-brand/5")}>
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      {TYPE_ICON[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Bell button */}
        <button
          onClick={handleOpenPanel}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
            panelOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Bell className="w-4 h-4 shrink-0" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto bg-brand text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
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
