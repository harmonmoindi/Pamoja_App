import { Check } from "lucide-react";

// To change the picture, replace this address (or use a file in frontend/public, e.g. "/images/about.jpg").
const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1729691032175-d6edd1581a31?auto=format&fit=crop&w=1000&q=80";

const principles = [
  "Protect beneficiary privacy",
  "Review needs responsibly",
  "Never confuse pledges with deliveries",
  "Keep authorized decisions human-led",
];

export default function About() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our shared purpose</span>
          <h1>Humanitarian coordination built around dignity.</h1>
          <p>
            Pamoja means “together.” Our prototype demonstrates how technology can connect needs,
            resources, and accountable outcomes.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div>
            <span className="eyebrow">The Pamoja model</span>
            <h2>Clarity at every step</h2>
            <p>
              We designed the platform around a simple promise: stakeholders should understand where
              a need stands, what has been committed, what has actually moved, and whether it
              arrived.
            </p>
            <div className="principles">
              {principles.map((text) => (
                <span key={text}>
                  <Check />
                  {text}
                </span>
              ))}
            </div>
          </div>
          <div className="about-image">
            <img src={ABOUT_IMAGE} alt="Young community members together" />
          </div>
        </div>
      </section>
    </main>
  );
}
