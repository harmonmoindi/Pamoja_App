import { ClipboardList, Package, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { PageHead } from "@/components/ui/PageHead";

const stats = [
  { title: "Total Requests", value: "120", icon: ClipboardList },
  { title: "Available Resources", value: "85", icon: Package },
  { title: "Active Deliveries", value: "24", icon: Truck },
  { title: "Completed Requests", value: "96", icon: CheckCircle }
];

const recentRequests = [
  { id: "REQ001", category: "Food Supplies", location: "Nairobi", status: "Pending" },
  { id: "REQ002", category: "Medical Supplies", location: "Kiambu", status: "In Progress" },
  { id: "REQ003", category: "Clothing", location: "Machakos", status: "Completed" }
];

export default function AgencyDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <PageHead
        eyebrow="Agency Workspace"
        title="Agency Dashboard"
        description="Monitor assistance requests, resources, and humanitarian operations."
      />
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Agency Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to the Pamoja Humanitarian Coordination Platform.</p>
        <p className="mt-2 text-sm text-amber-700">Dashboard preview — sample data</p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ title, value, icon: Icon }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium text-gray-600">{title}</h2>
              <Icon className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <AlertCircle className="text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">Recent Assistance Requests</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                {["Request ID", "Category", "Location", "Status"].map(heading => (
                  <th key={heading} className="p-4">{heading}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {recentRequests.map(request => (
                <tr key={request.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{request.id}</td>
                  <td className="p-4">{request.category}</td>
                  <td className="p-4">{request.location}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}