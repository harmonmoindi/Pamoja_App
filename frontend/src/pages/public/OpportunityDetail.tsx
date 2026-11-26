import { Link, useParams } from "react-router";
import { ArrowRight, Building2, Check, ChevronRight, MapPin, ShieldCheck, Smartphone } from "lucide-react";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { lifecycle } from "@/data/constants/lifecycle";
import { useAsync } from "@/hooks/useAsync";
import { loadNeed, percent } from "@/lib/needs";

export default function OpportunityDetail() {
  const { id = "" } = useParams();
  const { data, loading, error, reload } = useAsync(() => loadNeed(id), [id]);
  const item = data?.item ?? null;

  return (
    <main className="page-bg">
      <div className="container breadcrumb">
        <Link to="/explore">Explore opportunities</Link>
        <ChevronRight />
        <span>{item?.category ?? "Opportunity"}</span>
      </div>

      {error && (
        <div className="container">
          <ErrorNotice message={error} onRetry={reload} />
        </div>
      )}
      {!data && loading && (
        <div className="container">
          <Loading label="Loading this opportunity…" />
        </div>
      )}

      {data && !item && (
        <div className="container">
          <div className="empty">
            <h3>Opportunity not found</h3>
            <p>It may have been removed, or the link is incorrect.</p>
            <Button to="/explore">Back to all opportunities</Button>
          </div>
        </div>
      )}

      {item && (
        <section className="container detail-grid">
          <div>
            <div className="detail-image">
              <img src={item.image} alt="" />
              <span className="fictional">Demonstration record</span>
            </div>
            <div className="detail-main">
              <div className="card-meta">
                <span>{item.category}</span>
                <b>{item.urgency}</b>
              </div>
              <h1>{item.title}</h1>
              <div className="detail-meta">
                <span>
                  <MapPin />
                  {item.county}
                </span>
              </div>
              <div className="agency-banner">
                <span>
                  <Building2 />
                </span>
                <div>
                  <small>Coordinated by</small>
                  <b>{item.agency}</b>
                  <p>
                    <ShieldCheck /> Reviewed organization
                  </p>
                </div>
              </div>
              <h2>About this need</h2>
              <p>
                {item.description} This request was reviewed using a documented assessment. No personally
                identifying beneficiary information is displayed publicly.
              </p>

              <h2>Assistance journey</h2>
              <div className="lifecycle">
                {lifecycle.map((stage, i) => {
                  const reached = Math.max(lifecycle.findIndex((s) => s === item.stage), 2);
                  const done = i <= reached;
                  return (
                    <div className={done ? "done" : ""} key={stage}>
                      <span>{done ? <Check /> : i + 1}</span>
                      <b>{stage}</b>
                      <small>{done ? "Completed" : "Pending"}</small>
                    </div>
                  );
                })}
              </div>

              <h2>Resource requirements</h2>
              <div className="resource-table">
                <div className="table-head">
                  <span>Resource</span>
                  <span>Requested</span>
                  <span>Pledged</span>
                  <span>Delivered</span>
                  <span>Outstanding</span>
                </div>
                <div className="table-row">
                  <b>{item.unit}</b>
                  <span>{item.requested}</span>
                  <span>{item.pledged}</span>
                  <span>{item.delivered}</span>
                  <strong>{Math.max(item.requested - item.pledged, 0)}</strong>
                </div>
              </div>
            </div>
          </div>

          <aside className="support-card">
            <span className="eyebrow">Resource commitment</span>
            <h2>
              {item.pledged} of {item.requested}
            </h2>
            <p>{item.unit} pledged</p>
            <Progress value={percent(item.pledged, item.requested)} />
            <div className="support-stats">
              <span>
                <b>{percent(item.pledged, item.requested)}%</b> pledged
              </span>
              <span>
                <b>{item.delivered}</b> delivered
              </span>
              <span>
                <b>{Math.max(item.requested - item.pledged, 0)}</b> still needed
              </span>
            </div>

            {item.financialTarget > 0 && (
              <div className="financial-progress-block">
                <div>
                  <span>Financial support</span>
                  <b>KES {item.financialReceived.toLocaleString()} received</b>
                </div>
                <Progress value={percent(item.financialReceived, item.financialTarget)} tone="gold" />
                <div className="financial-status-row">
                  <span>KES {item.financialPledged.toLocaleString()} pledged</span>
                  <span>KES {item.financialReceived.toLocaleString()} confirmed</span>
                </div>
                <small>
                  Only successful payment callbacks count as received. Pending financial pledges are shown
                  separately.
                </small>
              </div>
            )}

            <Button to={`/donor/donate/${item.id}`} variant="gold">
              Donate with M-Pesa <Smartphone />
            </Button>
            <Button to={`/pledge/${item.id}`}>
              Pledge support <ArrowRight />
            </Button>
            <small>
              <ShieldCheck /> A pledge is a resource commitment, not a completed donation.
            </small>
          </aside>
        </section>
      )}
    </main>
  );
}
