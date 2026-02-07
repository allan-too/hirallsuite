import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dataPath = path.join(dataDir, "db.json");

const defaultState = {
  users: [
    {
      id: "user-admin",
      name: "Admin",
      role: "manager",
      pin: "1234",
      branchId: "branch-main",
      active: true
    }
  ],
  branches: [{ id: "branch-main", name: "Main Branch" }],
  products: [],
  categories: [],
  inventoryLedger: [],
  stockOnHand: {},
  sales: [],
  shifts: [],
  refunds: [],
  attendance: [],
  auditLog: [],
  changeLog: []
};

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(defaultState, null, 2));
  }
}

export function loadState() {
  ensureDataFile();
  const raw = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(raw);
}

export function saveState(state) {
  ensureDataFile();
  fs.writeFileSync(dataPath, JSON.stringify(state, null, 2));
}

export function createId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function nowIso() {
  return new Date().toISOString();
}
