import { DoorOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation } from "@/lib/data";
import StatusBadge from "./StatusBadge";

interface Props {
  reservation: Reservation;
  className?: string;
  onClick?: () => void;
}

export default function ReservationCard({ reservation, className, onClick }: Props) {
  const isBilateral = reservation.type === "bilateral";
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-brand/30 transition-colors",
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        isBilateral ? "bg-brand-light" : "bg-olive-light"
      )}>
        {isBilateral
          ? <Users className="w-5 h-5 text-brand" />
          : <DoorOpen className="w-5 h-5 text-olive-dark" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{reservation.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {reservation.startTime} – {reservation.endTime} · {reservation.location}
        </p>
      </div>
      <StatusBadge status={reservation.status} />
    </div>
  );
}
