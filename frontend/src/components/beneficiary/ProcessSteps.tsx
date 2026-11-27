import { Check } from "lucide-react";
import { AssistanceStep, TrackingStep, assistanceProcess } from "@/data/mock/beneficiaryRequests";

type ProcessStepsProps = {
  detailed?: boolean;
  steps?: Array<AssistanceStep | TrackingStep>;
};

export function ProcessSteps({ detailed = false, steps = assistanceProcess }: ProcessStepsProps) {
  return (
    <ol className="portal-steps">
      {steps.map((step, index) => {
        const next = steps[index + 1];
        const line = !next ? "none" : step.done && next.done ? "done" : "todo";
        const copy = "body" in step && detailed ? step.body : step.detail;
        return (
          <li key={step.title} className={step.done ? "portal-step done" : "portal-step"}>
            <span className="portal-step-rail" aria-hidden="true">
              <span className={step.done ? "portal-step-dot done" : "portal-step-dot"}>
                {step.done && <Check size={12} strokeWidth={3} />}
              </span>
              {line !== "none" && <i className={line} />}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{copy}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
