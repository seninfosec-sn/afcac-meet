import { Reservation } from "./data";

export interface AdminData {
  reservations: Reservation[];
  users: AdminUser[];
}

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

type RGB = [number, number, number];

// AFCAC brand palette
const C = {
  green:       [20,  88,  71 ] as RGB,
  greenDark:   [13,  61,  49 ] as RGB,
  greenLight:  [232, 242, 239] as RGB,
  olive:       [179, 174, 65 ] as RGB,
  oliveDark:   [122, 117, 42 ] as RGB,
  oliveLight:  [245, 244, 213] as RGB,
  white:       [255, 255, 255] as RGB,
  black:       [30,  30,  30 ] as RGB,
  gray:        [107, 114, 128] as RGB,
  lightGray:   [248, 249, 250] as RGB,
  confirmedBg: [220, 252, 231] as RGB,
  pendingBg:   [254, 243, 199] as RGB,
  proposedBg:  [219, 234, 254] as RGB,
  cancelledBg: [254, 226, 226] as RGB,
  confirmedTx: [22,  101, 52 ] as RGB,
  pendingTx:   [146, 64,  14 ] as RGB,
  proposedTx:  [30,  64,  175] as RGB,
  cancelledTx: [185, 28,  28 ] as RGB,
  purple:      [109, 40,  217] as RGB,
  purpleLight: [245, 240, 255] as RGB,
};

function sl(s: string): string {
  return ({ confirmed: "Confirmé", pending: "En attente", proposed: "Proposé", cancelled: "Annulé" } as Record<string, string>)[s] ?? s;
}

function statusStyle(status: string): { fillColor: RGB; textColor: RGB } {
  const m: Record<string, { fillColor: RGB; textColor: RGB }> = {
    confirmed: { fillColor: C.confirmedBg, textColor: C.confirmedTx },
    pending:   { fillColor: C.pendingBg,   textColor: C.pendingTx   },
    proposed:  { fillColor: C.proposedBg,  textColor: C.proposedTx  },
    cancelled: { fillColor: C.cancelledBg, textColor: C.cancelledTx },
  };
  return m[status] ?? { fillColor: C.lightGray, textColor: C.gray };
}

function pct(val: number, total: number): string {
  return total === 0 ? "0 %" : `${Math.round((val / total) * 100)} %`;
}

