
import type {
  OpportunityCategory,
  OpportunityStatus,
} from "../../types/opportunity";

interface OpportunityFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: OpportunityCategory | "all";
  setSelectedCategory: (
    value: OpportunityCategory | "all"
  ) => void;
  selectedStatus: OpportunityStatus | "all";
  setSelectedStatus: (
    value: OpportunityStatus | "all"
  ) => void;
  resetFilters: () => void;
}

export default function OpportunityFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  resetFilters,
}: OpportunityFiltersProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="opportunity-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search opportunities
          </label>

          <input
            id="opportunity-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by title or location..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label
            htmlFor="opportunity-category"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Category
          </label>

          <select
            id="opportunity-category"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(
                event.target.value as OpportunityCategory | "all"
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          >
            <option value="all">All categories</option>
            <option value="Food">Food</option>
            <option value="Water">Water</option>
            <option value="Shelter">Shelter</option>
            <option value="Medical">Medical</option>
            <option value="Education">Education</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="opportunity-status"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Status
          </label>

          <select
            id="opportunity-status"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(
                event.target.value as OpportunityStatus | "all"
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-500"
          >
            <option value="all">All statuses</option>
            <option value="Need identified">Need identified</option>
            <option value="Assessed">Assessed</option>
            <option value="Published">Published</option>
            <option value="Pledged">Pledged</option>
            <option value="Allocated">Allocated</option>
            <option value="Delivered">Delivered</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={resetFilters}
          className="text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
