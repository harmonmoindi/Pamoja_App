import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";
import { BeneficiaryPage } from "@/components/beneficiary/BeneficiaryPage";
import { useBeneficiaryRequests } from "@/components/beneficiary/BeneficiaryRequests";
import { Button } from "@/components/ui/Button";
import { requestCategories, requestUrgencies } from "@/data/mock/beneficiaryRequests";
import { listVerifiedOrganizations } from "@/services/requestService";
import type { VerifiedOrganization } from "@/types/request";

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
  const [organizationId, setOrganizationId] = useState<number | "">("");
  const [organizations, setOrganizations] = useState<VerifiedOrganization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadOrganizations() {
      setLoadingOrgs(true);
      try {
        const page = await listVerifiedOrganizations();
        if (!active) return;
        setOrganizations(page.items);
        if (page.items.length === 1) {
          setOrganizationId(page.items[0].id);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load verified agencies.");
      } finally {
        if (active) setLoadingOrgs(false);
      }
    }
    void loadOrganizations();
    return () => {
      active = false;
    };
  }, []);

  const selectedOrganization = organizations.find((org) => org.id === organizationId);

  const continueStep = () => {
    if (step === 0) {
      if (!category) {
        setError("Select an assistance category to continue.");
        return;
      }
      if (!organizationId) {
        setError("Select a verified agency to review your request.");
        return;
      }
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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!organizationId) {
      setError("Select a verified agency to review your request.");
      return;
    }

    const qty = Number(quantity);
    setSubmitting(true);
    setError("");
    try {
      const created = await addRequest({
        title: title.trim(),
        category,
        location: location.trim(),
        summary: summary.trim(),
        resource: resource.trim(),
        quantity: qty,
        urgency,
        organizationId,
      });
      navigate(`/beneficiary/requests/${encodeURIComponent(created.reference)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BeneficiaryPage
      title="Request assistance"
      description="Submit a need for agency review. Approved requests are published for donors."
    >
      <form className="form-card" onSubmit={(event) => void submit(event)} style={{ maxWidth: 760 }}>
        <div className="demo-warning" role="note">
          <AlertTriangle size={18} aria-hidden="true" />
          <p>Demo only: please do not submit real identities, personal stories, medical details, contact information, or sensitive documents.</p>
        </div>

        <div className="wizard-progress" aria-hidden="true">
          {stepLabels.map((label, index) => (
            <span key={label} className={index <= step ? "done" : ""} />
          ))}
        </div>
        <div className="wizard-stepmeta">
          <strong>Step {step + 1} of 3</strong>
          <span>{stepLabels[step]}</span>
        </div>

        {step === 0 && (
          <div>
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
            <label>
              Reviewing agency
              <select
                value={organizationId === "" ? "" : String(organizationId)}
                onChange={(event) =>
                  setOrganizationId(event.target.value ? Number(event.target.value) : "")
                }
                disabled={loadingOrgs || organizations.length === 0}
              >
                <option value="">
                  {loadingOrgs ? "Loading agencies..." : "Select a verified agency"}
                </option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>
            <p style={{ color: "var(--muted)", fontSize: 12, marginTop: -8 }}>
              Your request is sent to the selected agency for review. After approval it appears on the donor page.
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
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
            <div className="field-grid">
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
          <div>
            <dl className="review-grid">
              <div>
                <dt>Category</dt>
                <dd>{category}</dd>
              </div>
              <div>
                <dt>Agency</dt>
                <dd>{selectedOrganization?.name ?? "Not selected"}</dd>
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
            <p style={{ color: "var(--muted)", fontSize: 12 }}>
              Submitting sends this request to the agency portal for review. Approved needs are published for donors.
            </p>
          </div>
        )}

        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}

        <div className="form-actions" style={step === 0 ? { justifyContent: "flex-start" } : undefined}>
          {step > 0 && (
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setError("");
                setStep((current) => current - 1);
              }}
            >
              ← Back
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={continueStep}>
              {step === 0 ? "Continue" : "Review request"} →
            </Button>
          ) : (
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit assistance request"}
            </Button>
          )}
        </div>
      </form>
    </BeneficiaryPage>
  );
}
