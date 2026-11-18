import { PageHead } from "./PageHead";

// Shown automatically for any page file that has no default export yet.
export function ComingSoon({ name }: { name: string }) {
  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <PageHead
        eyebrow="Under construction"
        title={name}
        description="This page has not been built yet. Its owner will add it soon."
      />
      <section className="panel">
        <p>
          To build it, open <code>src/pages/{name}.tsx</code> and add a component with{" "}
          <code>export default</code>. It will appear here automatically.
        </p>
      </section>
    </div>
  );
}
