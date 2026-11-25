
export default function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Stay updated on your donations, pledges, and opportunities.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Notifications are coming soon
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Your notification centre is not available yet. Once notification
          services are connected, updates about donations, pledges, payments,
          and opportunities will appear here.
        </p>
      </div>
    </div>
  );
}
