
import { useEffect, useState } from "react";
import {
  appointmentService,
  type AppointmentRecord,
  type AppointmentStatus,
} from "../../services/appointmentService";

export default function Appointments() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await appointmentService.getMine();
        setAppointments(response.items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your appointments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const cancelAppointment = async (id: number) => {
    try {
      setCancellingId(id);
      setError("");
      setMessage("");

      await appointmentService.cancel(id);

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === id
            ? { ...appointment, status: "Cancelled" }
            : appointment
        )
      );

      setMessage("Appointment cancelled successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel the appointment."
      );
    } finally {
      setCancellingId(null);
    }
  };

  const statusStyles: Record<AppointmentStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });

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

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading your appointments...</p>
      ) : appointments.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h2 className="font-semibold text-gray-800">
            No appointments yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Your booked appointments will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4">Collection Centre</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Time</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {appointment.centreName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment.location}, {appointment.county}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    {formatDate(appointment.slotStart)}
                  </td>

                  <td className="px-5 py-4">
                    {formatTime(appointment.slotStart)}
                  </td>

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
                    {appointment.status !== "Cancelled" &&
                      appointment.status !== "Completed" && (
                        <button
                          type="button"
                          disabled={cancellingId === appointment.id}
                          onClick={() => cancelAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {cancellingId === appointment.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
