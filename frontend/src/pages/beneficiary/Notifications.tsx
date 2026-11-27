import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import {
  notificationService,
  type ApiNotification,
} from "@/services/notificationService";

function linkFor(note: ApiNotification) {
  if (note.kind === "delivery") return "/beneficiary/receipt";
  if (note.kind === "request") return "/beneficiary/requests";
  return "/beneficiary/dashboard";
}

export default function Notifications() {
  const [notes, setNotes] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const page = await notificationService.getAll();
      setNotes(page.items);
    } catch (err) {
      setNotes([]);
      setError(err instanceof Error ? err.message : "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const markAllRead = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await notificationService.markAllAsRead();
      setNotes((current) => current.map((note) => ({ ...note, isRead: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to mark notifications as read.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <BeneficiaryPage
      title="Notifications"
      description="Updates from request review, delivery, and platform activity."
      action={
        <button className="bn-secondary" type="button" onClick={() => void markAllRead()} disabled={busy || loading}>
          Mark all read
        </button>
      }
    >
      {error && (
        <p className="bn-error bn-section" role="alert">
          {error}{" "}
          <button className="bn-link" type="button" onClick={() => void load()}>
            Try again
          </button>
        </p>
      )}

      {loading ? (
        <p className="bn-empty bn-section">Loading notifications...</p>
      ) : notes.length === 0 ? (
        <p className="bn-empty bn-section">No notifications yet. Submit a request to get started.</p>
      ) : (
        <ul className="bn-notes bn-section">
          {notes.map((note) => (
            <li key={note.id} className={note.isRead ? "" : "unread"}>
              <span className="bn-note-icon" aria-hidden="true">
                <AlertTriangle size={16} />
              </span>
              <div>
                <Link to={linkFor(note)}>{note.title}</Link>
                <p>{note.body}</p>
              </div>
              {note.isRead ? <span className="bn-read">Read</span> : <i className="bn-unread" aria-label="Unread" />}
            </li>
          ))}
        </ul>
      )}
    </BeneficiaryPage>
  );
}
