import express from "express";
import {
  createId,
  loadState,
  nowIso,
  saveState
} from "./store.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-User-Id,X-Branch-Id,X-Device-Id");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
});

function getContext(req) {
  return {
    userId: req.header("X-User-Id") || "system",
    branchId: req.header("X-Branch-Id") || "branch-main",
    deviceId: req.header("X-Device-Id") || "device-local"
  };
}

function recordAudit(state, { action, entity, entityId, meta }, context) {
  const entry = {
    id: createId("audit"),
    action,
    entity,
    entityId,
    meta,
    userId: context.userId,
    branchId: context.branchId,
    deviceId: context.deviceId,
    timestamp: nowIso()
  };
  state.auditLog.push(entry);
}

function recordChange(state, { action, entity, entityId, payload }) {
  state.changeLog.push({
    id: createId("change"),
    action,
    entity,
    entityId,
    payload,
    timestamp: nowIso()
  });
}

function requireManager(state, pin) {
  const manager = state.users.find((user) => user.role === "manager" && user.pin === pin);
  if (!manager) {
    const error = new Error("Manager approval required");
    error.status = 403;
    throw error;
  }
  return manager;
}

function getOpenShift(state, userId) {
  return state.shifts.find((shift) => shift.userId === userId && shift.status === "open");
}

function adjustStock(state, items, direction) {
  items.forEach((item) => {
    const current = state.stockOnHand[item.productId] || 0;
    state.stockOnHand[item.productId] = current + direction * item.quantity;
  });
}

function computeSaleTotals(items) {
  return items.reduce(
    (acc, item) => {
      const lineSubtotal = item.price * item.quantity;
      const lineDiscount = item.discount || 0;
      const lineTax = item.tax || 0;
      const lineTotal = lineSubtotal - lineDiscount + lineTax;
      acc.subtotal += lineSubtotal;
      acc.discount += lineDiscount;
      acc.tax += lineTax;
      acc.total += lineTotal;
      return acc;
    },
    { subtotal: 0, discount: 0, tax: 0, total: 0 }
  );
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "hirall-api-node" });
});

app.post("/auth/pin", (req, res) => {
  const { userId, pin } = req.body;
  const state = loadState();
  const user = state.users.find((entry) => entry.id === userId && entry.pin === pin);
  if (!user) {
    res.status(401).json({ message: "Invalid PIN" });
    return;
  }
  res.json({ user });
});

app.get("/modules", (req, res) => {
  res.json({
    modules: ["POS", "Cashier", "Store", "Manager", "HR"],
    phase: "HIRALL POS v1"
  });
});

app.get("/users", (req, res) => {
  const state = loadState();
  res.json({ users: state.users });
});

app.post("/users", (req, res) => {
  const state = loadState();
  const context = getContext(req);
  const user = {
    id: createId("user"),
    name: req.body.name,
    role: req.body.role,
    pin: req.body.pin,
    branchId: req.body.branchId || context.branchId,
    active: true
  };
  state.users.push(user);
  recordAudit(state, { action: "create", entity: "user", entityId: user.id, meta: user }, context);
  recordChange(state, { action: "create", entity: "user", entityId: user.id, payload: user });
  saveState(state);
  res.status(201).json({ user });
});

app.get("/products", (req, res) => {
  const state = loadState();
  res.json({ products: state.products });
});

app.post("/products", (req, res) => {
  const state = loadState();
  const context = getContext(req);
  const product = {
    id: createId("product"),
    name: req.body.name,
    sku: req.body.sku || null,
    category: req.body.category || "General",
    unit: req.body.unit || "unit",
    costPrice: Number(req.body.costPrice || 0),
    sellingPrice: Number(req.body.sellingPrice || 0),
    trackStock: Boolean(req.body.trackStock !== false),
    reorderLevel: Number(req.body.reorderLevel || 0)
  };
  state.products.push(product);
  recordAudit(state, { action: "create", entity: "product", entityId: product.id, meta: product }, context);
  recordChange(state, { action: "create", entity: "product", entityId: product.id, payload: product });
  saveState(state);
  res.status(201).json({ product });
});

