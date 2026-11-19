import { Link } from "react-router";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleCheckBig,
  Eye,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Home as HomeIcon,
  PackageCheck,
  ShieldCheck,
  Stethoscope,
  TentTree,
  Truck,
  Utensils,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Metric } from "@/components/ui/Metric";

// To change the hero picture, replace this address (or use a file in frontend/public, e.g. "/images/hero.jpg").
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1637149014802-d917e6255c2d?auto=format&fit=crop&w=1400&q=85";

const categories = [
  { Icon: GraduationCap, name: "Education", desc: "Learning materials and school support" },
  { Icon: Stethoscope, name: "Healthcare", desc: "Medical supplies and outreach care" },
  { Icon: Utensils, name: "Food security", desc: "Nutritious food and household essentials" },
  { Icon: HomeIcon, name: "Shelter", desc: "Safe and dignified emergency shelter" },
  { Icon: TentTree, name: "Disaster relief", desc: "Rapid support for affected communities" },
  { Icon: UsersRound, name: "Community support", desc: "Locally led resilience initiatives" },
];

const steps = [
  {
    Icon: BookOpen,
    n: "01",
    title: "Share a need",
    desc: "Beneficiaries describe what support is needed through a simple, privacy-conscious request.",
  },
  {
    Icon: HeartHandshake,
    n: "02",
    title: "Connect resources",
    desc: "Participating agencies assess requests while donors discover verified opportunities.",
  },
  {
    Icon: Truck,
    n: "03",
    title: "Track the impact",
    desc: "Commitments, allocations, deliveries, and confirmations are recorded along the way.",
  },
];

const values = [
  {
    Icon: Eye,
    title: "Transparent assistance",
    desc: "Follow commitments and reported outcomes without confusing pledges with deliveries.",
  },
  {
    Icon: ShieldCheck,
    title: "Trusted coordination",
    desc: "Support documented needs through reviewed organizations.",
  },
  {
    Icon: UsersRound,
    title: "Community empowerment",
    desc: "Give communities an accessible channel to communicate needs.",
  },
  {
    Icon: PackageCheck,
    title: "Measurable impact",
    desc: "See how resources move from commitment to confirmed receipt.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-pattern" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <HeartHandshake size={16} /> Humanitarian coordination, connected
            </span>
            <h1>
              Together, we can make a <em>difference.</em>
            </h1>
            <p>
              Pamoja connects people in need with compassionate donors and trusted humanitarian
              organizations—making assistance more accessible, transparent, and impactful.
            </p>
            <div className="hero-actions">
              <Button to="/explore">
                Explore opportunities <ArrowRight size={17} />
              </Button>
              <Button to="/beneficiary/request" variant="outline">
                Request assistance
              </Button>
            </div>
            <div className="trust-line">
              <span>
                <ShieldCheck /> Reviewed organizations
              </span>
              <span>
                <PackageCheck /> Traceable resources
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo">
              <img src={HERO_IMAGE} alt="Community members collaborating outdoors in Kenya" />
            </div>
            <div className="floating-card impact-float">
              <span className="float-icon">
                <HandHeart />
              </span>
              <div>
                <b>41 deliveries</b>
                <small>confirmed by beneficiaries</small>
              </div>
            </div>
            <div className="floating-card verified-float">
              <CircleCheckBig />
              <span>
                <b>Verified partners</b>
                <small>Accountable coordination</small>
              </span>
            </div>
            <div className="gold-dot" />
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-title">
            <span>Illustrative demo statistics</span>
            <p>Sample data showing how assistance moves through Pamoja.</p>
          </div>
          <div className="stats-grid">
            <Metric label="Assistance requests" value="142" note="Submitted needs" />
            <Metric label="Requests reviewed" value="98" note="By partner agencies" tone="blue" />
            <Metric label="Resource pledges" value="67" note="Active commitments" tone="gold" />
            <Metric label="Confirmed deliveries" value="41" note="Receipt acknowledged" tone="navy" />
          </div>
        </div>
      </section>

      <section className="section how-section" id="how">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">A transparent path forward</span>
            <h2>From needs to lasting impact</h2>
            <p>
              One connected platform makes every stage visible, from a community’s request to
              confirmed delivery.
            </p>
          </div>
          <div className="steps">
            {steps.map(({ Icon, n, title, desc }, i) => (
              <div className="step-card" key={title}>
                <span className="step-num">{n}</span>
                <div className="step-icon">
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                {i < steps.length - 1 && (
                  <span className="step-line">
                    <ChevronRight />
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="center">
            <Button to="/about" variant="outline">
              Learn how Pamoja works <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      <section className="section category-section">
        <div className="container">
          <div className="section-heading left">
            <span className="eyebrow">Areas of support</span>
            <h2>Every need deserves a pathway</h2>
            <p>Explore opportunities across essential humanitarian categories.</p>
          </div>
          <div className="category-grid">
            {categories.map(({ Icon, name, desc }, i) => (
              <Link to={`/explore?category=${encodeURIComponent(name)}`} className={`category-card c${i}`} key={name}>
                <Icon />
                <h3>{name}</h3>
                <p>{desc}</p>
                <ArrowRight className="cat-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*
        TODO: "Featured opportunities" section.
        Add it once the Donor dev has merged components/opportunities/OpportunityCard.tsx
        and data/mock/opportunities.ts. It shows the first three opportunities:

        <section className="section opportunities">
          <div className="container">
            <div className="section-top">
              <div className="section-heading left">
                <span className="eyebrow">Featured opportunities</span>
                <h2>Support where it matters</h2>
                <p>These fictional examples demonstrate transparent resource coordination.</p>
              </div>
              <Button to="/explore" variant="outline">
                View all opportunities <ArrowRight size={16} />
              </Button>
            </div>
            <div className="opportunity-grid">
              {opportunities.slice(0, 3).map((o) => (
                <OpportunityCard key={o.id} item={o} />
              ))}
            </div>
          </div>
        </section>
      */}

      <section className="section why">
        <div className="container why-grid">
          <div className="why-copy">
            <span className="eyebrow">Why Pamoja</span>
            <h2>
              Built for trust.
              <br />
              Designed for people.
            </h2>
            <p>
              Humanitarian support works best when every stakeholder can understand what happened,
              what comes next, and where action is still needed.
            </p>
            <Button to="/impact" variant="gold">
              Explore our accountability model <ArrowRight size={16} />
            </Button>
          </div>
          <div className="value-grid">
            {values.map(({ Icon, title, desc }) => (
              <div className="value-card" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta-inner">
          <div>
            <span>We move further when we move together.</span>
            <h2>Be part of something greater.</h2>
            <p>
              Give resources, request support, or coordinate humanitarian initiatives in one
              accountable network.
            </p>
          </div>
          <div className="cta-actions">
            <Button to="/register" variant="gold">
              Become a donor
            </Button>
            <Button to="/beneficiary/request" variant="secondary">
              Request assistance
            </Button>
            <Button to="/register" variant="outline">
              Register your organization
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}