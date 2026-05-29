"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Mail, Zap, Moon, LogOut, Pencil, CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";

function Toggle({ defaultOn = true }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn(
        "relative w-10 h-6 rounded-full transition-colors shrink-0",
        on ? "bg-brand" : "bg-muted border border-border"
      )}
    >
      <span className={cn(
        "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
        on ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  );
}

export default function ProfilPage() {
  const router = useRouter();
  const { reservations } = useStore();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  const confirmed = reservations.filter(r => r.status === "confirmed").length;
  const pending = reservations.filter(r => r.status === "pending").length;
  const total = reservations.length;
  const thisMonth = reservations.filter(r => r.date.startsWith("2026-03")).length;

  return (
    <div className="flex flex-col gap-[10px]">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gérez votre compte et vos préférences</p>
      </div>

      <div className="grid grid-cols-3 gap-[10px]">
        {/* Left column */}
        <div className="flex flex-col gap-[10px]">
          {/* Profile card */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white text-xl font-bold">
                AD
              </div>
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-lg font-bold">Amadou Diallo</h2>
            <p className="text-sm text-muted-foreground mt-0.5">amadou.diallo@exemple.sn</p>
            <span className="inline-flex items-center mt-3 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-light text-brand border border-brand/20">
              Compte actif
            </span>
          </div>

          {/* Stats */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Statistiques</h3>
            <div className="flex flex-col gap-[10px]">
              {[
                { label: "Ce mois", value: String(thisMonth), icon: CalendarDays, color: "text-brand", bg: "bg-brand-light" },
                { label: "Confirmées", value: String(confirmed), icon: CheckCircle2, color: "text-brand", bg: "bg-brand-light" },
                { label: "En attente", value: String(pending), icon: Clock, color: "text-olive-dark", bg: "bg-olive-light" },
                { label: "Total", value: String(total), icon: CalendarDays, color: "text-muted-foreground", bg: "bg-muted" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
                    <Icon className={cn("w-4 h-4", color)} />
                  </div>
                  <span className="flex-1 text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-bold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors font-medium px-1 py-0.5"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>

        {/* Right columns */}
        <div className="col-span-2 flex flex-col gap-[10px]">
          {/* Preferences */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Préférences</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Configurez vos notifications et comportements par défaut</p>
            </div>
            {[
              { icon: Bell, label: "Notifications push", desc: "Recevez des alertes instantanées dans le navigateur", defaultOn: true },
              { icon: Mail, label: "Rappels par email", desc: "Recevez un récapitulatif de vos réservations par email", defaultOn: true },
              { icon: Zap, label: "Confirmation automatique", desc: "Acceptez automatiquement les invitations entrantes", defaultOn: false },
              { icon: Moon, label: "Mode sombre", desc: "Basculez vers l'interface sombre", defaultOn: false },
            ].map(({ icon: Icon, label, desc, defaultOn }, i, arr) => (
              <div key={label} className={cn("flex items-center gap-4 px-6 py-4", i < arr.length - 1 && "border-b border-border")}>
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <Toggle defaultOn={defaultOn} />
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Activité récente</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Vos dernières réservations</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {reservations.slice(0, 5).map((r, i, arr) => (
                  <tr key={r.id} className={cn("", i < arr.length - 1 && "border-b border-border")}>
                    <td className="px-6 py-3.5 font-medium">{r.title}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{r.date} · {r.startTime}</td>
                    <td className="px-6 py-3.5 text-muted-foreground max-w-[140px] truncate">{r.location}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