app.post("/inventory/movements", (req, res) => {
  const state = loadState();
  const context = getContext(req);
  const movement = {
    id: createId("movement"),
    type: req.body.type,
    reason: req.body.reason || null,
    supplier: req.body.supplier || null,
    reference: req.body.reference || null,
    items: req.body.items || [],
    createdAt: nowIso(),
    userId: context.userId,
    branchId: context.branchId,
    deviceId: context.deviceId
  };

  const trackableItems = movement.items.filter((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    return product?.trackStock;
  });

  if (["GRN", "TRANSFER_IN", "ADJUSTMENT_IN"].includes(movement.type)) {
    adjustStock(state, trackableItems, 1);
  } else if (["STOCK_OUT", "TRANSFER_OUT", "ADJUSTMENT_OUT"].includes(movement.type)) {
    adjustStock(state, trackableItems, -1);
  }

  state.inventoryLedger.push(movement);
  recordAudit(state, { action: "create", entity: "inventory", entityId: movement.id, meta: movement }, context);
  recordChange(state, { action: "create", entity: "inventory", entityId: movement.id, payload: movement });
  saveState(state);
  res.status(201).json({ movement });
});

app.get("/inventory/stock", (req, res) => {
  const state = loadState();
  const stock = state.products.map((product) => ({
    ...product,
    onHand: state.stockOnHand[product.id] || 0
  }));
  res.json({ stock });
});

app.post("/shifts/open", (req, res) => {
  const state = loadState();
  const context = getContext(req);
  const existing = getOpenShift(state, context.userId);
  if (existing) {
    res.status(400).json({ message: "Shift already open", shift: existing });
    return;
  }
  const shift = {
    id: createId("shift"),
    userId: context.userId,
    branchId: context.branchId,
    deviceId: context.deviceId,
    floatAmount: Number(req.body.floatAmount || 0),
    cashDrops: [],
    status: "open",
    openedAt: nowIso(),
    closedAt: null,
    countedCash: null,
    expectedCash: null,
    variance: null
  };
  state.shifts.push(shift);
  recordAudit(state, { action: "open", entity: "shift", entityId: shift.id, meta: shift }, context);
  recordChange(state, { action: "open", entity: "shift", entityId: shift.id, payload: shift });
  saveState(state);
  res.status(201).json({ shift });
});

app.post("/shifts/close", (req, res) => {
  const state = loadState();
  const context = getContext(req);
  const shift = getOpenShift(state, context.userId);
  if (!shift) {
    res.status(400).json({ message: "No open shift" });
    return;
  }
  const cashSales = state.sales
    .filter((sale) => sale.shiftId === shift.id && sale.status === "posted")
    .flatMap((sale) => sale.payments)
    .filter((payment) => payment.method === "cash")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const expectedCash = shift.floatAmount + cashSales;
  const countedCash = Number(req.body.countedCash || 0);
  const variance = countedCash - expectedCash;
  shift.status = "closed";
  shift.closedAt = nowIso();
  shift.countedCash = countedCash;
  shift.expectedCash = expectedCash;
  shift.variance = variance;
  recordAudit(state, { action: "close", entity: "shift", entityId: shift.id, meta: shift }, context);
  recordChange(state, { action: "close", entity: "shift", entityId: shift.id, payload: shift });
  saveState(state);
  res.json({ shift });
});

app.get("/cashier/summary", (req, res) => {
  const state = loadState();
  const context = getContext(req);
  const shift = getOpenShift(state, context.userId);
  const todaysSales = state.sales.filter((sale) => sale.userId === context.userId);
  const totals = todaysSales.reduce(
    (acc, sale) => {
      acc.total += sale.totals.total;
      acc.count += 1;
      sale.payments.forEach((payment) => {
        acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
      });
      return acc;
    },
    { total: 0, count: 0, cash: 0, mpesa: 0, card: 0 }
  );
  res.json({ shift, totals });
});

app.post("/sales", (req, res) => {
  const state = loadState();
  const context = getContext(req);
  const shift = getOpenShift(state, context.userId);
  if (!shift) {
    res.status(400).json({ message: "Open shift required" });
    return;
  }
  const items = req.body.items || [];
  const payments = req.body.payments || [];
  const totals = computeSaleTotals(items);
  const sale = {
    id: createId("sale"),
    receiptNumber: `RCPT-${Date.now()}`,
    orderNumber: `ORD-${Date.now()}`,
    status: "posted",
    items,
    payments,
    totals,
    createdAt: nowIso(),
    userId: context.userId,
    branchId: context.branchId,
    deviceId: context.deviceId,
    shiftId: shift.id
  };
  state.sales.push(sale);

  const trackableItems = items.filter((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    return product?.trackStock;
  });
  if (trackableItems.length > 0) {
    const movement = {
      id: createId("movement"),
      type: "SALE",
      reason: "Sale",
      items: trackableItems,
      createdAt: nowIso(),
      userId: context.userId,
      branchId: context.branchId,
      deviceId: context.deviceId,
      reference: sale.id
    };
    state.inventoryLedger.push(movement);
    adjustStock(state, trackableItems, -1);
  }

  recordAudit(state, { action: "create", entity: "sale", entityId: sale.id, meta: sale }, context);
  recordChange(state, { action: "create", entity: "sale", entityId: sale.id, payload: sale });
  saveState(state);
  res.status(201).json({ sale });
});

