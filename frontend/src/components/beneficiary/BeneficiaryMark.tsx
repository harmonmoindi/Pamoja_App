import { Link } from "react-router";

export function BeneficiaryMark({ to, tone = "brand" }: { to: string; tone?: "brand" | "light" }) {
  return (
    <Link to={to} className={`bn-mark ${tone}`} aria-label="Pamoja home">
      <span className="bn-mark-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="15" height="15">
          <path
            fill="currentColor"
            d="M11 1.5h2V7l3.8-3.8 1.4 1.4L14.4 8.4H20v2h-5.6l3.8 3.8-1.4 1.4L13 12.2V18h-2v-5.8l-3.8 3.8-1.4-1.4 3.8-3.8H4v-2h5.6L5.8 4.6l1.4-1.4L11 7V1.5z"
          />
        </svg>
      </span>
      <b>PAMOJA</b>
    </Link>
  );
}
