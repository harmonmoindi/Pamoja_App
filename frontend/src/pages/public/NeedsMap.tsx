import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Map as MapIcon, MapPin, ShieldCheck, UsersRound } from "lucide-react";
import { ErrorNotice, Loading } from "@/components/ui/AsyncState";
import { NeedCard } from "@/components/opportunities/NeedCard";
import { useAsync } from "@/hooks/useAsync";
import { loadNeeds, Need } from "@/lib/needs";

// Approximate positions of counties on the schematic map (x and y are percentages of the map area).
const COUNTY_POSITIONS: Record<string, [number, number]> = {
  Turkana: [27, 20],
  Marsabit: [55, 24],
  Garissa: [79, 56],
  Kisumu: [21, 55],
  "Homa Bay": [19, 63],
  Nairobi: [50, 68],
  Kiambu: [51, 61],
  Kitui: [65, 66],
  Mombasa: [80, 82],
};

type Pin = { id: string; x: number; y: number; label: string };

function pinsFor(needs: Need[]): Pin[] {
  const seen: Record<string, number> = {};
  return needs.map((need, index) => {
    const key = need.county.replace(/ County$/, "");
    const k = (seen[key] = (seen[key] ?? -1) + 1); // how many pins this county already has
    const [x, y] = COUNTY_POSITIONS[key] ?? [30 + ((index * 17) % 45), 25 + ((index * 23) % 50)];
    return { id: need.id, label: need.title, x: x + (k % 3) * 4 - 4, y: y + Math.floor(k / 3) * 5 };
  });
}

function SchematicMap({ pins }: { pins: Pin[] }) {
  return (
    <div className="demo-map" aria-label="Generalized locations of approved needs">
      <div className="map-road r1" />
      <div className="map-road r2" />
      <div className="map-road r3" />
      <div className="map-water" />
      <span className="map-label l1">General area</span>
      <span className="map-label l2">County level</span>
      {pins.map((pin) => (
        <Link
          to={`/opportunity/${pin.id}`}
          className="map-pin"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          key={pin.id}
          aria-label={pin.label}
        >
          <MapPin />
          <span>{pin.label}</span>
        </Link>
      ))}
      <div className="map-attribution">Schematic map · general areas only</div>
    </div>
  );
}

export default function NeedsMap() {
  const { data, loading, error, reload } = useAsync(() => loadNeeds(), []);
  const [view, setView] = useState<"map" | "list">("map");
  const [county, setCounty] = useState("All counties");
  const [category, setCategory] = useState("All categories");
  const [urgency, setUrgency] = useState("Any urgency");

  const items = useMemo(() => data?.items ?? [], [data]);
  const counties = useMemo(() => [...new Set(items.map((i) => i.county))].sort(), [items]);
  const categories = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items]);
  const urgencies = useMemo(() => [...new Set(items.map((i) => i.urgency))], [items]);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (county === "All counties" || item.county === county) &&
          (category === "All categories" || item.category === category) &&
          (urgency === "Any urgency" || item.urgency === urgency),
      ),
    [items, county, category, urgency],
  );
  const pins = useMemo(() => pinsFor(filtered), [filtered]);

  return (
    <main className="page-bg">
      <section className="page-hero map-hero">
        <div className="container">
          <span className="eyebrow">Generalized public locations</span>
          <h1>Humanitarian needs map</h1>
          <p>Explore approved needs by county. Exact beneficiary locations are never displayed.</p>
        </div>
      </section>

      <section className="container map-page">
        <div className="map-toolbar">
          <div className="map-filters">
            <label>
              County
              <select value={county} onChange={(e) => setCounty(e.target.value)}>
                <option>All counties</option>
                {counties.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>All categories</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Urgency
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option>Any urgency</option>
                {urgencies.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="view-toggle">
            <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>
              <MapIcon /> Map
            </button>
            <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
              <UsersRound /> List
            </button>
          </div>
        </div>

        <div className="public-location-notice">
          <ShieldCheck />
          <p>
            Markers represent generalized county areas and are intentionally not placed on residential
            locations. {data?.sample ? "Sample records are shown." : ""}
          </p>
        </div>

        {error && <ErrorNotice message={error} onRetry={reload} />}
        {!data && loading && <Loading label="Loading the map…" />}

        {data && view === "map" && (
          <div className="needs-map-layout">
            <SchematicMap pins={pins} />
            <aside className="map-results">
              <b>{filtered.length} approved needs</b>
              {filtered.map((item) => (
                <Link to={`/opportunity/${item.id}`} key={item.id}>
                  <span className="map-result-icon">
                    <MapPin />
                  </span>
                  <div>
                    <small>
                      {item.category} · {item.urgency}
                    </small>
                    <b>{item.title}</b>
                    <p>{item.county}</p>
                  </div>
                  <ArrowRight />
                </Link>
              ))}
            </aside>
          </div>
        )}

        {data && view === "list" && (
          <div className="opportunity-grid">
            {filtered.map((item) => (
              <NeedCard item={item} key={item.id} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
