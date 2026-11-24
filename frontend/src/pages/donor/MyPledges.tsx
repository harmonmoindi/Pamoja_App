import PledgeTable from "../../components/portal/PledgeTable";

type Pledge = React.ComponentProps<typeof PledgeTable>["pledges"][number];

const mockPledges: Pledge[] = [
	{
		id: 1,
		reference: "PLEDGE-001",
		opportunityId: 1,
		opportunityTitle: "Emergency Food Relief",
		donorId: 1,
		amount: 15000,
		status: "Fulfilled",
		paymentMethod: "mpesa",
		date: "2026-10-12",
		createdAt: "2026-10-12",
		dueDate: "2026-11-12",
	},
	{
		id: 2,
		reference: "PLEDGE-002",
		opportunityId: 2,
		opportunityTitle: "Clean Water Initiative",
		donorId: 1,
		amount: 8500,
		status: "Pending",
		paymentMethod: "mpesa",
		date: "2026-11-05",
		createdAt: "2026-11-05",
		dueDate: "2026-12-05",
	},
	{
		id: 3,
		reference: "PLEDGE-003",
		opportunityId: 3,
		opportunityTitle: "Medical Supplies",
		donorId: 1,
		amount: 12000,
		status: "Fulfilled",
		paymentMethod: "mpesa",
		date: "2026-09-28",
		createdAt: "2026-09-28",
		dueDate: "2026-10-28",
	},
];

export default function MyPledges() {
	const totalPledged = mockPledges.reduce(
		(total, pledge) => total + pledge.amount,
		0
	);

	const pendingPledges = mockPledges.filter(
		(pledge) => pledge.status === "Pending"
	);

	const fulfilledPledges = mockPledges.filter(
		(pledge) => pledge.status === "Fulfilled"
	);

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat("en-KE", {
			style: "currency",
			currency: "KES",
			maximumFractionDigits: 0,
		}).format(amount);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">My Pledges</h1>
				<p className="mt-1 text-sm text-gray-500">
					View and track your humanitarian contribution pledges.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div className="rounded-xl border border-gray-200 bg-white p-5">
					<p className="text-sm text-gray-500">Total Pledged</p>
					<h2 className="mt-2 text-2xl font-bold text-gray-900">
						{formatCurrency(totalPledged)}
					</h2>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-5">
					<p className="text-sm text-gray-500">Pending Pledges</p>
					<h2 className="mt-2 text-2xl font-bold text-yellow-600">
						{pendingPledges.length}
					</h2>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-5">
					<p className="text-sm text-gray-500">Fulfilled Pledges</p>
					<h2 className="mt-2 text-2xl font-bold text-green-600">
						{fulfilledPledges.length}
					</h2>
				</div>
			</div>

			<section className="space-y-4">
				<h2 className="text-lg font-semibold text-gray-900">Pledge History</h2>

				<PledgeTable pledges={mockPledges} />
			</section>
		</div>
	);
}
