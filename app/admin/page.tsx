"use client";
import { useState, useEffect, useCallback } from "react";
import { Users, DoorOpen, CheckCircle2, Clock, XCircle, CalendarDays, RefreshCw, ShieldCheck, TrendingUp, CalendarClock, Download, Pencil, Trash2, X, Save } from "lucide-react";
import { Reservation } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface AdminUser { id: string; email: string; display_name: string; created_at: string; }
interface AdminData { reservations: Reservation[]; users: AdminUser[]; }

const FILTERS = ["Toutes", "Bilatérales", "Salles", "Confirmées", "En attente", "Proposées", "Annulées"];

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("Toutes");
  const [tab, setTab] = useState<"reservations" | "users">("reservations");
  const [updating, setUpdating] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [userAction, setUserAction] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reservations");
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Erreur");
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  function downloadReport() {
    if (!data) return;
    const { reservations, users } = data;
    const now = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

    // ── Feuille 1 : Invitations bilatérales ──────────────────────────
    const invitations = reservations
      .filter(r => r.type === "bilateral")
      .map(r => ({
        "Titre":          r.title,
        "Date":           r.date,
        "Heure début":    r.startTime,
        "Heure fin":      r.endTime,
        "Lieu":           r.location,
        "Initiateur":     r.creatorEmail ?? "—",
        "Invité(e)":      r.inviteeEmail ?? "—",
        "Statut":         r.status === "confirmed" ? "Confirmé"
                        : r.status === "pending"   ? "En attente"
                        : r.status === "proposed"  ? "Proposé"
                        : "Annulé",
      }));

    // ── Feuille 2 : Salles occupées ──────────────────────────────────
    const salles = reservations
      .filter(r => r.type === "salle")
      .map(r => ({
        "Salle":          r.location,
        "Titre":          r.title,
        "Date":           r.date,
        "Heure début":    r.startTime,
        "Heure fin":      r.endTime,
        "Organisateur":   r.creatorEmail ?? "—",
        "Capacité":       r.capacity ?? "—",
        "Statut":         r.status === "confirmed" ? "Confirmé"
                        : r.status === "pending"   ? "En attente"
                        : "Annulé",
      }));

    // ── Feuille 3 : Utilisateurs ─────────────────────────────────────
    const utilisateurs = users.map(u => ({
      "Nom":                u.display_name || "—",
      "Email":              u.email,
      "Réservations":       reservations.filter(r => r.creatorEmail === u.email || r.inviteeEmail === u.email).length,
      "Date d'inscription": new Date(u.created_at).toLocaleDateString("fr-FR"),
    }));

    // ── Construction du classeur ─────────────────────────────────────
    const wb = XLSX.utils.book_new();

    const wsInv = XLSX.utils.json_to_sheet(invitations.length ? invitations : [{ "Info": "Aucune invitation" }]);
    const wsSal = XLSX.utils.json_to_sheet(salles.length     ? salles     : [{ "Info": "Aucune réservation de salle" }]);
    const wsUsr = XLSX.utils.json_to_sheet(utilisateurs.length ? utilisateurs : [{ "Info": "Aucun utilisateur" }]);

    // Largeurs de colonnes automatiques
    [wsInv, wsSal, wsUsr].forEach(ws => {
      ws["!cols"] = Array(10).fill({ wch: 22 });
    });

    XLSX.utils.book_append_sheet(wb, wsInv, "Invitations");
    XLSX.utils.book_append_sheet(wb, wsSal, "Salles occupées");
    XLSX.utils.book_append_sheet(wb, wsUsr, "Utilisateurs");

    XLSX.writeFile(wb, `rapport-afcac-${now.replace(/ /g, "-")}.xlsx`);
  }

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
  const users = data?.users ?? [];

  const stats = {
    total:      reservations.length,
    bilateral:  reservations.filter(r => r.type === "bilateral").length,
    salle:      reservations.filter(r => r.type === "salle").length,
    confirmed:  reservations.filter(r => r.status === "confirmed").length,
    pending:    reservations.filter(r => r.status === "pending").length,
    proposed:   reservations.filter(r => r.status === "proposed").length,
    cancelled:  reservations.filter(r => r.status === "cancelled").length,
  };

  function applyFilter(list: Reservation[]) {
    switch (filter) {
      case "Bilatérales": return list.filter(r => r.type === "bilateral");
      case "Salles":      return list.filter(r => r.type === "salle");
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
      <div className="flex items-center justify-between">
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
          <button
            onClick={downloadReport}
            disabled={!data}
            className="flex items-center gap-2 text-sm text-white bg-brand hover:bg-brand-dark px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Download className="w-4 h-4" /> Télécharger le rapport
          </button>
          <button onClick={fetchData} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-[10px]">
        {[
          { label: "Total réservations", value: stats.total,     icon: CalendarDays,  color: "text-foreground",   bg: "bg-muted" },
          { label: "Confirmées",         value: stats.confirmed, icon: CheckCircle2,  color: "text-brand",        bg: "bg-brand-light" },
          { label: "En attente",         value: stats.pending,   icon: Clock,         color: "text-olive-dark",   bg: "bg-olive-light" },
          { label: "Proposées",          value: stats.proposed,  icon: CalendarClock, color: "text-blue-600",     bg: "bg-blue-50" },
          { label: "Annulées",           value: stats.cancelled, icon: XCircle,       color: "text-red-600",      bg: "bg-red-50" },
          { label: "Bilatérales",        value: stats.bilateral, icon: Users,         color: "text-brand",        bg: "bg-brand-light" },
          { label: "Salles",             value: stats.salle,     icon: DoorOpen,      color: "text-olive-dark",   bg: "bg-olive-light" },
          { label: "Utilisateurs",       value: users.length,   icon: TrendingUp,    color: "text-purple-600",   bg: "bg-purple-50" },
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
      <div className="flex gap-2">
        {(["reservations", "users"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-5 py-2 rounded-lg text-sm font-medium border transition-colors",
              tab === t ? "bg-brand text-white border-brand" : "bg-card border-border text-muted-foreground hover:border-brand/40"
            )}>
            {t === "reservations" ? `Réservations (${reservations.length})` : `Utilisateurs (${users.length})`}
          </button>
        ))}
      </div>

      {tab === "reservations" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                  filter === f ? "bg-brand text-white border-brand" : "bg-card border-border text-muted-foreground hover:border-brand/40"
                )}>
                {f}
              </button>
            ))}
          </div>

          {/* Reservations table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
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
                      {updating === r.id ? (
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

      {tab === "users" && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
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
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
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
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
                  Nom d'affichage
                </label>
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
                <button
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={!editName.trim() || userAction === editUser.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {userAction === editUser.id
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Save className="w-3.5 h-3.5" />
                  }
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
