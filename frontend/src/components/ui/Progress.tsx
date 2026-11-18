export function Progress({ value, tone = "green" }: { value: number; tone?: string }) {
  return (
    <div className="progress" aria-label={`${value}% complete`}>
      <span className={tone} style={{ width: `${value}%` }} />
    </div>
  );
}
