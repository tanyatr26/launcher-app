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
  const [org, setOrg] = useState("Metro Temps LLC");
  const [pins, setPins] = useState(() => {
    const o = {};D.APPS.forEach((a) => {o[a.id] = a.pinned;});(D.HOME_APPS || []).forEach((a) => {o[a.id] = a.pinned;});return o;
  });

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
      showToast("Terms ready for Customer Configuration \u2014 review & accept.");
    }, 2600);
  };
  // Open the review-and-accept modal in Subscriptions (used by the Requests "Terms ready" row).
  const openTierReview = () => {setScreen("billing");setUpgradeOpen(true);};
  // Open Manage seats in Subscriptions (used by the Requests seat-shortage row).
  const openManageSeats = () => {setScreen("billing");setSeatOpen(true);};

  // ---- mock chat ----
  function mockReply(prompt, hasFiles) {
    const q = (prompt || "").toLowerCase();
    let ids;
    if (/onboard|hire|contractor|new employee/.test(q)) ids = ["employee-records", "manage-users", "org-chart"];else
    if (/tax|w-?2|year[- ]?end/.test(q)) ids = ["year-end-w2", "tax-filing", "accounting"];else
    if (/close|month|reconcil|account|finance/.test(q)) ids = ["accounting", "process-payroll", "claims"];else
    if (/invoice|upload|document|file/.test(q)) ids = ["file-uploader", "ai-docs", "documents"];else
    if (/payroll|pay run|compensat|salary/.test(q)) ids = ["payroll-run", "process-payroll", "compensation"];else
    if (hasFiles) ids = ["ai-docs", "documents", "file-uploader"];else
    {
      ids = D.APPS.filter((a) => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)).slice(0, 3).map((a) => a.id);
      if (ids.length < 2) ids = ["process-payroll", "accounting", "ai-docs"];
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
  const openRecent = (r) => {setScreen("home");setChat([{ role: "user", text: r.prompt }, mockReply(r.prompt)]);};
  // Apps with an `inplace` flag render their screen in the main area instead of launching a tab.
  const openApp = (a) => {if (a.inplace) {setChat(null);setScreen(a.inplace);}};

  // ---- access requests (Explore) ----
  // Conditional flags (not hard-coded): Ophelia is a scoped Payroll Specialist, not a top-level admin.
  const viewerIsTopAdmin = false;
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

  const apps = useMemo(() => D.HOME_APPS.map((a) => ({ ...a, pinned: pins[a.id] })), [pins]);
  const allApps = useMemo(() => D.APPS.map((a) => ({ ...a, pinned: pins[a.id] })), [pins]);

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
    if (avail === "notyet") pool = D.EXPLORE_GROUPS.filter((g) => g.key !== "available").flatMap((g) => g.apps);else
    pool = D.EXPLORE_GROUPS.flatMap((g) => g.apps);
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
      <>Good morning, <span className="accent">Ophelia</span></>}
    </h1>
    <button className="bell-btn" onClick={() => setNotifOpen(true)} aria-label="Notifications">
      <Icon name="bell" size={22} />
      {notifUnread > 0 && <span className="bell-badge">{notifUnread}</span>}
    </button>
  </div>;


  return (
    <div className="app">
      <Sidebar theme={theme} onToggleTheme={toggleTheme} query={query} setQuery={onChangeQuery}
      screen={screen} onNavigate={setScreen} onRequestTool={() => setRequestOpen(true)}
      recents={D.RECENTS} onOpenRecent={openRecent}
      org={org} orgs={D.ORGS} onSwitchOrg={switchOrg} />

      <main className="main" style={{ fontWeight: "500" }}>
        <div className={"main-inner" + (chatActive ? " dim" : "")}>
          {screen === "requests" ?
          <RequestsView onReview={() => showToast("Request review — coming soon.")} onOpenBilling={() => setScreen("billing")}
          upgradeStage={upgradeStage} onRequestTierUpgrade={requestTierUpgrade} onOpenTierReview={openTierReview} onOpenManageSeats={openManageSeats} /> :
          screen === "billing" ?
          <BillingScreen onAction={showToast}
          upgradeStage={upgradeStage} setUpgradeStage={setUpgradeStage} requestUpgrade={requestTierUpgrade}
          upgradeOpen={upgradeOpen} setUpgradeOpen={setUpgradeOpen} seatOpen={seatOpen} setSeatOpen={setSeatOpen} /> :
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
            {D.EXPLORE_GROUPS.
              filter((g) => avail === "all" || g.key !== "available").
              map((g) => ({ ...g, list: cats.length ? g.apps.filter((a) => cats.includes(a.cat)) : g.apps })).
              filter((g) => g.list.length).
              map((g) =>
              <Section key={g.key} title={g.title} count={g.list.length} sub={g.sub}>
              <div className="cards-loose">
                {g.list.map((a) =>
                  <ExploreCard key={a.id} app={a} action={g.action} helper={g.helper}
                  onLaunch={(x) => showToast("Launching " + x.name + "\u2026")}
                  onRequest={(x) => showToast("Request sent \u2014 your administrator will review it.")}
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
        <ChatView messages={chat} onNewChat={newChat} onLaunch={(a) => showToast("Launching " + a.name + "\u2026")}>
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
      {toast && <Toast text={toast} />}
      {notifOpen && <NotificationsDrawer groups={notifGroups} onClose={() => setNotifOpen(false)}
      onMarkAll={() => setNotifGroups((gs) => gs.map((g) => ({ ...g, items: g.items.map((n) => ({ ...n, unread: false })) })))} />}
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);