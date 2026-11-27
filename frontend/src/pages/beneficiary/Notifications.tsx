import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { Button } from "@/components/ui/Button";
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
        <Button variant="outline" onClick={() => void markAllRead()} disabled={busy || loading}>
          Mark all read
        </Button>
      }
    >
      <section className="panel">
        {error && (
          <p className="error-text" role="alert">
            {error}{" "}
            <button className="btn btn-ghost" type="button" onClick={() => void load()}>
              Try again
            </button>
          </p>
        )}

        {loading ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>Loading notifications…</p>
        ) : notes.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            No notifications yet. Submit a request to get started.
          </p>
        ) : (
          <div className="request-list">
            {notes.map((note) => (
              <Link key={note.id} to={linkFor(note)}>
                <span className={`request-icon ${note.isRead ? "" : "gold"}`}>
                  <AlertTriangle size={16} />
                </span>
                <div>
                  <b>{note.title}</b>
                  <p>{note.body}</p>
                </div>
                <span className={`status ${note.isRead ? "green" : "gold"}`}>
                  <i />
                  {note.isRead ? "Read" : "Unread"}
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </BeneficiaryPage>
  );
}
