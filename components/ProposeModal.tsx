"use client";
import { useState } from "react";
import { X, CalendarDays, Clock } from "lucide-react";
import { Reservation } from "@/lib/data";

const SLOT_DURATION = 45;
const SLOTS = Array.from({ length: 13 }, (_, i) => {
  const total = 8 * 60 + i * SLOT_DURATION;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

interface Props {
  reservation: Reservation;
  onClose: () => void;
  onPropose: (date: string, startTime: string, endTime: string) => Promise<void>;
}

export default function ProposeModal({ reservation, onClose, onPropose }: Props) {
  const snapStart = SLOTS.includes(reservation.startTime) ? reservation.startTime : SLOTS[0];
  const [date, setDate] = useState(reservation.date);
  const [startTime, setStartTime] = useState(snapStart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endTime = addMinutes(startTime, SLOT_DURATION);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onPropose(date, startTime, endTime);
      onClose();
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground">Proposer une nouvelle date</h2>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[280px]">{reservation.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Créneau actuel</p>
            <p>{reservation.date} · {reservation.startTime} – {reservation.endTime} · {reservation.location}</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-brand" /> Nouvelle date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              min="2026-06-15"
              max="2026-06-19"
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand" /> Créneau <span className="text-muted-foreground font-normal">(45 min)</span>
              </label>
              <select
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              >
                {SLOTS.map(s => (
                  <option key={s} value={s}>{s} – {addMinutes(s, SLOT_DURATION)}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Fin
              </label>
              <div className="h-10 px-3 rounded-lg border border-input bg-muted/50 text-sm flex items-center text-muted-foreground">
                {endTime}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand text-white h-10 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Envoi…" : "Envoyer la proposition"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-10 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
