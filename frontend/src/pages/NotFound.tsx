import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="container" style={{ padding: "90px 0", textAlign: "center" }}>
      <span className="eyebrow">Error 404</span>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        <Button to="/">Back to home</Button>
        <Button to="/explore" variant="outline">
          Explore needs
        </Button>
      </div>
    </main>
  );
}
