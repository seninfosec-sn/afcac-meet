import { cn } from "@/lib/utils";
import { ReservationStatus, STATUS_CONFIG } from "@/lib/data";

export default function StatusBadge({ status }: { status: ReservationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cfg.className)}>
      {cfg.label}
    </span>
  );
}
