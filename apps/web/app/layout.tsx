export const metadata = {
  title: "HIRALL POS v1",
  description: "HIRALL POS v1 workspace"
};

import type { ReactNode } from "react";

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb" }}>
        <div style={{ borderBottom: "1px solid #e5e7eb", background: "white" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto", padding: "16px" }}>
            <strong>HIRALL POS v1</strong>
            <nav style={{ marginTop: "8px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a href="/">Home</a>
              <a href="/pos">POS</a>
              <a href="/cashier">Cashier</a>
              <a href="/store">Store</a>
              <a href="/manager">Manager</a>
              <a href="/hr">HR</a>
            </nav>
          </div>
        </div>
        <main style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>{children}</main>
      </body>
    </html>
  );
}
