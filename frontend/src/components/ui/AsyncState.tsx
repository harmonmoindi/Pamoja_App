import { CircleAlert } from "lucide-react";
import { Button } from "./Button";

export function Loading({ label = "Loading…" }: { label?: string }) {
  return <p style={{ padding: "18px 4px", color: "var(--muted)" }}>{label}</p>;
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="auth-error" role="alert" style={{ margin: "12px 0" }}>
      <CircleAlert />
      <span>{message}</span>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
