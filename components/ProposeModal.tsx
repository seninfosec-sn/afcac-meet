"use client";
import { useState } from "react";
import { X, CalendarDays, Clock } from "lucide-react";
import { Reservation } from "@/lib/data";

interface Props {
  reservation: Reservation;
  onClose: () => void;
  onPropose: (date: string, startTime: string, endTime: string) => Promise<void>;
}

export default function ProposeModal({ reservation, onClose, onPropose }: Props) {
  const [date, setDate] = useState(reservation.date);
  const [startTime, setStartTime] = useState(reservation.startTime);
  const [endTime, setEndTime] = useState(reservation.endTime);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (endTime <= startTime) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }
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
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand" /> Début
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Fin
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
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
