import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";

type Note = {
  id: string;
  title: string;
  body: string;
  to: string;
  unread: boolean;
};

export default function Notifications() {
  const { requests } = useBeneficiaryRequests();
  const seed = useMemo<Note[]>(
    () => [
      {
        id: "welcome",
        title: "Welcome to your Pamoja demonstration workspace",
        body: "Fictional notification",
        to: "/beneficiary/dashboard",
        unread: true,
      },
      {
        id: "privacy",
        title: "Demo reminder: do not enter real personal data",
        body: "Fictional notification",
        to: "/beneficiary/request",
        unread: true,
      },
      {
        id: "tracking",
        title: requests[0]
          ? `${requests[0].reference} is recorded as ${requests[0].status}`
          : "Request tracking is ready in this workspace",
        body: requests[0]
          ? `${requests[0].title} · Fictional notification`
          : "Fictional notification",
        to: requests[0] ? `/beneficiary/requests/${requests[0].reference}` : "/beneficiary/tracking",
        unread: false,
      },
    ],
    [requests],
  );
  const [notes, setNotes] = useState<Note[] | null>(null);
  const visible = notes ?? seed;

  const markAllRead = () => {
    setNotes(visible.map((note) => ({ ...note, unread: false })));
  };

  return (
    <BeneficiaryPage
      title="Notifications"
      description="Demonstration activity and updates from across the platform."
      action={
        <button className="bn-secondary" type="button" onClick={markAllRead}>
          Mark all read
        </button>
      }
    >
      <ul className="bn-notes bn-section">
        {visible.map((note) => (
          <li key={note.id} className={note.unread ? "unread" : ""}>
            <span className="bn-note-icon" aria-hidden="true">
              <AlertTriangle size={16} />
            </span>
            <div>
              <Link to={note.to}>{note.title}</Link>
              <p>{note.body}</p>
            </div>
            {note.unread ? <i className="bn-unread" aria-label="Unread" /> : <span className="bn-read">Read</span>}
          </li>
        ))}
      </ul>
    </BeneficiaryPage>
  );
}
