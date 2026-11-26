import { Link } from "react-router";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/Progress";
import { Need, percent } from "@/lib/needs";

/** A card for one humanitarian need. Used by Explore and the Needs map list view. */
export function NeedCard({ item }: { item: Need }) {
  const pct = percent(item.pledged, item.requested);
  return (
    <article className="opportunity-card">
      <Link to={`/opportunity/${item.id}`} className="card-image">
        <img src={item.image} alt="" />
        <span className="fictional">Demonstration record</span>
      </Link>
      <div className="card-body">
        <div className="card-meta">
          <span>{item.category}</span>
          <b className={item.urgency === "Urgent" ? "urgent" : ""}>{item.urgency}</b>
        </div>
        <Link to={`/opportunity/${item.id}`}>
          <h3>{item.title}</h3>
        </Link>
        <p className="location">
          <MapPin size={15} />
          {item.county}
        </p>
        <p className="agency">
          <ShieldCheck size={16} />
          {item.agency}
        </p>
        <div className="resource-row">
          <span>
            <b>{item.pledged}</b> pledged
          </span>
          <span>
            {item.requested} {item.unit} needed
          </span>
        </div>
        <Progress value={pct} />
        <div className="card-foot">
          <b>{pct}% committed</b>
          <Link to={`/opportunity/${item.id}`}>
            View opportunity <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
