import type { Pledge } from "../../types/pledge";

export const mockPledges: Pledge[] = [
  {
      id: 1,
      donorId: 1,
      opportunityId: 1,
      opportunityTitle: "Food Support for Vulnerable Families",
      amount: 20000,
      status: "Pending",
      paymentMethod: "M-Pesa",
      reference: "",
      date: "2026-11-01",
      createdAt: "2026-11-01",
      dueDate: "2026-12-01"
  },
  {
      id: 2,
      donorId: 2,
      opportunityId: 2,
      opportunityTitle: "Medical Supplies for Community Clinics",
      amount: 15000,
      status: "Fulfilled",
      paymentMethod: "Card",
      reference: "",
      date: "2026-11-03",
      createdAt: "2026-11-03",
      dueDate: "2026-12-03"
  },
  {
      id: 3,
      donorId: 3,
      opportunityId: 4,
      opportunityTitle: "Emergency Shelter Assistance",
      amount: 10000,
      status: "Pending",
      paymentMethod: "Bank Transfer",
      reference: "",
      date: "2026-11-05",
      createdAt: "2026-11-05",
      dueDate: "2026-12-05"
  },
  {
      id: 4,
      donorId: 4,
      opportunityId: 5,
      opportunityTitle: "Emergency Relief Fund",
      amount: 5000,
      status: "Cancelled",
      paymentMethod: "M-Pesa",
      reference: "",
      date: "2026-11-08",
      createdAt: "2026-11-08",
      dueDate: "2026-12-08"
  },
];
