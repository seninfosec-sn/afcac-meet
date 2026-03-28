"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ClipboardList, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", icon: Calendar, label: "Calendrier" },
  { href: "/reservations", icon: ClipboardList, label: "Rés." },
  { href: "/nouvelle", icon: Plus, label: "Nouveau" },
  { href: "/profil", icon: User, label: "Profil" },
];

export default function MobileNav() {
  const path = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = path === href;
        return (
          <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors">
            <Icon className={cn("w-5 h-5", active ? "text-brand" : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium", active ? "text-brand" : "text-muted-foreground")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
