import { Link } from "react-router";
import { HeartHandshake } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="logo" aria-label="Pamoja home">
      <span className="logo-mark">
        <HeartHandshake size={23} strokeWidth={2.2} />
      </span>
      <span className={light ? "text-white" : ""}>
        <b>PAMOJA</b>
        <small>From needs to impact</small>
      </span>
    </Link>
  );
}
