import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, useLocation } from "react-router";
import AgencyRoutes from "./routes/agencyRoutes";
import Situation from "./pages/public/Situation";
import "./styles/index.css";

function Preview() {
  const { pathname } = useLocation();
  return pathname === "/situation" ? <Situation /> : <AgencyRoutes />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter><Preview /></HashRouter>
  </StrictMode>
);
