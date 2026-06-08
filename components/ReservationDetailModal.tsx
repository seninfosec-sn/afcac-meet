"use client";
import { X, Users, DoorOpen, Calendar, Clock, MapPin, User, AlignLeft, CalendarClock, Check, QrCode } from "lucide-react";
import { Reservation } from "@/lib/data";
import { useLanguage } from "@/contexts/LanguageContext";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/utils";

interface Props {
  reservation: Reservation;
  currentEmail: string | null;
  onClose: () => void;
  onConfirm?: (r: Reservation) => void;
  onRefuse?: (r: Reservation) => void;
  onPropose?: (r: Reservation) => void;
  onQR?: (r: Reservation) => void;
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export default function ReservationDetailModal({ reservation: r, currentEmail, onClose, onConfirm, onRefuse, onPropose, onQR }: Props) {
  const { t } = useLanguage();
  const isBilateral = r.type === "bilateral";

  const isInvitee =
    isBilateral &&
    r.status === "pending" &&
    currentEmail !== null &&
    r.inviteeEmail?.toLowerCase() === currentEmail?.toLowerCase() &&
    r.creatorEmail?.toLowerCase() !== currentEmail?.toLowerCase();

  const canCheckIn = r.status === "confirmed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border w-full max-w-md overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className={cn("px-5 py-4 flex items-center justify-between", isBilateral ? "bg-brand" : "bg-olive-dark")}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              {isBilateral
                ? <Users className="w-5 h-5 text-white" />
                : <DoorOpen className="w-5 h-5 text-white" />
              }
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-base truncate">{r.title}</p>
              <p className="text-white/70 text-xs mt-0.5">
                {isBilateral ? t.detail.bilateral : t.detail.room}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <StatusBadge status={r.status} />
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Row
              icon={<Calendar className="w-4 h-4 text-muted-foreground" />}
              label={t.detail.date}
              value={new Date(r.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            />
            <Row
              icon={<Clock className="w-4 h-4 text-muted-foreground" />}
              label={t.detail.schedule}
              value={`${r.startTime} – ${r.endTime}`}
            />
          </div>

          <Row
            icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
            label={t.detail.location}
            value={
              <span className="flex items-center gap-2">
                {r.location}
                {r.capacity && <span className="text-xs text-muted-foreground font-normal">· {r.capacity} pers.</span>}
              </span>
            }
          />

          {isBilateral && (
            <Row
              icon={<User className="w-4 h-4 text-muted-foreground" />}
              label={t.detail.participants}
              value={
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-brand-light text-brand font-medium">{t.detail.initiator}</span>
                    {r.creatorEmail}
                  </span>
                  {r.inviteeEmail && (
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{t.detail.guest}</span>
                      {r.inviteeEmail}
                    </span>
                  )}
                </div>
              }
            />
          )}

          {r.description && (
            <Row
              icon={<AlignLeft className="w-4 h-4 text-muted-foreground" />}
              label={t.detail.description}
              value={<span className="text-sm text-muted-foreground font-normal leading-relaxed">{r.description}</span>}
            />
          )}

          {r.status === "proposed" && r.proposedDate && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <CalendarClock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700">{t.detail.proposedSlot}</p>
                <p className="text-sm text-amber-800 mt-0.5">
                  {r.proposedDate} · {r.proposedTime} – {r.proposedEndTime}
                </p>
              </div>
            </div>
          )}

          {(isInvitee || canCheckIn) && (
            <div className="pt-1 border-t border-border flex flex-col gap-2">
              {isInvitee && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { onConfirm?.(r); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm text-white bg-brand hover:bg-brand-dark px-4 py-2.5 rounded-xl transition-colors font-medium"
                  >
                    <Check className="w-4 h-4" /> {t.detail.confirm}
                  </button>
                  <button
                    onClick={() => { onPropose?.(r); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm text-brand border border-brand/40 hover:bg-brand-light px-4 py-2.5 rounded-xl transition-colors font-medium"
                  >
                    <CalendarClock className="w-4 h-4" /> {t.detail.propose}
                  </button>
                  <button
                    onClick={() => { onRefuse?.(r); onClose(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors font-medium"
                  >
                    <X className="w-4 h-4" /> {t.detail.refuse}
                  </button>
                </div>
              )}
              {canCheckIn && (
                <button
                  onClick={() => { onQR?.(r); onClose(); }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground border border-border hover:bg-muted px-4 py-2.5 rounded-xl transition-colors"
                >
                  <QrCode className="w-4 h-4" /> {t.detail.checkinQR}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
