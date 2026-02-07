"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Shift = {
  id: string;
  status: string;
  floatAmount: number;
  expectedCash: number | null;
  countedCash: number | null;
  variance: number | null;
};

type Summary = {
  total: number;
  count: number;
  cash: number;
  mpesa: number;
  card: number;
};

export default function CashierPage() {
  const [floatAmount, setFloatAmount] = useState(0);
  const [countedCash, setCountedCash] = useState(0);
  const [shift, setShift] = useState<Shift | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [message, setMessage] = useState("");

  const loadSummary = () => {
    apiFetch("/cashier/summary")
      .then((data) => {
        setShift(data.shift);
        setSummary(data.totals);
      })
      .catch((error) => setMessage(error.message));
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const openShift = async () => {
    try {
      const data = await apiFetch("/shifts/open", {
        method: "POST",
        body: JSON.stringify({ floatAmount })
      });
      setShift(data.shift);
      setMessage("Shift opened");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  const closeShift = async () => {
    try {
      const data = await apiFetch("/shifts/close", {
        method: "POST",
        body: JSON.stringify({ countedCash })
      });
      setShift(data.shift);
      setMessage("Shift closed");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  return (
    <section style={{ display: "grid", gap: "24px" }}>
      <header>
        <h1 style={{ fontSize: "28px" }}>Cashier</h1>
        <p style={{ color: "#6b7280" }}>Open shifts, close shifts, and check cashier totals.</p>
      </header>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Shift controls</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            type="number"
            placeholder="Float amount"
            value={floatAmount}
            onChange={(event) => setFloatAmount(Number(event.target.value))}
          />
          <button onClick={openShift}>Open Shift</button>
          <input
            type="number"
            placeholder="Counted cash"
            value={countedCash}
            onChange={(event) => setCountedCash(Number(event.target.value))}
          />
          <button onClick={closeShift}>Close Shift</button>
        </div>
      </section>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Shift summary</h2>
        {shift ? (
          <div>
            <p>Status: {shift.status}</p>
            <p>Float: {shift.floatAmount}</p>
            <p>Expected: {shift.expectedCash ?? "-"}</p>
            <p>Counted: {shift.countedCash ?? "-"}</p>
            <p>Variance: {shift.variance ?? "-"}</p>
          </div>
        ) : (
          <p>No open shift.</p>
        )}
        {summary && (
          <div>
            <p>Sales total: {summary.total}</p>
            <p>Transactions: {summary.count}</p>
            <p>Cash: {summary.cash}</p>
            <p>M-Pesa: {summary.mpesa}</p>
            <p>Card: {summary.card}</p>
          </div>
        )}
        <button onClick={loadSummary}>Refresh summary</button>
      </section>

      {message && <div style={{ background: "#fef3c7", padding: "12px" }}>{message}</div>}
    </section>
  );
}
