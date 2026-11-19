import { Link } from "react-router";
import { Logo } from "@/components/ui/Logo";
import { DemoBanner } from "@/components/ui/DemoBanner";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p>Connecting people. Empowering communities. Transforming lives.</p>
          <DemoBanner />
        </div>
        <div>
          <h4>Platform</h4>
          <Link to="/explore">Explore needs</Link>
          <Link to="/impact">Our impact</Link>
          <Link to="/situation">Situation centre</Link>
          <Link to="/collection-centres">Collection centres</Link>
        </div>
        <div>
          <h4>Organization</h4>
          <Link to="/about">About Pamoja</Link>
          <Link to="/about">Privacy & safety</Link>
          <Link to="/about">Contact support</Link>
        </div>
        <div>
          <h4>Stakeholder portals</h4>
          <Link to="/donor/dashboard">Donor portal</Link>
          <Link to="/beneficiary/dashboard">Beneficiary portal</Link>
          <Link to="/agency/dashboard">Agency portal</Link>
          <Link to="/admin/dashboard">Admin portal</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2025 Pamoja. Fictional prototype.</span>
        <span>Built for accountable humanitarian coordination.</span>
      </div>
    </footer>
  );
}
