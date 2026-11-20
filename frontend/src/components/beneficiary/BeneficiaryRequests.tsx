import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import {
  BeneficiaryRequest,
  BeneficiaryStatus,
  nextReference,
  seedBeneficiaryRequests,
} from "@/data/mock/beneficiaryRequests";

const STORAGE_KEY = "pamoja.beneficiary.requests.v1";

type NewRequestInput = {
  title: string;
  category: string;
  location: string;
  summary: string;
};

type BeneficiaryRequestsValue = {
  requests: BeneficiaryRequest[];
  addRequest: (input: NewRequestInput) => void;
  confirmReceipt: (reference: string) => void;
};

const BeneficiaryRequestsContext = createContext<BeneficiaryRequestsValue | null>(null);

function isStatus(value: unknown): value is BeneficiaryStatus {
  return value === "under review" || value === "approved" || value === "fulfilled";
}

function isRequest(value: unknown): value is BeneficiaryRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as BeneficiaryRequest;
  return (
    typeof request.reference === "string" &&
    typeof request.title === "string" &&
    typeof request.category === "string" &&
    typeof request.location === "string" &&
    typeof request.summary === "string" &&
    typeof request.submittedOn === "string" &&
    isStatus(request.status)
  );
}

function readRequests(): BeneficiaryRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedBeneficiaryRequests;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isRequest)) {
      return seedBeneficiaryRequests;
    }
    return parsed;
  } catch {
    return seedBeneficiaryRequests;
  }
}

function saveRequests(requests: BeneficiaryRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch {
    // The prototype still works for this visit if the browser blocks storage.
  }
}

function formatToday() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function BeneficiaryRequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<BeneficiaryRequest[]>(readRequests);

  const addRequest = useCallback((input: NewRequestInput) => {
    setRequests((current) => {
      const next = [
        {
          reference: nextReference(current),
          title: input.title,
          category: input.category,
          location: input.location,
          summary: input.summary,
          status: "under review" as const,
          submittedOn: formatToday(),
        },
        ...current,
      ];
      saveRequests(next);
      return next;
    });
  }, []);

  const confirmReceipt = useCallback((reference: string) => {
    setRequests((current) => {
      const next = current.map((request) =>
        request.reference === reference && request.status === "approved"
          ? { ...request, status: "fulfilled" as const }
          : request,
      );
      saveRequests(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ requests, addRequest, confirmReceipt }),
    [requests, addRequest, confirmReceipt],
  );

  return <BeneficiaryRequestsContext.Provider value={value}>{children}</BeneficiaryRequestsContext.Provider>;
}

export function useBeneficiaryRequests() {
  const value = useContext(BeneficiaryRequestsContext);
  if (!value) throw new Error("useBeneficiaryRequests must be used inside BeneficiaryRequestsProvider");
  return value;
}
