import { ComponentType, lazy, Suspense } from "react";
import { ComingSoon } from "@/components/ui/ComingSoon";

// Finds every file in src/pages automatically.
const pages = import.meta.glob<{ default?: ComponentType }>("../pages/**/*.tsx");

/**
 * page("admin/AdminDashboard") loads src/pages/admin/AdminDashboard.tsx.
 * If that file is still empty (no default export), a "coming soon" page is shown,
 * so routes never break while the team is still building.
 *
 * RULE: every page file must use `export default function PageName() { ... }`.
 */
export function page(name: string) {
  const Page = lazy(async () => {
    const loader = pages[`../pages/${name}.tsx`];
    const mod: { default?: ComponentType } = loader ? await loader() : {};
    if (mod.default) return { default: mod.default };
    return { default: () => <ComingSoon name={name} /> };
  });
  return (
    <Suspense fallback={<div className="container" style={{ padding: 32 }}>Loading…</div>}>
      <Page />
    </Suspense>
  );
}
