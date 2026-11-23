import { FormEvent, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { requestCategories, requestUrgencies } from "@/data/mock/beneficiaryRequests";

const stepLabels = ["Choose a category", "Describe your need", "Review & submit"] as const;

export default function RequestWizard() {
  const { addRequest } = useBeneficiaryRequests();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("Education");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [resource, setResource] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [urgency, setUrgency] = useState<(typeof requestUrgencies)[number]>("Medium");
  const [error, setError] = useState("");

  const continueStep = () => {
    if (step === 0 && !category) {
      setError("Select an assistance category to continue.");
      return;
    }
    if (step === 1) {
      if (!title.trim() || !location.trim() || !summary.trim() || !resource.trim()) {
        setError("Add a title, location, description, and resource required.");
        return;
      }
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty < 1) {
        setError("Quantity must be at least 1.");
        return;
      }
    }
    setError("");
    setStep((current) => Math.min(current + 1, 2));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const qty = Number(quantity);
    const created = addRequest({
      title: title.trim(),
      category,
      location: location.trim(),
      summary: summary.trim(),
      resource: resource.trim(),
      quantity: qty,
      urgency,
    });
    navigate(`/beneficiary/requests/${created.reference}`);
  };

  return (
    <BeneficiaryPage
      title="Request assistance"
      description="A guided three-step request form for fictional demonstration data."
    >
      <form className="bn-panel bn-form bn-section" onSubmit={submit}>
        <div className="bn-alert" role="note">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>Demo only: please do not submit real identities, personal stories, medical details, contact information, or sensitive documents.</p>
        </div>

        <div className="bn-progress" aria-hidden="true">
          {stepLabels.map((_, index) => (
            <span key={stepLabels[index]} className={index <= step ? "done" : ""} />
          ))}
        </div>
        <div className="bn-stepmeta">
          <strong>Step {step + 1} of 3</strong>
          <span>{stepLabels[step]}</span>
        </div>

        {step === 0 && (
          <div className="bn-stepbody">
            <label>
              Assistance category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {requestCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <p className="bn-help">Select the category that best describes the type of resources needed.</p>
          </div>
        )}

        {step === 1 && (
          <div className="bn-stepbody">
            <label>
              Request title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Learning materials for a school"
                maxLength={80}
              />
            </label>
            <label>
              General location (county)
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Turkana"
                maxLength={40}
              />
            </label>
            <label>
              Description
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Explain the fictional need"
                maxLength={280}
              />
            </label>
            <div className="bn-form-grid">
              <label>
                Resource required
                <input
                  value={resource}
                  onChange={(event) => setResource(event.target.value)}
                  placeholder="e.g. Exercise books"
                  maxLength={60}
                />
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </label>
            </div>
            <label>
              Urgency
              <select value={urgency} onChange={(event) => setUrgency(event.target.value as (typeof requestUrgencies)[number])}>
                {requestUrgencies.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="bn-stepbody">
            <dl className="bn-review">
              <div>
                <dt>Category</dt>
                <dd>{category}</dd>
              </div>
              <div>
                <dt>Title</dt>
                <dd>{title.trim()}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{location.trim()}</dd>
              </div>
              <div>
                <dt>Resource</dt>
                <dd>
                  {quantity} · {resource.trim()}
                </dd>
              </div>
              <div>
                <dt>Urgency</dt>
                <dd>{urgency}</dd>
              </div>
              <div className="full">
                <dt>Description</dt>
                <dd>{summary.trim()}</dd>
              </div>
            </dl>
            <p className="bn-help">Submitting saves this fictional request in local browser storage only.</p>
          </div>
        )}

        {error && (
          <p className="bn-error" role="alert">
            {error}
          </p>
        )}

        <div className={`bn-form-actions ${step === 0 ? "start" : ""}`}>
          {step > 0 && (
            <button className="bn-secondary" type="button" onClick={() => { setError(""); setStep((current) => current - 1); }}>
              ← Back
            </button>
          )}
          {step < 2 ? (
            <button className="bn-primary" type="button" onClick={continueStep}>
              {step === 0 ? "Continue" : "Review request"} <span aria-hidden="true">→</span>
            </button>
          ) : (
            <button className="bn-primary" type="submit">
              Submit demonstration request
            </button>
          )}
        </div>
      </form>
    </BeneficiaryPage>
  );
}
