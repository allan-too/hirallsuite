"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type ReportTotals = {
  total: number;
  cash?: number;
  mpesa?: number;
  card?: number;
};

export default function ManagerPage() {
  const [salesTotals, setSalesTotals] = useState<ReportTotals | null>(null);
  const [inventoryValuation, setInventoryValuation] = useState<number | null>(null);
  const [voidsCount, setVoidsCount] = useState<number>(0);
  const [auditCount, setAuditCount] = useState<number>(0);
  const [saleId, setSaleId] = useState("");
  const [managerPin, setManagerPin] = useState("");
  const [message, setMessage] = useState("");

  const loadReports = async () => {
    try {
      const sales = await apiFetch("/reports/sales");
      const inventory = await apiFetch("/reports/inventory");
      const voids = await apiFetch("/reports/voids");
      const audit = await apiFetch("/audit/logs");
      setSalesTotals(sales.totals);
      setInventoryValuation(inventory.valuation);
      setVoidsCount(voids.refunds.length);
      setAuditCount(audit.auditLog.length);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const voidSale = async () => {
    try {
      await apiFetch(`/sales/${saleId}/void`, {
        method: "POST",
        body: JSON.stringify({ managerPin, reason: "Manager void" })
      });
      setMessage("Sale voided");
      loadReports();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  const refundSale = async () => {
    try {
      await apiFetch(`/sales/${saleId}/refund`, {
        method: "POST",
        body: JSON.stringify({ managerPin, reason: "Manager refund" })
      });
      setMessage("Sale refunded");
      loadReports();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  return (
    <section style={{ display: "grid", gap: "24px" }}>
      <header>
        <h1 style={{ fontSize: "28px" }}>Manager</h1>
        <p style={{ color: "#6b7280" }}>Audit sales, inventory, and user activity.</p>
      </header>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Sales audit</h2>
        {salesTotals ? (
          <ul>
            <li>Total sales: {salesTotals.total}</li>
            <li>Cash: {salesTotals.cash ?? 0}</li>
            <li>M-Pesa: {salesTotals.mpesa ?? 0}</li>
            <li>Card: {salesTotals.card ?? 0}</li>
          </ul>
        ) : (
          <p>No sales yet.</p>
        )}
      </section>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Inventory audit</h2>
        <p>Stock valuation: {inventoryValuation ?? 0}</p>
      </section>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Voids & refunds</h2>
        <p>Count: {voidsCount}</p>
      </section>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Audit log</h2>
        <p>Total events: {auditCount}</p>
      </section>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Voids & refunds approval</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            placeholder="Sale ID"
            value={saleId}
            onChange={(event) => setSaleId(event.target.value)}
          />
          <input
            placeholder="Manager PIN"
            value={managerPin}
            onChange={(event) => setManagerPin(event.target.value)}
          />
          <button onClick={voidSale}>Void sale</button>
          <button onClick={refundSale}>Refund sale</button>
        </div>
      </section>

      <button onClick={loadReports}>Refresh reports</button>

      {message && <div style={{ background: "#fee2e2", padding: "12px" }}>{message}</div>}
    </section>
  );
}
