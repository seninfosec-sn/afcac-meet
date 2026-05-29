"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, DoorOpen, Check, Loader2, Wifi, Lock } from "lucide-react";
import { ROOMS, Reservation } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type ReservationType = "bilateral" | "salle";

const DURATIONS = [
  { label: "30 minutes", minutes: 30 },
  { label: "1 heure",    minutes: 60 },
  { label: "1h30",       minutes: 90 },
  { label: "2 heures",   minutes: 120 },
  { label: "Demi-journée", minutes: 240 },
  { label: "Journée complète", minutes: 480 },
];

// Virtual room option for bilateral
const VIRTUAL_ROOM = { id: "visio", name: "Visio", capacity: 0, equipment: [], floor: "" };

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function addMinutes(time: string, minutes: number): string {
  const total = toMinutes(time) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function isRoomConflict(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  reservations: Reservation[]
): boolean {
  return reservations.some(r => {
    if (r.status === "cancelled") return false;
    if (r.date !== date) return false;
    if (r.room !== roomId) return false;
    const rStart = toMinutes(r.startTime);
    const rEnd   = toMinutes(r.endTime && r.endTime !== r.startTime ? r.endTime : addMinutes(r.startTime, 60));
    const nStart = toMinutes(startTime);
    const nEnd   = toMinutes(endTime);
    return nStart < rEnd && nEnd > rStart;
  });
}

export default function NouvellePage() {
  const router = useRouter();
  const { reservations, addReservation, refresh } = useStore();

  const [type, setType] = useState<ReservationType>("bilateral");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shared fields
  const [date, setDate] = useState("2026-03-25");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [selectedRoom, setSelectedRoom] = useState("visio"); // "visio" or room id

  // Bilateral-only fields
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Salle-only fields
  const [subject, setSubject] = useState("");

  const endTime = useMemo(() => addMinutes(time, duration), [time, duration]);

  // Compute which rooms are booked for current date/time/duration
  const bookedRooms = useMemo(() =>
    ROOMS.reduce<Record<string, boolean>>((acc, room) => {
      acc[room.id] = isRoomConflict(room.id, date, time, endTime, reservations);
      return acc;
    }, {}),
    [date, time, endTime, reservations]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (selectedRoom !== "visio" && bookedRooms[selectedRoom]) {
      setError("Cette salle est déjà réservée sur ce créneau. Veuillez en choisir une autre.");
      return;
    }

    setLoading(true);

    const roomName = selectedRoom === "visio" ? "Visio" : ROOMS.find(r => r.id === selectedRoom)?.name ?? "";
    const room = ROOMS.find(r => r.id === selectedRoom);

    // Save to DB via API
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        date,
        startTime: time,
        endTime,
        title: type === "bilateral" ? `Rencontre avec ${email}` : (subject || `${roomName} — Réservation`),
        description: message,
        inviteeEmail: type === "bilateral" ? email : undefined,
        room: selectedRoom === "visio" ? undefined : selectedRoom,
        location: roomName,
        capacity: room?.capacity,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      try {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de la création.");
      } catch {
        setError("Erreur lors de la création. Veuillez réessayer.");
      }
      return;
    }

    // Send invitation email for bilateral
    if (type === "bilateral") {
      await fetch("/api/send-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, date, time, location: roomName, message }),
      }).catch(() => {});
    }

    refresh();
    setSubmitted(true);
    setTimeout(() => router.push("/reservations"), 2000);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center">
          <Check className="w-10 h-10 text-brand" />
        </div>
        <h2 className="text-xl font-bold text-brand">Demande envoyée !</h2>
        <p className="text-muted-foreground text-sm text-center">
          {type === "bilateral" ? "Un email de notification a été envoyé à l'invité." : "La salle a été réservée."}
          <br />Redirection en cours…
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <div>
        <h1 className="text-2xl font-bold">Nouvelle réservation</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Choisissez le type de réservation à créer</p>
      </div>

      <div className="grid grid-cols-3 gap-[10px]">
        {/* Left column */}
        <div className="flex flex-col gap-[10px]">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Type de réservation</h2>
          <div className="flex flex-col gap-[10px]">
            {([
              ["bilateral", Users, "Rencontre bilatérale", "Accord mutuel requis des deux parties"],
              ["salle", DoorOpen, "Réservation de salle", "Disponibilité des salles en temps réel"],
            ] as const).map(([t, Icon, label, desc]) => (
              <button
                key={t}
                onClick={() => { setType(t); setSelectedRoom(t === "bilateral" ? "visio" : "a"); }}
                className={cn(
                  "flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left",
                  type === t ? "border-brand bg-brand-light" : "border-border bg-card hover:border-brand/30"
                )}
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5", type === t ? "bg-brand" : "bg-muted")}>
                  <Icon className={cn("w-5 h-5", type === t ? "text-white" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", type === t ? "text-brand" : "text-foreground")}>{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              {type === "bilateral" ? "Comment ça marche ?" : "Disponibilités en temps réel"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {type === "bilateral"
                ? "Envoyez une invitation à un collègue. Il recevra un email de notification et pourra accepter ou proposer un autre créneau."
                : "Les salles affichent leur disponibilité en direct. Votre réservation est immédiatement prise en compte dans le calendrier partagé."}
            </p>
          </div>
        </div>

        {/* Right column — form */}
        <div className="col-span-2 bg-card rounded-2xl border border-border p-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6">
            {type === "bilateral" ? "Détails de la rencontre" : "Détails de la réservation"}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">

            {/* ── Créneau (commun aux deux types) ── */}
            <div className="grid grid-cols-3 gap-[10px]">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Date</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Heure de début</label>
                <input type="time" required value={time} onChange={e => setTime(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Durée</label>
                <select value={duration} onChange={e => setDuration(Number(e.target.value))}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors">
                  {DURATIONS.map(d => <option key={d.label} value={d.minutes}>{d.label}</option>)}
                </select>
              </div>
            </div>

            {/* ── Sélection de salle (commun) ── */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {type === "bilateral" ? "Lieu de la rencontre" : "Choisir une salle"}
                </label>
                <span className="text-xs text-muted-foreground">
                  {time} → {endTime}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-[10px]">
                {/* Option Visio uniquement pour bilatéral */}
                {type === "bilateral" && (
                  <button
                    type="button"
                    onClick={() => setSelectedRoom("visio")}
                    className={cn(
                      "flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all text-left",
                      selectedRoom === "visio"
                        ? "border-brand bg-brand-light"
                        : "border-border bg-background hover:border-brand/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Wifi className={cn("w-4 h-4", selectedRoom === "visio" ? "text-brand" : "text-muted-foreground")} />
                      <p className={cn("text-sm font-semibold", selectedRoom === "visio" ? "text-brand" : "text-foreground")}>
                        Visio
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">Lien Meet, Teams, Zoom…</p>
                  </button>
                )}

                {/* Salles physiques */}
                {ROOMS.map(room => {
                  const booked = bookedRooms[room.id];
                  const active = selectedRoom === room.id;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      disabled={booked}
                      onClick={() => !booked && setSelectedRoom(room.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all text-left",
                        booked
                          ? "border-border bg-muted/40 opacity-50 cursor-not-allowed"
                          : active
                          ? "border-[#b3ae41] bg-olive-light"
                          : "border-border bg-background hover:border-[#b3ae41]/40"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <p className={cn("text-sm font-semibold", booked ? "text-muted-foreground" : active ? "text-olive-dark" : "text-foreground")}>
                          {room.name}
                        </p>
                        {booked && (
                          <span className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" /> Indisponible
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{room.capacity} pers. · {room.floor}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {room.equipment.slice(0, 2).map(eq => (
                          <span key={eq} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{eq}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Champs spécifiques bilatéral ── */}
            {type === "bilateral" && (
              <>
                {selectedRoom === "visio" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Lien de la visio</label>
                    <input type="text" placeholder="https://meet.google.com/…"
                      className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Inviter (email)</label>
                  <input type="email" placeholder="fatou.diallo@exemple.sn" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Message d'invitation</label>
                  <textarea placeholder="Bonjour, je propose qu'on se retrouve…" rows={3}
                    value={message} onChange={e => setMessage(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none" />
                </div>
              </>
            )}

            {/* ── Champs spécifiques salle ── */}
            {type === "salle" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Objet de la réservation</label>
                <input type="text" placeholder="Ex : Atelier design, Formation…" required
                  value={subject} onChange={e => setSubject(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-brand text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Envoi en cours…" : "Envoyer la demande"}
              </button>
              <button type="button" onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
