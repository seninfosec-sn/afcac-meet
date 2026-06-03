"use client";
import { useState, useEffect } from "react";
import { Plus, QrCode, Check, X, CalendarClock, Users, DoorOpen } from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import QRModal from "@/components/QRModal";
import ProposeModal from "@/components/ProposeModal";
import { Reservation } from "@/lib/data";

const FILTERS = ["Toutes", "Bilatérales", "Salles", "Confirmées", "En attente"];
const TODAY = new Date().toISOString().slice(0, 10);

export default function ReservationsPage() {
  const { reservations, updateStatus, refresh } = useStore();
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState("Toutes");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [proposing, setProposing] = useState<Reservation | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(u => u && setCurrentEmail(u.email));
  }, []);

  // Invitations received (bilateral, pending, current user is invitee)
  const pendingInvitations = reservations.filter(r =>
    r.type === "bilateral" &&
    r.status === "pending" &&
    currentEmail &&
    r.inviteeEmail?.toLowerCase() === currentEmail.toLowerCase() &&
    r.creatorEmail?.toLowerCase() !== currentEmail.toLowerCase()
  );

  const upcoming = reservations.filter(r => r.status !== "cancelled" && r.date >= TODAY);
  const past = reservations.filter(r => r.status === "cancelled" || r.date < TODAY);

  function applyFilter(list: Reservation[]) {
    if (filter === "Bilatérales") return list.filter(r => r.type === "bilateral");
    if (filter === "Salles") return list.filter(r => r.type === "salle");
    if (filter === "Confirmées") return list.filter(r => r.status === "confirmed");
    if (filter === "En attente") return list.filter(r => r.status === "pending");
    return list;
  }

  async function handlePropose(r: Reservation, date: string, startTime: string, endTime: string) {
    await fetch(`/api/reservations/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "proposed", proposedDate: date, proposedStartTime: startTime, proposedEndTime: endTime }),
    });
    await refresh();
  }

  function renderActions(r: Reservation) {
    const isInvitee =
      r.type === "bilateral" &&
      r.status === "pending" &&
      currentEmail !== null &&
      r.inviteeEmail?.toLowerCase() === currentEmail.toLowerCase() &&
      r.creatorEmail?.toLowerCase() !== currentEmail.toLowerCase();

    if (isInvitee) {
      return (
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
          <button
            onClick={() => setProposing(r)}
            className="flex items-center gap-1 text-xs text-brand border border-brand/30 hover:bg-brand-light px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <CalendarClock className="w-3 h-3" /> Proposer
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => setSelected(r)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border hover:border-brand/40"
      >
        <QrCode className="w-3.5 h-3.5" /> Check-in
      </button>
    );
  }

  function renderTable(list: Reservation[], dimmed = false) {
    return (
      <div className={cn("bg-card rounded-2xl border border-border overflow-hidden", dimmed && "opacity-70")}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Type", "Titre", "Date", "Horaire", "Lieu", "Statut", ""].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((r, i, arr) => (
              <tr key={r.id} className={cn("hover:bg-muted/30 transition-colors", i < arr.length - 1 && "border-b border-border")}>
                <td className="px-5 py-3.5">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", r.type === "bilateral" ? "bg-brand-light" : "bg-olive-light")}>
                    {r.type === "bilateral" ? <Users className="w-4 h-4 text-brand" /> : <DoorOpen className="w-4 h-4 text-olive-dark" />}
                  </div>
                </td>
                <td className="px-5 py-3.5 font-medium text-foreground">{r.title}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{r.date}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{r.startTime} – {r.endTime}</td>
                <td className="px-5 py-3.5 text-muted-foreground max-w-[180px] truncate">{r.location}</td>
                <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3.5">{!dimmed && renderActions(r)}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">Aucune réservation</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes réservations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gérez vos rendez-vous et réservations de salles</p>
        </div>
        <Link href="/nouvelle" className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
          <Plus className="w-4 h-4" /> Nouvelle réservation
        </Link>
      </div>

      {/* ── Invitations reçues ── */}
      {pendingInvitations.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold">{pendingInvitations.length}</span>
            Invitations reçues
          </h2>
          <div className="flex flex-col gap-2">
            {pendingInvitations.map(r => (
              <div key={r.id} className="bg-card border-2 border-brand/30 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{r.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {r.date} · {r.startTime} – {r.endTime} · {r.location}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    De : {r.creatorEmail}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateStatus(r.id, "confirmed", "bilateral")}
                    className="flex items-center gap-1.5 text-sm text-white bg-brand hover:bg-brand-dark px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    <Check className="w-4 h-4" /> Confirmer
                  </button>
                  <button
                    onClick={() => setProposing(r)}
                    className="flex items-center gap-1.5 text-sm text-brand border border-brand/40 hover:bg-brand-light px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    <CalendarClock className="w-4 h-4" /> Proposer une date
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "cancelled", "bilateral")}
                    className="flex items-center gap-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    <X className="w-4 h-4" /> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="flex gap-[10px]">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
              filter === f ? "bg-brand text-white border-brand" : "bg-card border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
            )}
          >{f}</button>
        ))}
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">À venir</h2>
        {renderTable(applyFilter(upcoming))}
      </section>

      {applyFilter(past).length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Passées</h2>
          {renderTable(applyFilter(past), true)}
        </section>
      )}

      {selected && <QRModal reservation={selected} onClose={() => setSelected(null)} />}
      {proposing && (
        <ProposeModal
          reservation={proposing}
          onClose={() => setProposing(null)}
          onPropose={(date, start, end) => handlePropose(proposing, date, start, end)}
        />
      )}
    </div>
  );
}
