import { RouteObject } from "react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { page } from "./lazyPage";

// Owned by the Foundation owner. Page owners only change their page file, not this list.
export const publicRoutes: RouteObject = {
  path: "/",
  element: <PublicLayout />,
  children: [
    { index: true, element: page("public/Home") },
    { path: "explore", element: page("public/Explore") },
    { path: "needs-map", element: page("public/NeedsMap") },
    { path: "collection-centres", element: page("public/CollectionCentres") },
    { path: "opportunity/:id", element: page("public/OpportunityDetail") },
    { path: "impact", element: page("public/Impact") },
    { path: "situation", element: page("public/Situation") },
    { path: "about", element: page("public/About") },
    { path: "pledge/:id", element: page("donor/PledgePage") },
    { path: "*", element: page("NotFound") },
  ],
};