app.post("/sales/:saleId/void", (req, res) => {
  const state = loadState();
  const context = getContext(req);
  const sale = state.sales.find((entry) => entry.id === req.params.saleId);
  if (!sale) {
    res.status(404).json({ message: "Sale not found" });
    return;
  }
  if (sale.status !== "posted") {
    res.status(400).json({ message: "Sale already voided/refunded" });
    return;
  }
  const manager = requireManager(state, req.body.managerPin);
  sale.status = "voided";
  sale.voidedAt = nowIso();
  sale.voidedBy = manager.id;
  sale.voidReason = req.body.reason || "Void";

  const trackableItems = sale.items.filter((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    return product?.trackStock;
  });
  if (trackableItems.length > 0) {
    const movement = {
      id: createId("movement"),
      type: "VOID",
      reason: sale.voidReason,
      items: trackableItems,
      createdAt: nowIso(),
      userId: context.userId,
      branchId: context.branchId,
      deviceId: context.deviceId,
      reference: sale.id
    };
    state.inventoryLedger.push(movement);
    adjustStock(state, trackableItems, 1);
  }

  const refund = {
    id: createId("refund"),
    saleId: sale.id,
    type: "void",
    reason: sale.voidReason,
    approvedBy: manager.id,
    createdAt: nowIso()
  };
  state.refunds.push(refund);
  recordAudit(state, { action: "void", entity: "sale", entityId: sale.id, meta: refund }, context);
  recordChange(state, { action: "void", entity: "sale", entityId: sale.id, payload: refund });
  saveState(state);
  res.json({ sale, refund });
});

app.post("/sales/:saleId/refund", (req, res) => {
  const state = loadState();
  const context = getContext(req);
  const sale = state.sales.find((entry) => entry.id === req.params.saleId);
  if (!sale) {
    res.status(404).json({ message: "Sale not found" });
    return;
  }
  const manager = requireManager(state, req.body.managerPin);
  const refund = {
    id: createId("refund"),
    saleId: sale.id,
    type: "refund",
    reason: req.body.reason || "Refund",
    approvedBy: manager.id,
    createdAt: nowIso()
  };
  state.refunds.push(refund);

  const trackableItems = sale.items.filter((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    return product?.trackStock;
  });
  if (trackableItems.length > 0) {
    const movement = {
      id: createId("movement"),
      type: "REFUND",
      reason: refund.reason,
      items: trackableItems,
      createdAt: nowIso(),
      userId: context.userId,
      branchId: context.branchId,
      deviceId: context.deviceId,
      reference: sale.id
    };
    state.inventoryLedger.push(movement);
    adjustStock(state, trackableItems, 1);
  }

  recordAudit(state, { action: "refund", entity: "sale", entityId: sale.id, meta: refund }, context);
  recordChange(state, { action: "refund", entity: "sale", entityId: sale.id, payload: refund });
  saveState(state);
  res.json({ sale, refund });
});

app.get("/reports/sales", (req, res) => {
  const state = loadState();
  const salesByPayment = state.sales.reduce(
    (acc, sale) => {
      sale.payments.forEach((payment) => {
        acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
      });
      acc.total += sale.totals.total;
      return acc;
    },
    { total: 0 }
  );
  res.json({ sales: state.sales, totals: salesByPayment });
});

app.get("/reports/voids", (req, res) => {
  const state = loadState();
  res.json({ refunds: state.refunds });
});

app.get("/reports/inventory", (req, res) => {
  const state = loadState();
  const valuation = state.products.reduce((sum, product) => {
    const onHand = state.stockOnHand[product.id] || 0;
    return sum + onHand * product.costPrice;
  }, 0);
  res.json({ stockOnHand: state.stockOnHand, valuation, ledger: state.inventoryLedger });
});

app.get("/audit/logs", (req, res) => {
  const state = loadState();
  res.json({ auditLog: state.auditLog });
});

app.get("/sync/changes", (req, res) => {
  const state = loadState();
  const since = req.query.since;
  const changes = since
    ? state.changeLog.filter((entry) => entry.timestamp > since)
    : state.changeLog;
  res.json({ changes, latest: state.changeLog.at(-1)?.timestamp || null });
});

app.post("/sync/push", (req, res) => {
  const state = loadState();
  const incoming = req.body.changes || [];
  incoming.forEach((change) => {
    state.changeLog.push(change);
  });
  saveState(state);
  res.json({ received: incoming.length });
});

app.listen(port, () => {
  console.log(`HIRALL Node API listening on ${port}`);
});
