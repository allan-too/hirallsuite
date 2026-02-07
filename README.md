# HIRALL POS v1 MVP Specification

Locked Phase 1 scope for Food + Retail.

## 0) System-wide MVP Rules (Non-negotiables)

- Every action is tied to **user + timestamp + branch + device** (audit trail).
- No editing sales after posting; only **void/refund with approval**.
- Inventory changes only via **stock movement records** (no “typing new quantity”).
- Works with **offline local DB**, sync later (Phase 1 can be local-only if you want speed, but keep sync-ready design).

## 1) POS Module (Front Counter)

### 1.1 Sales Flow

- Product catalog (search + categories)
- Add to cart (qty, discount: item-level + order-level)
- Tax/VAT toggle per item (simple)
- Hold / resume sale
- Split payment (optional MVP; if too heavy, do single payment)
- Payment methods: Cash, M-Pesa, Card (card can be “manual entry” MVP)
- Post sale → generate:
  - Receipt number
  - Order number
  - Transaction record
- Print receipt (thermal printer support)

### 1.2 Returns / Voids (MVP-grade control)

- Void sale (same day) **requires Manager PIN/approval**
- Refund (creates negative transaction) with reason capture
- All void/refund actions logged and appear in audit reports

### 1.3 Cash Handling (Shift)

- Shift open (float amount)
- Cash drops (optional)
- Shift close:
  - Expected cash
  - Counted cash
  - Variance (over/short)
- Cashier cannot edit shift summary

## 2) Cashier Module (User Account + Operations)

### 2.1 Access & Permissions

**Cashier can:**

- Sell
- View own shift summary
- Reprint receipt (same day)
- Request void/refund (but cannot approve)

**Cashier cannot:**

- Edit prices
- Edit stock
- View full business reports
- Manage users

### 2.2 Cashier Dashboard (simple)

- Today sales total
- Transactions count
- Cash vs M-Pesa totals
- Over/short (at shift close)

## 3) Store Module (Inventory / Stock)

### 3.1 Product & Stock Setup (MVP)

- Create product (name, SKU/barcode optional, category, unit)
- Pricing:
  - Cost price
  - Selling price
- Trackable stock toggle:
  - Track stock = true (inventory item)
  - Track stock = false (services like “delivery fee”)

### 3.2 Stock Movements (core of store module)

You need these 4 movement types:

1. **GRN / Stock In (Receiving)**
   - Supplier
   - Invoice/Delivery note reference (optional MVP)
   - Items + quantities + unit cost
   - Date received
   - Updates on-hand quantity
   - Creates “stock ledger entry”

2. **Stock Out (Internal Use / Wastage / Damage)**
   - Reason: Wastage, Damage, Expired, Staff meal, Transfer out
   - Items + quantities
   - Approval required for large quantities (optional rule)

3. **Stock Adjustment (Correction)**
   - Only Manager can do
   - Must include reason + attachment (optional)
   - Logged heavily (auditors love this)

4. **Stock Transfer (Branch-to-Branch)**
   - If you support multi-branch in Phase 1:
     - Create transfer (outgoing)
     - Receive transfer (incoming)
   - If single-branch MVP: postpone transfers

### 3.3 Stock Views (MVP screens)

- Stock on hand list
- Low stock alerts (below reorder level)
- Expiry tracking (optional for food; mandatory later for pharmacy)
- Stock ledger per item (chronological movements)

## 4) Manager Module (Auditing + HR)

### 4A) Auditing / Control

#### 4A.1 Sales Audit

- Sales by day / cashier / payment method
- Voids & refunds report (with reasons)
- Discount report (who discounted, how much)
- “No-sale” events (cash drawer opened) (optional hardware integration; can skip MVP)

#### 4A.2 Cash Audit

- Shift reports per cashier
- Expected vs counted cash
- Over/short history
- Cash movement log (float, drops if used)

#### 4A.3 Inventory Audit

- Stock valuation summary (basic: sum(qty * cost))
- GRN history
- Adjustments report (most important)
- Wastage report

#### 4A.4 User Activity Logs

- Logins
- Price changes
- Role changes
- Stock edits
- Void/refund approvals

### 4B) HR (MVP-grade, not full HR)

#### 4B.1 Staff Records

- Add staff profile (name, phone, ID/Passport optional, role, branch)
- Employment status (active/inactive)
- Simple documents upload (optional)

#### 4B.2 Shifts / Attendance (Pick ONE for MVP)

**Option A (simplest): Clock in/out**

- Staff clock-in/out from POS device
- Late flag (based on shift schedule)

**Option B (more control): Shift scheduling**

- Create shift templates
- Assign staff to shifts
- Attendance vs schedule

For MVP, do **Option A**.

#### 4B.3 Permissions Admin

- Create users
- Assign roles
- Reset passwords / PIN

## 5) Minimum Data Objects

You’ll need these tables/entities:

- User
- Role / Permission
- Branch
- Product, Category
- InventoryLedger (movement records)
- Supplier
- Sale
- SaleItem
- Payment (cash/mpesa/card)
- Shift
- ShiftCashCount
- Refund/Void record
- StaffProfile (can be merged with User)
- Attendance (clock in/out)
- AuditLog (event log)

## 6) MVP “Done” Criteria

HIRALL POS v1 is sellable when:

- Cashier can sell + print receipts + close shift
- Stock increases only via GRN
- Sales reduce stock automatically
- Manager sees:
  - Sales totals
  - Cash vs M-Pesa
  - Over/short
  - Voids/discounts
  - Stock on hand + valuation
- Manager can add staff/users and view attendance
