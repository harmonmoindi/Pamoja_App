
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/apiClient";

interface DonorPreferences {
  preferences: Record<string, unknown>;
  notificationSettings: {
    email?: boolean;
    inApp?: boolean;
  };
}

export default function Preferences() {
  const [preferences, setPreferences] = useState<Record<string, unknown>>({});
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api<DonorPreferences>("/donor/preferences");

        setPreferences(response.preferences ?? {});
        setEmailNotifications(
          response.notificationSettings?.email ?? true
        );
        setInAppNotifications(
          response.notificationSettings?.inApp ?? true
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your preferences."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api<DonorPreferences>("/donor/preferences", {
        method: "PATCH",
        body: {
          preferences,
          notificationSettings: {
            email: emailNotifications,
            inApp: inAppNotifications,
          },
        },
      });

      setMessage("Your preferences have been saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save your preferences."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">
        Loading your preferences...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Donor Preferences
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your notification settings and communication preferences.
        </p>
      </div>

      <div className="max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-lg border border-gray-200 bg-white p-6"
        >
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-gray-900">
              Notification settings
            </legend>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(event) =>
                  setEmailNotifications(event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              Email notifications
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={inAppNotifications}
                onChange={(event) =>
                  setInAppNotifications(event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              In-app notifications
            </label>
          </fieldset>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save preferences"}
          </button>
        </form>
      </div>
    </div>
  );
}
