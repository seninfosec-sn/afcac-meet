"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, DoorOpen, Check, Loader2, Lock } from "lucide-react";
import { Reservation } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { COUNTRIES, PARTNERS, getCountryName } from "@/lib/partners";

interface RoomData {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  equipment: string[];
  locked: boolean;
}

type ReservationType = "bilateral" | "salle";
type ContactType = "" | "country" | "partner" | "other";

const SLOT_DURATION = 45;
const SLOTS = Array.from({ length: 32 }, (_, i) => {
  const totalMin = 0 * 60 + i * SLOT_DURATION;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

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
  const { reservations, refresh } = useStore();
  const { t, lang } = useLanguage();

  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [type, setType] = useState<ReservationType>("bilateral");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("2026-06-15");
  const [time, setTime] = useState("08:15");
  const [selectedRoom, setSelectedRoom] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [requesterCountry, setRequesterCountry] = useState("");
  const [organization, setOrganization] = useState("");
  const [contactType, setContactType] = useState<ContactType>("");
  const [countryCode, setCountryCode] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [otherText, setOtherText] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const selectedPartner = useMemo(() => PARTNERS.find(p => p.id === partnerId), [partnerId]);
  const selectedCountry = useMemo(() => COUNTRIES.find(c => c.code === countryCode), [countryCode]);

  const endTime = addMinutes(time, SLOT_DURATION);

  useEffect(() => {
    fetch("/api/rooms")
      .then(r => r.json())
      .then(data => setRooms(data.rooms ?? []))
      .catch(() => {});
  }, []);

  const bookedRooms = useMemo(() =>
    rooms.reduce<Record<string, boolean>>((acc, room) => {
      acc[room.id] = isRoomConflict(room.id, date, time, endTime, reservations);
      return acc;
    }, {}),
    [rooms, date, time, endTime, reservations]
  );

  const roomDayCount = useMemo(() =>
    rooms.reduce<Record<string, number>>((acc, room) => {
      acc[room.id] = reservations.filter(
        r => r.status !== "cancelled" && r.date === date && r.room === room.id
      ).length;
      return acc;
    }, {}),
    [rooms, date, reservations]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (type === "bilateral") {
      const invalid =
        !contactType ||
        (contactType === "country" && !countryCode) ||
        (contactType === "partner" && !selectedPartner) ||
        (contactType === "other" && !otherText.trim());
      if (invalid) { setError(t.newRes.errorSelectContact); return; }
    }

    if (selectedRoom && (bookedRooms[selectedRoom] || (roomDayCount[selectedRoom] ?? 0) >= 32)) {
      setError((roomDayCount[selectedRoom] ?? 0) >= 32
        ? t.newRes.errorMaxSlots
        : t.newRes.errorSlotTaken);
      return;
    }

    setLoading(true);

    const roomName = rooms.find(r => r.id === selectedRoom)?.name ?? "";
    const room = rooms.find(r => r.id === selectedRoom);

    let contactLabel = "";
    let meetingTitle: string;
    if (type === "bilateral") {
      if (contactType === "partner" && selectedPartner) {
        contactLabel = `${selectedPartner.organization} (${selectedPartner.email})`;
        meetingTitle = `${t.newRes.meetingWith} ${selectedPartner.name} — ${selectedPartner.organization}`;
      } else if (contactType === "country" && selectedCountry) {
        contactLabel = `${selectedCountry.flag} ${getCountryName(selectedCountry, lang)}`;
        meetingTitle = `${t.newRes.meetingWith} ${selectedCountry.flag} ${getCountryName(selectedCountry, lang)}`;
      } else {
        contactLabel = otherText.trim();
        meetingTitle = otherText.trim();
      }
    } else {
      meetingTitle = subject || `${roomName} — ${t.newRes.roomReservation}`;
    }

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        date,
        startTime: time,
        endTime,
        title: meetingTitle,
        description: message,
        // senderEmail stored as inviteeEmail — used to send confirmation when sfall confirms
        inviteeEmail: type === "bilateral" ? senderEmail : undefined,
        room: selectedRoom || undefined,
        location: roomName,
        capacity: room?.capacity,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      try {
        const data = await res.json();
        setError(data.error ?? t.newRes.errorCreation);
      } catch {
        setError(t.newRes.errorCreation);
      }
      return;
    }

    if (type === "bilateral" && senderEmail) {
      const mailRes = await fetch("/api/send-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, location: roomName, message, senderEmail, contactLabel, meetingTitle, firstName, lastName, jobTitle, requesterCountry, organization }),
      }).catch(() => null);

      if (!mailRes || !mailRes.ok) {
        let mailErr = t.newRes.mailFailed;
        try {
          const d = await mailRes?.json();
          if (d?.error) mailErr = `${t.newRes.mailFailed} (${d.error})`;
        } catch { /* ignore */ }
        setError(mailErr);
        refresh();
        return;
      }
    }

    refresh();
    toast.success(
      type === "bilateral" ? t.newRes.successInvite : t.newRes.successRoom,
      { description: type === "bilateral" ? t.newRes.resSaved : t.newRes.resSaved }
    );
    setSubmitted(true);
    setTimeout(() => router.push("/reservations"), 2000);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center">
          <Check className="w-10 h-10 text-brand" />
        </div>
        <h2 className="text-xl font-bold text-brand">{t.newRes.sentTitle}</h2>
        <p className="text-muted-foreground text-sm text-center">
          {type === "bilateral" ? t.newRes.sentBilateral : t.newRes.sentRoom}
          <br />{t.newRes.redirecting}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      <div>
        <h1 className="text-2xl font-bold">{t.newRes.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t.newRes.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
        <div className="flex flex-col gap-[10px]">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t.newRes.typeSection}</h2>
          <div className="flex flex-col gap-[10px]">
            {([
              ["bilateral", Users, t.newRes.bilateralLabel, t.newRes.bilateralDesc],
              ["salle", DoorOpen, t.newRes.roomLabel, t.newRes.roomDesc],
            ] as const).map(([rtype, Icon, label, desc]) => (
              <button
                key={rtype}
                onClick={() => { setType(rtype); setSelectedRoom(rtype === "bilateral" ? "" : "a"); setContactType(""); setCountryCode(""); setPartnerId(""); setOtherText(""); setFirstName(""); setLastName(""); setJobTitle(""); setRequesterCountry(""); setOrganization(""); setSenderEmail(""); }}
                className={cn(
                  "flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left",
                  type === rtype ? "border-brand bg-brand-light" : "border-border bg-card hover:border-brand/30"
                )}
              >
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5", type === rtype ? "bg-brand" : "bg-muted")}>
                  <Icon className={cn("w-5 h-5", type === rtype ? "text-white" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className={cn("text-sm font-semibold", type === rtype ? "text-brand" : "text-foreground")}>{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              {type === "bilateral" ? t.newRes.howItWorksBilateral : t.newRes.howItWorksRoom}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {type === "bilateral" ? t.newRes.descBilateral : t.newRes.descRoom}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-card rounded-2xl border border-border p-4 md:p-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-6">
            {type === "bilateral" ? t.newRes.detailsBilateral : t.newRes.detailsRoom}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t.newRes.date}</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)}
                  min="2026-06-15" max="2026-06-19"
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t.newRes.slot} <span className="text-muted-foreground font-normal">{t.newRes.slotMin}</span></label>
                <select value={time} onChange={e => setTime(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors">
                  {SLOTS.map(s => (
                    <option key={s} value={s}>{s} – {addMinutes(s, SLOT_DURATION)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {type === "bilateral" ? t.newRes.meetingLocation : t.newRes.chooseRoom}
                </label>
                <span className="text-xs text-muted-foreground">{time} → {endTime}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                {rooms.map(room => {
                  const slotBooked = bookedRooms[room.id];
                  const dayFull = (roomDayCount[room.id] ?? 0) >= 32;
                  const unavailable = slotBooked || dayFull || room.locked;
                  const active = selectedRoom === room.id;
                  return (
                    <button key={room.id} type="button" disabled={unavailable}
                      onClick={() => !unavailable && setSelectedRoom(room.id)}
                      className={cn(
                        "flex flex-col items-start gap-1 p-4 rounded-xl border-2 transition-all text-left",
                        unavailable ? "border-border bg-muted/40 opacity-50 cursor-not-allowed"
                          : active ? "border-[#b3ae41] bg-olive-light"
                          : "border-border bg-background hover:border-[#b3ae41]/40"
                      )}>
                      <div className="flex items-center justify-between w-full">
                        <p className={cn("text-sm font-semibold", unavailable ? "text-muted-foreground" : active ? "text-olive-dark" : "text-foreground")}>
                          {room.name}
                        </p>
                        {room.locked && (
                          <span className="flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" /> {t.newRes.locked}
                          </span>
                        )}
                        {!room.locked && dayFull && (
                          <span className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" /> {t.newRes.full}
                          </span>
                        )}
                        {!room.locked && !dayFull && slotBooked && (
                          <span className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" /> {t.newRes.slotTaken}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{room.capacity} pers. · {room.floor}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {room.equipment.slice(0, 2).map((eq: string) => (
                          <span key={eq} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{eq}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {type === "bilateral" && (
              <>
                {/* Étape 1 — type de contact */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">{t.newRes.contactType}</label>
                  <select
                    value={contactType}
                    onChange={e => {
                      setContactType(e.target.value as ContactType);
                      setCountryCode("");
                      setPartnerId("");
                      setOtherText("");
                    }}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                  >
                    <option value="">— {t.newRes.selectContactType} —</option>
                    <option value="country">{t.newRes.contactTypeCountry}</option>
                    <option value="partner">{t.newRes.contactTypePartner}</option>
                    <option value="other">{t.newRes.contactTypeOther}</option>
                  </select>
                </div>

                {/* Étape 2 — champ conditionnel */}
                {contactType === "country" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">{t.newRes.country}</label>
                    <select
                      value={countryCode}
                      onChange={e => setCountryCode(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                    >
                      <option value="">— {t.newRes.selectCountry} —</option>
                      {[...COUNTRIES].sort((a, b) => getCountryName(a, lang).localeCompare(getCountryName(b, lang))).map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {getCountryName(c, lang)}</option>
                      ))}
                    </select>
                  </div>
                )}

                {contactType === "partner" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">{t.newRes.partner}</label>
                    <select
                      value={partnerId}
                      onChange={e => setPartnerId(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                    >
                      <option value="">— {t.newRes.selectPartner} —</option>
                      {PARTNERS.map(p => (
                        <option key={p.id} value={p.id}>{p.organization}</option>
                      ))}
                    </select>
                    {selectedPartner && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-light border border-brand/20 text-xs text-brand">
                        <span className="font-semibold">{COUNTRIES.find(c => c.code === selectedPartner.countryCode)?.flag}</span>
                        <span>{t.newRes.invitationSentTo} <strong>{selectedPartner.email}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {contactType === "other" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">{t.newRes.otherLabel}</label>
                    <textarea
                      rows={3}
                      placeholder={t.newRes.otherPlaceholder}
                      value={otherText}
                      onChange={e => setOtherText(e.target.value)}
                      className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none"
                    />
                  </div>
                )}

                {/* Informations du demandeur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">{t.newRes.firstName} <span className="text-red-500">*</span></label>
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">{t.newRes.lastName} <span className="text-red-500">*</span></label>
                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">{t.newRes.jobTitle} <span className="text-red-500">*</span></label>
                    <input type="text" required value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">{t.newRes.requesterCountry} <span className="text-red-500">*</span></label>
                    <input type="text" required value={requesterCountry} onChange={e => setRequesterCountry(e.target.value)}
                      className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">{t.newRes.organization} <span className="text-red-500">*</span></label>
                  <input type="text" required value={organization} onChange={e => setOrganization(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">
                    {lang === "EN" ? "Your email address" : lang === "PT" ? "Seu endereço de email" : "Votre adresse email"}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder={lang === "EN" ? "your@email.com" : lang === "PT" ? "seu@email.com" : "votre@email.com"}
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">{t.newRes.inviteMessage}</label>
                  <textarea placeholder={t.newRes.inviteMsgPlaceholder} rows={3}
                    value={message} onChange={e => setMessage(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none" />
                </div>
              </>
            )}

            {type === "salle" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">{t.newRes.subject}</label>
                <input type="text" placeholder={t.newRes.subjectPlaceholder} required
                  value={subject} onChange={e => setSubject(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 bg-brand text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? t.newRes.sending : t.newRes.send}
              </button>
              <button type="button" onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors">
                {t.newRes.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
