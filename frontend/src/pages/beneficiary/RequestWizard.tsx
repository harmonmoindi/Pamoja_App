import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { requestCategories, requestLocations } from "@/data/mock/beneficiaryRequests";

export default function RequestWizard() {
  const { addRequest } = useBeneficiaryRequests();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = {
      title: title.trim(),
      category,
      location,
      summary: summary.trim(),
    };
    if (!next.title || !next.category || !next.location || !next.summary) {
      setError("Add a title, category, location, and short description.");
      return;
    }
    addRequest(next);
    navigate("/beneficiary/dashboard");
  };

  return (
    <BeneficiaryPage
      title="New assistance request"
      description="Describe a fictional need. It is saved only in this browser and is not sent to an agency."
    >
      <form className="bn-panel bn-form bn-section" onSubmit={submit}>
        <p className="bn-note">Demonstration only. Submitting this form does not request real assistance.</p>
        <label>
          Request title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} />
        </label>
        <div className="bn-form-grid">
          <label>
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">Select a category</option>
              {requestCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Location
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option value="">Select a location</option>
              {requestLocations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          What support is needed
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={280} />
        </label>
        {error && (
          <p className="bn-error" role="alert">
            {error}
          </p>
        )}
        <div className="bn-form-actions">
          <Link className="bn-secondary" to="/beneficiary/dashboard">
            Cancel
          </Link>
          <button className="bn-primary" type="submit">
            Submit request
          </button>
        </div>
      </form>
    </BeneficiaryPage>
  );
}
