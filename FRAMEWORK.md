# FactoryOS — Product Framework

**A factory coordination and ISO compliance system for a concrete admixture manufacturer.**
This document is the build plan. No code gets written that doesn't trace back to something here.

---

## 1. Vision

Today, a retiring manager is the human glue of the factory: she checks every department's
paper forms for ISO compliance, acts as internal auditor, coordinates orders between
operations / production / lab / drivers, and handles contract paperwork.

FactoryOS replaces the *checking* with **forms that cannot be submitted incomplete or
non-compliant**, and replaces the *coordinating* with **a shared live pipeline every
department sees**. On top sits an **owner dashboard** giving the boss her bird's-eye view:
stock levels, QC results, outgoing shipments, quality consistency, equipment failure rates.

> North star: when the manager retires, the factory runs on FactoryOS + the boss,
> not on a replacement hire.

---

## 2. The factory (context)

- **Product**: concrete admixtures — water reducers, foaming agents, retarders,
  accelerators, etc. **50+ distinct products**, grouped in families with different QC tests.
- **Departments**: Production · Lab (QC + R&D) · Operations (order intake, shipment
  coordination, receiving) · Engineering (2 staff, equipment maintenance) · 2 local
  delivery drivers (most deliveries via external logistics) · Accountant · Manager (retiring).
- **Orders** arrive mostly by phone; Operations records them.
- **QC chain**: every batch is tested at three stages — pot test → tank test (after
  transfer to storage tanks) → pumping-point test (during truck loading). The lab also
  QC-tests incoming raw materials.
- **Paper**: every department has ISO-corresponding paper forms today. Paper and digital
  will run **in parallel for a while**; digital views must be printable.
- **Language**: English and Chinese, switchable at any time by any user.
- **Batch numbering**: an existing scheme is in use — the app adopts it, never invents its own.

---

## 3. Users & roles

| Role | Primary device | What they see / do |
|---|---|---|
| **Owner (boss)** | Desktop + phone | Everything. Dashboard, all records, all reports. Approvals. |
| **Operations** | Desktop | Order intake, shipment scheduling, receiving, stock overview. |
| **Production** | iPad at station | Today's production queue, batch records, pot handoff to lab. |
| **Lab** | iPad in lab | Test queue (pots, tanks, pumping, incoming materials), pass/fail entry, R&D notes. |
| **Engineering** | iPad / phone | Equipment list, maintenance log, repair work orders. |
| **Drivers** | Phone | Today's deliveries, delivery confirmation (signature/photo). |
| **Accountant** | Desktop | Read access to orders/shipments; export for tax paperwork. |
| **Auditor (external)** | Browser, temporary | Read-only access to compliance records, time-limited. |

**Principles**
- Each role lands on *their* home screen — an operator's iPad shows 2–3 big actions,
  never a 10-item menu.
- Permissions are enforced in the backend (not just hidden buttons).
- Every record stores *who* and *when* automatically — that is half of ISO evidence.

---

## 4. Core concepts (data model)

```
Customer ──< Order ──< OrderLine (product, qty) ──< Shipment ──< Delivery (driver or external)
Product (50+, belongs to a ProductFamily; family defines which QC tests apply)
RawMaterial ──< IncomingLot (supplier, qty, QC status) ──< StockLevel
Batch (existing numbering; product, pots, links to IncomingLots used)
  └─< QCTest (stage: pot | tank | pumping | incoming; parameters per test template)
Tank (holds released product; current level; links to source batches)
Equipment ──< MaintenanceRecord (repair | preventive; downtime)
Document (ISO docs, versioned)   Audit ──< Finding ──< CAPA   NonConformance
User (role, language preference)  AuditTrail (every create/edit, automatic)
```

**Key design decisions**

1. **Test templates per product family.** Foaming agents and water reducers need different
   parameters (density, flowability, solids content, pH, foam stability…). Templates are
   *configurable data*, not code — the lab can adjust parameter sets and pass ranges
   without a developer.
2. **The batch is the traceability spine.** From a customer complaint you walk:
   Delivery → Shipment → Tank → Batch(es) → pot tests + raw material lots. Every link
   above is a real database relation, so this walk is one click, not an afternoon of
   paper-digging.
