import { Button } from "@/components/ui/Button";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { Metric } from "@/components/ui/Metric";
import { PageHead } from "@/components/ui/PageHead";
import { AgencyVerificationList } from "@/components/portal/AgencyVerificationList";
import { AuditList } from "@/components/portal/AuditList";
import { useAsync } from "@/hooks/useAsync";
import { getOverview, listAgencies, listAudit } from "@/services/adminService";

const metricTones = ["green", "blue", "gold", "navy"];

export default function AdminDashboard() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [overview, agencies, audit] = await Promise.all([
      getOverview(),
      listAgencies({ perPage: 100 }),
      listAudit({ perPage: 4 }),
    ]);
    return { overview, agencies: agencies.items, audit: audit.items };
  }, []);

  return (
    <>
      <PageHead
        eyebrow="Administrator workspace"
        title="Platform administration"
        description="Monitor trust, safety, and operations across Pamoja."
      />

      {error && <ErrorNotice message={error} onRetry={reload} />}
      {!data && loading && <Loading label="Loading the dashboard…" />}

      {data && (
        <>
          <div className="portal-metrics">
            {data.overview.metrics.map((m, i) => (
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
              <AgencyVerificationList agencies={data.agencies.filter((a) => a.status !== "verified")} limit={3} />
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
                    <b>{data.overview.trustSafety.score}</b>/ 100
                  </span>
                </div>
                <b>{data.overview.trustSafety.headline}</b>
                <p>{data.overview.trustSafety.summary}</p>
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
              <AuditList events={data.audit} />
            </section>
          </div>
        </>
      )}
    </>
  );
}
