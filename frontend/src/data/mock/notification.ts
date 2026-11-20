import type { Notification } from "../../types/notification";

export const mockNotifications: Notification[] = [
	{
		id: 1,
		title: "Donation Successful",
		message:
			"Your donation to Food Support for Vulnerable Families was successful.",
		type: "Donation",
		read: false,
		date: "2026-11-20",
	},
	{
		id: 2,
		title: "Pledge Reminder",
		message:
			"You have a pending pledge that is approaching its due date.",
		type: "Pledge",
		read: false,
		date: "2026-11-19",
	},
	{
		id: 3,
		title: "New Opportunity",
		message:
			"A new humanitarian opportunity is now available.",
		type: "Opportunity",
		read: true,
		date: "2026-11-18",
	},
	{
		id: 4,
		title: "Appointment Confirmed",
		message:
			"Your appointment has been successfully confirmed.",
		type: "System",
		read: true,
		date: "2026-11-17",
	},
	{
		id: 5,
		title: "Account Update",
		message:
			"Your donor account information has been updated.",
		type: "System",
		read: false,
		date: "2026-11-16",
	},
];
