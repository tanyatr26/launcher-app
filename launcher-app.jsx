// launcher-app.jsx — main App, state, routing, tweaks
const { useState, useMemo, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": ["#15803d", "#14b8a6"],
  "heroStyle": "blend",
  "defaultView": "list",
  "density": "regular",
  "showChips": true
} /*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const D = window.LAUNCHER_DATA;

  // URL-param presets (used by the side-by-side compare canvas)
  const params = new URLSearchParams(location.search);
  const embed = params.get("embed") === "1";
  const forcedHero = params.get("hero");
  const portalApp = params.get("app"); // a launched app renders standalone in its own tab

  const [theme, setTheme] = useState(params.get("theme") || t.theme);
  const [view, setView] = useState(params.get("view") || t.defaultView);
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState(null);
  const [activeCat, setCat] = useState("all");
  const [cats, setCats] = useState([]);
  const [sort, setSort] = useState("Smart");
  const [screen, setScreen] = useState("home");
  const [avail, setAvail] = useState("available");
  const [modalApp, setModalApp] = useState(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifGroups, setNotifGroups] = useState(() => D.NOTIFICATIONS);
  const notifUnread = notifGroups.reduce((s, g) => s + g.items.filter((n) => n.unread).length, 0);
  const [chat, setChat] = useState(null);
  const [org, setOrg] = useState("Bayside Office Temps");
  // The BFF's account_state signal, per selected org — pending_activation |
  // active | suspended | offboarded. Ops-owned; the launcher only renders it.
  const accountState = (D.ORG_STATES || {})[org] || "active";
  const [pins, setPins] = useState(() => {
    const o = {};D.APPS.forEach((a) => {o[a.id] = a.pinned;});(D.HOME_APPS || []).forEach((a) => {o[a.id] = a.pinned;});return o;
  });

  // ---- Sales Rep Portal: rep status (mock; resolved by ops) + the user's live Sent ledger ----
  const [repStatus, setRepStatus] = useState("none"); // none | pending | active
  const [repAppOpen, setRepAppOpen] = useState(false);
  const [sentReqs, setSentReqs] = useState(() => D.REQUESTS.sent);
  const repTimer = React.useRef(null);
  useEffect(() => () => {if (repTimer.current) clearTimeout(repTimer.current);}, []);

  // tweak -> state sync (skipped when embedded so each preset stays locked)
  useEffect(() => {if (!embed) setTheme(t.theme);}, [t.theme]);
  useEffect(() => {if (!embed) setView(t.defaultView);}, [t.defaultView]);

  useEffect(() => {
    const root = document.documentElement;
    // Disable transitions while theme/accent flips so var()-driven colors recompute
    // instantly (Chromium won't re-resolve var() in a mid-transition property otherwise).
    root.classList.add("theme-switching");
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-density", t.density);
    const [a1, a2] = Array.isArray(t.accent) ? t.accent : [t.accent, t.accent];
    root.style.setProperty("--accent", a1);
    root.style.setProperty("--accent-2", a2 || a1);
    void root.offsetHeight; // commit new values with transitions off
    const raf = requestAnimationFrame(() => root.classList.remove("theme-switching"));
    return () => cancelAnimationFrame(raf);
  }, [theme, t.density, t.accent]);

  const toggleTheme = () => {const nx = theme === "dark" ? "light" : "dark";setTheme(nx);setTweak("theme", nx);};
  const togglePin = (id) => setPins((p) => ({ ...p, [id]: !p[id] }));

  const submitToolRequest = () => {
    setRequestOpen(false);
    showToast("Request sent — the PM Office team will be in touch.");
  };
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 4000);
  };

  // ---- tier-upgrade flow (shared by Requests + Subscriptions) ----
  // needed -> requested (awaiting terms) -> ready (terms issued) -> done (gate lifted)
  const [upgradeStage, setUpgradeStage] = useState("needed");
  const [upgradeOpen, setUpgradeOpen] = useState(false); // Subscriptions review/accept modal
  const [seatOpen, setSeatOpen] = useState(false); // Subscriptions manage-seats modal
  const termsTimer = React.useRef(null);
  useEffect(() => () => {if (termsTimer.current) clearTimeout(termsTimer.current);}, []);
  // Submit the upgrade as a request to PM Office; terms come back asynchronously.
  const requestTierUpgrade = () => {
    if (upgradeStage !== "needed") return;
    setUpgradeStage("requested");
    showToast("Upgrade request sent to PM Office \u2014 awaiting issued terms.");
    if (termsTimer.current) clearTimeout(termsTimer.current);
    termsTimer.current = setTimeout(() => {
      setUpgradeStage("ready");
      showToast("Terms ready for HR \u2014 review & accept.");
    }, 2600);
  };
  // Open the review-and-accept modal in Subscriptions (used by the Requests "Terms ready" row).
  const openTierReview = () => {setScreen("billing");setUpgradeOpen(true);};
  // Open Manage seats in Subscriptions (used by the Requests seat-shortage row).
  const openManageSeats = () => {setScreen("billing");setSeatOpen(true);};

  // ---- Payroll Suite acquisition (new app/bundle on a LIVE account; user
  // decision 2026-07-13). request (intake) -> pending -> terms-ready ->
  // accept & pay -> live. NOTHING the suite grants activates before
  // accept-and-pay CLEARS: a check/wire acceptance parks at awaiting-clear
  // (apps stay gated) until PM Office reconciles receipt.
  // The org's payment-method wallet (docs: methods can be added, edited and
  // reassigned; automated capture runs through the payment processor). Shared
  // by EVERY payment choice — Change payment method, Accept & pay, suspended
  // billing — so a method added anywhere is available everywhere.
  const [wallet, setWallet] = useState(D.WALLET);
  const addPaymentMethod = (m) => {
    setWallet((prev) => [...prev, m]);
    showToast("Payment method added — " + m.name + " ···· " + m.num + " (captured through the payment processor).");
  };

  const [suiteStage, setSuiteStage] = useState("none"); // none | escalated | pending | terms-ready | awaiting-clear | live
  const [suiteMethod, setSuiteMethod] = useState(null); // chosen payment method label
  const [suiteIntakeOpen, setSuiteIntakeOpen] = useState(false);
  const [suiteOpen, setSuiteOpen] = useState(false); // the review-&-accept modal (in Subscriptions)
  const suiteTimer = React.useRef(null);
  useEffect(() => () => {if (suiteTimer.current) clearTimeout(suiteTimer.current);}, []);
  const submitSuiteIntake = (answers) => {
    setSuiteIntakeOpen(false);
    setSuiteStage("pending");
    setSentReqs((prev) => [{ id: "suite-req", app: "Payroll Suite", icon: "bank", grad: "forest",
      to: "Platform Operations", status: "pending", time: "Just now", answers }, ...prev.filter((r) => r.id !== "suite-req")]);
    showToast("Request sent — Platform Operations will price the Payroll Suite and issue terms.");
    if (suiteTimer.current) clearTimeout(suiteTimer.current);
    // Mock the ops round-trip (pricing + issued terms), like the tier flow.
    suiteTimer.current = setTimeout(() => {
      setSuiteStage("terms-ready");
      setSentReqs((prev) => prev.map((r) => r.id === "suite-req" ? { ...r, status: "terms-ready" } : r));
      showToast("PM Office issued terms for the Payroll Suite — review & accept in Subscriptions.");
    }, 2600);
  };
  const openSuiteReview = () => {setScreen("billing");setSuiteOpen(true);};
  // ESCALATION BY RESOLUTION (docs): a user WITHOUT subscription authority who
  // wants a not-licensed item sees "Request for your team" — the request walks
  // up the invite chain to the first resolver (Lena, the owner), never to ops.
  // The owner then starts the licensing request (the intake → ops flow).
  const escalateSuite = () => {
    if (suiteStage !== "none") return;
    setSuiteStage("escalated");
    setSentReqs((prev) => [{ id: "suite-req", app: "Payroll Suite", icon: "bank", grad: "forest",
      to: "Lena Strand (owner)", status: "pending", time: "Just now" }, ...prev.filter((r) => r.id !== "suite-req")]);
    showToast("Request sent — escalated to Lena Strand (owner), who holds subscription authority.");
  };
  // The one escalated record, seen from the resolver's side (owner's Incoming).
  const incomingCombined = suiteStage === "escalated" ?
  [{ id: "inc-suite", type: "escalation", requester: "Ophelia Crosby", initials: "OC", grad: "coral", app: "Payroll Suite", time: "Just now" }, ...D.REQUESTS.incoming] :
  D.REQUESTS.incoming;
  // Accept-and-pay. Automated methods (card/ACH) clear now -> live; check/wire
  // issues an Owed invoice and parks at awaiting-clear — the suite's apps stay
  // gated until PM Office reconciles the payment (mock: a demo affordance).
  const acceptSuiteDeal = (method) => {
    setSuiteOpen(false);
    setSuiteMethod(method.label);
    setSentReqs((prev) => prev.map((r) => r.id === "suite-req" ? { ...r, status: "accepted" } : r));
    if (method.kind === "manual") {
      setSuiteStage("awaiting-clear");
      showToast("Accepted — invoice issued. The suite's apps unlock once your " + method.label.toLowerCase() + " payment clears.");
    } else {
      setSuiteStage("live");
      showToast("Payroll Suite is live — Payroll, Customer Configuration, Check Printing and Billing are now in your apps.");
    }
  };
  const simulateSuiteClear = () => {setSuiteStage("live");showToast("Payment received — Payroll Suite is live.");};
  const suiteLive = suiteStage === "live";

  // ---- mock chat ----
  function mockReply(prompt, hasFiles) {
    const q = (prompt || "").toLowerCase();
    let ids;
    if (/onboard|hire|contractor|new employee/.test(q)) ids = ["hr", "user-management"];else
    if (/employee|record|enroll|benefit/.test(q)) ids = ["hr"];else
    if (/spreadsheet|clean|import|upload|document|file|rate sheet/.test(q)) ids = ["spreadsheet-transformer"];else
    if (/user|access|grant/.test(q)) ids = ["user-management"];else
    if (hasFiles) ids = ["spreadsheet-transformer", "hr"];else
    {
      // Pre-flow, payroll/claims queries route to what's actually granted —
      // the suite's apps join D.APPS-driven results only after activation.
      ids = D.APPS.filter((a) => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)).slice(0, 3).map((a) => a.id);
      if (ids.length < 2) ids = ["hr", "spreadsheet-transformer", "user-management"];
    }
    const list = ids.map((id) => D.APPS.find((a) => a.id === id)).filter(Boolean).slice(0, 3);
    const reason = hasFiles ?
    q ? "I looked at that document and your note \u2014 here\u2019s where it goes:" : "I looked at that document \u2014 here\u2019s where it goes:" :
    "Here are a few tools that fit \u2014 this usually touches these:";
    return { role: "ai", reason, apps: list };
  }
  const handleSend = (text, files) => {
    const v = (text || "").trim();
    const hasFiles = files && files.length > 0;
    if (!v && !hasFiles) return;
    setScreen("home");
    setChat((prev) => [...(prev || []), { role: "user", text: v, files: hasFiles ? files : [] }, mockReply(v, hasFiles)]);
    setQuery("");
  };
  const newChat = () => {setChat(null);setQuery("");};
  const openRecent = (r) => {
    // Suspended/offboarded: apps are gated, so AI routing to them is too.
    if (accountState !== "active") {showToast("Apps are unavailable while this account is " + accountState + ".");return;}
    setScreen("home");setChat([{ role: "user", text: r.prompt }, mockReply(r.prompt)]);
  };
  // Apps with an `inplace` flag render their screen in the main area; `repPortal` apps launch in a new tab.
  const openApp = (a) => {
    if (a.repPortal) {launchSalesRepPortal();return;}
    if (a.inplace) {setChat(null);setScreen(a.inplace);}
  };

  // ---- Sales Rep Portal launch + ops-resolved rep application (separate from the app grant) ----
  // The granted app always launches in a new tab; the in-app application gates portal access.
  const portalUrl = location.origin + location.pathname + "?app=sales-rep-portal";
  const launchSalesRepPortal = () => {
    if (repStatus === "active") {window.open(portalUrl, "_blank", "noopener");return;}
    if (repStatus === "pending") {showToast("Your Sales Rep application is under review by Platform Operations.");return;}
    setRepAppOpen(true); // not yet a rep -> ops-defined application form
  };
  // Submitting writes one ledger entry to the user's Sent section, resolved by Platform Operations.
  const submitRepApplication = (payload) => {
    const row = { id: "rep-app", kind: "rep_application", app: "Sales Rep Portal", icon: "groups", grad: "teal",
      to: "Platform Operations", status: "pending", time: "Just now", answers: payload && payload.fields };
    setSentReqs((prev) => [row, ...prev.filter((r) => r.id !== "rep-app")]);
    setRepStatus("pending");
    // Mock the ops round-trip the same way the tier-upgrade flow resolves asynchronously.
    if (repTimer.current) clearTimeout(repTimer.current);
    repTimer.current = setTimeout(() => {
      setSentReqs((prev) => prev.map((r) => r.id === "rep-app" ? { ...r, status: "accepted" } : r));
      setRepStatus("active");
      showToast("You’re approved as a Sales Rep — launch the portal to open your dashboard.");
    }, 2600);
  };

  // ---- access requests (Explore) ----
  const viewerIsTopAdmin = false;
  // ---- Demo personas (user decision 2026-07-13) ----
  // One org, two views split by SUBSCRIPTION AUTHORITY (the BFF's
  // has_subscriptions signal): Lena Strand (owner — authority holder, the
  // requester ops shows on REQ-1042/1033) vs Ophelia Crosby (standard user).
  // Authority gates the Subscriptions nav, the commercial actions, and WHERE a
  // licensing request goes: an owner's request opens the ops intake; a
  // standard user's request ESCALATES up the invite chain to the owner.
  const [personaKey, setPersonaKey] = useState("owner");
  const persona = D.PERSONAS[personaKey];
  const viewerHasSubscriptions = persona.hasSubscriptions;
  const switchPersona = (key) => {
    if (key === personaKey) return;
    const p = D.PERSONAS[key];
    setPersonaKey(key);
    setChat(null);
    // A non-holder can't stand in Subscriptions — the section doesn't exist for them.
    if (!p.hasSubscriptions && screen === "billing") setScreen("home");
    showToast("Demo view — now viewing as " + p.name + (p.hasSubscriptions ? " (owner)." : " (standard user)."));
  };
  const requestTarget = viewerIsTopAdmin ? "platform" : "admin";
  const appHasSandbox = (app) => app && app.hasSandbox !== false; // these apps offer sandboxes
  const requestAccess = (app, target) => {
    setModalApp(null);
    showToast(target === "platform" ?
    "Request sent \u2014 Platform Operations will review it." :
    "Request sent \u2014 your administrator will review it.");
  };
  const openSandbox = (app) => {showToast("Opening " + app.name + " sandbox\u2026");};

  // ---- organization switch ----
  // Single trigger point: in production this is where entitled apps, the Explore
  // catalog, Requests, and Recents would be reloaded for the selected org.
  const switchOrg = (name) => {
    if (name === org) return;
    setOrg(name);
    setScreen("home");
    setChat(null);
    // refreshWorkspace(name) -> reload apps / explore / requests / recents per org
  };
  const chatActive = chat && screen === "home";

  // The suite's grants join the grid ONLY once accept-and-pay has cleared —
  // all four member apps (Payroll · Customer Configuration · Check Printing ·
  // Billing) arrive together, per the bundle's licensed-as-one rule.
  const SUITE_APPS = [
    { id: "h-payroll", name: "Payroll", cat: "payroll", icon: "run", grad: "coral",
      desc: "Process and submit payroll for the upcoming pay period." },
    { id: "h-customer-configuration", name: "Customer Configuration", cat: "admin", icon: "briefcase", grad: "slate",
      desc: "Configure customer accounts, settings and preferences." },
    { id: "h-check-printing", name: "Check Printing", cat: "payroll", icon: "printer", grad: "purple",
      desc: "Print, distribute and track employee payroll checks." },
    { id: "h-billing", name: "Billing", cat: "finance", icon: "receipt", grad: "green",
      desc: "Invoice and bill your own customers." }];
  const apps = useMemo(() => {
    const base = D.HOME_APPS.map((a) => ({ ...a, pinned: pins[a.id] }));
    if (!suiteLive) return base;
    return [...base, ...SUITE_APPS.map((a) => ({ ...a, used: null, usedRank: 0, isNew: 1, pinned: !!pins[a.id] }))];
  }, [pins, suiteLive]);
  const allApps = useMemo(() => D.APPS.map((a) => ({ ...a, pinned: pins[a.id] })), [pins]);

  // Explore groups follow the suite's stage: at live, the four member apps
  // move into "Available to you" and the suite card leaves "Expand your
  // platform"; before that, nothing the suite grants is available anywhere.
  const exploreGroups = useMemo(() => D.EXPLORE_GROUPS.map((g) => {
    if (g.key === "available" && suiteLive)
      return { ...g, apps: [...g.apps, ...SUITE_APPS.map((a) => ({ ...a, id: "x-" + a.id.slice(2) + "-live" }))] };
    if (g.key === "expand" && suiteLive)
      return { ...g, apps: g.apps.filter((a) => a.id !== "x-payroll-suite") };
    return g;
  }), [suiteLive]);

  // ---- search / routing ----
  function runRoute(text) {
    const q = (text || "").trim().toLowerCase();
    if (!q) {setRoute(null);return;}
    const hit = D.SUGGESTIONS.find((s) => q.includes(s.q));
    let matchIds = [];
    if (hit) {
      if (hit.filter === "new") matchIds = apps.filter((a) => a.isNew > 0).map((a) => a.id);else
      matchIds = [...(hit.ids || []), ...apps.filter((a) => (hit.cats || []).includes(a.cat)).map((a) => a.id)];
    } else {
      matchIds = apps.filter((a) =>
      a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) ||
      D.CATEGORIES.find((c) => c.key === a.cat)?.label.toLowerCase().includes(q)
      ).map((a) => a.id);
    }
    matchIds = [...new Set(matchIds)];
    const names = matchIds.slice(0, 3).map((id) => apps.find((a) => a.id === id)?.name).filter(Boolean);
    setRoute({
      ids: matchIds,
      lead: matchIds.length ?
      `Routing you to ${matchIds.length} tool${matchIds.length > 1 ? "s" : ""}.` :
      "No exact match \u2014 here\u2019s the closest I found.",
      detail: names.length ? `Top picks: ${names.join(", ")}.` : "Try rephrasing the task."
    });
  }

  const onChip = (s) => {setQuery(s.label);runRoute(s.q);};
  const onSubmit = (v) => runRoute(v);
  const onChangeQuery = (v) => {setQuery(v);if (route) setRoute(null);};

  // ---- derived lists ----
  // Note: the AI prompt bar does NOT live-filter the grid. Typing changes nothing
  // until submit (which opens the chat). Only category filter affects the grid.
  const visible = useMemo(() => {
    let list = apps;
    if (cats.length) list = list.filter((a) => cats.includes(a.cat));
    if (sort === "A \u2013 Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));else
    if (sort === "Recently used") list = [...list].sort((a, b) => b.usedRank - a.usedRank);else
    if (sort === "Newest") list = [...list].sort((a, b) => b.isNew - a.isNew);
    return list;
  }, [apps, cats, sort]);

  const pinned = visible.filter((a) => a.pinned);
  const recent = [...visible].filter((a) => a.usedRank > 0 && !a.pinned).sort((a, b) => b.usedRank - a.usedRank).slice(0, 5);
  const byCat = D.CATEGORIES.map((c) => ({ ...c, items: visible.filter((a) => a.cat === c.key && !a.pinned) })).filter((c) => c.items.length);
  const filtering = cats.length > 0;

  // Categories actually present in the active availability view (so the Filter only offers relevant ones)
  const availCatKeys = (() => {
    let pool;
    if (avail === "available") pool = apps;else
    if (avail === "notyet") pool = exploreGroups.filter((g) => g.key !== "available").flatMap((g) => g.apps);else
    pool = exploreGroups.flatMap((g) => g.apps);
    return new Set(pool.map((a) => a.cat));
  })();
  const availCategories = D.CATEGORIES.filter((c) => availCatKeys.has(c.key));

  const renderItems = (items, hl) =>
  view === "grid" ?
  <div className="grid">{items.map((a) => <AppCard key={a.id} app={a} onTogglePin={togglePin} onOpen={openApp} highlight={hl && route?.ids.includes(a.id)} />)}</div> :
  <div className="rows">{items.map((a) => <AppRow key={a.id} app={a} onTogglePin={togglePin} onOpen={openApp} highlight={hl && route?.ids.includes(a.id)} />)}</div>;

  // ---- hero ----
  const hero = forcedHero || t.heroStyle;
  const greeting =
  <div className="greeting-row">
    <h1 className={"greeting" + (hero === "bold" ? " dramatic" : "")}>
      {hero === "bold" ?
      <><span className="pre">Find</span> your next <span className="accent">action.</span></> :
      <>Good morning, <span className="accent">{persona.name.split(" ")[0]}</span></>}
    </h1>
    <button className="bell-btn" onClick={() => setNotifOpen(true)} aria-label="Notifications">
      <Icon name="bell" size={22} />
      {notifUnread > 0 && <span className="bell-badge">{notifUnread}</span>}
    </button>
  </div>;


  // A launched app opens in its own tab and renders standalone (no launcher chrome).
  if (portalApp === "sales-rep-portal")
  return <SalesRepPortal theme={theme} onToggleTheme={toggleTheme}
  onBack={() => {window.location.href = location.origin + location.pathname;}} />;

  return (
    <div className="app">
      <Sidebar theme={theme} onToggleTheme={toggleTheme} query={query} setQuery={onChangeQuery}
      screen={screen} onNavigate={setScreen} onRequestTool={() => setRequestOpen(true)}
      recents={D.RECENTS} onOpenRecent={openRecent}
      org={org} orgs={D.ORGS} onSwitchOrg={switchOrg} hasSubscriptions={viewerHasSubscriptions}
      accountState={accountState}
      persona={persona} personas={D.PERSONAS} onSwitchPersona={switchPersona} />

      <main className="main" style={{ fontWeight: "500" }}>
        <div className={"main-inner" + (chatActive ? " dim" : "")}>
          {/* Account-state rendering (BFF account_state drives it — docs 01 ·
              Architecture): offboarded = residual mode everywhere; suspended =
              apps gate behind a prominent notice while Subscriptions (the
              billing-fix surface) and the request ledger stay reachable. */}
          {accountState === "offboarded" ?
          <AccountStateGate state="offboarded" org={org} /> :
          accountState === "suspended" && screen === "billing" ?
          <SuspendedBillingScreen org={org} data={D.SUSPENDED_BILLING[org] || { reason: "Billing cause unresolved", items: [], invoices: [] }} onAction={showToast}
          wallet={wallet} onAddMethod={addPaymentMethod} /> :
          accountState === "suspended" && screen !== "requests" ?
          <AccountStateGate state="suspended" org={org} onOpenBilling={() => setScreen("billing")} /> :
          screen === "requests" ?
          <RequestsView sent={sentReqs} incoming={incomingCombined} showIncoming={persona.resolver}
          canAcceptSuite={persona.hasSubscriptions} onStartSuiteIntake={() => setSuiteIntakeOpen(true)}
          onReview={() => showToast("Request review — coming soon.")} onOpenBilling={() => setScreen("billing")}
          upgradeStage={upgradeStage} onRequestTierUpgrade={requestTierUpgrade} onOpenTierReview={openTierReview} onOpenManageSeats={openManageSeats}
          onOpenSuiteReview={openSuiteReview} /> :
          screen === "billing" ?
          <BillingScreen onAction={showToast}
          upgradeStage={upgradeStage} setUpgradeStage={setUpgradeStage} requestUpgrade={requestTierUpgrade}
          upgradeOpen={upgradeOpen} setUpgradeOpen={setUpgradeOpen} seatOpen={seatOpen} setSeatOpen={setSeatOpen}
          suiteStage={suiteStage} suiteMethod={suiteMethod} suiteOpen={suiteOpen} setSuiteOpen={setSuiteOpen}
          suiteDeal={D.SUITE_DEAL} onAcceptSuite={acceptSuiteDeal} onSimulateClear={simulateSuiteClear}
          wallet={wallet} onAddMethod={addPaymentMethod} /> :
          <>
          {hero === "bold" ?
            <span className="ai-pill"><Icon name="sparkle" size={14} /> AI-Powered Launcher</span> :
            <div className="eyebrow">Friday, May 1</div>}

          {greeting}
          <p className="subhead">
            {hero === "bold" ?
              "Describe a task or topic \u2014 we\u2019ll route you to the right tools across PM Office." :
              <><strong style={{ color: "var(--text)", fontWeight: 500 }}>{apps.length} apps</strong> in {org}. Type a goal, a tool name, or a task.</>}
          </p>

          <SearchBar value={query} onChange={onChangeQuery} onSubmit={handleSend}
            suggestions={D.SUGGESTIONS} onChip={(s) => handleSend(s.label)} showChips={t.showChips} />
          <RouteResult result={route} onClose={() => {setRoute(null);setQuery("");}} />

          <Controls view={view} setView={setView} categories={availCategories}
            cats={cats}
            onToggleCat={(k) => setCats((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k])}
            onClearCats={() => setCats([])}
            sort={sort} setSort={setSort}
            avail={avail} onAvail={(v) => {setAvail(v);setCats([]);}} showViewSort={avail === "available"} />

          {avail === "available" ?
            visible.length === 0 ?
            <EmptyState query={"the selected filters"} /> :
            <>
              {pinned.length > 0 && <Section title="Pinned" count={pinned.length} dot="var(--accent)">{renderItems(pinned)}</Section>}
              {recent.length > 0 && <Section title="Recently Used" count={recent.length}>{renderItems(recent)}</Section>}
              {byCat.map((c) => <Section key={c.key} title={c.label} count={c.items.length} dot={c.dot}>{renderItems(c.items)}</Section>)}
          </> :
            <>
            {avail === "all" && <p className="catalog-intro">Everything available across {org} &mdash; each card shows whether you can launch it, request access, or add it.</p>}
            {exploreGroups.
              filter((g) => avail === "all" || g.key !== "available").
              map((g) => ({ ...g, list: cats.length ? g.apps.filter((a) => cats.includes(a.cat)) : g.apps })).
              filter((g) => g.list.length).
              map((g) =>
              <Section key={g.key} title={g.title} count={g.list.length} sub={g.sub}>
              <div className="cards-loose">
                {g.list.map((a) =>
                  <ExploreCard key={a.id} app={a} action={g.action} helper={g.helper}
                  suiteStatus={a.id === "x-payroll-suite" ? suiteStage : null} onReview={openSuiteReview}
                  authority={viewerHasSubscriptions} onStartIntake={() => setSuiteIntakeOpen(true)}
                  onLaunch={(x) => x.repPortal ? launchSalesRepPortal() : showToast("Launching " + x.name + "\u2026")}
                  onRequest={(x) => {
                    // Owner (authority): Request Access opens the ops-authored
                    // intake \u2014 the request that lands in the ops queue (REQ-1042).
                    // Standard user: "Request for your team" ESCALATES up the
                    // invite chain to the owner \u2014 never straight to ops.
                    if (x.id === "x-payroll-suite") {
                      if (viewerHasSubscriptions) setSuiteIntakeOpen(true);else escalateSuite();
                      return;
                    }
                    showToast(x.negotiated ?
                    (viewerHasSubscriptions ? "Request sent \u2014 routed to Platform Operations." : "Request sent \u2014 escalated to Lena Strand (owner).") :
                    "Request sent \u2014 your administrator will review it.");
                  }}
                  onTrial={(x) => showToast("Starting your " + x.name + " free trial\u2026")}
                  onSubscribe={(x) => showToast("Opening checkout for " + x.name + "\u2026")}
                  onDemo={(x) => showToast("Opening " + x.name + " demo\u2026")} />
                  )}
              </div>
            </Section>
              )}
          </>
            }
          </>
          }
        </div>

        {chatActive &&
        <ChatView messages={chat} onNewChat={newChat} onLaunch={(a) => a.repPortal ? launchSalesRepPortal() : showToast("Launching " + a.name + "\u2026")}>
          <SearchBar value={query} onChange={onChangeQuery} onSubmit={handleSend}
          suggestions={D.SUGGESTIONS} onChip={(s) => handleSend(s.label)} showChips={false} />
        </ChatView>
        }
      </main>

      {!embed &&
      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={theme} options={["light", "dark"]}
        onChange={(v) => {setTheme(v);setTweak("theme", v);}} />
        <TweakColor label="Accent" value={t.accent}
        options={[["#15803d", "#14b8a6"], ["#2563eb", "#22d3ee"], ["#7c3aed", "#c084fc"], ["#c2410c", "#f59e0b"], ["#0f172a", "#475569"]]}
        onChange={(v) => setTweak("accent", v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Hero" value={t.heroStyle} options={["blend", "bold"]}
        onChange={(v) => setTweak("heroStyle", v)} />
        <TweakRadio label="Apps" value={view} options={["list", "grid"]}
        onChange={(v) => {setView(v);setTweak("defaultView", v);}} />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]}
        onChange={(v) => setTweak("density", v)} />
        <TweakToggle label="Suggestion chips" value={t.showChips} onChange={(v) => setTweak("showChips", v)} />
      </TweaksPanel>
      }
      {modalApp && <AppModal app={modalApp} hasSandbox={appHasSandbox(modalApp)} requestTarget={requestTarget}
      onClose={() => setModalApp(null)} onSandbox={openSandbox} onRequest={requestAccess} />}
      {requestOpen && <RequestToolModal onClose={() => setRequestOpen(false)} onSubmit={submitToolRequest} />}
      {suiteIntakeOpen && <IntakeFormModal form={D.SUITE_INTAKE} onClose={() => setSuiteIntakeOpen(false)} onSubmit={submitSuiteIntake} />}
      {repAppOpen && <RepApplicationModal onClose={() => setRepAppOpen(false)} onSubmit={submitRepApplication} />}
      {toast && <Toast text={toast} />}
      {notifOpen && <NotificationsDrawer groups={notifGroups} onClose={() => setNotifOpen(false)}
      onMarkAll={() => setNotifGroups((gs) => gs.map((g) => ({ ...g, items: g.items.map((n) => ({ ...n, unread: false })) })))} />}
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);