import { ReactNode } from "react";
import { PageHead } from "@/components/ui/PageHead";

type BeneficiaryPageProps = {
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
};

export function BeneficiaryPage({ title, description, action, children }: BeneficiaryPageProps) {
  return (
    <>
      <PageHead
        eyebrow="Beneficiary workspace"
        title={title}
        description={description}
        action={action}
      />
      {children}
    </>
  );
}
