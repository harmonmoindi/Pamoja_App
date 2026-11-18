import { HandHeart } from "lucide-react";

type MetricProps = {
  label: string;
  value: string;
  note: string;
  tone?: string;
};

export function Metric({ label, value, note, tone = "green" }: MetricProps) {
  return (
    <div className="metric">
      <span className={`metric-icon ${tone}`}>
        <HandHeart size={20} />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
      <p>{note}</p>
    </div>
  );
}
