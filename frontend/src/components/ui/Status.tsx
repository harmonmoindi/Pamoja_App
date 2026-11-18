import { ReactNode } from "react";

export function Status({ children, tone = "green" }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`status ${tone}`}>
      <i />
      {children}
    </span>
  );
}
