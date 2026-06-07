"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users, DoorOpen, CheckCircle2, Clock, XCircle, CalendarDays, RefreshCw,
  ShieldCheck, TrendingUp, CalendarClock, Download, Pencil, Trash2, X, Save,
  FileSpreadsheet, FileText, ChevronDown, Loader2, Lock, LockOpen, Plus,
} from "lucide-react";
import { Reservation } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { downloadPDFReport } from "@/lib/export-pdf";

interface AdminUser { id: string; email: string; display_name: string; created_at: string; }
interface AdminData { reservations: Reservation[]; users: AdminUser[]; }
interface AdminRoom {
  id: string; name: string; capacity: number; floor: string;
  equipment: string[]; locked: boolean; created_at: string;
}

export default function AdminPage() {
  const [data, setData]       = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [filter, setFilter]   = useState("Toutes");
  const [tab, setTab]         = useState<"reservations" | "users" | "rooms">("reservations");
  const [updating, setUpdating]   = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | "all" | null>(null);

  // Users
  const [editUser, setEditUser]   = useState<AdminUser | null>(null);
  const [editName, setEditName]   = useState("");
  const [userAction, setUserAction] = useState<string | null>(null);

  // Download
  const [showDownload, setShowDownload] = useState(false);
  const [downloading, setDownloading]   = useState<"excel" | "pdf" | null>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  // Rooms
  const [rooms, setRooms]         = useState<AdminRoom[]>([]);
  const [roomModal, setRoomModal] = useState<"create" | "edit" | null>(null);
  const [editRoom, setEditRoom]   = useState<AdminRoom | null>(null);
  const [roomForm, setRoomForm]   = useState({ name: "", floor: "", capacity: "0", equipment: "" });
  const [roomAction, setRoomAction] = useState<string | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await fetch("/api/admin/reservations");
    if (!res.ok) {
      const d = await res.json();
      if (!silent) setError(d.error ?? "Erreur");
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoading(false);
  }, []);

  const fetchRooms = useCallback(async () => {
    const res = await fetch("/api/admin/rooms");
    if (res.ok) setRooms((await res.json()).rooms ?? []);
  }, []);

  useEffect(() => { fetchData(); fetchRooms(); }, [fetchData, fetchRooms]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
      fetchRooms();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchData, fetchRooms]);

  useEffect(() => {
    if (!showDownload) return;
    function handleClick(e: MouseEvent) {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node))
        setShowDownload(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDownload]);

  // ── User handlers ──────────────────────────────────────────────
  async function handleDeleteUser(id: string, label: string) {
    if (!window.confirm(`Supprimer l'utilisateur "${label}" ? Cette action est irréversible.`)) return;
    setUserAction(id);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    await fetchData();
    setUserAction(null);
  }

  async function handleUpdateUser() {
    if (!editUser || !editName.trim()) return;
    setUserAction(editUser.id);
    await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: editName.trim() }),
    });
    await fetchData();
    setEditUser(null);
    setUserAction(null);
  }

  async function handleDeleteReservation(id: string, type: "bilateral" | "salle", title: string) {
    if (!window.confirm(`Supprimer la réservation "${title}" ? Cette action est irréversible.`)) return;
    setDeleting(id);
    await fetch("/api/admin/reservations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type }),
    });
    await fetchData(true);
    setDeleting(null);
  }

  async function handleDeleteAllReservations() {
    if (!window.confirm("Supprimer TOUTES les réservations ? Cette action est irréversible.")) return;
    setDeleting("all");
    await fetch("/api/admin/reservations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    await fetchData(true);
    setDeleting(null);
  }

  async function updateStatus(id: string, status: string, type: "bilateral" | "salle") {
    setUpdating(id);
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, tableType: type === "bilateral" ? "bilateral" : "salle" }),
    });
    await fetchData();
    setUpdating(null);
  }

  // ── Download handlers ──────────────────────────────────────────
  async function handleDownloadExcel() {
    if (!data) return;
    setDownloading("excel");
    setShowDownload(false);
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) throw new Error("Erreur serveur");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-afcac-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadPDF() {
    if (!data) return;
    setDownloading("pdf");
    setShowDownload(false);
    try { await downloadPDFReport(data); }
    finally { setDownloading(null); }
  }

  // ── Room handlers ──────────────────────────────────────────────
  function openCreateRoom() {
    setEditRoom(null);
    setRoomForm({ name: "", floor: "", capacity: "0", equipment: "" });
    setRoomModal("create");
  }

  function openEditRoom(room: AdminRoom) {
    setEditRoom(room);
    setRoomForm({
      name:      room.name,
      floor:     room.floor,
      capacity:  String(room.capacity),
      equipment: room.equipment.join(", "),
    });
    setRoomModal("edit");
  }

  async function handleSaveRoom() {
    const body = {
      name:      roomForm.name.trim(),
      floor:     roomForm.floor.trim(),
      capacity:  Number(roomForm.capacity) || 0,
      equipment: roomForm.equipment.split(",").map(e => e.trim()).filter(Boolean),
    };
    setRoomAction("saving");
    if (editRoom) {
      await fetch(`/api/admin/rooms/${editRoom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    await fetchRooms();
    setRoomModal(null);
    setEditRoom(null);
    setRoomAction(null);
  }

  async function handleToggleLock(room: AdminRoom) {
    setRoomAction(room.id);
    await fetch(`/api/admin/rooms/${room.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locked: !room.locked }),
    });
    await fetchRooms();
    setRoomAction(null);
  }

  async function handleDeleteRoom(room: AdminRoom) {
    if (!window.confirm(`Supprimer la salle "${room.name}" ? Cette action est irréversible.`)) return;
    setRoomAction(room.id);
    await fetch(`/api/admin/rooms/${room.id}`, { method: "DELETE" });
    await fetchRooms();
    setRoomAction(null);
  }

  // ── Loading / error ────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
      <RefreshCw className="w-5 h-5 animate-spin" /> Chargement…
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">{error}</div>
    </div>
  );

  const reservations = data?.reservations ?? [];
  const users        = data?.users ?? [];

  const stats = {
    total:     reservations.length,
    bilateral: reservations.filter(r => r.type === "bilateral").length,
    salle:     reservations.filter(r => r.type === "salle").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    pending:   reservations.filter(r => r.status === "pending").length,
    proposed:  reservations.filter(r => r.status === "proposed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  };

  const reservedRooms = Array.from(new Set(
    reservations.filter(r => r.type === "salle" && r.location).map(r => r.location)
  )).sort();

  function applyFilter(list: Reservation[]) {
    if (reservedRooms.includes(filter)) return list.filter(r => r.type === "salle" && r.location === filter);
    switch (filter) {
      case "Bilatérales": return list.filter(r => r.type === "bilateral");
      case "Confirmées":  return list.filter(r => r.status === "confirmed");
      case "En attente":  return list.filter(r => r.status === "pending");
      case "Proposées":   return list.filter(r => r.status === "proposed");
      case "Annulées":    return list.filter(r => r.status === "cancelled");
      default:            return list;
    }
  }

  const filtered = applyFilter(reservations);

  return (
    <div className="flex flex-col gap-[10px]">
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel Administrateur</h1>
            <p className="text-sm text-muted-foreground">Vue globale de toutes les réservations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div ref={downloadRef} className="relative">
            <button
              onClick={() => setShowDownload(v => !v)}
              disabled={!data || !!downloading}
              className="flex items-center gap-2 text-sm text-white bg-brand hover:bg-brand-dark px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading === "excel" ? "Génération Excel…" : downloading === "pdf" ? "Génération PDF…" : "Télécharger le rapport"}
              {!downloading && <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showDownload && "rotate-180")} />}
            </button>

            {showDownload && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Format d'export</p>
                </div>
                <button onClick={handleDownloadExcel} className="w-full flex items-center gap-3 px-3 py-3 text-sm hover:bg-muted/60 transition-colors text-left">
                  <div className="w-7 h-7 rounded-lg bg-[#e8f2ef] flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-brand" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Rapport Excel</p>
                    <p className="text-[11px] text-muted-foreground">4 feuilles analytiques .xlsx</p>
                  </div>
                </button>
                <button onClick={handleDownloadPDF} className="w-full flex items-center gap-3 px-3 py-3 text-sm hover:bg-muted/60 transition-colors text-left border-t border-border/60">
                  <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Rapport PDF</p>
                    <p className="text-[11px] text-muted-foreground">5 pages — mise en page pro</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-2 border border-border rounded-lg bg-card">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
            Temps réel
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px]">
        {[
          { label: "Total réservations", value: stats.total,     icon: CalendarDays,  color: "text-foreground",   bg: "bg-muted" },
          { label: "Confirmées",         value: stats.confirmed, icon: CheckCircle2,  color: "text-brand",        bg: "bg-brand-light" },
          { label: "En attente",         value: stats.pending,   icon: Clock,         color: "text-olive-dark",   bg: "bg-olive-light" },
          { label: "Proposées",          value: stats.proposed,  icon: CalendarClock, color: "text-blue-600",     bg: "bg-blue-50" },
          { label: "Annulées",           value: stats.cancelled, icon: XCircle,       color: "text-red-600",      bg: "bg-red-50" },
          { label: "Bilatérales",        value: stats.bilateral, icon: Users,         color: "text-brand",        bg: "bg-brand-light" },
          { label: "Salles réservées",   value: stats.salle,     icon: DoorOpen,      color: "text-olive-dark",   bg: "bg-olive-light" },
          { label: "Utilisateurs",       value: users.length,    icon: TrendingUp,    color: "text-purple-600",   bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["reservations", "users", "rooms"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-5 py-2 rounded-lg text-sm font-medium border transition-colors",
              tab === t ? "bg-brand text-white border-brand" : "bg-card border-border text-muted-foreground hover:border-brand/40"
            )}>
            {t === "reservations" ? `Réservations (${reservations.length})`
              : t === "users" ? `Utilisateurs (${users.length})`
              : `Salles (${rooms.length})`}
          </button>
        ))}
      </div>

      {/* ── Reservations tab ── */}
      {tab === "reservations" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {["Toutes", "Bilatérales"].map((f: string) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    filter === f ? "bg-brand text-white border-brand" : "bg-card border-border text-muted-foreground hover:border-brand/40"
                  )}>
                  {f}
                </button>
              ))}

              {reservedRooms.length > 0 && (
                <>
                  <span className="text-border text-base select-none">|</span>
                  {reservedRooms.map((f: string) => (
                    <button key={f} onClick={() => setFilter(f)}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                        filter === f
                          ? "bg-olive-dark text-white border-olive-dark"
                          : "bg-card border-border text-muted-foreground hover:border-olive/60"
                      )}>
                      <DoorOpen className="w-3 h-3" />{f}
                    </button>
                  ))}
                  <span className="text-border text-base select-none">|</span>
                </>
              )}

              {["Confirmées", "En attente", "Proposées", "Annulées"].map((f: string) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    filter === f ? "bg-brand text-white border-brand" : "bg-card border-border text-muted-foreground hover:border-brand/40"
                  )}>
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={handleDeleteAllReservations}
              disabled={deleting === "all" || reservations.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {deleting === "all" ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Tout supprimer
            </button>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Type", "Titre", "Initiateur", "Invité / Salle", "Date", "Horaire", "Statut", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i, arr) => (
                  <tr key={r.id} className={cn("hover:bg-muted/30 transition-colors", i < arr.length - 1 && "border-b border-border")}>
                    <td className="px-4 py-3">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", r.type === "bilateral" ? "bg-brand-light" : "bg-olive-light")}>
                        {r.type === "bilateral" ? <Users className="w-3.5 h-3.5 text-brand" /> : <DoorOpen className="w-3.5 h-3.5 text-olive-dark" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">{r.title}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[150px] truncate">{r.creatorEmail ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[150px] truncate">
                      {r.type === "bilateral" ? (r.inviteeEmail ?? "—") : (r.location ?? "—")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.startTime} – {r.endTime}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      {updating === r.id || deleting === r.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="flex items-center gap-1">
                          {r.status !== "confirmed" && (
                            <button onClick={() => updateStatus(r.id, "confirmed", r.type)}
                              className="text-[11px] text-white bg-brand hover:bg-brand-dark px-2 py-1 rounded-md transition-colors">
                              Confirmer
                            </button>
                          )}
                          {r.status !== "cancelled" && (
                            <button onClick={() => updateStatus(r.id, "cancelled", r.type)}
                              className="text-[11px] text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-md transition-colors">
                              Annuler
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReservation(r.id, r.type, r.title)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">Aucune réservation</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Users tab ── */}
      {tab === "users" && (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Initiales", "Nom", "Email", "Réservations", "Inscrit le", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i, arr) => {
                const userRes = reservations.filter(r => r.creatorEmail === u.email || r.inviteeEmail === u.email);
                const initials = (u.display_name || u.email).slice(0, 2).toUpperCase();
                return (
                  <tr key={u.id} className={cn("hover:bg-muted/30 transition-colors", i < arr.length - 1 && "border-b border-border")}>
                    <td className="px-5 py-3.5">
                      <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{u.display_name || "—"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-light text-brand">
                        {userRes.length} réservation{userRes.length > 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditUser(u); setEditName(u.display_name || ""); }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-brand hover:bg-brand-light transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.display_name || u.email)}
                          disabled={userAction === u.id}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {userAction === u.id
                            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">Aucun utilisateur</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Rooms tab ── */}
      {tab === "rooms" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={openCreateRoom}
              className="flex items-center gap-2 text-sm text-white bg-brand hover:bg-brand-dark px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4" /> Nouvelle salle
            </button>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-sm min-w-[550px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Salle", "Étage", "Capacité", "Équipements", "Statut", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room, i, arr) => (
                  <tr key={room.id} className={cn("hover:bg-muted/30 transition-colors", i < arr.length - 1 && "border-b border-border")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                          room.locked ? "bg-red-50" : "bg-olive-light")}>
                          {room.locked
                            ? <Lock className="w-3.5 h-3.5 text-red-500" />
                            : <DoorOpen className="w-3.5 h-3.5 text-olive-dark" />}
                        </div>
                        <span className="font-medium">{room.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{room.floor}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{room.capacity} pers.</td>
                    <td className="px-4 py-3">
                      {room.equipment.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.map(eq => (
                            <span key={eq} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                              {eq}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                        room.locked
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-brand-light text-brand border-brand/20"
                      )}>
                        {room.locked ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {room.locked ? "Verrouillée" : "Disponible"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {roomAction === room.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditRoom(room)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-brand hover:bg-brand-light transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleLock(room)}
                            className={cn("p-1.5 rounded-md transition-colors",
                              room.locked
                                ? "text-muted-foreground hover:text-brand hover:bg-brand-light"
                                : "text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            )}
                            title={room.locked ? "Déverrouiller" : "Verrouiller"}
                          >
                            {room.locked ? <LockOpen className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">Aucune salle configurée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Modal : modifier utilisateur ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Modifier l'utilisateur</h2>
              <button onClick={() => setEditUser(null)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                <p className="text-sm text-foreground">{editUser.email}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Nom d'affichage</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleUpdateUser()}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  placeholder="Nom d'affichage"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                  Annuler
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={!editName.trim() || userAction === editUser.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {userAction === editUser.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal : créer / modifier salle ── */}
      {roomModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-olive-light flex items-center justify-center">
                  <DoorOpen className="w-4 h-4 text-olive-dark" />
                </div>
                <h2 className="text-base font-semibold">
                  {roomModal === "create" ? "Nouvelle salle" : `Modifier — ${editRoom?.name}`}
                </h2>
              </div>
              <button onClick={() => { setRoomModal(null); setEditRoom(null); }} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Nom de la salle *</label>
                <input
                  value={roomForm.name}
                  onChange={e => setRoomForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  placeholder="Ex : T'bol"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Étage *</label>
                <input
                  value={roomForm.floor}
                  onChange={e => setRoomForm(f => ({ ...f, floor: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  placeholder="Ex : 2ème étage"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Capacité (personnes)</label>
                <input
                  type="number"
                  min="0"
                  value={roomForm.capacity}
                  onChange={e => setRoomForm(f => ({ ...f, capacity: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Équipements</label>
                <input
                  value={roomForm.equipment}
                  onChange={e => setRoomForm(f => ({ ...f, equipment: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  placeholder="Vidéoprojecteur, Tableau blanc, Visio"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Séparés par des virgules</p>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => { setRoomModal(null); setEditRoom(null); }}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveRoom}
                  disabled={!roomForm.name.trim() || !roomForm.floor.trim() || roomAction === "saving"}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {roomAction === "saving"
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Save className="w-3.5 h-3.5" />}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
