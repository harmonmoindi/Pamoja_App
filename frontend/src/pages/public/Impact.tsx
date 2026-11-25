import { ArrowRight, ShieldCheck } from "lucide-react";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { Metric } from "@/components/ui/Metric";
import { lifecycle } from "@/data/constants/lifecycle";
import { impactSecondary } from "@/data/mock/impact";
import { useAsync } from "@/hooks/useAsync";
import { getImpactSummary } from "@/services/impactService";

const metricTones = ["green", "blue", "gold", "navy"];

export default function Impact() {
  const { data, loading, error, reload } = useAsync(() => getImpactSummary(), []);
  const maxRequests = Math.max(...(data?.countyRequests.map((c) => c.count) ?? [1]), 1);

  return (
    <main className="page-bg">
      <section className="impact-hero">
        <div className="container">
          <span className="eyebrow">Public accountability</span>
          <h1>
            Every resource has a story.
            <br />
            Every outcome should be visible.
          </h1>
          <p>
            Platform data showing how Pamoja distinguishes commitments, coordination, and confirmed outcomes.
          </p>
        </div>
      </section>

      <section className="container impact-content">
        <div className="notice">
          <ShieldCheck />
          <div>
            <b>Transparent by design</b>
            <p>
              Only a beneficiary's completed receipt counts as a confirmed delivery. A pledge is a commitment, never a
              delivery.
            </p>
          </div>
        </div>

        {error && <ErrorNotice message={error} onRetry={reload} />}
        {!data && loading && <Loading label="Loading impact figures…" />}

        {data && (
          <>
            <div className="stats-grid impact-stats">
              {data.metrics.map((m, i) => (
                <Metric key={m.label} label={m.label} value={m.value} note={m.note} tone={metricTones[i]} />
              ))}
            </div>

            <div className="impact-secondary-stats">
              {impactSecondary.map((s) => (
                <div key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                  <small>{s.note} (illustrative)</small>
                </div>
              ))}
            </div>

            <div className="county-impact-card">
              <div>
                <span className="eyebrow">Generalized regional overview</span>
                <h3>Assistance requests by county</h3>
                <p>Requests by county. No beneficiary addresses are shown.</p>
              </div>
              <div className="county-bars">
                {data.countyRequests.length === 0 && <p>No requests yet.</p>}
                {data.countyRequests.map((c) => (
                  <span key={c.county}>
                    <b>{c.county}</b>
                    <i>
                      <strong style={{ width: `${Math.round((c.count / maxRequests) * 100)}%` }} />
                    </i>
                    <small>{c.count} requests</small>
                  </span>
                ))}
              </div>
            </div>

            <div className="chart-grid">
              <div className="chart-card">
                <div className="chart-head">
                  <div>
                    <h3>Assistance by category</h3>
                    <p>Delivered resource units</p>
                  </div>
                </div>
                <div className="bar-chart">
                  {data.categoryOutput.length === 0 && <p>No deliveries recorded yet.</p>}
                  {data.categoryOutput.map((c) => (
                    <div key={c.name}>
                      <span>{c.name}</span>
                      <i>
                        <b style={{ width: `${c.value}%` }} />
                      </i>
                      <strong>{c.units}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Resource commitment progress</h3>
                <p>Requests by current stage</p>
                <div className="donut-wrap">
                  <div className="donut">
                    <span>
                      <b>{data.commitmentProgress.coordinated}%</b>coordinated
                    </span>
                  </div>
                  <div className="donut-legend">
                    <span>
                      <i className="l1" />
                      Received <b>{data.commitmentProgress.received}%</b>
                    </span>
                    <span>
                      <i className="l2" />
                      Allocated <b>{data.commitmentProgress.allocated}%</b>
                    </span>
                    <span>
                      <i className="l3" />
                      Pledged only <b>{data.commitmentProgress.pledgedOnly}%</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="accountability">
          <div>
            <span className="eyebrow">The accountability chain</span>
            <h2>From need to confirmed outcome</h2>
            <p>Pamoja never counts an unfulfilled pledge as delivered assistance.</p>
          </div>
          <div className="account-flow">
            {lifecycle.map((stage, i) => (
              <div key={stage}>
                <span>{i + 1}</span>
                <b>{stage}</b>
                {i < lifecycle.length - 1 && <ArrowRight />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}