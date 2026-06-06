export type ReservationType = "bilateral" | "salle";
export type ReservationStatus = "confirmed" | "pending" | "cancelled" | "proposed";

export interface Reservation {
  id: string;
  type: ReservationType;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: ReservationStatus;
  participants?: string[];
  room?: string;
  capacity?: number;
  description?: string;
  // Server-side fields for bilateral invitations
  creatorEmail?: string;
  inviteeEmail?: string;
  // Proposed reschedule by invitee
  proposedDate?: string;
  proposedTime?: string;
  proposedEndTime?: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  floor: string;
}

export const ROOMS: Room[] = [
  { id: "a", name: "T'bol",  capacity: 20, equipment: ["Vidéoprojecteur", "Tableau blanc", "Visio"], floor: "2ème étage" },
  { id: "b", name: "Kamou",  capacity: 12, equipment: ["Télévision", "Tableau blanc"], floor: "2ème étage" },
  { id: "c", name: "Adjifo", capacity: 6,  equipment: ["Tableau blanc"], floor: "3ème étage" },
  { id: "d", name: "Gorée",  capacity: 30, equipment: ["Vidéoprojecteur", "Micro", "Visio", "Tableau blanc"], floor: "1er étage" },
];

export const RESERVATIONS: Reservation[] = [
  {
    id: "r1",
    type: "bilateral",
    title: "Réunion avec Fatou Diallo",
    date: "2026-06-15",
    startTime: "14:00",
    endTime: "15:00",
    location: "Visio — Google Meet",
    status: "confirmed",
    participants: ["Fatou Diallo"],
  },
  {
    id: "r2",
    type: "salle",
    title: "Kamou — Atelier design",
    date: "2026-06-15",
    startTime: "16:30",
    endTime: "18:00",
    location: "Kamou",
    status: "pending",
    room: "b",
    capacity: 12,
  },
  {
    id: "r3",
    type: "bilateral",
    title: "Entretien avec Moussa Konaté",
    date: "2026-06-16",
    startTime: "10:00",
    endTime: "11:00",
    location: "Adjifo",
    status: "pending",
    participants: ["Moussa Konaté"],
  },
  {
    id: "r4",
    type: "salle",
    title: "T'bol — Formation RH",
    date: "2026-06-17",
    startTime: "09:00",
    endTime: "12:00",
    location: "T'bol",
    status: "confirmed",
    room: "a",
    capacity: 20,
  },
  {
    id: "r5",
    type: "bilateral",
    title: "Point avec Awa Sarr",
    date: "2026-06-18",
    startTime: "15:30",
    endTime: "16:00",
    location: "Bureau 304",
    status: "confirmed",
    participants: ["Awa Sarr"],
  },
  {
    id: "r6",
    type: "salle",
    title: "Adjifo — Brainstorming",
    date: "2026-06-19",
    startTime: "14:00",
    endTime: "15:30",
    location: "Adjifo",
    status: "cancelled",
    room: "c",
    capacity: 6,
  },
];

export const OCCUPIED_DAYS = [3, 7, 12, 15, 18, 20, 23, 26];
export const AVAILABLE_DAYS = [1, 5, 9, 14, 22, 27];
export const MIXED_DAYS = [10, 17];

export const STATUS_CONFIG = {
  confirmed: { label: "Confirmé", className: "bg-brand-light text-brand border-brand/20" },
  pending:   { label: "En attente", className: "bg-olive-light text-olive-dark border-olive/20" },
  cancelled: { label: "Annulé", className: "bg-red-50 text-red-700 border-red-200" },
  proposed:  { label: "Proposé", className: "bg-blue-50 text-blue-700 border-blue-200" },
};
