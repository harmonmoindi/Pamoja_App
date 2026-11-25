
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { api } from "../../lib/apiClient";
import { appointmentService } from "../../services/appointmentService";

interface CentreOption {
  id: number;
  name: string;
  county: string;
  generalArea: string;
  openingHours?: string;
}

export default function AppointmentBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [centres, setCentres] = useState<CentreOption[]>([]);
  const [centreId, setCentreId] = useState(id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loadingCentres, setLoadingCentres] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        setLoadingCentres(true);
        setError("");

        const response = await api<{ items: CentreOption[] }>("/centres");
        setCentres(response.items);

        if (id && response.items.some((centre) => centre.id === Number(id))) {
          setCentreId(id);
        } else if (!id && response.items.length > 0) {
          setCentreId(String(response.items[0].id));
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load collection centres."
        );
      } finally {
        setLoadingCentres(false);
      }
    };

    fetchCentres();
  }, [id]);

  const getToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!centreId || !date || !time) {
      setError("Please select a collection centre, date and time.");
      return;
    }

    const selectedDateTime = new Date(`${date}T${time}:00`);

    if (selectedDateTime <= new Date()) {
      setError("Please choose a date and time in the future.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await appointmentService.create({
        centreId: Number(centreId),
        slotStart: `${date}T${time}:00`,
      });

      setSuccessMessage(
        `Your appointment request was submitted. Status: ${response.appointment.status}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your appointment request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Book an Appointment
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose a collection centre and a preferred date and time.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-800">
            Appointment Request Submitted
          </h2>

          <p className="mt-2 text-sm text-green-700">
            {successMessage}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/donor/appointments")}
              className="rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800"
            >
              View My Appointments
            </button>

            <button
              type="button"
              onClick={() => {
                setDate("");
                setTime("");
                setSuccessMessage("");
              }}
              className="rounded-lg border border-green-700 px-4 py-2 text-green-800"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div>
            <label
              htmlFor="centre"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Collection Centre
            </label>

            {loadingCentres ? (
              <p className="text-sm text-gray-500">
                Loading collection centres...
              </p>
            ) : centres.length === 0 ? (
              <p className="text-sm text-gray-500">
                No collection centres are currently available.
              </p>
            ) : (
              <select
                id="centre"
                required
                value={centreId}
                onChange={(event) => setCentreId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                {centres.map((centre) => (
                  <option key={centre.id} value={centre.id}>
                    {centre.name} - {centre.generalArea}, {centre.county}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Preferred Date
            </label>

            <input
              id="date"
              type="date"
              required
              min={getToday()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="time"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Preferred Time
            </label>

            <input
              id="time"
              type="time"
              required
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <p className="text-sm text-gray-500">
            Your request will be submitted for confirmation by the team.
          </p>

          <button
            type="submit"
            disabled={
              submitting ||
              loadingCentres ||
              centres.length === 0
            }
            className="w-full rounded-lg bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Appointment Request"}
          </button>
        </form>
      )}
    </div>
  );
}
