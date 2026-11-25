import { useState, type FormEvent } from "react";
import { Building2, MapPin, Plus, Search, Pencil, Package, RefreshCw } from "lucide-react";
import useApiCentres from "../../hooks/useApiCentres";
import type { ApiCollectionCentre, CentrePayload } from "../../types/centre";

type CentreForm = Omit<CentrePayload, "categories"> & { categories: string };

const emptyForm: CentreForm = {
  name: "",
  county: "",
  generalArea: "",
  openingHours: "",
  categories: ""
};

const inputClass = "w-full rounded-lg border border-gray-300 p-3 focus:border-green-600 focus:outline-none";

const fields = [
  { key: "name", label: "Centre Name", placeholder: "Kasarani Collection Centre" },
  { key: "county", label: "County", placeholder: "Nairobi" },
  { key: "generalArea", label: "General Area", placeholder: "Kasarani" },
  { key: "openingHours", label: "Opening Hours", placeholder: "Monday-Friday, 8 AM-5 PM" },
  { key: "categories", label: "Accepted Categories", placeholder: "Food, Clothing, Medical Supplies" }
] as const;

export default function CollectionCentresManage() {
  const {
    centres, loading, error: loadError, reload,
    addCentre, editCentre, page, setPage, total, perPage
  } = useApiCentres();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CentreForm>({ ...emptyForm });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(perPage, 1)));

  const filteredCentres = centres.filter(centre =>
    [centre.name, centre.county, centre.generalArea, centre.openingHours, ...centre.categories]
      .some(value => value.toLowerCase().includes(search.trim().toLowerCase()))
  );

  const stats = [
    {
      title: "Total Collection Centres",
      value: total,
      icon: Building2,
      color: "text-green-600"
    },
    {
      title: "Counties on This Page",
      value: new Set(centres.map(c => c.county)).size,
      icon: MapPin,
      color: "text-blue-600"
    },
    {
      title: "Categories on This Page",
      value: new Set(centres.flatMap(c => c.categories)).size,
      icon: Package,
      color: "text-orange-600"
    }
  ];

  function openForm(centre?: ApiCollectionCentre) {
    setEditingId(centre?.id ?? null);

    setForm(centre ? {
      name: centre.name,
      county: centre.county,
      generalArea: centre.generalArea,
      openingHours: centre.openingHours,
      categories: centre.categories.join(", ")
    } : { ...emptyForm });

    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFormError("");
  }

  async function saveCentre(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const data: CentrePayload = {
      name: form.name.trim(),
      county: form.county.trim(),
      generalArea: form.generalArea.trim(),
      openingHours: form.openingHours.trim(),
      categories: form.categories.split(",").map(c => c.trim()).filter(Boolean)
    };

    if (
      !data.name ||
      !data.county ||
      !data.generalArea ||
      !data.openingHours ||
      !data.categories.length
    ) {
      setFormError("Please complete all required fields and provide at least one category.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingId !== null) {
        await editCentre(editingId, data);
      } else {
        await addCentre(data);
      }

      closeForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unable to save collection centre.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* PAGE HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Collection Centres</h1>
          <p className="mt-2 text-gray-600">
            Manage your agency's collection and distribution centres.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => void reload()}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => openForm()}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
          >
            <Plus size={20} />
            Add Collection Centre
          </button>
        </div>
      </div>

      {/* DASHBOARD STATISTICS */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="rounded-xl bg-white p-6 shadow-sm">
            <Icon className={`mb-3 ${color}`} />
            <p className="text-gray-600">{title}</p>
            <h2 className="mt-2 text-3xl font-bold">{value}</h2>
          </div>
        ))}
      </div>

      {/* API ERROR */}
      {loadError && (
        <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {loadError}
        </p>
      )}

      {/* COLLECTION CENTRES TABLE */}
      <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-xl font-semibold">
            Registered Collection Centres
          </h2>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search this page..."
              aria-label="Search collection centres on this page"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-green-600 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-10 text-gray-500">
            <RefreshCw size={20} className="animate-spin" />
            <p>Loading collection centres...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Centre",
                    "County",
                    "General Area",
                    "Opening Hours",
                    "Categories",
                    "Actions"
                  ].map(heading => (
                    <th key={heading} className="p-4">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredCentres.map(centre => (
                  <tr key={centre.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">
                      {centre.name}
                    </td>

                    <td className="p-4">
                      {centre.county}
                    </td>

                    <td className="p-4">
                      {centre.generalArea}
                    </td>

                    <td className="p-4">
                      {centre.openingHours}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {centre.categories.map(category => (
                          <span
                            key={category}
                            className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => openForm(centre)}
                        aria-label={`Edit ${centre.name}`}
                        className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
                      >
                        <Pencil size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCentres.length === 0 && (
              <p className="py-8 text-center text-gray-500">
                {loadError
                  ? "Unable to display collection centres."
                  : "No collection centres found on this page."}
              </p>
            )}

            {/* PAGINATION */}
            <div className="mt-6 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages} | {total} collection centres
                </p>

                {total > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Showing {Math.min((page - 1) * perPage + 1, total)}–
                    {Math.min(page * perPage, total)} of {total} centres
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading || page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={loading || page >= totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ADD / EDIT COLLECTION CENTRE FORM */}
      {showForm && (
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold">
            {editingId !== null
              ? "Edit Collection Centre"
              : "Register Collection Centre"}
          </h2>

          <form
            onSubmit={saveCentre}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {fields.map(field => (
              <div key={field.key}>
                <label
                  htmlFor={`centre-${field.key}`}
                  className="mb-2 block font-medium"
                >
                  {field.label} *
                </label>

                <input
                  id={`centre-${field.key}`}
                  type="text"
                  required
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))
                  }
                  className={inputClass}
                />
              </div>
            ))}

            {formError && (
              <p
                role="alert"
                className="text-sm text-red-600 md:col-span-2"
              >
                {formError}
              </p>
            )}

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Register Centre"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}