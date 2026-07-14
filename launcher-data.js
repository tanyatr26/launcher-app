/* PM Office — launcher data (plain JS; sets window globals)
   ENTITY ALIGNMENT (2026-07-10): every commercial entity here — app names,
   pricing shapes, tiers, bundles, org/account names — mirrors the Ops Portal's
   catalog and account fixtures (ops-portal app-catalog/catalog-data.ts and
   accounts/data.ts). The catalog is ops-owned and single-source (docs:
   04 · App Catalog); the launcher renders it and authors none of it. */
(function () {
  // Gradient tiles for app icons
  const GRAD = {
    amber:  "linear-gradient(140deg,#fbbf24,#f59e0b)",
    orange: "linear-gradient(140deg,#fb923c,#f97316)",
    coral:  "linear-gradient(140deg,#fb7185,#ef4444)",
    green:  "linear-gradient(140deg,#34d399,#059669)",
    teal:   "linear-gradient(140deg,#2dd4bf,#0d9488)",
    forest: "linear-gradient(140deg,#10b981,#065f46)",
    purple: "linear-gradient(140deg,#a78bfa,#7c3aed)",
    blue:   "linear-gradient(140deg,#60a5fa,#2563eb)",
    slate:  "linear-gradient(140deg,#94a3b8,#475569)",
    gold:   "linear-gradient(140deg,#fcd34d,#d97706)",
  };

  // Single hue per tile (drives the frosted-glass icon tiles via --th)
  const GRAD_HUE = {
    amber: "#f59e0b", orange: "#f97316", coral: "#f43f5e", green: "#10b981",
    teal: "#14b8a6", forest: "#10b981", purple: "#8b5cf6", blue: "#3b82f6",
    slate: "#64748b", gold: "#d97706",
  };

  const CATEGORIES = [
    { key: "payroll",   label: "Payroll & Taxes", dot: "#ef4444" },
    { key: "claims",    label: "Claims",          dot: "#475569" },
    { key: "people",    label: "People & HR",     dot: "#f59e0b" },
    { key: "admin",     label: "Admin",           dot: "#7c3aed" },
    { key: "documents", label: "Documents",       dot: "#2563eb" },
    { key: "finance",   label: "Finance",         dot: "#0d9488" },
  ];

  /* The COMMERCIAL CATALOG — the ops-owned 9-app world (+ the catalog
     bundles below). Used by the rep package builder and Explore; the launcher
     never invents an app outside it. `negotiated` mirrors the ops catalog's
     resolution mode (admin-negotiated vs self-serve). */
  const CATALOG = [
    { id: "payroll", name: "Payroll", cat: "payroll", icon: "run", grad: "coral", negotiated: true,
      desc: "Process and submit payroll for the upcoming pay period." },
    { id: "claims", name: "Claims", cat: "claims", icon: "claims", grad: "slate", negotiated: true,
      desc: "Manage workers' compensation claims end to end." },
    { id: "billing", name: "Billing", cat: "finance", icon: "receipt", grad: "green", negotiated: true,
      desc: "Invoice and bill your own customers." },
    { id: "hr", name: "HR", cat: "people", icon: "shield-user", grad: "amber", negotiated: true,
      desc: "Manage employee records, onboarding and HR workflows." },
    { id: "time-attendance", name: "Time & Attendance", cat: "people", icon: "calendar", grad: "blue",
      desc: "Track hours, shifts, PTO and approvals across teams." },
    { id: "check-printing", name: "Check Printing", cat: "payroll", icon: "printer", grad: "purple",
      desc: "Print, distribute and track employee payroll checks." },
    { id: "spreadsheet-transformer", name: "Spreadsheet Transformer", cat: "documents", icon: "upload", grad: "gold",
      desc: "Turn messy spreadsheets into clean, structured data automatically." },
    { id: "mailroom", name: "Mailroom", cat: "documents", icon: "doc", grad: "forest",
      desc: "Digitize, route and track incoming physical mail across your team." },
    { id: "customer-configuration", name: "Customer Configuration", cat: "admin", icon: "briefcase", grad: "slate",
      desc: "Configure customer accounts, settings and preferences." },
  ];

  /* The signed-in user's granted apps (org: Bayside Office Temps).
     PRE-FLOW GATING (user decision 2026-07-13): the demo starts with NO
     payroll-associated or claims apps — Payroll, Customer Configuration,
     Check Printing, Billing and Claims appear ONLY after the Payroll Suite /
     Claims Management intake → terms → accept-and-pay flow completes. Until
     then Bayside holds HR + Spreadsheet Transformer plus the platform apps. */
  const APPS = [
    { id: "hr",            name: "HR",            cat: "people",    icon: "shield-user", grad: "amber",
      desc: "Manage employee records, onboarding and HR workflows.", used: "1 hour ago", usedRank: 5, isNew: 0, pinned: true, featured: true },
    { id: "spreadsheet-transformer", name: "Spreadsheet Transformer", cat: "documents", icon: "upload", grad: "gold",
      desc: "Turn messy spreadsheets into clean, structured data automatically.", used: "Just now", usedRank: 6, isNew: 0, pinned: true, featured: false },
    { id: "user-management", name: "User Management", cat: "admin", icon: "users-cog", grad: "coral", platform: true,
      desc: "Create and manage all of your users from one dashboard.", used: null, usedRank: 0, isNew: 2, pinned: false, featured: true },
    /* Granted-like-User-Management work app: governed by standard grants, launches in a new tab.
       repPortal drives the in-app rep-status check (apply -> ops, or open dashboard). Never a subscription. */
    { id: "sales-rep-portal", name: "Sales Rep Portal", cat: "admin", icon: "groups", grad: "teal", platform: true,
      desc: "Apply to the Sales Reps program, then manage your pipeline, leads and commissions.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, repPortal: true, newTab: true },
  ];

  // Access requests (mock) for the Requests view — apps are catalog apps only.
  const REQUESTS = {
    incoming: [
      { id: "i1", requester: "Marcus Lee",      initials: "ML", grad: "blue",   app: "HR",                     time: "2 hours ago" },
      { id: "i2", requester: "Dana Whitfield",  initials: "DW", grad: "purple", app: "Spreadsheet Transformer", time: "Yesterday" },
      { id: "i3", requester: "Priya Nair",      initials: "PN", grad: "teal",   app: "HR",                     time: "3 days ago" },
      { id: "i4", type: "capacity", capacity: "seats", requester: "Jordan Reyes", initials: "JR", grad: "amber", app: "Mailroom", time: "4 hours ago", delta: "18/18 seats used · +3 requested" },
      /* Mirrors the ops-side HR tier ladder: Tier 2 $600 → Tier 3 $1,100 (+$500/mo). */
      { id: "i5", type: "capacity", capacity: "tier", requester: "System", icon: "shield", grad: "slate", app: "HR", time: "Yesterday", delta: "Tier 2 → Tier 3 · +$500/mo" },
    ],
    sent: [
      /* A pending request for the Claims Management BUNDLE (Claims + Customer
         Configuration — workers' comp), routed to ops like any negotiated item. */
      { id: "s1", app: "Claims Management",  icon: "claims",   grad: "slate",  to: "Platform Operations", status: "pending",  time: "1 hour ago" },
      { id: "s2", app: "Time & Attendance",  icon: "calendar", grad: "blue",   to: "Alex Romero",         status: "accepted", time: "2 days ago" },
      /* The Payroll Suite request row is created LIVE by the acquisition flow
         (Explore → Request Access → intake) — see SUITE_INTAKE / SUITE_DEAL. */
      /* Seeded so the accepted state of an ops-resolved rep_application is visible alongside a fresh pending one. */
      { id: "s4", kind: "rep_application", app: "Sales Rep Portal", icon: "groups", grad: "teal", to: "Platform Operations", status: "accepted", time: "Last week" },
    ],
  };

  /* The org's payment-method WALLET (docs 02 · Subscriptions): "automated
     methods (cards, ACH) captured through the payment processor … Methods can
     be added, edited, and reassigned." Check/wire rides the manual path and
     is offered at the point of payment, not stored here. */
  const WALLET = [
    { id: "visa-4242", kind: "card", glyph: "receipt", name: "Visa", num: "4242", sub: "Expires 09 / 27" },
    { id: "ach-6789", kind: "ach", glyph: "bank", name: "ACH", num: "6789", sub: "Chase business checking" },
  ];

  /* ---- Demo personas (user decision 2026-07-13) ----
     Two views of the SAME org, split by SUBSCRIPTION AUTHORITY — the docs'
     action matrix differs by it, and a non-holder's request ESCALATES up the
     invite chain to the first resolver instead of going to ops.
     Owner = Lena Strand: Bayside's owner and the requester ops shows on
     REQ-1042 / REQ-1033 (authority "held by the owner by default").
     Standard user = Ophelia Crosby: a scoped Payroll Specialist, no authority. */
  const PERSONAS = {
    owner: { key: "owner", name: "Lena Strand", initials: "LS", email: "lena.strand@baysidetemps.com",
      role: "Owner · subscription authority", hasSubscriptions: true, resolver: true,
      avatarGrad: "linear-gradient(140deg,#2dd4bf,#0d9488)" },
    member: { key: "member", name: "Ophelia Crosby", initials: "OC", email: "ophelia.crosby@baysidetemps.com",
      role: "Payroll Specialist", hasSubscriptions: false, resolver: false,
      avatarGrad: "linear-gradient(140deg,#f59e0b,#c2410c)" },
  };

  // Organizations this user belongs to — all real Ops Portal accounts.
  // Pinnacle Per Diem and Anchor Maritime Crews are included so the suspended /
  // offboarded renderings are reachable via the org switcher (docs: one
  // identity can belong to many organizations; switching triggers a full
  // re-resolution).
  const ORGS = ["Bayside Office Temps", "Cardinal Healthcare Staffing", "TalentBridge Solutions", "BlueOak Labor Partners", "Pinnacle Per Diem", "Anchor Maritime Crews"];
  // Per-org app totals (mock) shown in the greeting subtitle
  const ORG_APP_COUNTS = {
    "Bayside Office Temps": 10,
    "Cardinal Healthcare Staffing": 14,
    "TalentBridge Solutions": 8,
    "BlueOak Labor Partners": 9,
    "Pinnacle Per Diem": 2,
    "Anchor Maritime Crews": 0,
  };

  /* Account state per org — the mock's stand-in for the BFF's account_state
     signal (pending_activation | active | suspended | offboarded). The states
     mirror the Ops Portal's Accounts screen exactly: Pinnacle Per Diem is
     Suspended, Anchor Maritime Crews is Offboarded. The lifecycle is OPS-OWNED
     (suspension and its lift are manual ops actions) — the launcher only
     renders the state, never changes it. */
  const ORG_STATES = {
    "Bayside Office Temps": "active",
    "Cardinal Healthcare Staffing": "active",
    "TalentBridge Solutions": "active",
    "BlueOak Labor Partners": "active",
    "Pinnacle Per Diem": "suspended",
    "Anchor Maritime Crews": "offboarded",
  };

  /* Suspended-org billing — the billing-fix surface the suspension gate points
     to ("Subscriptions stays reachable so a billing cause can be fixed").
     Items and the failed invoice mirror the ops fixtures for the org:
     Pinnacle's Time & Attendance (Tier 1 · $600/mo) and Check Printing
     (Tier 1 · $150/mo) renewals failed Apr 18; failed invoice INV-9075 on
     Visa ···· 4471. */
  const SUSPENDED_BILLING = {
    "Pinnacle Per Diem": {
      reason: "Time & Attendance charge declined — the balance is unresolved",
      items: [
        { id: "time-attendance", name: "Time & Attendance", icon: "calendar", grad: "blue", pricing: "tier",
          tier: "Tier 1", band: "up to 100 users", total: "$600 / month", renew: "Renewal failed Apr 18", pay: "Visa ···· 4471" },
        { id: "check-printing", name: "Check Printing", icon: "printer", grad: "purple", pricing: "tier",
          tier: "Tier 1", band: "up to 500 checks / mo", total: "$150 / month", renew: "Renewal failed Apr 18", pay: "Visa ···· 4471" },
      ],
      invoices: [
        { date: "Apr 18, 2026", amount: "$600", item: "Time & Attendance", ref: "INV-9075", status: "Failed" },
      ],
    },
  };

  // Explore All Apps — three state-based groups (id used for stable keys).
  // Mirrors the BFF app states: available / licensed_not_granted / not_licensed.
  const EXPLORE_GROUPS = [
    {
      key: "available",
      title: "Available to you",
      sub: "Licensed by your organization and granted to your account.",
      action: "launch",
      apps: [
        { id: "x-user-management", name: "User Management", cat: "admin", icon: "users-cog", grad: "coral",
          desc: "Create and manage all of your users from one dashboard." },
        { id: "x-sales-rep-portal", name: "Sales Rep Portal", cat: "admin", icon: "groups", grad: "teal",
          desc: "Apply to the Sales Reps program, then manage your pipeline, leads and commissions.", repPortal: true, newTab: true },
        { id: "x-hr", name: "HR", cat: "people", icon: "shield-user", grad: "amber",
          desc: "Manage employee records, onboarding and HR workflows." },
        { id: "x-spreadsheet-transformer", name: "Spreadsheet Transformer", cat: "documents", icon: "upload", grad: "gold",
          desc: "Turn messy spreadsheets into clean, structured data automatically." },
      ],
    },
    {
      key: "company",
      title: "Available at your company",
      sub: "Licensed by your organization — you don’t have access yet.",
      action: "request",
      helper: "Your company has this — request access from your admin.",
      apps: [
        { id: "x-time-attendance", name: "Time & Attendance", cat: "people", icon: "calendar", grad: "blue",
          desc: "Track hours, shifts, PTO and approvals across teams." },
        { id: "x-mailroom", name: "Mailroom", cat: "documents", icon: "doc", grad: "forest",
          desc: "Digitize, route and track incoming physical mail across your team." },
      ],
    },
    {
      key: "expand",
      title: "Expand your platform",
      sub: "Not yet part of your plan — request, demo or add them.",
      action: "sales",
      apps: [
        /* Admin-negotiated catalog BUNDLES: acquisition is a licensing request
           routed to Platform Operations (never self-serve Subscribe). Their
           member apps appear nowhere else until a flow completes. */
        { id: "x-payroll-suite", name: "Payroll Suite", cat: "payroll", icon: "bank", grad: "forest", negotiated: true, bundle: true,
          desc: "Payroll, Customer Configuration, Check Printing and Billing — the payroll operation, licensed and priced as one." },
        { id: "x-claims-mgmt", name: "Claims Management", cat: "claims", icon: "claims", grad: "slate", negotiated: true, bundle: true,
          desc: "Claims (workers' compensation) and Customer Configuration, licensed and priced as one." },
      ],
    },
  ];

  /* ---- Payroll Suite acquisition (new app/bundle on a LIVE account) ----
     The launcher half of ops REQ-1042 (Bayside Office Temps · Payroll Suite ·
     new-app · admin-negotiated). Request Access opens the intake below; the
     request rides the Access Requests ledger (Pending → Terms ready →
     Accepted); issued terms surface as a pending-deal card in Subscriptions;
     and NOTHING the suite grants activates until accept-and-pay clears. */

  // App-aware intake (04 · App Catalog): the qualifying questions ops authored
  // for the bundle — answers return to the waiting request in the ops queue.
  const SUITE_INTAKE = {
    name: "Payroll Suite",
    fields: [
      { k: "components", label: "Bundle requested", fixed: "Payroll Suite — Payroll · Customer Configuration · Check Printing · Billing" },
      { k: "employees", label: "Employees paid per run", ph: "e.g. 240" },
      { k: "checks", label: "Checks printed per month", ph: "e.g. 350" },
      { k: "states", label: "States operated in", ph: "e.g. TX, OK, NM" },
      { k: "reason", label: "What are you consolidating?", ph: "e.g. the whole payroll operation with one vendor" },
    ],
  };

  // The ops-issued deal the pending-deal card renders once terms come back —
  // the acceptance rendering contract (02 · Subscriptions): lines by shape ·
  // payment term · agreement prose · owed-invoice preview. Price = the ops
  // catalog bundle ($850/mo).
  const SUITE_DEAL = {
    id: "payroll-suite", name: "Payroll Suite", icon: "bank", grad: "forest",
    includes: "Payroll, Customer Configuration, Check Printing, Billing",
    total: "$850 / month", amountDue: "$850",
    paymentTerm: "Due at acceptance — $850. Full first charge; your anniversary billing cycle starts today.",
    invoice: "Invoice at acceptance · $850 · Owed until paid",
    agreement: [
      "Payroll Suite — Payroll, Customer Configuration, Check Printing and Billing, licensed together as one bundle line at $850/month. The bundle is priced as a single item; its component apps are licensed only as part of it and activate together at acceptance.",
      "Charges bill monthly. $850 is due at acceptance — the full first charge; the anniversary billing cycle starts today. Terms take effect immediately.",
      "Payment may be made by an automated method on file (card or ACH, captured through the payment processor) or by check or wire, invoiced and reconciled by PM Office on receipt. Access to the suite's apps opens once the due-at-acceptance amount clears.",
      "Drafted by PM Office from the composed terms and reviewed before issue. This agreement is binding only on acceptance here in the launcher.",
    ],
  };

  // Recent chat threads (mock) shown in the sidebar
  const RECENTS = [
    { id: "rc1", title: "Onboarding a new hire",       time: "2h ago",    prompt: "Onboard a new hire" },
    { id: "rc2", title: "Reviewing employee records",  time: "Yesterday", prompt: "Review employee records" },
    { id: "rc3", title: "Cleaning a rate sheet",       time: "3d ago",    prompt: "Clean up this spreadsheet" },
  ];

  // Focused daily-use set shown in the "Your Apps" view — the PRE-FLOW state
  // (no payroll/claims apps until a suite flow completes; see APPS note).
  const HOME_APPS = [
    { id: "h-user-management", name: "User Management", cat: "admin", icon: "users-cog", grad: "coral",
      desc: "Create and manage all of your users from one dashboard.", used: null, usedRank: 0, isNew: 0, pinned: true },
    { id: "h-sales-rep-portal", name: "Sales Rep Portal", cat: "admin", icon: "groups", grad: "teal",
      desc: "Apply to the Sales Reps program, then manage your pipeline, leads and commissions.", used: null, usedRank: 0, isNew: 0, pinned: true, repPortal: true, newTab: true },
    { id: "h-hr", name: "HR", cat: "people", icon: "shield-user", grad: "amber",
      desc: "Manage employee records, onboarding and HR workflows.", used: "1 hour ago", usedRank: 5, isNew: 0, pinned: false },
    { id: "h-spreadsheet-transformer", name: "Spreadsheet Transformer", cat: "documents", icon: "upload", grad: "gold",
      desc: "Turn messy spreadsheets into clean, structured data automatically.", used: "Just now", usedRank: 6, isNew: 0, pinned: false },
  ];

  // AI routing intents: chip label -> { line, match(app) }
  const SUGGESTIONS = [
    { label: "Onboard a new hire",    q: "onboard",     cats: ["people"], ids: ["hr", "user-management"] },
    { label: "Review employee records", q: "record",    ids: ["hr"] },
    { label: "Clean up a spreadsheet", q: "spreadsheet", ids: ["spreadsheet-transformer"] },
    { label: "See what's new",        q: "new",         filter: "new" },
  ];

  // Notifications (mock) grouped by source app — pre-flow sources only.
  const NOTIFICATIONS = [
    { group: "Requests", icon: "users-cog", grad: "coral", items: [
      { id: "n1", msg: "Marcus Lee requested access to HR", time: "2h ago", unread: true },
      { id: "n2", msg: "Dana Whitfield requested access to Spreadsheet Transformer", time: "5h ago", unread: true },
    ]},
    { group: "Mailroom", icon: "doc", grad: "forest", items: [
      { id: "n3", msg: "14 new mail items digitized and routed", time: "1h ago", unread: true },
      { id: "n4", msg: "Batch forwarded to accounts payable", time: "Yesterday", unread: false },
    ]},
    { group: "HR", icon: "shield-user", grad: "amber", items: [
      { id: "n5", msg: "3 employee records need review", time: "3h ago", unread: true },
      { id: "n6", msg: "Open enrollment closes Friday", time: "2d ago", unread: false },
    ]},
  ];

  /* ---- Sales Rep Portal: catalog bundles, packages, earnings (mock store) ---- */

  // Bundles available to package for a prospect — the ops catalog's two
  // bundles (Payroll Suite, HR Suite), composed of catalog app ids.
  const BUNDLES = [
    { id: "payroll-suite", name: "Payroll Suite", icon: "bank", grad: "forest",
      desc: "Payroll, Customer Configuration, Check Printing and Billing.", apps: ["payroll", "customer-configuration", "check-printing", "billing"] },
    { id: "claims-management", name: "Claims Management", icon: "claims", grad: "slate",
      desc: "Claims (workers' comp) and Customer Configuration.", apps: ["claims", "customer-configuration"] },
    { id: "hr-suite", name: "HR Suite", icon: "shield-user", grad: "amber",
      desc: "HR and Time & Attendance.", apps: ["hr", "time-attendance"] },
  ];

  // Rep packages (one store). Each selection item is a "line"; a bundle is a single line.
  // thread = the per-line commission offer<->counter rounds (rep view of the ops thread).
  // Two independent axes per package: `status` = the DEAL axis (submitted -> approved ->
  // invited -> signedup -> live, + declined/expired); the COMMISSION axis (offered -> in
  // negotiation -> settled) is DERIVED from settled/thread. `bill` = the prospect's committed
  // price, observed/derived from ops (read-only). Commission is initial% + recurring% only (no term).
  // Selections and bills track the ops catalog (bundle prices, tier entry prices).
  const REP_PACKAGES = [
    // Approved · In negotiation
    { id: "pkg-1", code: "BRIGHTBK-204", status: "approved", note: "",
      prospect: { name: "Bright Books LLC", company: "Bright Books", email: "ap@brightbooks.co" },
      selection: [{ id: "payroll-suite", name: "Payroll Suite", icon: "bank", grad: "forest", bundle: true }],
      bill: "$850 / mo", settled: false, settledBy: null,
      thread: [
        { by: "ops", at: "Tue 10:02", justification: "Opening offer — standard rate for the Payroll Suite line.",
          lines: [{ id: "payroll-suite", name: "Payroll Suite", initial: "12%", recurring: "10%" }] },
        { by: "rep", at: "Tue 11:20", justification: "Multi-entity account I sourced directly — requesting a higher recurring rate.",
          lines: [{ id: "payroll-suite", name: "Payroll Suite", initial: "12%", recurring: "14%" }] },
        { by: "ops", at: "Tue 14:05", justification: "Can meet partway on the recurring rate.",
          lines: [{ id: "payroll-suite", name: "Payroll Suite", initial: "12%", recurring: "12%" }] },
      ] },
    // Invited · Settled
    { id: "pkg-2", code: "HARBOR-118", status: "invited", note: "",
      prospect: { name: "Harbor Staffing Group", company: "Harbor Staffing", email: "ops@harborstaffing.com" },
      selection: [{ id: "hr", name: "HR", icon: "shield-user", grad: "amber", bundle: false },
                  { id: "time-attendance", name: "Time & Attendance", icon: "calendar", grad: "blue", bundle: false }],
      bill: "$900 / mo", settled: true, settledBy: "ops",
      thread: [
        { by: "rep", at: "Mon 09:15", justification: "Proposing rates up front — long-standing client of mine.",
          lines: [{ id: "hr", name: "HR", initial: "10%", recurring: "8%" },
                  { id: "time-attendance", name: "Time & Attendance", initial: "10%", recurring: "8%" }] },
        { by: "ops", at: "Mon 13:40", justification: "Agreed to your proposed rates.",
          lines: [{ id: "hr", name: "HR", initial: "10%", recurring: "8%" },
                  { id: "time-attendance", name: "Time & Attendance", initial: "10%", recurring: "8%" }] },
      ] },
    // Signed up · Settled
    { id: "pkg-3", code: "MERIDIAN-091", status: "signedup", note: "",
      prospect: { name: "Meridian Clinics", company: "Meridian", email: "billing@meridianclinics.com" },
      selection: [{ id: "check-printing", name: "Check Printing", icon: "printer", grad: "purple", bundle: false }],
      bill: "$350 / mo", settled: true, settledBy: "rep",
      thread: [
        { by: "ops", at: "Last week", justification: "Opening offer for Check Printing.",
          lines: [{ id: "check-printing", name: "Check Printing", initial: "12%", recurring: "10%" }] },
      ] },
    // Live · Settled
    { id: "pkg-4", code: "CEDAR-066", status: "live", note: "",
      prospect: { name: "Cedar & Co Accountants", company: "Cedar & Co", email: "ap@cedarco.com" },
      selection: [{ id: "spreadsheet-transformer", name: "Spreadsheet Transformer", icon: "upload", grad: "gold", bundle: false }],
      bill: "$250 / mo", settled: true, settledBy: "rep",
      thread: [
        { by: "ops", at: "3 weeks ago", justification: "Opening offer for Spreadsheet Transformer.",
          lines: [{ id: "spreadsheet-transformer", name: "Spreadsheet Transformer", initial: "12%", recurring: "10%" }] },
      ] },
    // Declined (no commission)
    { id: "pkg-5", code: "QUICKTMP-077", status: "declined", note: "",
      prospect: { name: "Quick Temp Inc.", company: "Quick Temp", email: "hr@quicktemp.io" },
      selection: [{ id: "mailroom", name: "Mailroom", icon: "doc", grad: "forest", bundle: false }],
      bill: null, settled: false, settledBy: null, thread: [] },
    // Expired (no commission)
    { id: "pkg-6", code: "LATERAL-031", status: "expired", note: "",
      prospect: { name: "Lateral Mfg", company: "Lateral Manufacturing", email: "it@lateralmfg.com" },
      selection: [{ id: "time-attendance", name: "Time & Attendance", icon: "calendar", grad: "blue", bundle: false }],
      bill: null, settled: false, settledBy: null, thread: [] },
  ];

  // Rep earnings by period (ONE source). Chunk-1 summary reads periods[0]; payouts read all.
  // Amount disbursed per period = that period's earned commission (no recompute downstream).
  const REP_EARNINGS = {
    periods: [
      { period: "May 2026", total: "$1,840", initial: "$640", recurring: "$1,200", payout: { status: "pending" } },
      { period: "Apr 2026", total: "$1,610", initial: "$520", recurring: "$1,090", payout: { status: "scheduled", date: "Scheduled Jun 5" } },
      { period: "Mar 2026", total: "$1,480", initial: "$430", recurring: "$1,050", payout: { status: "paid", date: "Paid Apr 5" },
        adjustment: { label: "Ops adjustment · late-signup correction", amount: "+$120" } },
      { period: "Feb 2026", total: "$1,120", initial: "$300", recurring: "$820", payout: { status: "failed", date: "Failed Mar 5" } },
    ],
  };

  window.LAUNCHER_DATA = { GRAD, GRAD_HUE, CATEGORIES, CATALOG, PERSONAS, WALLET, APPS, HOME_APPS, SUGGESTIONS, REQUESTS, RECENTS, ORGS, ORG_APP_COUNTS, ORG_STATES, SUSPENDED_BILLING, SUITE_INTAKE, SUITE_DEAL, EXPLORE_GROUPS, NOTIFICATIONS, BUNDLES, REP_PACKAGES, REP_EARNINGS };
})();
