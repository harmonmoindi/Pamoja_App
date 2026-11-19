import { ReactNode } from "react";
import { Link } from "react-router";

type ButtonProps = {
  children: ReactNode;
  to?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

export function Button({
  children,
  to,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const cls = `btn btn-${variant}`;
  return to ? (
    <Link className={cls} to={to}>
      {children}
    </Link>
  ) : (
    <button className={cls} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
}
