"use client";
import { useState, useEffect } from "react";
import { Plus, QrCode, Check, X } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import QRModal from "@/components/QRModal";
import { Reservation } from "@/lib/data";
import { Users, DoorOpen } from "lucide-react";

const FILTERS = ["Toutes", "Bilatérales", "Salles", "Confirmées", "En attente"];

export default function ReservationsPage() {
  const { reservations, updateStatus } = useStore();
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(u => u && setCurrentEmail(u.email));
  }, []);
  const [filter, setFilter] = useState("Toutes");
  const [selected, setSelected] = useState<Reservation | null>(null);

  const upcoming = reservations.filter(r => r.status !== "cancelled" && r.date >= "2026-03-20");
  const past = reservations.filter(r => r.status === "cancelled" || r.date < "2026-03-20");

  function applyFilter(list: Reservation[]) {
    if (filter === "Bilatérales") return list.filter(r => r.type === "bilateral");
    if (filter === "Salles") return list.filter(r => r.type === "salle");
    if (filter === "Confirmées") return list.filter(r => r.status === "confirmed");
    if (filter === "En attente") return list.filter(r => r.status === "pending");
    return list;
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes réservations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gérez vos rendez-vous et réservations de salles</p>
        </div>
        <Link
          href="/nouvelle"
          className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle réservation
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-[10px]">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
              filter === f
                ? "bg-brand text-white border-brand"
                : "bg-card border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Upcoming table */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">À venir</h2>
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Titre</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Horaire</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lieu</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {applyFilter(upcoming).map((r, i, arr) => (
                <tr
                  key={r.id}
                  className={cn("hover:bg-muted/30 transition-colors", i < arr.length - 1 && "border-b border-border")}
                >
                  <td className="px-5 py-3.5">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      r.type === "bilateral" ? "bg-brand-light" : "bg-olive-light"
                    )}>
                      {r.type === "bilateral"
                        ? <Users className="w-4 h-4 text-brand" />
                        : <DoorOpen className="w-4 h-4 text-olive-dark" />
                      }
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{r.title}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.date}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.startTime} – {r.endTime}</td>
                  <td className="px-5 py-3.5 text-muted-foreground max-w-[180px] truncate">{r.location}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5">
                    {(() => {
                      const isInvitee =
                        r.type === "bilateral" &&
                        r.status === "pending" &&
                        currentEmail !== null &&
                        r.inviteeEmail?.toLowerCase() === currentEmail.toLowerCase() &&
                        r.creatorEmail?.toLowerCase() !== currentEmail.toLowerCase();
                      return isInvitee ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateStatus(r.id, "confirmed", "bilateral")}
                            className="flex items-center gap-1 text-xs text-white bg-brand hover:bg-brand-dark px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Check className="w-3 h-3" /> Confirmer
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "cancelled", "bilateral")}
                            className="flex items-center gap-1 text-xs text-red-600 border border-red-200 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <X className="w-3 h-3" /> Refuser
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelected(r)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border hover:border-brand/40"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Check-in
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))}
              {applyFilter(upcoming).length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    Aucune réservation à venir
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Past table */}
      {applyFilter(past).length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Passées</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden opacity-70">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Titre</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Horaire</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lieu</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {applyFilter(past).map((r, i, arr) => (
                  <tr key={r.id} className={cn("", i < arr.length - 1 && "border-b border-border")}>
                    <td className="px-5 py-3.5">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        r.type === "bilateral" ? "bg-brand-light" : "bg-olive-light"
                      )}>
                        {r.type === "bilateral"
                          ? <Users className="w-4 h-4 text-brand" />
                          : <DoorOpen className="w-4 h-4 text-olive-dark" />
                        }
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{r.title}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.date}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.startTime} – {r.endTime}</td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-[180px] truncate">{r.location}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {selected && <QRModal reservation={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
