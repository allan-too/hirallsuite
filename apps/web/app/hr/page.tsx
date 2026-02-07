"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type User = {
  id: string;
  name: string;
  role: string;
};

export default function HrPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("cashier");
  const [pin, setPin] = useState("0000");
  const [message, setMessage] = useState("");

  const loadUsers = () => {
    apiFetch("/users")
      .then((data) => setUsers(data.users))
      .catch((error) => setMessage(error.message));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async () => {
    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({ name, role, pin })
      });
      setMessage("User created");
      setName("");
      loadUsers();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  };

  return (
    <section style={{ display: "grid", gap: "24px" }}>
      <header>
        <h1 style={{ fontSize: "28px" }}>HR</h1>
        <p style={{ color: "#6b7280" }}>Add staff profiles and manage roles.</p>
      </header>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Create staff</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="store">Store</option>
          </select>
          <input
            placeholder="PIN"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
          />
          <button onClick={createUser}>Create</button>
        </div>
      </section>

      <section style={{ background: "white", padding: "16px", borderRadius: "12px" }}>
        <h2 style={{ marginTop: 0 }}>Staff list</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} — {user.role}
            </li>
          ))}
        </ul>
      </section>

      {message && <div style={{ background: "#e0f2fe", padding: "12px" }}>{message}</div>}
    </section>
  );
}
