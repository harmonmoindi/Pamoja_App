
import { useState, type FormEvent } from "react";

type UserPreferences = {
  emailNotifications: boolean;
  smsNotifications: boolean;
};

function PreferencesForm({
  onSave,
}: {
  onSave: (preferences: UserPreferences) => void;
}) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(preferences);
  }

  return (
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
            checked={preferences.emailNotifications}
            onChange={(event) =>
              setPreferences({
                ...preferences,
                emailNotifications: event.target.checked,
              })
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          Email notifications
        </label>
        <label className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={preferences.smsNotifications}
            onChange={(event) =>
              setPreferences({
                ...preferences,
                smsNotifications: event.target.checked,
              })
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          SMS notifications
        </label>
      </fieldset>
      <button
        type="submit"
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Save preferences
      </button>
    </form>
  );
}

export default function Preferences() {
  const handleSavePreferences = (
    preferences: UserPreferences
  ) => {
    console.log("Updated donor preferences:", preferences);
  };

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
        <PreferencesForm onSave={handleSavePreferences} />
      </div>
    </div>
  );
}
