import { ReactNode } from "react";

type BeneficiaryPageProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function BeneficiaryPage({ title, description, action, children }: BeneficiaryPageProps) {
  return (
    <>
      <header className="bn-pagehead">
        <div>
          <p className="bn-kicker">Pamoja / Demonstration workspace</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {action}
      </header>
      {children}
    </>
  );
}
