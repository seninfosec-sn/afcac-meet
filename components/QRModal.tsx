"use client";
import { useEffect, useRef, useState } from "react";
import { X, Share2, CheckCircle2 } from "lucide-react";
import { Reservation } from "@/lib/data";
import { useLanguage } from "@/contexts/LanguageContext";
import StatusBadge from "./StatusBadge";

interface Props {
  reservation: Reservation;
  onClose: () => void;
}

function drawQR(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const size = 200, cell = 6.25, cols = Math.floor(size / cell);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  function rand(i: number) { return ((12345 * i * 1103515245 + 12345) & 0x7fffffff) % 100; }
  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      let fill = false;
      if (r < 7 && c < 7) { fill = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4); }
      else if (r < 7 && c >= cols - 7) { const lc = c - (cols - 7); fill = r === 0 || r === 6 || lc === 0 || lc === 6 || (r >= 2 && r <= 4 && lc >= 2 && lc <= 4); }
      else if (r >= cols - 7 && c < 7) { const lr = r - (cols - 7); fill = lr === 0 || lr === 6 || c === 0 || c === 6 || (lr >= 2 && lr <= 4 && c >= 2 && c <= 4); }
      else { fill = rand(r * cols + c) > 48; }
      ctx.fillStyle = fill ? "#145847" : "#ffffff";
      ctx.fillRect(c * cell, r * cell, cell - 0.5, cell - 0.5);
    }
  }
}

export default function QRModal({ reservation, onClose }: Props) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [checked, setChecked] = useState(false);
  const [secs, setSecs] = useState(900);

  useEffect(() => {
    if (canvasRef.current) drawQR(canvasRef.current);
    const timer = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const min = Math.floor(secs / 60), sec = secs % 60;
  const id = `RES-2026-${reservation.id.toUpperCase()}-7F4A`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-sm overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}>
        <div className="bg-[#145847] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-base">{t.qr.title}</p>
            <p className="text-white/70 text-xs mt-0.5">{t.qr.subtitle}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
            <div>
              <p className="text-sm font-medium">{reservation.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{reservation.startTime} – {reservation.endTime} · {reservation.location}</p>
            </div>
            <StatusBadge status={reservation.status} />
          </div>

          {!checked ? (
            <>
              <div className="flex justify-center">
                <div className="p-4 border-2 border-border rounded-xl relative">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#145847] rounded-tl" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#145847] rounded-tr" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#145847] rounded-bl" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#145847] rounded-br" />
                  <canvas ref={canvasRef} width={200} height={200} className="block rounded" />
                </div>
              </div>

              <p className="text-center text-xs font-mono text-muted-foreground">{id}</p>

              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#145847] animate-pulse" />
                <span className="text-sm font-medium text-[#145847]">{t.qr.waiting}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  [t.qr.reservation, t.qr.confirmed],
                  [t.qr.expiresIn, `${min}:${sec.toString().padStart(2, "0")}`],
                  [t.qr.participants, "2"],
                  [t.qr.type, reservation.type === "bilateral" ? t.qr.bilateral : t.qr.room],
                ].map(([l, v]) => (
                  <div key={l} className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="text-sm font-medium mt-0.5">{v}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => setChecked(true)}
                className="w-full bg-[#145847] text-white py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {t.qr.simulate}
              </button>
              <button className="w-full border border-border py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                {t.qr.share}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center py-6 gap-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-brand" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg text-brand">{t.qr.successTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">{t.qr.successMsg}<br />{t.qr.goodMeeting}</p>
              </div>
              <button onClick={onClose} className="bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                {t.qr.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
