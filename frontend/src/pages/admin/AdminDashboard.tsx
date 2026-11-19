import { Button } from "@/components/ui/Button";
import { Metric } from "@/components/ui/Metric";
import { PageHead } from "@/components/ui/PageHead";
import { AgencyVerificationList } from "@/components/portal/AgencyVerificationList";
import { AuditList } from "@/components/portal/AuditList";
import { agencies } from "@/data/mock/agencies";
import { adminMetrics, trustSafety } from "@/data/mock/adminOverview";
import { auditEvents } from "@/data/mock/auditEvents";

const metricTones = ["green", "blue", "gold", "navy"];

export default function AdminDashboard() {
  const awaitingReview = agencies.filter((a) => a.status !== "verified");

  return (
    <>
      <PageHead
        eyebrow="Fictional demonstration workspace"
        title="Platform administration"
        description="Monitor trust, safety, and operations across Pamoja."
      />

      <div className="portal-metrics">
        {adminMetrics.map((m, i) => (
          <Metric key={m.label} label={m.label} value={m.value} note={m.note} tone={metricTones[i]} />
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel wide">
          <div className="panel-head">
            <div>
              <h2>Agency verification queue</h2>
              <p>Applications awaiting administrator review</p>
            </div>
            <Button to="/admin/verification" variant="outline">
              View all
            </Button>
          </div>
          <AgencyVerificationList agencies={awaitingReview} limit={3} />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Trust & safety</h2>
              <p>Records needing attention</p>
            </div>
          </div>
          <div className="safety-score">
            <div className="score-ring">
              <span>
                <b>{trustSafety.score}</b>/ 100
              </span>
            </div>
            <b>{trustSafety.headline}</b>
            <p>{trustSafety.summary}</p>
          </div>
          <Button to="/admin/duplicates" variant="outline">
            Open review centre
          </Button>
        </section>

        <section className="panel span-2">
          <div className="panel-head">
            <div>
              <h2>Audit activity</h2>
              <p>Important platform actions</p>
            </div>
            <Button to="/admin/audit" variant="ghost">
              Full audit log
            </Button>
          </div>
          <AuditList events={auditEvents.slice(0, 4)} />
        </section>
      </div>
    </>
  );
}
