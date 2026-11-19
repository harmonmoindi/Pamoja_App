import {
  Check,
  CircleAlert,
  CircleUserRound,
  HandHeart,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { AuditEvent, AuditKind } from "@/types/admin";
import { formatDateTime } from "@/utils/format";

const icons: Record<AuditKind, typeof Check> = {
  request: PackageCheck,
  delivery: Check,
  pledge: HandHeart,
  agency: ShieldCheck,
  user: CircleUserRound,
  safety: CircleAlert,
};

export function AuditList({ events }: { events: AuditEvent[] }) {
  return (
    <div className="activity">
      {events.map((event) => {
        const Icon = icons[event.kind];
        return (
          <div key={event.id}>
            <span className={event.kind === "delivery" ? "complete" : ""}>
              <Icon />
            </span>
            <div>
              <b>{event.title}</b>
              <p>{event.description}</p>
            </div>
            <small>{formatDateTime(event.timestamp)}</small>
          </div>
        );
      })}
    </div>
  );
}
