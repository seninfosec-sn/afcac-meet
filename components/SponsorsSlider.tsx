"use client";
import Image from "next/image";

interface Sponsor {
  name: string;
  abbr: string;
  logo?: string;
  bg: string;
  text: string;
  category: "Gold" | "Silver" | "Exhibitor";
}

const SPONSORS: Sponsor[] = [
  // Gold
  { name: "ICAO",              abbr: "ICAO",    logo: "/sponsors/icao.png",       bg: "#003087", text: "#fff",    category: "Gold" },
  { name: "IATA",              abbr: "IATA",    logo: "/sponsors/iata.png",       bg: "#cc0000", text: "#fff",    category: "Gold" },
  { name: "ASECNA",            abbr: "ASECNA",  logo: "/sponsors/asecna.png",     bg: "#006ab0", text: "#fff",    category: "Gold" },
  { name: "Airbus",            abbr: "Airbus",  logo: "/sponsors/airbus.png",     bg: "#00205b", text: "#fff",    category: "Gold" },
  // Silver
  { name: "AFRAA",             abbr: "AFRAA",   logo: "/sponsors/afraa.png",      bg: "#145847", text: "#fff",    category: "Silver" },
  { name: "Air Sénégal",       abbr: "AS",      logo: "/sponsors/air-senegal.png",bg: "#006f3c", text: "#fff",    category: "Silver" },
  { name: "Ethiopian Airlines",abbr: "ET",      logo: "/sponsors/ethiopian.png",  bg: "#2a7a3b", text: "#fff",    category: "Silver" },
  { name: "Royal Air Maroc",   abbr: "RAM",     logo: "/sponsors/ram.png",        bg: "#b22222", text: "#fff",    category: "Silver" },
  { name: "Kenya Airways",     abbr: "KQ",      logo: "/sponsors/kenya.png",      bg: "#cc0000", text: "#fff",    category: "Silver" },
  { name: "Safran",            abbr: "Safran",  logo: "/sponsors/safran.png",     bg: "#0f2342", text: "#fff",    category: "Silver" },
  // Exhibitors
  { name: "Thales",            abbr: "Thales",  logo: "/sponsors/thales.png",     bg: "#004899", text: "#fff",    category: "Exhibitor" },
  { name: "Collins Aerospace", abbr: "Collins", logo: "/sponsors/collins.png",    bg: "#1a3d6b", text: "#fff",    category: "Exhibitor" },
  { name: "Air Côte d'Ivoire", abbr: "HF",      logo: "/sponsors/aci.png",        bg: "#f4a300", text: "#1a1a1a",category: "Exhibitor" },
  { name: "AfDB",              abbr: "AfDB",    logo: "/sponsors/afdb.png",       bg: "#00538b", text: "#fff",    category: "Exhibitor" },
  { name: "Orange",            abbr: "Orange",  logo: "/sponsors/orange.png",     bg: "#ff6600", text: "#fff",    category: "Exhibitor" },
  { name: "UEMOA",             abbr: "UEMOA",   logo: "/sponsors/uemoa.png",      bg: "#003d7a", text: "#fff",    category: "Exhibitor" },
];

const CATEGORY_LABEL: Record<Sponsor["category"], string> = {
  Gold:      "Gold Sponsor",
  Silver:    "Silver Sponsor",
  Exhibitor: "Exhibitor",
};

const CATEGORY_BADGE: Record<Sponsor["category"], string> = {
  Gold:      "bg-amber-100 text-amber-700 border-amber-200",
  Silver:    "bg-slate-100 text-slate-600 border-slate-200",
  Exhibitor: "bg-brand-light text-brand border-brand/20",
};

const DOUBLED = [...SPONSORS, ...SPONSORS];

export default function SponsorsSlider() {
  return (
    <section className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Sponsors &amp; Exhibitors</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{SPONSORS.length} partenaires officiels</p>
        </div>
        <div className="flex items-center gap-2">
          {(["Gold", "Silver", "Exhibitor"] as Sponsor["category"][]).map(cat => (
            <span key={cat} className={`hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_BADGE[cat]}`}>
              {CATEGORY_LABEL[cat]}
            </span>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden py-5 group">
        {/* left/right fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-card to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent z-10" />

        <div
          className="flex gap-4 w-max animate-marquee group-hover:[animation-play-state:paused]"
          style={{ animationTimingFunction: "linear" }}
        >
          {DOUBLED.map((sp, idx) => (
            <LogoCard key={idx} sponsor={sp} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LogoCard({ sponsor: sp }: { sponsor: Sponsor }) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0 w-[130px]">
      <div
        className="w-[130px] h-[72px] rounded-xl flex items-center justify-center shadow-sm border border-white/10 overflow-hidden relative"
        style={{ background: sp.bg }}
      >
        {sp.logo ? (
          <Image
            src={sp.logo}
            alt={sp.name}
            fill
            className="object-contain p-3"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : null}
        {/* Fallback text always rendered, hidden when image loads */}
        <span
          className="font-bold tracking-wide text-sm select-none absolute inset-0 flex items-center justify-center"
          style={{ color: sp.text }}
          aria-hidden={!!sp.logo}
        >
          {sp.abbr}
        </span>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-medium text-foreground leading-tight line-clamp-1">{sp.name}</p>
        <span className={`inline-flex text-[9px] font-semibold px-1.5 py-px rounded-full border mt-0.5 ${CATEGORY_BADGE[sp.category]}`}>
          {sp.category}
        </span>
      </div>
    </div>
  );
}