export async function downloadPDFReport(data: AdminData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const { reservations, users } = data;

  const stats = {
    total:     reservations.length,
    bilateral: reservations.filter(r => r.type === "bilateral").length,
    salle:     reservations.filter(r => r.type === "salle").length,
    confirmed: reservations.filter(r => r.status === "confirmed").length,
    pending:   reservations.filter(r => r.status === "pending").length,
    proposed:  reservations.filter(r => r.status === "proposed").length,
    cancelled: reservations.filter(r => r.status === "cancelled").length,
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 297 mm
  const H = doc.internal.pageSize.getHeight();  // 210 mm

  // ── Try loading the AFCAC logo ─────────────────────────────────────────────
  let logoUrl: string | null = null;
  try {
    const resp = await fetch("/afcac_logo.png");
    const blob = await resp.blob();
    logoUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });
  } catch { /* continue without logo */ }

  // ── Helper: branded section header band ───────────────────────────────────
  function drawSectionHeader(title: string, subtitle: string, bg: RGB) {
    doc.setFillColor(...bg);
    doc.rect(0, 0, W, 20, "F");
    doc.setFillColor(...C.olive);
    doc.rect(0, 0, 5, 20, "F");
    doc.setFillColor(...C.olive);
    doc.rect(0, 19.6, W, 0.4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.setTextColor(...C.white);
    doc.text(title, 12, 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(200, 230, 220);
    doc.text(subtitle, W - 10, 13, { align: "right" });
  }

  // ── Helper: standard page footer ──────────────────────────────────────────
  function drawFooter(pageNum: number, total: number) {
    doc.setFillColor(...C.greenDark);
    doc.rect(0, H - 10, W, 10, "F");
    doc.setFillColor(...C.olive);
    doc.rect(0, H - 10, W, 0.8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.white);
    doc.text("AFCAC MEET  —  Rapport confidentiel", 10, H - 3.8);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${pageNum} / ${total}`, W / 2, H - 3.8, { align: "center" });
    doc.text(`${dateStr}  à  ${timeStr}`, W - 10, H - 3.8, { align: "right" });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ══════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...C.green);
  doc.rect(0, 0, W, H, "F");

  // Decorative bands
  doc.setFillColor(...C.greenDark);
  doc.rect(0, 0, W, 7, "F");
  doc.setFillColor(...C.olive);
  doc.rect(0, 7, 7, H - 17, "F");
  doc.setFillColor(...C.greenDark);
  doc.rect(W - 28, 0, 28, H - 14, "F");
  doc.setFillColor(...C.olive);
  doc.rect(W - 32, 0, 4, H - 14, "F");

  // Logo or placeholder
  if (logoUrl) {
    doc.addImage(logoUrl, "PNG", W / 2 - 24, 18, 48, 36);
  } else {
    doc.setFillColor(...C.white);
    doc.roundedRect(W / 2 - 28, 18, 56, 24, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...C.green);
    doc.text("AFCAC", W / 2, 34, { align: "center" });
  }

  // Main title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...C.white);
  doc.text("RAPPORT DE GESTION", W / 2, 76, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...C.greenLight);
  doc.text("AFCAC MEET  —  Exposition Internationale", W / 2, 89, { align: "center" });
  doc.setFontSize(13);
  doc.text("Dakar  ·  Juin 2026", W / 2, 98, { align: "center" });

  // Olive divider
  doc.setDrawColor(...C.olive);
  doc.setLineWidth(1.2);
  doc.line(W / 2 - 72, 104, W / 2 + 72, 104);

  // Statistics boxes
  const kpis = [
    { label: "Réservations", value: stats.total,     },
    { label: "Confirmées",   value: stats.confirmed, },
    { label: "En attente",   value: stats.pending,   },
    { label: "Délégués",     value: users.length,    },
  ];
  const bW = 44, bH = 26, bGap = 7;
  const totalBW = kpis.length * bW + (kpis.length - 1) * bGap;
  const startX = (W - totalBW) / 2;

  kpis.forEach((k, i) => {
    const bx = startX + i * (bW + bGap);
    const by = 112;
    doc.setFillColor(...C.greenDark);
    doc.roundedRect(bx, by, bW, bH, 3, 3, "F");
    doc.setDrawColor(...C.olive);
    doc.setLineWidth(0.7);
    doc.roundedRect(bx, by, bW, bH, 3, 3, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...C.white);
    doc.text(String(k.value), bx + bW / 2, by + 14, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 220, 210);
    doc.text(k.label, bx + bW / 2, by + 21, { align: "center" });
  });

  // Generation timestamp
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.greenLight);
  doc.text(`Généré le ${dateStr} à ${timeStr}`, W / 2, 148, { align: "center" });

  // Cover footer
  doc.setFillColor(...C.olive);
  doc.rect(0, H - 14, W, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.white);
  doc.text("DOCUMENT CONFIDENTIEL  —  USAGE INTERNE AFCAC", W / 2, H - 5.5, { align: "center" });

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — ANALYTICS DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSectionHeader("TABLEAU DE BORD ANALYTIQUE", `Vue globale — ${dateStr}`, C.green);

  // KPI strip
  const kpiAll: { label: string; value: number; sub: string; color: RGB }[] = [
    { label: "Total",        value: stats.total,     sub: "100 %",                          color: C.green      },
    { label: "Confirmées",   value: stats.confirmed,  sub: pct(stats.confirmed,  stats.total), color: C.confirmedTx },
    { label: "En attente",   value: stats.pending,    sub: pct(stats.pending,    stats.total), color: C.pendingTx   },
    { label: "Proposées",    value: stats.proposed,   sub: pct(stats.proposed,   stats.total), color: C.proposedTx  },
    { label: "Annulées",     value: stats.cancelled,  sub: pct(stats.cancelled,  stats.total), color: C.cancelledTx },
    { label: "Bilatérales",  value: stats.bilateral,  sub: pct(stats.bilateral,  stats.total), color: C.green       },
    { label: "Salles",       value: stats.salle,      sub: pct(stats.salle,      stats.total), color: C.oliveDark   },
    { label: "Délégués",     value: users.length,     sub: "—",                               color: C.purple      },
  ];

  const kW = (W - 20) / kpiAll.length;
  kpiAll.forEach((k, i) => {
    const kx = 10 + i * kW, ky = 23, kH2 = 22;
    doc.setFillColor(...C.lightGray);
    doc.roundedRect(kx, ky, kW - 1.5, kH2, 1.5, 1.5, "F");
    doc.setFillColor(...k.color);
    doc.roundedRect(kx, ky, kW - 1.5, 2.5, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...k.color);
    doc.text(String(k.value), kx + (kW - 1.5) / 2, ky + 12.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.gray);
    doc.text(k.label, kx + (kW - 1.5) / 2, ky + 17,   { align: "center" });
    doc.text(k.sub,   kx + (kW - 1.5) / 2, ky + 20.5, { align: "center" });
  });

  const halfW = (W - 26) / 2;
  const tableY = 50;

  // Left: distribution by type
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.green);
  doc.text("Répartition par type", 10, tableY);

  autoTable(doc, {
    startY: tableY + 3,
    head: [["Type", "Total", "%", "Confirmées", "En attente", "Annulées"]],
    body: [
      ["Réunions bilatérales",    stats.bilateral, pct(stats.bilateral, stats.total),
        reservations.filter(r => r.type === "bilateral" && r.status === "confirmed").length,
        reservations.filter(r => r.type === "bilateral" && r.status === "pending").length,
        reservations.filter(r => r.type === "bilateral" && r.status === "cancelled").length],
      ["Réservations de salles",  stats.salle,     pct(stats.salle, stats.total),
        reservations.filter(r => r.type === "salle" && r.status === "confirmed").length,
        reservations.filter(r => r.type === "salle" && r.status === "pending").length,
        reservations.filter(r => r.type === "salle" && r.status === "cancelled").length],
      ["TOTAL",                   stats.total,     "100 %", stats.confirmed, stats.pending, stats.cancelled],
    ],
    theme: "grid",
    headStyles: { fillColor: C.green, textColor: C.white, fontStyle: "bold", fontSize: 8.5, halign: "center" },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "center", fontStyle: "bold", textColor: C.green },
      2: { halign: "center" },
      3: { halign: "center", textColor: C.confirmedTx },
      4: { halign: "center", textColor: C.pendingTx },
      5: { halign: "center", textColor: C.cancelledTx },
    },
    didParseCell: (d) => {
      if (d.section === "body" && d.row.index === 2) {
        d.cell.styles.fillColor = C.greenLight;
        d.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 10, right: W / 2 + 3, bottom: 14 },
    tableWidth: halfW,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leftFinalY: number = (doc as any).lastAutoTable.finalY;

  // Right: distribution by status
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...C.green);
  doc.text("Répartition par statut", W / 2 + 3, tableY);

  autoTable(doc, {
    startY: tableY + 3,
    head: [["Statut", "Total", "%", "Bilatérales", "Salles"]],
    body: [
      ["Confirmé",   stats.confirmed, pct(stats.confirmed, stats.total),
        reservations.filter(r => r.type === "bilateral" && r.status === "confirmed").length,
        reservations.filter(r => r.type === "salle"     && r.status === "confirmed").length],
      ["En attente", stats.pending,   pct(stats.pending, stats.total),
        reservations.filter(r => r.type === "bilateral" && r.status === "pending").length,
        reservations.filter(r => r.type === "salle"     && r.status === "pending").length],
      ["Proposé",    stats.proposed,  pct(stats.proposed, stats.total),
        reservations.filter(r => r.type === "bilateral" && r.status === "proposed").length,
        reservations.filter(r => r.type === "salle"     && r.status === "proposed").length],
      ["Annulé",     stats.cancelled, pct(stats.cancelled, stats.total),
        reservations.filter(r => r.type === "bilateral" && r.status === "cancelled").length,
        reservations.filter(r => r.type === "salle"     && r.status === "cancelled").length],
    ],
    theme: "grid",
    headStyles: { fillColor: C.olive, textColor: C.white, fontStyle: "bold", fontSize: 8.5, halign: "center" },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "center", fontStyle: "bold" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
    },
    didParseCell: (d) => {
      if (d.section === "body" && d.column.index === 0) {
        const m: Record<string, { fillColor: RGB; textColor: RGB }> = {
          "Confirmé":   { fillColor: C.confirmedBg, textColor: C.confirmedTx },
          "En attente": { fillColor: C.pendingBg,   textColor: C.pendingTx   },
          "Proposé":    { fillColor: C.proposedBg,  textColor: C.proposedTx  },
          "Annulé":     { fillColor: C.cancelledBg, textColor: C.cancelledTx },
        };
        const sty = m[d.cell.raw as string];
        if (sty) { d.cell.styles.fillColor = sty.fillColor; d.cell.styles.textColor = sty.textColor; d.cell.styles.fontStyle = "bold"; }
      }
    },
    margin: { left: W / 2 + 3, right: 10, bottom: 14 },
    tableWidth: halfW,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rightFinalY: number = (doc as any).lastAutoTable.finalY;
  const nextY = Math.max(leftFinalY, rightFinalY) + 8;

  // Top 5 users (if enough space)
  if (nextY < H - 50) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...C.green);
    doc.text("Top 5 délégués les plus actifs", 10, nextY);

    const top5 = [...users]
      .map(u => ({
        name: u.display_name || "—",
        email: u.email,
        count: reservations.filter(r => r.creatorEmail === u.email || r.inviteeEmail === u.email).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    autoTable(doc, {
      startY: nextY + 3,
      head: [["#", "Délégué", "Adresse email", "Réservations", "% du total"]],
      body: top5.map((u, i) => [i + 1, u.name, u.email, u.count, pct(u.count, stats.total)]),
      theme: "grid",
      headStyles: { fillColor: C.purple, textColor: C.white, fontStyle: "bold", fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { fontStyle: "bold" },
        3: { halign: "center", fontStyle: "bold", textColor: C.green },
        4: { halign: "center", textColor: C.gray },
      },
      margin: { left: 10, right: 10, bottom: 14 },
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — INVITATIONS BILATÉRALES
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSectionHeader("INVITATIONS BILATÉRALES", `${stats.bilateral} réunion(s)  ·  ${dateStr}`, C.green);

  const bilRows = reservations
    .filter(r => r.type === "bilateral")
    .map(r => [r.date, `${r.startTime} – ${r.endTime}`, r.title, r.creatorEmail ?? "—", r.inviteeEmail ?? "—", r.location, sl(r.status), r.status]);

  autoTable(doc, {
    startY: 23,
    head: [["Date", "Horaire", "Titre", "Initiateur", "Invité(e)", "Lieu", "Statut"]],
    body: bilRows.length
      ? bilRows.map(r => r.slice(0, 7))
      : [["", "", "Aucune invitation enregistrée", "", "", "", ""]],
    theme: "grid",
    headStyles: { fillColor: C.green, textColor: C.white, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: C.greenLight },
    columnStyles: {
      0: { halign: "center", cellWidth: 22 },
      1: { halign: "center", cellWidth: 26 },
      2: { fontStyle: "bold" },
      3: { cellWidth: 44, textColor: C.gray, fontSize: 8 },
      4: { cellWidth: 44, textColor: C.gray, fontSize: 8 },
      5: { halign: "center", cellWidth: 22 },
      6: { halign: "center", cellWidth: 22 },
    },
    didParseCell: (d) => {
      if (d.section === "body" && d.column.index === 6 && bilRows.length > 0) {
        const sty = statusStyle(bilRows[d.row.index]?.[7] as string ?? "");
        if (sty) { d.cell.styles.fillColor = sty.fillColor; d.cell.styles.textColor = sty.textColor; d.cell.styles.fontStyle = "bold"; }
      }
    },
    didDrawPage: (hook) => {
      if (hook.pageNumber > 1)
        drawSectionHeader("INVITATIONS BILATÉRALES (suite)", `${stats.bilateral} réunion(s)  ·  ${dateStr}`, C.green);
    },
    margin: { left: 10, right: 10, top: 23, bottom: 14 },
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 4 — RÉSERVATIONS DE SALLES
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSectionHeader("RÉSERVATIONS DE SALLES", `${stats.salle} réservation(s)  ·  ${dateStr}`, C.olive);

  const roomRows = reservations
    .filter(r => r.type === "salle")
    .map(r => [r.location ?? "—", r.date, `${r.startTime} – ${r.endTime}`, r.title, r.creatorEmail ?? "—", r.capacity ?? "—", sl(r.status), r.status]);

  autoTable(doc, {
    startY: 23,
    head: [["Salle", "Date", "Horaire", "Titre", "Organisateur", "Cap.", "Statut"]],
    body: roomRows.length
      ? roomRows.map(r => r.slice(0, 7))
      : [["", "", "", "Aucune réservation de salle", "", "", ""]],
    theme: "grid",
    headStyles: { fillColor: C.olive, textColor: C.white, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: C.oliveLight },
    columnStyles: {
      0: { halign: "center", fontStyle: "bold", cellWidth: 22, textColor: C.greenDark },
      1: { halign: "center", cellWidth: 22 },
      2: { halign: "center", cellWidth: 26 },
      3: { fontStyle: "bold" },
      4: { cellWidth: 46, textColor: C.gray, fontSize: 8 },
      5: { halign: "center", cellWidth: 14 },
      6: { halign: "center", cellWidth: 22 },
    },
    didParseCell: (d) => {
      if (d.section === "body" && d.column.index === 6 && roomRows.length > 0) {
        const sty = statusStyle(roomRows[d.row.index]?.[7] as string ?? "");
        if (sty) { d.cell.styles.fillColor = sty.fillColor; d.cell.styles.textColor = sty.textColor; d.cell.styles.fontStyle = "bold"; }
      }
    },
    didDrawPage: (hook) => {
      if (hook.pageNumber > 1)
        drawSectionHeader("RÉSERVATIONS DE SALLES (suite)", `${stats.salle} réservation(s)  ·  ${dateStr}`, C.olive);
    },
    margin: { left: 10, right: 10, top: 23, bottom: 14 },
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5 — DÉLÉGUÉS INSCRITS
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage();
  drawSectionHeader("DÉLÉGUÉS INSCRITS", `${users.length} délégué(s)  ·  ${dateStr}`, C.purple);

  const userRows = users.map(u => {
    const count = reservations.filter(r => r.creatorEmail === u.email || r.inviteeEmail === u.email).length;
    return [u.display_name || "—", u.email, count, pct(count, stats.total), new Date(u.created_at).toLocaleDateString("fr-FR")];
  });

  autoTable(doc, {
    startY: 23,
    head: [["Nom", "Adresse email", "Réservations", "% du total", "Inscription"]],
    body: userRows.length ? userRows : [["", "Aucun utilisateur enregistré", "", "", ""]],
    theme: "grid",
    headStyles: { fillColor: C.purple, textColor: C.white, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: C.purpleLight },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { textColor: C.gray, fontSize: 8 },
      2: { halign: "center", fontStyle: "bold", textColor: C.green },
      3: { halign: "center", textColor: C.gray },
      4: { halign: "center", textColor: C.gray },
    },
    didDrawPage: (hook) => {
      if (hook.pageNumber > 1)
        drawSectionHeader("DÉLÉGUÉS INSCRITS (suite)", `${users.length} délégué(s)  ·  ${dateStr}`, C.purple);
    },
    margin: { left: 10, right: 10, top: 23, bottom: 14 },
  });

  // ══════════════════════════════════════════════════════════════════════════
  // POST-PROCESSING: footers on all data pages (cover has its own)
  // ══════════════════════════════════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(p - 1, totalPages - 1);
  }

  doc.save(`rapport-afcac-${now.toISOString().slice(0, 10)}.pdf`);
}
