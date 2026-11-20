
import { useState } from "react";

export default function AppointmentBooking() {
  const [appointmentType, setAppointmentType] = useState("Consultation");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Book an Appointment
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Schedule a meeting with the Pamoja support team.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-lg font-semibold text-green-800">
            Appointment Request Submitted
          </h2>
          <p className="mt-2 text-sm text-green-700">
            Your appointment request has been recorded locally.
            The team will need to confirm your booking.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-white"
          >
            Book Another Appointment
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-gray-200 bg-white p-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Appointment Type
            </label>
            <select
              value={appointmentType}
              onChange={(event) => setAppointmentType(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option>Consultation</option>
              <option>Donation Assistance</option>
              <option>Volunteer Discussion</option>
              <option>General Support</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Preferred Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Preferred Time
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Additional Information
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell us more about your appointment..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-700"
          >
            Submit Appointment Request
          </button>
        </form>
      )}
    </div>
  );
}
