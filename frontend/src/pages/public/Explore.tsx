import { useMemo, useState } from "react";
import { Link } from "react-router";
import { MapPin, Search } from "lucide-react";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { Button } from "@/components/ui/Button";
import { NeedCard } from "@/components/opportunities/NeedCard";
import { useAsync } from "@/hooks/useAsync";
import { loadNeeds, Need, percent } from "@/lib/needs";

const ALL_CATEGORIES = "All categories";
const ALL_COUNTIES = "All counties";
const ANY_URGENCY = "Any urgency";

type Sort = "newest" | "urgent" | "least-supported";

function urgencyRank(urgency: string): number {
  if (urgency === "Urgent") return 0;
  if (urgency === "High priority") return 1;
  return 2;
}

export default function Explore() {
  const { data, loading, error, reload } = useAsync(() => loadNeeds(), []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [county, setCounty] = useState(ALL_COUNTIES);
  const [urgency, setUrgency] = useState(ANY_URGENCY);
  const [sort, setSort] = useState<Sort>("newest");

  const items: Need[] = useMemo(() => data?.items ?? [], [data]);
  const categories = useMemo(() => [...new Set(items.map((i) => i.category))].filter(Boolean).sort(), [items]);
  const counties = useMemo(() => [...new Set(items.map((i) => i.county))].filter(Boolean).sort(), [items]);
  const urgencies = useMemo(() => [...new Set(items.map((i) => i.urgency))].filter(Boolean), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter(
      (o) =>
        (category === ALL_CATEGORIES || o.category === category) &&
        (county === ALL_COUNTIES || o.county === county) &&
        (urgency === ANY_URGENCY || o.urgency === urgency) &&
        `${o.title} ${o.county} ${o.category}`.toLowerCase().includes(q),
    );
    if (sort === "urgent") return [...list].sort((a, b) => urgencyRank(a.urgency) - urgencyRank(b.urgency));
    if (sort === "least-supported") {
      return [...list].sort((a, b) => percent(a.pledged, a.requested) - percent(b.pledged, b.requested));
    }
    return list;
  }, [items, query, category, county, urgency, sort]);

  const clear = () => {
    setQuery("");
    setCategory(ALL_CATEGORIES);
    setCounty(ALL_COUNTIES);
    setUrgency(ANY_URGENCY);
    setSort("newest");
  };

  return (
    <main className="page-bg">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Humanitarian opportunities</span>
          <h1>Explore humanitarian opportunities</h1>
          <p>
            Discover meaningful ways to support individuals and communities through reviewed organizations.
          </p>
        </div>
      </section>

      <section className="container explore-layout">
        <aside className="filter-panel">
          <div className="filter-title">
            <b>Filter opportunities</b>
            <button onClick={clear}>Clear all</button>
          </div>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>{ALL_CATEGORIES}</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Location
            <select value={county} onChange={(e) => setCounty(e.target.value)}>
              <option>{ALL_COUNTIES}</option>
              {counties.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Urgency
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option>{ANY_URGENCY}</option>
              {urgencies.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </label>
        </aside>

        <div className="results">
          <div className="result-tools">
            <div className="search-box">
              <Search />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search needs or locations..."
              />
            </div>
            <select aria-label="Sort opportunities" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="newest">Newest first</option>
              <option value="urgent">Most urgent</option>
              <option value="least-supported">Least supported</option>
            </select>
          </div>

          <div className="result-count">
            <b>{filtered.length} opportunities</b>
            <span>
              <Link className="map-view-link" to="/needs-map">
                <MapPin /> View needs map
              </Link>
              {data?.sample ? "Sample records shown" : "Live records"}
            </span>
          </div>

          {error && <ErrorNotice message={error} onRetry={reload} />}
          {!data && loading && <Loading label="Loading opportunities…" />}

          {data && filtered.length > 0 && (
            <div className="opportunity-grid two">
              {filtered.map((o) => (
                <NeedCard key={o.id} item={o} />
              ))}
            </div>
          )}
          {data && filtered.length === 0 && (
            <div className="empty">
              <Search />
              <h3>No opportunities found</h3>
              <p>Try adjusting your search or clearing the filters.</p>
              <Button onClick={clear}>Clear filters</Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
