import { cn } from "@/lib/utils";
import { ReservationStatus, STATUS_CONFIG } from "@/lib/data";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  const { t } = useLanguage();
  const cfg = STATUS_CONFIG[status];
  const label = t.status[status as keyof typeof t.status] ?? cfg.label;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cfg.className)}>
      {label}
    </span>
  );
}