3. **Failed test blocks the next step.** A pot that failed can't transfer to a tank in
   the app; a tank without a passing test can't be selected for loading. Overrides
   exist but require owner-level approval and leave a visible trail (that's a feature,
   not a bug — it's exactly what an auditor wants to see).
4. **Stock moves automatically.** Accepted incoming lot → raw material stock up.
   Batch produced → materials consumed down, product stock up. Truck loaded → product
   stock down. Nobody "does stocktaking" in the app; the numbers fall out of the workflow.

---

## 5. The five workflows

### W1 — Order to delivery (the pipeline)
```
DRAFT → CONFIRMED → IN PRODUCTION → QC RELEASED → SCHEDULED → OUT FOR DELIVERY → DELIVERED
```
- Operations takes a phone call, fills: customer, product(s), quantity, requested date. Done.
- Production sees a queue ordered by ship date. Lab sees what's coming.
- Every department updates its own step; everyone sees the whole pipeline.
- The owner dashboard shows the pipeline as a board (like columns of cards).

### W2 — Batch quality chain
```
Batch created (production) → POT TEST (lab) → transfer to TANK → TANK TEST (lab)
→ available for loading → PUMPING TEST at truck → shipment released
```
- Each stage is a form pre-filled with the right test template for that product family.
- Pass/fail is computed from entered values vs. template ranges — the lab enters numbers,
  the app decides compliance.
- Fail → automatic NonConformance record opens; rework or disposal is documented on it.

### W3 — Incoming materials QC
```
Delivery arrives (operations logs it) → lab test queue → PASS: lot enters stock
                                                       → FAIL: NC opens, supplier return documented
```

### W4 — Equipment maintenance
- Engineering logs repairs (what broke, downtime, parts) and scheduled preventive tasks.
- Recurring preventive schedules generate due-tasks automatically.
- Failure rate / downtime per machine appears on the owner dashboard with zero extra work.

### W5 — Compliance loop
- Audits (internal/external) create findings; findings create CAPAs; CAPAs have owners
  and due dates and nag until closed.
- Documents (SOPs, work instructions) are versioned; only current version visible to floor.
- **Everything above doubles as ISO evidence** — the audit trail, the blocked-step
  overrides, the QC records. The separate "compliance module" is thin because
  compliance is built into the workflows.

---

## 6. Screens (module map)

| Screen | Who | Replaces current page |
|---|---|---|
| **Owner Dashboard** — stock, pipeline, QC trend, equipment health, alerts | Owner | Dashboard (rebuilt) |
| **Orders board** — pipeline columns, order entry | Operations, Owner | new |
| **Production queue** — today's batches, batch record form | Production | Production (rebuilt) |
| **Lab bench** — test queues (pot/tank/pumping/incoming), test entry, templates | Lab | DataCollection (rebuilt) |
| **Stock** — raw materials & finished product, tank levels | Operations, Owner | new |
| **Shipments** — schedule, driver assignment, external logistics, delivery confirm | Operations, Drivers | new |
| **Equipment** — machine list, maintenance log, preventive schedule | Engineering | Equipment (kept, extended) |
| **Quality** — NCs, CAPAs, trends | Lab, Owner | NonConformances + CAPA (merged) |
| **Audits** — checklists, findings | Owner, Auditor | Audits (kept) |
| **Documents** — versioned SOPs | all (read), Owner (write) | DocumentControl (kept) |
| **Reports** — printable/exportable: batch certificate, monthly summaries, tax export | Owner, Accountant | Reports (rebuilt) |
| **Settings** — users, roles, products, test templates, language | Owner | Settings (extended) |

---

## 7. Design principles

1. **Compliance by construction** — required fields, computed pass/fail, automatic
   who/when. If it submitted, it's compliant.
2. **Bilingual always** — every label via i18n (EN/中文), switchable per-user at any
   moment, including on printed forms. No hardcoded strings, ever.
3. **Touch-first on the floor** — big targets, number pads for measurements, minimal
   typing; photos as evidence where useful.
4. **Printable** — every record has a clean print view that resembles the current paper
   form, so the parallel-paper period and auditors are served.
5. **The app adopts factory reality** — existing batch numbers, existing form layouts,
   existing test names. Staff should recognize their world, not learn a new one.
6. **One source of truth** — a fact is entered once, by the department that owns it,
   and flows everywhere else.

---

## 8. Technical architecture

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind (existing) | Already built and working |
| Mobile | PWA + Capacitor iOS (existing) | Already set up for iPad |
| i18n | react-i18next, EN + zh-CN resource files | Switchable at runtime |
| Backend | **Supabase** (Postgres + Auth + Realtime + Storage) | User accounts, row-level security per role, live sync between devices, file storage for photos/certificates; generous free tier, ~$25/mo when outgrown |
| Offline | Phase-2 concern: queue writes locally, sync on reconnect | Factory Wi-Fi dead zones |
| Print/PDF | Browser print CSS per record type | Parallel paper period |

**Why Supabase over building our own server:** authentication, per-role data rules,
and live updates come out of the box; we write no server code to maintain. The schema
in §4 maps directly to Postgres tables.

---

## 9. Build phases

Each phase ships something the factory actually uses. No phase starts until the
previous one is in daily use — real usage will correct the plan.

**Phase 1 — Foundation + Orders pipeline** *(the coordination win)*
Supabase setup, login with roles, i18n scaffolding (EN/ZH), product catalog import,
Orders board (W1), role-based home screens. → *Operations stops writing orders on paper;
everyone sees the pipeline.*

**Phase 2 — Batch & QC chain** *(the traceability win)*
Batch records with existing numbering, test templates per product family, three-stage
QC (W2), incoming materials QC (W3), automatic stock levels, NC auto-creation on fail,
print views for batch/test records. → *The lab and production run on iPads; full
batch traceability exists.*

**Phase 3 — Logistics + Equipment**
Shipments and driver app (delivery confirmation), external logistics tracking,
equipment maintenance module (W4), preventive schedules. → *Drivers confirm deliveries
on phones; equipment history accumulates.*

**Phase 4 — Owner dashboard + Compliance**
Full owner dashboard (stock, QC consistency trends, failure rates, pipeline health,
alerts), audits/CAPA workflow (W5), document control, auditor access, accountant
exports. → *The manager's oversight job is now a screen.*

---

## 10. Open items (decide later, not blockers)

- Exact test parameter lists per product family — lab provides when building Phase 2
  templates (the system is configurable, so this is data entry, not design).
- Customer-facing artifacts (delivery notes, certificates of analysis) — formats to be
  copied from current paper versions.
- Offline behavior depth (view-only cache vs. full offline entry).
- Whether R&D (lab's second hat) gets its own experiments module later.
- Data migration: how much history (if any) to type in from paper.
