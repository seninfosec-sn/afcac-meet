"use client";
import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import ReservationCard from "@/components/ReservationCard";
import ReservationDetailModal from "@/components/ReservationDetailModal";
import QRModal from "@/components/QRModal";
import ProposeModal from "@/components/ProposeModal";
import SponsorsSlider from "@/components/SponsorsSlider";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Reservation } from "@/lib/data";
import { toast } from "sonner";

const DAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const EXPO_START = 15;
const EXPO_END = 19;
const CURRENT_MONTH = "2026-06";

export default function CalendarPage() {
  const { reservations, updateStatus } = useStore();
  const { t } = useLanguage();
  const [selectedDay, setSelectedDay] = useState(EXPO_START);
  const [detailReservation, setDetailReservation] = useState<Reservation | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [proposingFromDetail, setProposingFromDetail] = useState<Reservation | null>(null);
  const [qrFromDetail, setQrFromDetail] = useState<Reservation | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(u => u && setCurrentEmail(u.email));
  }, []);

  const dayStatuses = useMemo(() => {
    const map: Record<number, { confirmed: boolean; pending: boolean }> = {};
    reservations.forEach(r => {
      if (r.status === "cancelled") return;
      if (!r.date.startsWith(CURRENT_MONTH)) return;
      const day = parseInt(r.date.split("-")[2]);
      if (!map[day]) map[day] = { confirmed: false, pending: false };
      if (r.status === "confirmed") map[day].confirmed = true;
      if (r.status === "pending") map[day].pending = true;
    });
    return map;
  }, [reservations]);

  const stats = useMemo(() => {
    const thisMonth = reservations.filter(r => r.date.startsWith(CURRENT_MONTH));
    const upcoming = reservations.filter(r => r.status !== "cancelled" && r.date >= "2026-06-15");
    const confirmed = reservations.filter(r => r.status === "confirmed");
    const pending = reservations.filter(r => r.status === "pending");
    return [
      { label: t.dashboard.statsThisMonth, value: String(thisMonth.length), icon: CalendarDays, color: "text-brand", bg: "bg-brand-light" },
      { label: t.dashboard.statsUpcoming, value: String(upcoming.length), icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
      { label: t.dashboard.statsConfirmed, value: String(confirmed.length), icon: CheckCircle2, color: "text-brand", bg: "bg-brand-light" },
      { label: t.dashboard.statsPending, value: String(pending.length), icon: AlertCircle, color: "text-olive-dark", bg: "bg-olive-light" },
    ];
  }, [reservations, t]);

  const selectedResas = useMemo(() => {
    const dateStr = `${CURRENT_MONTH}-${String(selectedDay).padStart(2, "0")}`;
    return reservations.filter(r => r.date === dateStr && r.status !== "cancelled");
  }, [reservations, selectedDay]);

  const upcoming = useMemo(() =>
    reservations.filter(r => r.status !== "cancelled" && r.date >= "2026-06-15").slice(0, 3),
    [reservations]
  );

  function getDayClass(d: number) {
    const isExpo = d >= EXPO_START && d <= EXPO_END;
    const isSelected = d === selectedDay;
    const s = dayStatuses[d];
    if (!isExpo) return "bg-muted/20 text-muted-foreground/30 cursor-not-allowed";
    if (!s) return cn("bg-secondary text-foreground hover:bg-muted", isSelected && "ring-2 ring-offset-1 ring-brand", d === EXPO_START && "font-bold underline");
    if (s.confirmed && s.pending) return cn("bg-gradient-to-br from-[#145847] to-[#b3ae41] text-white hover:opacity-80", isSelected && "ring-2 ring-offset-1 ring-brand");
    if (s.confirmed) return cn("bg-[#145847] text-white hover:opacity-80", isSelected && "ring-2 ring-offset-1 ring-[#145847]");
    if (s.pending) return cn("bg-[#b3ae41] text-white hover:opacity-80", isSelected && "ring-2 ring-offset-1 ring-[#b3ae41]");
    return cn("bg-secondary text-foreground hover:bg-muted", isSelected && "ring-2 ring-offset-1 ring-brand");
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t.dashboard.subtitle}</p>
        </div>
        <Link href="/nouvelle"
          className="flex items-center gap-2 bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors shrink-0">
          <Plus className="w-4 h-4" />
          {t.dashboard.newReservation}
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-[10px]">
        <div className="md:col-span-3 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-foreground">{t.dashboard.june2026}</span>
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
              <button key={d} disabled={d < EXPO_START || d > EXPO_END}
                onClick={() => d >= EXPO_START && d <= EXPO_END && setSelectedDay(d)}
                className={cn("aspect-square rounded-lg flex items-center justify-center text-sm transition-all", getDayClass(d))}>
                {d}
              </button>
            ))}
          </div>

          <div className="flex gap-5 mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-[#145847]" /> {t.dashboard.legendConfirmed}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-[#b3ae41]" /> {t.dashboard.legendPending}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-[#145847] to-[#b3ae41]" /> {t.dashboard.legendMixed}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-secondary border border-border" /> {t.dashboard.legendFree}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-[10px]">
          <div className="bg-card rounded-2xl border border-border p-5 flex-1">
            <h2 className="text-sm font-semibold text-foreground mb-1">
              {`${selectedDay} ${t.dashboard.june2026}`}
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              {selectedResas.length} {selectedResas.length === 1 ? t.dashboard.reservationSingular : t.dashboard.reservationPlural}
            </p>
            {selectedResas.length > 0 ? (
              <div className="flex flex-col gap-[10px]">
                {selectedResas.map(r => (
                  <ReservationCard key={r.id} reservation={r} onClick={() => setDetailReservation(r)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
                <CalendarDays className="w-8 h-8 mb-2 opacity-30" />
                {t.dashboard.noReservationsDay}
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">{t.dashboard.upcomingReservations}</h2>
            {upcoming.length > 0 ? (
              <div className="flex flex-col">
                {upcoming.map((r, i, arr) => (
                  <div key={r.id} onClick={() => setDetailReservation(r)}
                    className={cn("flex items-center gap-3 py-2.5 cursor-pointer hover:bg-muted/40 rounded-lg px-1 -mx-1 transition-colors", i < arr.length - 1 && "border-b border-border")}>
                    <div className={cn("w-2 h-2 rounded-full shrink-0", r.status === "confirmed" ? "bg-brand" : "bg-olive")} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.date} · {r.startTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{t.dashboard.noUpcoming}</p>
            )}
          </div>
        </div>
      </div>

      <SponsorsSlider />

      {detailReservation && (
        <ReservationDetailModal
          reservation={detailReservation}
          currentEmail={currentEmail}
          onClose={() => setDetailReservation(null)}
          onConfirm={async r => {
            await updateStatus(r.id, "confirmed", "bilateral");
            toast.success("Invitation confirmée", { description: `"${r.title}" est maintenant confirmé.` });
          }}
          onRefuse={async r => {
            await updateStatus(r.id, "cancelled", "bilateral");
            toast.info("Invitation refusée");
          }}
          onPropose={r => setProposingFromDetail(r)}
          onQR={r => setQrFromDetail(r)}
        />
      )}

      {proposingFromDetail && (
        <ProposeModal
          reservation={proposingFromDetail}
          onClose={() => setProposingFromDetail(null)}
          onPropose={async (date, start, end) => {
            await fetch(`/api/reservations/${proposingFromDetail.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "proposed", proposedDate: date, proposedStartTime: start, proposedEndTime: end, tableType: "bilateral" }),
            });
            toast.success("Créneau proposé", { description: `Proposition envoyée pour le ${date}.` });
            setProposingFromDetail(null);
          }}
        />
      )}

      {qrFromDetail && (
        <QRModal reservation={qrFromDetail} onClose={() => setQrFromDetail(null)} />
      )}
    </div>
  );
}
