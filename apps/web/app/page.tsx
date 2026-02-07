const modules = [
  {
    name: "POS",
    description: "Front counter sales, receipts, shifts, and cash handling."
  },
  {
    name: "Cashier",
    description: "Cashier permissions, dashboards, and receipt reprints."
  },
  {
    name: "Store",
    description: "Inventory, stock movements, and stock views."
  },
  {
    name: "Manager",
    description: "Auditing, reports, and staff administration."
  }
];

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "48px" }}>
      <header style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.2em" }}>
          HIRALL POS v1
        </p>
        <h1 style={{ fontSize: "36px", margin: "12px 0" }}>
          Next.js + Node.js + Python service workspace
        </h1>
        <p style={{ maxWidth: "640px", color: "#4b5563" }}>
          This workspace seeds the frontend and backend services for Phase 1. The
          POS specification lives in the README, and this UI can evolve into the
          operator console.
        </p>
      </header>
      <section>
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Modules in scope</h2>
        <ul style={{ display: "grid", gap: "16px", padding: 0, listStyle: "none" }}>
          {modules.map((module) => (
            <li
              key={module.name}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "16px"
              }}
            >
              <h3 style={{ margin: "0 0 8px 0" }}>{module.name}</h3>
              <p style={{ margin: 0, color: "#6b7280" }}>{module.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
