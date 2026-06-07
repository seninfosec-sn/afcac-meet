import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllReservations, getAllUsers } from "@/lib/db";
import ExcelJS from "exceljs";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "afcacexpo@gmail.com")
  .split(",").map(e => e.trim().toLowerCase());

// ARGB hex colors (ExcelJS format)
const E = {
  green:      "FF145847",
  greenDark:  "FF0d3d31",
  greenLight: "FFe8f2ef",
  olive:      "FFb3ae41",
  oliveDark:  "FF7a752a",
  oliveLight: "FFf5f4d5",
  white:      "FFFFFFFF",
  black:      "FF1e1e1e",
  gray:       "FF6b7280",
  lightGray:  "FFF8F9FA",
  altRow:     "FFF5F7F6",
  purple:     "FF7C3AED",
  purpleLight:"FFF5F0FF",
  confirmedBg:"FFDCFCE7",
  pendingBg:  "FFFEF3C7",
  proposedBg: "FFDBECFE",
  cancelledBg:"FFFEE2E2",
  confirmedTx:"FF166534",
  pendingTx:  "FF92400E",
  proposedTx: "FF1E3A8A",
  cancelledTx:"FFB91C1C",
};

function statusLabel(s: string): string {
  return ({ confirmed: "Confirmé", pending: "En attente", proposed: "Proposé", cancelled: "Annulé" } as Record<string, string>)[s] ?? s;
}

function statusArgb(s: string): { fill: string; text: string } {
  return ({
    confirmed: { fill: E.confirmedBg, text: E.confirmedTx },
    pending:   { fill: E.pendingBg,   text: E.pendingTx   },
    proposed:  { fill: E.proposedBg,  text: E.proposedTx  },
    cancelled: { fill: E.cancelledBg, text: E.cancelledTx },
  } as Record<string, { fill: string; text: string }>)[s] ?? { fill: E.lightGray, text: E.gray };
}

function pct(val: number, total: number): string {
  return total === 0 ? "0 %" : `${Math.round((val / total) * 100)} %`;
}

type BorderSide = ExcelJS.Border;
const thinBorder: BorderSide = { style: "thin", color: { argb: "FFD0D0D0" } };
const hairBorder: BorderSide = { style: "hair", color: { argb: "FFE8E8E8" } };
const allHair = { top: hairBorder, bottom: hairBorder, left: hairBorder, right: hairBorder };
const allThin = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function applySheetBranding(ws: ExcelJS.Worksheet, title: string, subtitle: string, cols: number) {
  const lastCol = String.fromCharCode(64 + cols);

  // Row 1: AFCAC brand header
  ws.mergeCells(`A1:${lastCol}1`);
  const r1 = ws.getCell("A1");
  r1.value = "AFCAC MEET — RAPPORT D'ACTIVITÉ";
  r1.font = { bold: true, size: 16, color: { argb: E.white }, name: "Calibri" };
  r1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: E.green } };
  r1.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 44;

  // Row 2: section title
  ws.mergeCells(`A2:${lastCol}2`);
  const r2 = ws.getCell("A2");
  r2.value = title;
  r2.font = { bold: true, size: 12, color: { argb: E.white }, name: "Calibri" };
  r2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: E.greenDark } };
  r2.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(2).height = 28;

  // Row 3: subtitle / generation date
  ws.mergeCells(`A3:${lastCol}3`);
  const r3 = ws.getCell("A3");
  r3.value = subtitle;
  r3.font = { italic: true, size: 9, color: { argb: E.gray }, name: "Calibri" };
  r3.alignment = { horizontal: "center" };
  ws.getRow(3).height = 17;

  // Row 4: spacer
  ws.getRow(4).height = 8;
}

function styleColHeader(cell: ExcelJS.Cell, text: string, bgArgb: string) {
  cell.value = text;
  cell.font = { bold: true, size: 9.5, color: { argb: E.white }, name: "Calibri" };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgArgb } };
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: false };
  cell.border = allThin;
}

