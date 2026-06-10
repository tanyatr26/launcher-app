/* PM Office — launcher data (plain JS; sets window globals) */
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
    { key: "payroll",    label: "Payroll & Taxes", dot: "#ef4444" },
    { key: "finance",    label: "Finance",         dot: "#0d9488" },
    { key: "people",     label: "People & HR",     dot: "#f59e0b" },
    { key: "admin",      label: "Admin",           dot: "#7c3aed" },
    { key: "documents",  label: "Documents",       dot: "#2563eb" },
    { key: "reports",    label: "Reports",         dot: "#059669" },
    { key: "claims",     label: "Claims",          dot: "#475569" },
  ];

  // Unified app catalog — merged from both source mocks
  const APPS = [
    { id: "payroll-run",   name: "Payroll Run",        cat: "payroll",   icon: "run",      grad: "coral",
      desc: "Process and submit payroll for the upcoming pay period.", used: "Yesterday", usedRank: 4, isNew: 0, pinned: false, featured: true },
    { id: "process-payroll", name: "Process Payroll",  cat: "payroll",   icon: "bank",     grad: "forest",
      desc: "Review and approve payroll submissions before the deadline.", used: null, usedRank: 0, isNew: 1, pinned: false, featured: true },
    { id: "compensation",  name: "Compensation",       cat: "payroll",   icon: "wallet",   grad: "coral",
      desc: "Adjust salaries, bonuses and pay grades across the org.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false },
    { id: "year-end-w2",   name: "Year-end & W-2",     cat: "payroll",   icon: "calendar", grad: "orange",
      desc: "Generate, review and file year-end W-2 and 1099 forms.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false },
    { id: "check-printing", name: "Check Printing",    cat: "payroll",   icon: "printer",  grad: "purple",
      desc: "Streamline employee check management and timely distribution.", used: null, usedRank: 0, isNew: 1, pinned: false, featured: false },

    { id: "accounting",    name: "Accounting",         cat: "finance",   icon: "ledger",   grad: "green",
      desc: "Track and manage all accounting and bank-related activity.", used: null, usedRank: 0, isNew: 1, pinned: false, featured: true },
    { id: "claims",        name: "Claims",             cat: "finance",   icon: "claims",   grad: "slate",
      desc: "Manage and confirm recorded payroll payments from customers.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false },
    { id: "file-uploader", name: "File Uploader",      cat: "finance",   icon: "upload",   grad: "gold",
      desc: "Keep track of all funded payroll invoices in one place.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false },
    { id: "hsa-fsa",       name: "HSA / FSA",          cat: "finance",   icon: "shield-user", grad: "forest",
      desc: "Administer health and flexible spending account benefits.", used: "5 hours ago", usedRank: 3, isNew: 0, pinned: true, featured: false },

    { id: "people-dir",    name: "People Directory",   cat: "people",    icon: "directory", grad: "amber",
      desc: "Search the full company directory and contact details.", used: "1 hour ago", usedRank: 5, isNew: 0, pinned: true, featured: false },
    { id: "employee-records", name: "Employee Records", cat: "people",   icon: "folder-user", grad: "orange",
      desc: "Open, edit and onboard employee records and files.", used: "Just now", usedRank: 6, isNew: 0, pinned: true, featured: false },
    { id: "org-chart",     name: "Org Chart",          cat: "people",    icon: "org",      grad: "amber",
      desc: "Visualize reporting lines and team structure.", used: "2 days ago", usedRank: 2, isNew: 0, pinned: false, featured: false },
    { id: "manage-users",  name: "Manage Users",       cat: "people",    icon: "users-cog", grad: "coral",
      desc: "Create and manage all of your users from one dashboard.", used: null, usedRank: 0, isNew: 2, pinned: false, featured: true },

    { id: "manage-biz",    name: "Manage Businesses",  cat: "admin",     icon: "briefcase", grad: "slate",
      desc: "Assign application access to businesses at a Super Admin level.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: true },
    { id: "compliance",    name: "Compliance Hub",     cat: "admin",     icon: "shield",   grad: "gold",
      desc: "Monitor regulatory compliance and resolve open items.", used: "3 hours ago", usedRank: 1, isNew: 0, pinned: false, featured: false },

    { id: "ai-docs",       name: "AI Document Uploader", cat: "documents", icon: "sparkle-doc", grad: "gold",
      desc: "Drop in documents and let AI classify, extract and file them.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: true },
    { id: "documents",     name: "Document Center",    cat: "documents", icon: "doc",      grad: "blue",
      desc: "Store, share and e-sign company documents securely.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false },

    { id: "groups-reports", name: "Groups & Reports",  cat: "reports",   icon: "groups",   grad: "coral",
      desc: "Create, share and save groups referenced across the system.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: true },

    /* --- Catalog-only: not provisioned for this user (used by Explore All Apps) --- */
    { id: "garnishments",  name: "Garnishments",       cat: "payroll",   icon: "wallet",   grad: "amber",
      desc: "Manage wage garnishments, levies and child-support orders.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, locked: true, access: "org" },
    { id: "tax-filing",    name: "Tax Filing",         cat: "payroll",   icon: "calendar", grad: "coral",
      desc: "File federal, state and local payroll taxes automatically.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, locked: true, access: "org" },
    { id: "bank-recon",    name: "Bank Reconciliation",cat: "finance",   icon: "bank",     grad: "teal",
      desc: "Match transactions and reconcile accounts at period close.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, locked: true, access: "user" },
    { id: "benefits-admin",name: "Benefits Admin",     cat: "people",    icon: "shield-user", grad: "green",
      desc: "Administer enrollment, carriers and open-enrollment windows.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, locked: true, access: "org" },
    { id: "time-attendance",name: "Time & Attendance", cat: "people",    icon: "calendar", grad: "blue",
      desc: "Track hours, shifts, PTO and approvals across teams.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, locked: true, access: "user" },
    { id: "audit-log",     name: "Audit Log",          cat: "admin",     icon: "ledger",   grad: "slate",
      desc: "Review every change and access event across the workspace.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, locked: true, access: "user" },
    { id: "api-webhooks",  name: "API & Webhooks",     cat: "admin",     icon: "briefcase",grad: "purple",
      desc: "Connect external systems with keys, webhooks and logs.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, locked: true, access: "org" },
    { id: "e-signature",   name: "E-Signature",        cat: "documents", icon: "doc",      grad: "teal",
      desc: "Send, sign and store legally binding documents.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, locked: true, access: "user" },
    { id: "analytics",     name: "Analytics Studio",   cat: "reports",   icon: "groups",   grad: "gold",
      desc: "Build custom dashboards across payroll, finance and HR.", used: null, usedRank: 0, isNew: 0, pinned: false, featured: false, locked: true, access: "org" },
  ];

  // Access requests (mock) for the Requests view
  const REQUESTS = {
    incoming: [
      { id: "i1", requester: "Marcus Lee",      initials: "ML", grad: "blue",   app: "Payroll App",       time: "2 hours ago" },
      { id: "i2", requester: "Dana Whitfield",  initials: "DW", grad: "purple", app: "Accounting",        time: "Yesterday" },
      { id: "i3", requester: "Priya Nair",      initials: "PN", grad: "teal",   app: "People Directory",  time: "3 days ago" },
      { id: "i4", type: "capacity", capacity: "seats", requester: "Jordan Reyes", initials: "JR", grad: "amber", app: "Check Printing Add-on", time: "4 hours ago", delta: "18/18 seats used \u00b7 +3 requested" },
      { id: "i5", type: "capacity", capacity: "tier", requester: "System", icon: "shield", grad: "slate", app: "Customer Configuration", time: "Yesterday", delta: "Tier 2 \u2192 Tier 3 \u00b7 +$1,000/mo" },
    ],
    sent: [
      { id: "s1", app: "Tax Filing",      icon: "calendar",    grad: "coral",  to: "Platform Operations", status: "pending",  time: "1 hour ago" },
      { id: "s2", app: "Benefits Admin",  icon: "shield-user", grad: "green",  to: "Alex Romero",         status: "accepted", time: "2 days ago" },
      { id: "s3", app: "API & Webhooks",  icon: "briefcase",   grad: "purple", to: "Platform Operations", status: "denied",   time: "Last week" },
    ],
  };

  // Organizations this user belongs to (mock)
  const ORGS = ["Employer's Outsourcing", "Metro Temps LLC", "Acme Staffing Group", "Pinnacle Services"];
  // Per-org app totals (mock) shown in the greeting subtitle
  const ORG_APP_COUNTS = {
    "Metro Temps LLC": 18,
    "Acme Staffing Group": 12,
    "Employer's Outsourcing": 24,
    "Pinnacle Services": 9,
  };

  // Explore All Apps — three state-based groups (id used for stable keys)
  const EXPLORE_GROUPS = [
    {
      key: "available",
      title: "Available to you",
      sub: "Licensed by your organization and granted to your account.",
      action: "launch",
      apps: [
        { id: "x-user-mgmt",   name: "User Management",        cat: "people",   icon: "users-cog",  grad: "coral",
          desc: "Create and manage all of your users from one dashboard." },
        { id: "x-cust-config", name: "Customer Configuration", cat: "admin",    icon: "briefcase",  grad: "slate",
          desc: "Configure customer accounts, settings and preferences." },
        { id: "x-crm",         name: "CRM Sales Funnel",       cat: "reports",  icon: "groups",     grad: "blue",
          desc: "Track leads and opportunities through your sales pipeline." },
        { id: "x-process-payroll", name: "Process Payroll",    cat: "payroll",  icon: "bank",       grad: "forest",
          desc: "Review and approve payroll submissions before the deadline." },
        { id: "x-accounting",  name: "Accounting",             cat: "finance",  icon: "ledger",     grad: "green",
          desc: "Track and manage all accounting and bank-related activity." },
        { id: "x-check-printing", name: "Check Printing",      cat: "payroll",  icon: "printer",    grad: "purple",
          desc: "Streamline employee check management and timely distribution." },
        { id: "x-claims",      name: "Claims Management",      cat: "finance",  icon: "claims",     grad: "slate",
          desc: "Manage and confirm recorded payroll payments from customers." },
        { id: "x-billing",     name: "Billing",                cat: "finance",  icon: "receipt",    grad: "gold",
          desc: "Manage invoicing for the services you provide." },
      ],
    },
    {
      key: "company",
      title: "Available at your company",
      sub: "Licensed by your organization \u2014 you don\u2019t have access yet.",
      action: "request",
      helper: "Your company has this \u2014 request access from your admin.",
      apps: [
        { id: "x-year-end",    name: "Year-end & W-2",         cat: "payroll",  icon: "calendar",   grad: "orange",
          desc: "Generate, review and file year-end W-2 and 1099 forms." },
        { id: "x-hr",          name: "HR",               cat: "people",  icon: "shield-user", grad: "amber",
          desc: "Manage employee records, onboarding and HR workflows." },
        { id: "x-timeclock",   name: "Timeclock",        cat: "people",  icon: "calendar",    grad: "blue",
          desc: "Track hours, shifts, PTO and approvals across teams." },
        { id: "x-groups-reports", name: "Groups & Reports", cat: "reports", icon: "groups",   grad: "coral",
          desc: "Create, share and save groups referenced across the system." },
        { id: "x-data-migration", name: "Historical Data Migration", cat: "documents", icon: "folder-user", grad: "teal",
          desc: "Migrate years of legacy payroll and HR data into PM Office." },
      ],
    },
    {
      key: "expand",
      title: "Expand your platform",
      sub: "Not yet part of your plan \u2014 try, demo or add them.",
      action: "sales",
      apps: [
        { id: "x-spreadsheet", name: "Spreadsheet Transformer", cat: "documents", icon: "upload", grad: "gold",
          desc: "Turn messy spreadsheets into clean, structured data automatically.", trial: true },
        { id: "x-mailroom", name: "Mailroom", cat: "documents", icon: "doc", grad: "coral",
          desc: "Digitize, route and track incoming physical mail across your team.", trial: false },
      ],
    },
  ];

  // Recent chat threads (mock) shown in the sidebar
  const RECENTS = [
    { id: "rc1", title: "Onboarding a contractor", time: "2h ago",    prompt: "Onboard a new contractor" },
    { id: "rc2", title: "Closing the month",       time: "Yesterday", prompt: "Help me close the month" },
    { id: "rc3", title: "Filing year-end W-2s",    time: "3d ago",    prompt: "I need to file year-end W-2s" },
  ];

  // Focused daily-use set shown in the "Your Apps" view (curated subset)
  const HOME_APPS = [
    { id: "h-user-mgmt",      name: "User Management",  cat: "admin",   icon: "users-cog", grad: "coral",
      desc: "Create and manage all of your users from one dashboard.", used: null, usedRank: 0, isNew: 0, pinned: true },
    { id: "h-cust-config",    name: "Customer Configuration", cat: "admin", icon: "briefcase", grad: "slate",
      desc: "Configure customer accounts, settings and preferences.", used: null, usedRank: 0, isNew: 0, pinned: false },
    { id: "h-crm",            name: "CRM Sales Funnel", cat: "admin",   icon: "groups",    grad: "blue",
      desc: "Track leads and opportunities through your sales pipeline.", used: null, usedRank: 0, isNew: 0, pinned: false },
    { id: "h-process-payroll", name: "Process Payroll", cat: "payroll", icon: "bank",      grad: "forest",
      desc: "Review and approve payroll submissions before the deadline.", used: null, usedRank: 0, isNew: 0, pinned: false },
    { id: "h-check-printing", name: "Check Printing",   cat: "payroll", icon: "printer",   grad: "purple",
      desc: "Streamline employee check management and timely distribution.", used: null, usedRank: 0, isNew: 0, pinned: false },
    { id: "h-accounting",     name: "Accounting",       cat: "payroll", icon: "ledger",    grad: "green",
      desc: "Track and manage all accounting and bank-related activity.", used: null, usedRank: 0, isNew: 0, pinned: false },
    { id: "h-claims",         name: "Claims Management", cat: "claims",  icon: "claims",    grad: "slate",
      desc: "Manage and confirm recorded payroll payments from customers.", used: null, usedRank: 0, isNew: 0, pinned: false },
  ];

  // AI routing intents: chip label -> { line, match(app) }
  const SUGGESTIONS = [
    { label: "Financial Operations", q: "financial",  cats: ["finance", "payroll"] },
    { label: "Onboard a new hire",   q: "onboard",    cats: ["people"], ids: ["employee-records", "manage-users", "org-chart"] },
    { label: "Close the month",      q: "close month", cats: ["finance"], ids: ["accounting", "process-payroll", "claims"] },
    { label: "Upload invoices",      q: "invoices",   ids: ["file-uploader", "ai-docs", "claims"] },
    { label: "See what's new",       q: "new",        filter: "new" },
  ];

  // Notifications (mock) grouped by source app
  const NOTIFICATIONS = [
    { group: "Requests", icon: "users-cog", grad: "coral", items: [
      { id: "n1", msg: "Marcus Lee requested access to Payroll App", time: "2h ago", unread: true },
      { id: "n2", msg: "Dana Whitfield requested access to Accounting", time: "5h ago", unread: true },
    ]},
    { group: "Process Payroll", icon: "bank", grad: "forest", items: [
      { id: "n3", msg: "Payroll run for Acme Corp is ready for review", time: "1h ago", unread: true },
      { id: "n4", msg: "Direct deposit batch submitted successfully", time: "Yesterday", unread: false },
    ]},
    { group: "Accounting", icon: "ledger", grad: "green", items: [
      { id: "n5", msg: "3 invoices need approval", time: "3h ago", unread: true },
      { id: "n6", msg: "Month-end close is due Friday", time: "2d ago", unread: false },
    ]},
  ];

  window.LAUNCHER_DATA = { GRAD, GRAD_HUE, CATEGORIES, APPS, HOME_APPS, SUGGESTIONS, REQUESTS, RECENTS, ORGS, ORG_APP_COUNTS, EXPLORE_GROUPS, NOTIFICATIONS };
})();
