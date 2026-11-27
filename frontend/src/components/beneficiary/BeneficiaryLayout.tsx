import { PortalLayout } from "@/components/layout/PortalLayout";
import { BeneficiaryRequestsProvider } from "./BeneficiaryRequests";

export function BeneficiaryLayout() {
  return (
    <BeneficiaryRequestsProvider>
      <PortalLayout role="beneficiary" />
    </BeneficiaryRequestsProvider>
  );
}