function styleDataCell(
  cell: ExcelJS.Cell,
  value: ExcelJS.CellValue,
  isEven: boolean,
  opts?: {
    bold?: boolean;
    color?: string;
    align?: "left" | "center" | "right";
    indent?: number;
    bg?: string;
    italic?: boolean;
  }
) {
  cell.value = value;
  const bg = opts?.bg ?? (isEven ? E.altRow : E.white);
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
  cell.font = {
    size: 9.5,
    bold: opts?.bold ?? false,
    italic: opts?.italic ?? false,
    color: { argb: opts?.color ?? E.black },
    name: "Calibri",
  };
  cell.alignment = { horizontal: opts?.align ?? "left", vertical: "middle", indent: opts?.indent ?? 0 };
  cell.border = allHair;
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!ADMIN_EMAILS.includes(user.email.toLowerCase()))
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const [reservations, users] = await Promise.all([getAllReservations(), getAllUsers()]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const subtitle = `Exposition AFCAC 2026 — Généré le ${dateStr} à ${timeStr}`;

  const stats = {
    total:     reservations.length,
    bilateral: reservations.filter(r => r.type === "bilateral").length,
    salle:     reservations.filter(r => r.type === "salle").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    pending:   reservations.filter(r => r.status === "pending").length,
    proposed:  reservations.filter(r => r.status === "proposed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  };

  const wb = new ExcelJS.Workbook();
  wb.creator = "AFCAC Meet";
  wb.created = now;
  wb.properties.date1904 = false;

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 1 — Résumé analytique
  // ─────────────────────────────────────────────────────────────────────────
  const wsS = wb.addWorksheet("Résumé analytique", {
    properties: { tabColor: { argb: E.green } },
    views: [{ showGridLines: false }],
  });
  wsS.columns = [{ width: 40 }, { width: 14 }, { width: 13 }, { width: 34 }];
  applySheetBranding(wsS, "RÉSUMÉ ANALYTIQUE", subtitle, 4);

  // KPI section title
  wsS.mergeCells("A5:D5");
  const kpiTitle = wsS.getCell("A5");
  kpiTitle.value = "  INDICATEURS CLÉS DE PERFORMANCE";
  kpiTitle.font = { bold: true, size: 10, color: { argb: E.green } };
  kpiTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: E.greenLight } };
  kpiTitle.alignment = { horizontal: "left", vertical: "middle" };
  wsS.getRow(5).height = 24;

  // KPI column headers
  ["Indicateur", "Valeur", "% du total", "Observation"].forEach((h, i) => {
    styleColHeader(wsS.getRow(6).getCell(i + 1), h, E.olive);
  });
  wsS.getRow(6).height = 22;

  const kpiRows: [string, number | string, string, string][] = [
    ["Total des réservations",                  stats.total,     "100 %",                          "Toutes catégories confondues"],
    ["Réservations confirmées",                 stats.confirmed, pct(stats.confirmed, stats.total), "Taux de confirmation"],
    ["En attente de validation",                stats.pending,   pct(stats.pending,   stats.total), "Requièrent une action administrative"],
    ["Propositions de nouveaux créneaux",        stats.proposed,  pct(stats.proposed,  stats.total), "Reschedule en cours de négociation"],
    ["Réservations annulées",                   stats.cancelled, pct(stats.cancelled, stats.total), "Taux d'annulation"],
    ["Réunions bilatérales",                    stats.bilateral, pct(stats.bilateral, stats.total), "Rencontres entre délégations"],
    ["Réservations de salles de réunion",        stats.salle,     pct(stats.salle,     stats.total), "Créneaux de salles occupés"],
    ["Utilisateurs inscrits (délégués)",        users.length,    "—",                               "Délégués et organisateurs enregistrés"],
  ];

  kpiRows.forEach(([label, val, pctStr, obs], idx) => {
    const row = wsS.getRow(7 + idx);
    row.height = 20;
    const even = idx % 2 === 0;
    styleDataCell(row.getCell(1), label,  even, { indent: 1 });
    styleDataCell(row.getCell(2), val,    even, { bold: true, color: E.green, align: "center" });
    styleDataCell(row.getCell(3), pctStr, even, { color: E.gray, align: "center" });
    styleDataCell(row.getCell(4), obs,    even, { color: E.gray, italic: true });
  });

  // Spacer
  wsS.getRow(16).height = 12;

  // Top users section
  wsS.mergeCells("A17:D17");
  const topTitle = wsS.getCell("A17");
  topTitle.value = "  TOP 5 DÉLÉGUÉS LES PLUS ACTIFS";
  topTitle.font = { bold: true, size: 10, color: { argb: E.green } };
  topTitle.fill = { type: "pattern", pattern: "solid", fgColor: { argb: E.greenLight } };
  topTitle.alignment = { horizontal: "left", vertical: "middle" };
  wsS.getRow(17).height = 24;

  ["Délégué", "Adresse email", "Réservations", "% du total"].forEach((h, i) => {
    styleColHeader(wsS.getRow(18).getCell(i + 1), h, E.green);
  });
  wsS.getRow(18).height = 22;

  const top5 = [...users]
    .map(u => ({
      name: u.display_name || "—",
      email: u.email,
      count: reservations.filter(r => r.creatorEmail === u.email || r.inviteeEmail === u.email).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  top5.forEach(({ name, email, count }, idx) => {
    const row = wsS.getRow(19 + idx);
    row.height = 20;
    const even = idx % 2 === 0;
    styleDataCell(row.getCell(1), `${idx + 1}.  ${name}`, even, { bold: true, indent: 1 });
    styleDataCell(row.getCell(2), email, even, { color: E.gray });
    styleDataCell(row.getCell(3), count, even, { bold: true, color: E.green, align: "center" });
    styleDataCell(row.getCell(4), pct(count, stats.total), even, { color: E.gray, align: "center" });
  });

  // Freeze header rows
  wsS.views = [{ state: "frozen", xSplit: 0, ySplit: 6, showGridLines: false }];

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 2 — Invitations bilatérales
  // ─────────────────────────────────────────────────────────────────────────
  const wsI = wb.addWorksheet("Invitations bilatérales", {
    properties: { tabColor: { argb: E.green } },
    views: [{ showGridLines: false }],
  });
  wsI.columns = [
    { width: 30 }, { width: 13 }, { width: 9 }, { width: 9 },
    { width: 28 }, { width: 28 }, { width: 14 }, { width: 14 },
  ];
  const bilateral = reservations.filter(r => r.type === "bilateral");
  applySheetBranding(wsI, "INVITATIONS BILATÉRALES", `${bilateral.length} réunion(s) · ${subtitle}`, 8);

  ["Titre", "Date", "Début", "Fin", "Initiateur", "Invité(e)", "Lieu", "Statut"].forEach((h, i) => {
    styleColHeader(wsI.getRow(5).getCell(i + 1), h, E.green);
  });
  wsI.getRow(5).height = 22;

  if (bilateral.length === 0) {
    wsI.mergeCells("A6:H6");
    const empty = wsI.getCell("A6");
    empty.value = "Aucune invitation bilatérale enregistrée.";
    empty.font = { italic: true, color: { argb: E.gray } };
    empty.alignment = { horizontal: "center" };
  } else {
    bilateral.forEach((r, idx) => {
      const row = wsI.getRow(6 + idx);
      row.height = 20;
      const even = idx % 2 === 0;
      const sc = statusArgb(r.status);
      styleDataCell(row.getCell(1), r.title,               even, { bold: true, indent: 1 });
      styleDataCell(row.getCell(2), r.date,                even, { align: "center" });
      styleDataCell(row.getCell(3), r.startTime,           even, { align: "center" });
      styleDataCell(row.getCell(4), r.endTime,             even, { align: "center" });
      styleDataCell(row.getCell(5), r.creatorEmail ?? "—", even, { color: E.gray });
      styleDataCell(row.getCell(6), r.inviteeEmail ?? "—", even, { color: E.gray });
      styleDataCell(row.getCell(7), r.location,            even, { align: "center" });
      styleDataCell(row.getCell(8), statusLabel(r.status), even, { bold: true, align: "center", color: sc.text, bg: sc.fill });
    });
  }

  wsI.autoFilter = { from: "A5", to: "H5" };
  wsI.views = [{ state: "frozen", xSplit: 0, ySplit: 5, showGridLines: false }];

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 3 — Réservations de salles
  // ─────────────────────────────────────────────────────────────────────────
  const wsR = wb.addWorksheet("Réservations de salles", {
    properties: { tabColor: { argb: E.olive } },
    views: [{ showGridLines: false }],
  });
  wsR.columns = [
    { width: 16 }, { width: 28 }, { width: 13 }, { width: 9 },
    { width: 9 },  { width: 28 }, { width: 11 }, { width: 14 },
  ];
  const salles = reservations.filter(r => r.type === "salle");
  applySheetBranding(wsR, "RÉSERVATIONS DE SALLES", `${salles.length} réservation(s) · ${subtitle}`, 8);

  ["Salle", "Titre", "Date", "Début", "Fin", "Organisateur", "Capacité", "Statut"].forEach((h, i) => {
    styleColHeader(wsR.getRow(5).getCell(i + 1), h, E.olive);
  });
  wsR.getRow(5).height = 22;

  if (salles.length === 0) {
    wsR.mergeCells("A6:H6");
    const empty = wsR.getCell("A6");
    empty.value = "Aucune réservation de salle enregistrée.";
    empty.font = { italic: true, color: { argb: E.gray } };
    empty.alignment = { horizontal: "center" };
  } else {
    salles.forEach((r, idx) => {
      const row = wsR.getRow(6 + idx);
      row.height = 20;
      const even = idx % 2 === 0;
      const sc = statusArgb(r.status);
      styleDataCell(row.getCell(1), r.location ?? "—",   even, { bold: true, align: "center", color: E.greenDark });
      styleDataCell(row.getCell(2), r.title,              even, { bold: true, indent: 1 });
      styleDataCell(row.getCell(3), r.date,               even, { align: "center" });
      styleDataCell(row.getCell(4), r.startTime,          even, { align: "center" });
      styleDataCell(row.getCell(5), r.endTime,            even, { align: "center" });
      styleDataCell(row.getCell(6), r.creatorEmail ?? "—",even, { color: E.gray });
      styleDataCell(row.getCell(7), r.capacity ?? "—",   even, { align: "center" });
      styleDataCell(row.getCell(8), statusLabel(r.status), even, { bold: true, align: "center", color: sc.text, bg: sc.fill });
    });
  }

  wsR.autoFilter = { from: "A5", to: "H5" };
  wsR.views = [{ state: "frozen", xSplit: 0, ySplit: 5, showGridLines: false }];

  // ─────────────────────────────────────────────────────────────────────────
  // SHEET 4 — Utilisateurs
  // ─────────────────────────────────────────────────────────────────────────
  const wsU = wb.addWorksheet("Utilisateurs", {
    properties: { tabColor: { argb: E.purple } },
    views: [{ showGridLines: false }],
  });
  wsU.columns = [{ width: 28 }, { width: 34 }, { width: 15 }, { width: 12 }, { width: 18 }];
  applySheetBranding(wsU, "DÉLÉGUÉS INSCRITS", `${users.length} délégué(s) · ${subtitle}`, 5);

  ["Nom", "Adresse email", "Réservations", "% du total", "Inscription"].forEach((h, i) => {
    styleColHeader(wsU.getRow(5).getCell(i + 1), h, E.purple);
  });
  wsU.getRow(5).height = 22;

  if (users.length === 0) {
    wsU.mergeCells("A6:E6");
    const empty = wsU.getCell("A6");
    empty.value = "Aucun utilisateur enregistré.";
    empty.font = { italic: true, color: { argb: E.gray } };
    empty.alignment = { horizontal: "center" };
  } else {
    users.forEach((u, idx) => {
      const row = wsU.getRow(6 + idx);
      row.height = 20;
      const even = idx % 2 === 0;
      const count = reservations.filter(r => r.creatorEmail === u.email || r.inviteeEmail === u.email).length;
      styleDataCell(row.getCell(1), u.display_name || "—", even, { bold: true, indent: 1 });
      styleDataCell(row.getCell(2), u.email,                even, { color: E.gray });
      styleDataCell(row.getCell(3), count,                  even, { bold: true, color: E.green, align: "center" });
      styleDataCell(row.getCell(4), pct(count, stats.total),even, { color: E.gray, align: "center" });
      styleDataCell(row.getCell(5), new Date(u.created_at).toLocaleDateString("fr-FR"), even, { align: "center", color: E.gray });
    });
  }

  wsU.autoFilter = { from: "A5", to: "E5" };
  wsU.views = [{ state: "frozen", xSplit: 0, ySplit: 5, showGridLines: false }];

  // ─────────────────────────────────────────────────────────────────────────
  // Send response
  // ─────────────────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const filename = `rapport-afcac-${now.toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
