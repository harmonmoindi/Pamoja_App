import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BeneficiaryRequest,
  mapAssistanceRequest,
} from "@/data/mock/beneficiaryRequests";
import { createRequest, myRequests } from "@/services/requestService";
import type { RequestUrgency } from "@/types/request";

type NewRequestInput = {
  title: string;
  category: string;
  location: string;
  summary: string;
  resource: string;
  quantity: number;
  urgency: RequestUrgency;
  organizationId: number;
};

type BeneficiaryRequestsValue = {
  requests: BeneficiaryRequest[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addRequest: (input: NewRequestInput) => Promise<BeneficiaryRequest>;
  confirmReceipt: (reference: string) => void;
};

const BeneficiaryRequestsContext = createContext<BeneficiaryRequestsValue | null>(null);

export function BeneficiaryRequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<BeneficiaryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await myRequests();
      setRequests(page.items.map(mapAssistanceRequest));
    } catch (err) {
      setRequests([]);
      setError(err instanceof Error ? err.message : "Unable to load your requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addRequest = useCallback(async (input: NewRequestInput) => {
    const { request } = await createRequest({
      title: input.title,
      category: input.category,
      county: input.location,
      summary: input.summary,
      resource: input.resource,
      quantity: input.quantity,
      urgency: input.urgency,
      organizationId: input.organizationId,
    });
    const mapped = mapAssistanceRequest(request);
    setRequests((current) => [mapped, ...current.filter((item) => item.id !== mapped.id)]);
    return mapped;
  }, []);

  const confirmReceipt = useCallback((reference: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.reference === reference && request.status === "approved"
          ? { ...request, status: "fulfilled" as const, stage: "Confirmed" }
          : request,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ requests, loading, error, refresh, addRequest, confirmReceipt }),
    [requests, loading, error, refresh, addRequest, confirmReceipt],
  );

  return (
    <BeneficiaryRequestsContext.Provider value={value}>
      {children}
    </BeneficiaryRequestsContext.Provider>
  );
}

export function useBeneficiaryRequests() {
  const value = useContext(BeneficiaryRequestsContext);
  if (!value) throw new Error("useBeneficiaryRequests must be used inside BeneficiaryRequestsProvider");
  return value;
}
