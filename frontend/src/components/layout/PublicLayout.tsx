import { Outlet } from "react-router";
import { PublicHeader } from "./PublicHeader";
import { Footer } from "./Footer";

export function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <Outlet />
      <Footer />
    </>
  );
}
