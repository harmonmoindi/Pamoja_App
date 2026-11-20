import { Check } from "lucide-react";
import { assistanceProcess } from "@/data/mock/beneficiaryRequests";

export function ProcessSteps({ detailed = false }: { detailed?: boolean }) {
  return (
    <ol className="bn-steps">
      {assistanceProcess.map((step, index) => {
        const next = assistanceProcess[index + 1];
        const line = !next ? "none" : step.done && next.done ? "done" : "todo";
        return (
          <li key={step.title} className={step.done ? "bn-step done" : "bn-step"}>
            <span className="bn-rail" aria-hidden="true">
              <span className={step.done ? "bn-dot done" : "bn-dot"}>{step.done && <Check strokeWidth={3} />}</span>
              {line !== "none" && <i className={line} />}
            </span>
            <div className="bn-step-copy">
              <h3>{step.title}</h3>
              <p>{detailed ? step.body : step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
