const modules = [
  {
    name: "POS",
    description: "Front counter sales, receipts, shifts, and cash handling.",
    href: "/pos"
  },
  {
    name: "Cashier",
    description: "Cashier permissions, dashboards, and receipt reprints.",
    href: "/cashier"
  },
  {
    name: "Store",
    description: "Inventory, stock movements, and stock views.",
    href: "/store"
  },
  {
    name: "Manager",
    description: "Auditing, reports, and staff administration.",
    href: "/manager"
  },
  {
    name: "HR",
    description: "Staff records and attendance tracking.",
    href: "/hr"
  }
];

export default function Home() {
  return (
    <section>
      <header style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.2em" }}>
          HIRALL POS v1
        </p>
        <h1 style={{ fontSize: "32px", margin: "12px 0" }}>
          Local-first POS workspace (sync-ready)
        </h1>
        <p style={{ maxWidth: "640px", color: "#4b5563" }}>
          Use the modules below to run an end-to-end flow: open a shift, stock in
          products, post sales, and review manager audits. The backend runs
          locally and records every action with user, branch, device, and time
          for audit readiness.
        </p>
      </header>
      <section>
        <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>Modules in scope</h2>
        <ul style={{ display: "grid", gap: "16px", padding: 0, listStyle: "none" }}>
          {modules.map((module) => (
            <li
              key={module.name}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px",
                background: "white"
              }}
            >
              <h3 style={{ margin: "0 0 8px 0" }}>{module.name}</h3>
              <p style={{ margin: "0 0 12px 0", color: "#6b7280" }}>{module.description}</p>
              <a href={module.href} style={{ color: "#2563eb" }}>
                Open {module.name} →
              </a>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
