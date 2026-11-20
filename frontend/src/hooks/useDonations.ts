import { useState } from "react";
import { donations as mockDonations } from "../data/mock/donations";
import type {
  Donation,
  DonationStatus,
} from "../types/donation";

export function useDonations(donorId: number = 1) {
  const [donations, setDonations] = useState<Donation[]>(
    mockDonations
  );

  const donorDonations = donations.filter(
    (donation) => donation.donorId === donorId
  );

  const totalDonated = donorDonations
    .filter((donation) => donation.status === "Successful")
    .reduce((total, donation) => total + donation.amount, 0);

  const successfulDonations = donorDonations.filter(
    (donation) => donation.status === "Successful"
  );

  const pendingDonations = donorDonations.filter(
    (donation) => donation.status === "Pending"
  );

  const addDonation = (newDonation: Donation) => {
    setDonations((currentDonations) => [
      newDonation,
      ...currentDonations,
    ]);
  };

  const updateDonationStatus = (
    id: number,
    status: DonationStatus
  ) => {
    setDonations((currentDonations) =>
      currentDonations.map((donation) =>
        donation.id === id
          ? { ...donation, status }
          : donation
      )
    );
  };

  const getDonationById = (id: number) => {
    return donorDonations.find(
      (donation) => donation.id === id
    );
  };

  return {
    donations: donorDonations,
    totalDonated,
    successfulDonations,
    pendingDonations,
    addDonation,
    updateDonationStatus,
    getDonationById,
  };
}
