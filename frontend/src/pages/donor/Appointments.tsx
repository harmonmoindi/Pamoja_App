
import { useState } from "react";

interface Appointment {
  id: number;
  type: string;
  date: string;
  time: string;
  status: "Pending" | "Confirmed" | "Cancelled";
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      type: "Consultation",
      date: "2026-11-25",
      time: "10:00",
      status: "Confirmed",
    },
    {
      id: 2,
      type: "Donation Assistance",
      date: "2026-11-28",
      time: "14:00",
      status: "Pending",
    },
  ]);

  const cancelAppointment = (id: number) => {
    setAppointments((previous) =>
      previous.map((appointment) =>
        appointment.id === id
          ? { ...appointment, status: "Cancelled" }
          : appointment
      )
    );
  };

  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          My Appointments
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your scheduled appointments.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-4">Appointment</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Time</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-5 py-4 font-medium">
                  {appointment.type}
                </td>
                <td className="px-5 py-4">{appointment.date}</td>
                <td className="px-5 py-4">{appointment.time}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyles[appointment.status]
                    }`}
                  >
                    {appointment.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {appointment.status !== "Cancelled" && (
                    <button
                      type="button"
                      onClick={() => cancelAppointment(appointment.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
