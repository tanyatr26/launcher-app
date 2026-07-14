// launcher-ui.jsx — presentational components (depends on window.Icon, window.Logo)
const { useState } = React;
const GRADS = () => window.LAUNCHER_DATA.GRAD;
const HUE = () => window.LAUNCHER_DATA.GRAD_HUE;

function Tile({ app, lg }) {
  return (
    <span className={"tile" + (lg ? " lg" : "")} style={{ "--th": HUE()[app.grad] }}>
      <Icon name={app.icon} stroke={1.9} />
    </span>);

}

/* ---------------- Org switcher ---------------- */
function OrgSwitcher({ org, orgs, onSwitch }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    const onKey = (e) => {if (e.key === "Escape") setOpen(false);};
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {document.removeEventListener("mousedown", onDoc);document.removeEventListener("keydown", onKey);};
  }, [open]);
  const multi = orgs.length > 1;
  const inner =
  <>
      <span className="brand-logo"><Logo size={24} /></span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <div className="brand-name">PM Office</div>
        <div className="brand-sub">{org}</div>
      </span>
      {multi && <Icon name="chevrons" size={16} className="org-chev" />}
    </>;

  if (!multi) return <div className="brand">{inner}</div>;
  return (
    <div className="org-switcher" ref={ref}>
      <button className={"brand brand-btn" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        {inner}
      </button>
      {open &&
      <div className="org-menu" role="listbox" aria-label="Switch organization">
        {orgs.map((o) =>
        <button key={o} role="option" aria-selected={o === org}
        className={"org-item" + (o === org ? " active" : "")} onClick={() => {onSwitch(o);setOpen(false);}}>
            <span className="org-item-name">{o}</span>
            {o === org && <Icon name="check" size={16} className="org-check" />}
          </button>
        )}
        <div className="org-count">{orgs.length} organizations</div>
      </div>
      }
    </div>);

}

/* ---------------- Sidebar ---------------- */
function Sidebar({ theme, onToggleTheme, query, setQuery, screen, onNavigate, onRequestTool, recents, onOpenRecent, org, orgs, onSwitchOrg, hasSubscriptions, accountState, persona, personas, onSwitchPersona }) {
  // Subscriptions renders ONLY for holders of the Subscriptions entitlement
  // (subscription authority) — the BFF's has_subscriptions signal. Non-holders
  // never see the nav item (docs: 00 · Overview, Subscriptions vs Billing App).
  // OFFBOARDED is residual mode — "no launches or commercial actions" — so the
  // nav collapses to Apps (which renders the residual notice). SUSPENDED keeps
  // the full nav: Subscriptions stays reachable to fix the billing cause.
  const offboarded = accountState === "offboarded";
  const nav = [
  { icon: "browse", label: "Apps", screen: "home" },
  ...(hasSubscriptions && !offboarded ? [{ icon: "receipt", label: "Subscriptions", screen: "billing" }] : []),
  ...(!offboarded ? [{ icon: "requests", label: "Access Requests", badge: 10, screen: "requests" }] : [])];

  return (
    <aside className="sidebar">
      <OrgSwitcher org={org} orgs={orgs} onSwitch={onSwitchOrg} />

      <nav className="nav">
        {nav.map((n) =>
        <button key={n.label} className={"nav-item" + (n.screen && screen === n.screen ? " active" : "")}
        onClick={() => n.screen && onNavigate(n.screen)}>
            <Icon name={n.icon} size={18} className="nav-ico" />
            <span>{n.label}</span>
            {n.badge != null && <span className="nav-badge">{n.badge}</span>}
          </button>
        )}
      </nav>

      {recents && recents.length > 0 &&
      <div className="nav-group">
        <div className="nav-group-label">Recents</div>
        {recents.map((r) =>
        <button key={r.id} className="recent-row" onClick={() => onOpenRecent && onOpenRecent(r)}>
            <span className="recent-title">{r.title}</span>
            <span className="recent-time">{r.time}</span>
          </button>
        )}
      </div>
      }

      <div className="sidebar-spacer" />

      <div className="sidebar-foot">
        {!offboarded && <button className="foot-item" onClick={onRequestTool}><Icon name="plus" size={18} className="nav-ico" /><span>Request a tool</span></button>}
        <button className="foot-item" onClick={onToggleTheme}>
          <Icon name="theme" size={18} className="nav-ico" />
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>

      <PersonaSwitcher persona={persona} personas={personas} onSwitch={onSwitchPersona} />
    </aside>);

}

/* ---------------- Persona switcher (demo views) ---------------- */
/* Two demo views of the SAME org, split by subscription authority (user
   decision 2026-07-13): Lena Strand (owner — the resolver requests escalate
   to; sees Subscriptions + commercial actions + the ops intake flow) and
   Ophelia Crosby (standard user — "Request for your team", no Subscriptions).
   A demo control, not product chrome — hence the demo tag. */
function PersonaSwitcher({ persona, personas, onSwitch }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    const onKey = (e) => {if (e.key === "Escape") setOpen(false);};
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {document.removeEventListener("mousedown", onDoc);document.removeEventListener("keydown", onKey);};
  }, [open]);
  if (!persona) return null;
  const list = Object.values(personas || {});
  return (
    <div className="persona-wrap" ref={ref}>
      <style>{`
.persona-wrap{position:relative}
.persona-wrap .user-card{width:100%;cursor:pointer;text-align:left;background:none}
.persona-menu{position:absolute;bottom:calc(100% + 8px);left:6px;right:6px;background:var(--surface);border:1px solid var(--border-strong);border-radius:var(--r-lg);box-shadow:var(--shadow-pop);padding:6px;z-index:80}
.persona-label{display:flex;align-items:center;gap:7px;font-size:10.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);padding:6px 8px 5px}
.demo-tag{font-size:9.5px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--text-2);background:color-mix(in oklch,var(--text) 8%,transparent);border-radius:4px;padding:1px 5px}
.persona-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:8px;border-radius:var(--r-md);transition:background .12s}
.persona-item:hover{background:var(--surface-hover)}
.persona-item.active{background:color-mix(in oklch,var(--text) 7%,transparent)}
.persona-av{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:500;font-size:12px;flex:none}
.persona-meta{min-width:0}
.persona-name{font-size:13px;font-weight:500;color:var(--text);white-space:nowrap}
.persona-role{font-size:11px;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`}</style>
      <button className="user-card" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label="Switch demo view">
        <span className="user-av-wrap">
          <span className="user-av" aria-label={persona.name}
          style={{ display: "grid", placeItems: "center", color: "#fff", fontWeight: 500, fontSize: 14,
            backgroundImage: persona.avatarGrad }}>{persona.initials}</span>
          <span className="user-dot" />
        </span>
        <span style={{ minWidth: 0 }}>
          <div className="user-name">{persona.name}</div>
          <div className="user-role">{persona.role}</div>
        </span>
        <Icon name="chevrons" size={16} className="user-chevs" />
      </button>
      {open &&
      <div className="persona-menu" role="menu" aria-label="Demo view">
        <div className="persona-label">Demo view <span className="demo-tag">demo</span></div>
        {list.map((p) =>
        <button key={p.key} role="menuitemradio" aria-checked={p.key === persona.key}
        className={"persona-item" + (p.key === persona.key ? " active" : "")}
        onClick={() => {onSwitch && onSwitch(p.key);setOpen(false);}}>
            <span className="persona-av" style={{ backgroundImage: p.avatarGrad }}>{p.initials}</span>
            <span className="persona-meta">
              <div className="persona-name">{p.name}</div>
              <div className="persona-role">{p.role}</div>
            </span>
            {p.key === persona.key && <Icon name="check" size={15} style={{ marginLeft: "auto", color: "var(--text)" }} />}
          </button>
        )}
      </div>
      }
    </div>);

}

/* ---------------- AI search ---------------- */
function SearchBar({ value, onChange, onSubmit, suggestions, onChip, showChips }) {
  const [attached, setAttached] = useState([]);
  const imgRef = React.useRef(null);
  const fileRef = React.useRef(null);

  const addFiles = (fileList, kind) => {
    const next = [...fileList].map((f) => ({
      id: f.name + f.size + Math.random().toString(36).slice(2, 6),
      name: f.name,
      kind,
      isImage: f.type.startsWith("image/"),
      ext: (f.name.split(".").pop() || "").toUpperCase(),
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
      size: f.size
    }));
    setAttached((a) => [...a, ...next]);
  };
  const remove = (id) => setAttached((a) => a.filter((x) => x.id !== id));
  const fmt = (b) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1) + " MB";

  return (
    <div className="search-wrap">
      <form className="search-bar" onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim() && attached.length === 0) return;
        onSubmit(value, attached);
        setAttached([]);
      }}>
        <Icon name="sparkle" size={22} className="spark" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe a task &mdash; or drop in a document"
          aria-label="Ask the launcher" />
        <div className="search-tools">
          <button type="button" className="attach-btn" aria-label="Attach image"
          title="Attach an image" onClick={() => imgRef.current && imgRef.current.click()}>
            <Icon name="image" size={19} />
          </button>
          <button type="button" className="attach-btn" aria-label="Upload a file"
          title="Upload a file" onClick={() => fileRef.current && fileRef.current.click()}>
            <Icon name="paperclip" size={19} />
          </button>
          <span className="divider" />
        </div>
        <button type="submit" className="search-send" aria-label="Route me" style={{ color: "rgb(255, 255, 255)" }}
        disabled={!value.trim() && attached.length === 0}>
          <Icon name="send" size={18} stroke={2} />
        </button>
        <input ref={imgRef} type="file" accept="image/*" multiple hidden
        onChange={(e) => {addFiles(e.target.files, "image");e.target.value = "";}} />
        <input ref={fileRef} type="file" multiple hidden
        onChange={(e) => {addFiles(e.target.files, "file");e.target.value = "";}} />
      </form>

      {attached.length > 0 &&
      <div className="attach-row">
          {attached.map((a) =>
        <span key={a.id} className="attach-chip">
              <span className="attach-thumb">
                {a.isImage && a.url ? <img src={a.url} alt="" /> : <Icon name={a.isImage ? "image" : "paperclip"} size={16} />}
              </span>
              <span className="attach-meta">
                <span className="attach-name">{a.name}</span>
                <span className="attach-kind">{fmt(a.size)}</span>
              </span>
              <button type="button" className="attach-x" aria-label="Remove" onClick={() => remove(a.id)}>
                <Icon name="x" size={14} />
              </button>
            </span>
        )}
        </div>
      }

      {showChips &&
      <div className="chips">
          <span className="chips-label">Try</span>
          {suggestions.map((s) =>
        <button key={s.label} className="chip" onClick={() => onChip(s)}>{s.label}</button>
        )}
        </div>
      }
    </div>);

}

function RouteResult({ result, onClose }) {
  if (!result) return null;
  return (
    <div className="route-result">
      <div className="route-head">
        <Icon name="sparkle" size={18} className="spark" />
        <p>
          {result.lead} <span className="dim">{result.detail}</span>
        </p>
        <button className="route-close" onClick={onClose} aria-label="Dismiss"><Icon name="x" size={16} /></button>
      </div>
    </div>);

}

/* ---------------- Controls bar ---------------- */
function Controls({ view, setView, categories, cats, onToggleCat, onClearCats, sort, setSort, avail, onAvail, showViewSort }) {
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);
  const sorts = ["Smart", "Recently used", "A \u2013 Z", "Newest"];
  const n = cats.length;
  const avails = [{ k: "available", l: "Available to me" }, { k: "notyet", l: "Not yet available" }, { k: "all", l: "All" }];
  const availLabel = (avails.find((a) => a.k === avail) || avails[0]).l;
  return (
    <div className="controls">
      <div style={{ position: "relative" }}>
        <button className={"filterbtn" + (availOpen ? " open" : "") + (avail !== "available" ? " has-filters" : "")}
        onClick={() => setAvailOpen((o) => !o)} aria-expanded={availOpen}>
          <Icon name="compass" size={14} />
          Availability: {availLabel}
          <Icon name="chevR" size={13} style={{ transform: "rotate(90deg)", opacity: .7 }} />
        </button>
        {availOpen &&
        <>
          <div className="dropdown-backdrop" onClick={() => setAvailOpen(false)} />
          <div className="filter-menu">
            <div className="filter-menu-head"><span>Availability</span></div>
            {avails.map((a) =>
            <button key={a.k} className="filter-opt" onClick={() => {onAvail(a.k);setAvailOpen(false);}}>
                <span className={"radio-dot" + (avail === a.k ? " on" : "")}>{avail === a.k && <span className="radio-fill" />}</span>
                <span className="filter-opt-label">{a.l}</span>
              </button>
            )}
          </div>
        </>
        }
      </div>
      <div style={{ position: "relative" }}>
        <button className={"filterbtn" + (filterOpen ? " open" : "") + (n ? " has-filters" : "")}
        onClick={() => setFilterOpen((o) => !o)} aria-expanded={filterOpen}>
          <Icon name="filter" size={14} />
          Filter
          {n > 0 && <span className="filter-count">{n}</span>}
          <Icon name="chevR" size={13} style={{ transform: "rotate(90deg)", opacity: .7 }} />
        </button>
        {filterOpen &&
        <>
          <div className="dropdown-backdrop" onClick={() => setFilterOpen(false)} />
          <div className="filter-menu">
            <div className="filter-menu-head">
              <span>Filter by category</span>
              {n > 0 && <button className="filter-clear" onClick={onClearCats}>Clear</button>}
            </div>
            {categories.map((c) => {
              const on = cats.includes(c.key);
              return (
                <button key={c.key} className="filter-opt" onClick={() => onToggleCat(c.key)}>
                  <span className={"checkbox" + (on ? " on" : "")}>{on && <Icon name="check" size={12} stroke={3} />}</span>
                  <span className="dot" style={{ background: c.dot }} />
                  <span className="filter-opt-label">{c.label}</span>
                </button>);
            })}
          </div>
        </>
        }
      </div>
      <div className="controls-right" style={showViewSort ? null : { visibility: "hidden" }}>
        <div className="view-toggle" role="tablist" aria-label="View">
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view"><Icon name="list" size={17} /></button>
          <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Icon name="grid" size={16} /></button>
        </div>
        <div style={{ position: "relative" }}>
          <button className="sortbtn" onClick={() => setSortOpen((o) => !o)}>
            <Icon name="sort" size={15} /> Sort: {sort} <Icon name="chevR" size={14} style={{ transform: "rotate(90deg)" }} />
          </button>
          {sortOpen &&
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 30,
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
            boxShadow: "var(--shadow-pop)", padding: 5, minWidth: 170 }}>
              {sorts.map((s) =>
            <button key={s} onClick={() => {setSort(s);setSortOpen(false);}}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
              padding: "8px 11px", borderRadius: 7, fontSize: 13.5, color: "var(--text)",
              background: s === sort ? "var(--surface-hover)" : "transparent" }}>
                  {s} {s === sort && <Icon name="chevR" size={14} style={{ color: "var(--text)", transform: "rotate(0)" }} />}
                </button>
            )}
            </div>
          }
        </div>
      </div>
    </div>);

}

/* ---------------- Section wrapper ---------------- */
function Section({ title, count, dot, sub, action, children }) {
  return (
    <section className="section">
      <div className="section-head">
        <span className="section-title" style={{ fontFamily: "Inter", fontWeight: "600" }}>
          {dot && <span className="dot" style={{ background: dot }} />}{title}
        </span>
        {count != null && <span className="section-count">{count}</span>}
        <span className="section-rule" />
        {action}
      </div>
      {sub && <p className="section-sub">{sub}</p>}
      {children}
    </section>);

}

/* ---------------- List row ---------------- */
function AppRow({ app, onTogglePin, highlight, onOpen }) {
  return (
    <div className="app-row" style={highlight ? { outline: "2px solid color-mix(in oklch, var(--text) 25%, transparent)", outlineOffset: -2 } : undefined}
    onClick={onOpen && (app.inplace || app.repPortal) ? () => onOpen(app) : undefined}>
      <Tile app={app} />
      <span className="meta">
        <span className="name" style={{ fontWeight: "500", fontFamily: "\"DM Sans\"" }}>{app.name}</span>
        {app.used && <span className="time">{app.used}</span>}
      </span>
      <span className="desc">{app.desc}</span>
      <span className="row-actions">
        {app.isNew > 0 && <span className="badge-new">{app.isNew} New</span>}
        <button className={"iconbtn pin-btn" + (app.pinned ? " pinned" : "")}
        onClick={(e) => {e.stopPropagation();onTogglePin(app.id);}}
        aria-label={app.pinned ? "Unpin" : "Pin"}>
          <Icon name="pin" size={17} fill={app.pinned ? "currentColor" : "none"} />
        </button>
        <button className="iconbtn chev" aria-label="Open"><Icon name="chevR" size={17} /></button>
      </span>
    </div>);

}

/* ---------------- Grid card ---------------- */
function AppCard({ app, onTogglePin, highlight, onOpen, explore }) {
  if (explore) {
    return (
      <div className="card card-locked" onClick={onOpen ? () => onOpen(app) : undefined}>
        <div className="card-top">
          <Tile app={app} lg />
          {app.isNew > 0 && <span className="badge-new">{app.isNew} New</span>}
        </div>
        <h3 className="card-title">{app.name}</h3>
        <p className="card-desc">{app.desc}</p>
        <div className="card-foot">
          <span className="launch">Request Access</span>
        </div>
      </div>);

  }
  return (
    <div className="card" style={highlight ? { outline: "2px solid color-mix(in oklch, var(--text) 25%, transparent)", outlineOffset: -2 } : null}
    onClick={onOpen ? () => onOpen(app) : undefined}>
      <div className="card-top">
        <Tile app={app} lg />
        {app.isNew > 0 && <span className="badge-new">{app.isNew} New</span>}
      </div>
      <h3 className="card-title">{app.name}</h3>
      <p className="card-desc">{app.desc}</p>
      <div className="card-foot">
        <span className="launch">Launch <Icon name="upRight" size={16} stroke={2} /></span>
        <button className={"iconbtn card-pin" + (app.pinned ? " pinned" : "")}
        onClick={(e) => {e.stopPropagation();onTogglePin(app.id);}}
        aria-label={app.pinned ? "Unpin" : "Pin"}>
          <Icon name="pin" size={17} fill={app.pinned ? "currentColor" : "none"} />
        </button>
      </div>
    </div>);

}

/* ---------------- Explore card (three states) ---------------- */
function ExploreCard({ app, action, helper, onLaunch, onRequest, onTrial, onSubscribe, onDemo, suiteStatus, onReview, authority = true, onStartIntake, onOpenRequests, onOpenBilling }) {
  const stop = (fn) => (e) => {e.stopPropagation();fn && fn(app);};
  // The Payroll Suite card walks the acquisition stages in place: escalated
  // (a standard user requested for the team — the OWNER starts the licensing
  // request) → requested/pending → terms ready (authority accepts; others see
  // it parked with the owner) → accepted-awaiting-payment. Nothing activates
  // from this card — only accept-and-pay does that.
  if (suiteStatus && suiteStatus !== "none" && suiteStatus !== "live") {
    // Clicking the CARD follows the stage to where the work is (user decision
    // 2026-07-14): terms-ready (authority) opens review & accept; a pending or
    // escalated request lands on Access Requests; accepted-awaiting-payment
    // lands on Subscriptions. The in-card pill/button still works on its own.
    const cardGo =
      suiteStatus === "terms-ready" && authority ? onReview :
      suiteStatus === "pending" || (suiteStatus === "escalated" && !authority) ? onOpenRequests :
      suiteStatus === "awaiting-clear" ? onOpenBilling : null;
    return (
      <div className={"card" + (cardGo ? " card-locked" : "")} onClick={cardGo ? () => cardGo(app) : undefined}>
        <div className="card-top"><Tile app={app} lg /></div>
        <h3 className="card-title">{app.name}</h3>
        <p className="card-desc">{app.desc}</p>
        <div className="card-foot explore-foot">
          {suiteStatus === "escalated" && (authority ?
          <button className="cta-fill" onClick={stop(onStartIntake)}>Start licensing request</button> :
          <span className="status-pill pending"><span className="sdot" />Requested &mdash; with the account owner</span>)}
          {suiteStatus === "pending" && <span className="status-pill pending"><span className="sdot" />Requested &mdash; pending with Platform Operations</span>}
          {suiteStatus === "terms-ready" && (authority ?
          <button className="status-pill ready" onClick={stop(onReview)}><span className="sdot" />Terms ready &mdash; Review &amp; accept</button> :
          <span className="status-pill pending"><span className="sdot" />Terms ready &mdash; awaiting the owner</span>)}
          {suiteStatus === "awaiting-clear" && <span className="status-pill pending"><span className="sdot" />Accepted &mdash; awaiting payment</span>}
        </div>
      </div>);
  }
  return (
    <div className="card">
      <div className="card-top">
        <Tile app={app} lg />
        {app.isNew > 0 && <span className="badge-new">{app.isNew} New</span>}
      </div>
      <h3 className="card-title">{app.name}</h3>
      <p className="card-desc">{app.desc}</p>

      {action === "request" && helper && <p className="card-helper">{helper}</p>}

      <div className="card-foot explore-foot">
        {action === "launch" &&
        <button className="launch launch-link" onClick={stop(onLaunch)}>Launch <Icon name="upRight" size={15} stroke={2} /></button>
        }
        {action === "request" &&
        <button className="cta-fill" onClick={stop(onRequest)}>Request Access</button>
        }
        {action === "sales" && (
        app.negotiated ?
        /* Admin-negotiated catalog entry (ops resolution mode). The label is
           authority-split per the docs' action matrix: the owner's Request
           Access starts the ops licensing request; everyone else's "Request
           for your team" ESCALATES up the invite chain to the owner. */
        <span className="sales-actions">
            <button className="cta-fill" onClick={stop(onRequest)}>{authority ? "Request Access" : "Request for your team"}</button>
          </span> :
        app.trial ?
        <span className="sales-actions">
            <button className="cta-fill" onClick={stop(onTrial)}>Start Free Trial</button>
            <button className="btn-demo" onClick={stop(onDemo)}>View Demo</button>
          </span> :
        <span className="sales-actions">
            <button className="cta-fill" onClick={stop(onSubscribe)}>Subscribe</button>
            <button className="btn-demo" onClick={stop(onDemo)}>View Demo</button>
          </span>)
        }
      </div>
    </div>);

}

/* ---------------- Requests view ---------------- */
function RequestsView({ incoming, sent, showIncoming = true, canAcceptSuite = true, onStartSuiteIntake, onReview, onOpenBilling, upgradeStage, onRequestTierUpgrade, onOpenTierReview, onOpenManageSeats, onOpenSuiteReview }) {
  const R = window.LAUNCHER_DATA.REQUESTS;
  const incomingList = incoming || R.incoming;
  const sentList = sent || R.sent;
  // "terms-ready": ops issued terms on an admin-negotiated request — the row's
  // affordance deep-links to the acceptance surface in Subscriptions.
  const statusLabel = { pending: "Pending", accepted: "Accepted", denied: "Denied", "terms-ready": "Terms ready" };
  // Right-side affordance + click target for a capacity (seats / tier) request row.
  const capacityAction = (r) => {
    if (r.capacity === "seats")
    return { onClick: onOpenManageSeats, node: <span className="req-review">Manage seats</span> };
    // tier upgrade — follows the shared request flow
    if (upgradeStage === "requested")
    return { onClick: null, node: <span className="status-pill pending"><span className="sdot" />Awaiting terms</span> };
    if (upgradeStage === "ready")
    return { onClick: onOpenTierReview, node: <button className="status-pill ready"><span className="sdot" />Terms ready</button> };
    if (upgradeStage === "done")
    return { onClick: null, node: <span className="status-pill accepted"><span className="sdot" />Upgraded</span> };
    return { onClick: onRequestTierUpgrade, node: <span className="req-review">Request upgrade</span> };
  };
  return (
    <div>
      <div className="eyebrow">Access</div>
      <h1 className="greeting" style={{ fontSize: "42px", textAlign: "left", height: "52px" }}>Access Requests</h1>
      <p className="subhead" style={{ lineHeight: "1.3", height: "32px" }}>Track access requests you&rsquo;ve sent and review requests waiting on you.</p>

      <div style={{ marginTop: 30 }}>
        {/* Incoming = requests waiting on YOU as a resolver — only the
            authority holder (owner) resolves anything, so a standard user
            sees Sent only (their requests escalate up the chain instead). */}
        {showIncoming &&
        <Section title="Incoming" count={incomingList.length}>
          <div className="rows">
            {incomingList.map((r) => {
              if (r.type === "escalation") {
                return (
                  <div key={r.id} className="app-row">
                    <span className="req-av" style={{ "--th": HUE()[r.grad] }}>{r.initials}</span>
                    <span className="meta">
                      <span className="name">{r.requester} <span className="req-arrow">&rarr;</span> requested for the team <span className="req-dot">&middot;</span> {r.app}</span>
                      <span className="time">Escalated to you &mdash; you hold subscription authority <span className="req-dot">&middot;</span> {r.time}</span>
                    </span>
                    <span className="row-actions">
                      <button className="status-pill ready" onClick={onStartSuiteIntake}><span className="sdot" />Start licensing request</button>
                    </span>
                  </div>);
              }
              if (r.type === "capacity") {
                const { onClick, node } = capacityAction(r);
                return (
                  <div key={r.id} className={"app-row" + (onClick ? " req-clickable" : "")}
                  onClick={onClick || undefined} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}
                  onKeyDown={onClick ? (e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();onClick();}} : undefined}>
                    <span className="req-av" style={{ "--th": HUE()[r.grad] }}>{r.icon ? <Icon name={r.icon} size={18} /> : r.initials}</span>
                    <span className="meta">
                      <span className="name">{r.requester} <span className="req-arrow">&rarr;</span> {r.capacity === "seats" ? "needs seats" : "tier upgrade"} <span className="req-dot">&middot;</span> {r.app}</span>
                      <span className="time">{r.delta} <span className="req-dot">&middot;</span> {r.time}</span>
                    </span>
                    <span className="row-actions">{node}</span>
                  </div>);

              }
              return (
                <div key={r.id} className="app-row">
                  <span className="req-av" style={{ "--th": HUE()[r.grad] }}>{r.initials}</span>
                  <span className="meta">
                    <span className="name">{r.requester} <span className="req-arrow">&rarr;</span> {r.app}</span>
                    <span className="time">{r.time}</span>
                  </span>
                </div>);

            })}
          </div>
        </Section>
        }

        <Section title="Sent" count={sentList.length}>
          <div className="rows">
            {sentList.map((r) =>
            <div key={r.id} className="app-row">
                <Tile app={{ grad: r.grad, icon: r.icon }} />
                <span className="meta">
                  <span className="name">{r.app} <span className="req-arrow">&rarr;</span> {r.to}</span>
                  <span className="time">{r.time}</span>
                </span>
                <span className="row-actions">
                  {r.status === "terms-ready" ?
                (canAcceptSuite ?
                <button className="status-pill ready" onClick={onOpenSuiteReview}><span className="sdot" />Terms ready &mdash; Review &amp; accept</button> :
                /* Acceptance is a financial commitment — authority-gated. */
                <span className="status-pill pending"><span className="sdot" />Terms ready &mdash; awaiting the owner</span>) :
                <span className={"status-pill " + r.status}><span className="sdot" />{statusLabel[r.status]}</span>}
                </span>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>);

}

/* ---------------- Chat view ---------------- */
function ChatReply({ reason, apps, onLaunch }) {
  return (
    <div className="msg-ai">
      <p className="ai-reason">{reason}</p>
      <div className="chat-cards">
        {apps.map((a, i) =>
        <div key={a.id} className="chat-card">
            <span className="chat-card-num">{i + 1}</span>
            <Tile app={a} />
            <span className="chat-card-meta">
              <span className="chat-card-name">{a.name}</span>
              <span className="chat-card-desc">{a.desc}</span>
            </span>
            <span className="launch chat-launch" onClick={() => onLaunch && onLaunch(a)}>Launch <Icon name="upRight" size={15} stroke={2} /></span>
          </div>
        )}
      </div>
    </div>);

}

function ChatView({ messages, onNewChat, onLaunch, children }) {
  const threadRef = React.useRef(null);
  React.useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages]);
  return (
    <div className="chat-view">
      <div className="chat-bar">
        <button className="newchat-btn" onClick={onNewChat}><Icon name="arrowL" size={16} stroke={2} /> Back</button>
      </div>
      <div className="thread" ref={threadRef}>
        <div className="thread-inner">
          {messages.map((m, i) =>
          m.role === "user" ?
          <div key={i} className="msg-user">
              <div className="bubble-user">
                {m.files && m.files.length > 0 &&
              <div className="bubble-files">
                  {m.files.map((f) =>
                <span key={f.id} className="bubble-file">
                    <span className="bubble-file-ico"><Icon name={f.isImage ? "image" : "paperclip"} size={15} /></span>
                    <span className="bubble-file-meta">
                      <span className="bubble-file-name">{f.name}</span>
                      <span className="bubble-file-type">{f.ext || (f.isImage ? "Image" : "File")}</span>
                    </span>
                  </span>
                )}
                </div>
              }
                {m.text && <span className="bubble-text">{m.text}</span>}
              </div>
            </div> :
          <ChatReply key={i} reason={m.reason} apps={m.apps} onLaunch={onLaunch} />
          )}
        </div>
      </div>
      <div className="composer">
        <div className="composer-inner">{children}</div>
      </div>
    </div>);

}

/* ---------------- Account-state gates (BFF account_state driven) ---------------- */
/* The account lifecycle is OPS-OWNED; the launcher renders the state.
   suspended — "loads the chrome but gates the apps behind a prominent notice
   while Subscriptions stays reachable to subscription authority (a suspension
   is often a billing fix)" (01 · Architecture & Foundations).
   offboarded — "residual mode per ops teardown — read access to the
   organization's own records only, with no launches or commercial actions."
   Neither state is lifted launcher-side: suspension ends by a manual ops
   action once the balance resolves (Ops 03 · Licensing). */
function AccountStateGate({ state, org, onOpenBilling }) {
  const suspended = state === "suspended";
  return (
    <div className="state-gate">
      <style>{`
.state-gate{display:flex;align-items:center;justify-content:center;min-height:62vh}
.state-gate-card{max-width:560px;text-align:center;padding:42px 40px;border:1px solid var(--border);border-radius:var(--r-lg);background:var(--surface)}
.state-gate-ico{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;margin:0 auto 18px}
.state-gate-ico.warn{background:color-mix(in oklch,#f59e0b 16%,transparent);color:#f59e0b}
.state-gate-ico.dim{background:var(--surface-2);color:var(--text-3)}
.state-gate-eyebrow{font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;margin-bottom:8px}
.state-gate-eyebrow.warn{color:#f59e0b}
.state-gate-eyebrow.dim{color:var(--text-3)}
.state-gate-title{font-family:var(--font-display);font-weight:500;font-size:26px;letter-spacing:-.015em;color:var(--text);margin:0 0 10px}
.state-gate-text{font-size:14px;line-height:1.6;color:var(--text-2);margin:0 0 22px;text-wrap:pretty}
.state-gate-foot{font-size:12px;color:var(--text-3);margin-top:18px}
.state-gate-ro{display:inline-flex;align-items:center;gap:7px;font-size:13px;color:var(--text-3);border:1px dashed var(--border-strong);border-radius:var(--r-md);padding:9px 14px;cursor:default}
`}</style>
      <div className="state-gate-card">
        <span className={"state-gate-ico " + (suspended ? "warn" : "dim")}><Icon name={suspended ? "alert" : "claims"} size={26} /></span>
        <div className={"state-gate-eyebrow " + (suspended ? "warn" : "dim")}>{suspended ? "Account suspended" : "Account offboarded"}</div>
        <h2 className="state-gate-title">{suspended ? "Apps are unavailable" : "Residual access only"}</h2>
        {suspended ?
        <p className="state-gate-text">PM Office has suspended <strong>{org}</strong>. Apps are gated until the billing cause is resolved &mdash; Subscriptions stays available so it can be fixed.</p> :
        <p className="state-gate-text"><strong>{org}</strong> has been offboarded from PM Office. Your organization keeps read access to its own records &mdash; nothing more. Apps can&rsquo;t be launched and no commercial actions are available.</p>}
        {suspended ?
        <button className="cta-fill" onClick={onOpenBilling}>Go to Subscriptions</button> :
        <span className="state-gate-ro"><Icon name="eye" size={15} /> Read-only record access &mdash; opens in the owning app (pending)</span>}
        <div className="state-gate-foot">{suspended ? "Suspension is lifted by PM Office once the balance is resolved." : "Contact PM Office to reactivate this organization."}</div>
      </div>
    </div>);

}

/* Suspended-org Subscriptions — the billing-fix surface the suspension gate
   points to. Items + the failed invoice mirror the ops fixtures for the org
   (Pinnacle Per Diem: T&A and Check Printing renewals failed Apr 18; INV-9075).
   Updating the method only FORWARDS AN INTENT — settlement and the suspension
   lift are ops-side and manual, so the state stays suspended here. */
function SuspendedBillingScreen({ org, data, onAction, wallet, onAddMethod }) {
  const act = onAction || (() => {});
  const [pmItem, setPmItem] = useState(null);
  return (
    <div className="billing">
      <div className="billing-head">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="greeting" style={{ fontSize: "clamp(30px,3.4vw,42px)", marginBottom: 2 }}>Subscriptions</h1>
          <p className="billing-org">{org}</p>
        </div>
      </div>

      <div className="alert alert-danger">
        <span className="alert-ico"><Icon name="alert" size={19} /></span>
        <span className="alert-body">
          <span className="alert-eyebrow">Account suspended</span>
          <span className="alert-title" style={{ fontWeight: "600" }}>{data.reason}</span>
          <span className="alert-text">Apps stay gated until PM Office resolves the balance. Update the payment method so the failed charges can be retried.</span>
        </span>
      </div>

      <div className="sub-list">
        {data.items.map((s) =>
        <div key={s.id} className="sub-card">
            <div className="sub-left">
              <span className="tile lg" style={{ "--th": HUE()[s.grad] }}><Icon name={s.icon} stroke={1.9} /></span>
              <span className="sub-id"><span className="sub-name-row"><span className="sub-name">{s.name}</span></span></span>
            </div>
            <div className="sub-mid">
              <span className="price-block">
                <span className="price-line">{s.tier} <span className="price-dim">&middot; {s.band}</span></span>
                <span className="price-total">{s.total}</span>
              </span>
            </div>
            <div className="sub-right">
              <span className="sub-pills"><span className="status-pill denied"><span className="sdot" />Payment failed</span></span>
              <span className="sub-meta sub-metaline">{[s.renew, s.pay].filter(Boolean).join(" · ")}</span>
            </div>
            <SubKebab onAction={(label) => label === "Change payment method" ? setPmItem(s) : act(label)}
          items={[{ label: "Change payment method" }, { label: "View invoices" }]} />
          </div>
        )}
      </div>

      <div className="section inv-history-card" style={{ marginTop: 38 }}>
        <div className="section-head"><span className="section-title">Invoice history</span></div>
        <table className="inv-table">
          <colgroup><col className="ci-date" /><col className="ci-amt" /><col className="ci-status" /><col className="ci-act" /></colgroup>
          <thead><tr><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.invoices.map((v, i) =>
            <tr key={i}>
                <td>{v.date}</td>
                <td className="col-amt" style={{ textAlign: "left" }}>{v.amount} <span className="price-dim">&middot; {v.item}{v.ref ? " · " + v.ref : ""}</span></td>
                <td className="col-status"><span className={"status-pill " + invStatusClass(v.status)}><span className="sdot" />{v.status}</span></td>
                <td className="inv-action"><button className="link-quiet" onClick={() => setPmItem(data.items.find((x) => x.name === v.item) || data.items[0])}>Update method</button></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pmItem && <ChangePaymentModal sub={pmItem} onClose={() => setPmItem(null)} wallet={wallet} onAdd={onAddMethod}
      onAction={() => act("Payment method updated — PM Office will retry the failed charge and review the suspension.")} />}
    </div>);

}

/* ---------------- Billing screen (in-place) ---------------- */
function SubKebab({ onAction, items }) {
  const [open, setOpen] = useState(false);
  const menu = items || [
  { label: "Change payment method" },
  { label: "View invoices" },
  { divider: true },
  { label: "Cancel subscription", danger: true }];

  return (
    <div className="kebab-wrap">
      <button className="kebab-btn" onClick={() => setOpen((o) => !o)} aria-label="More actions" aria-expanded={open}>
        <Icon name="kebab" size={18} />
      </button>
      {open &&
      <>
        <div className="dropdown-backdrop" onClick={() => setOpen(false)} />
        <div className="kebab-menu">
          {menu.map((m, i) =>
          m.divider ?
          <div key={i} className="kebab-divider" /> :
          <button key={i} className={"kebab-item" + (m.danger ? " danger" : "")}
          onClick={() => {setOpen(false);onAction(m.label);}}>
              {m.label}{m.glyph && <Icon name="upRight" size={13} stroke={2} style={{ marginLeft: 6, opacity: .7 }} />}
            </button>
          )}
        </div>
      </>
      }
    </div>);

}

function BillingScreen({ onAction, upgradeStage, setUpgradeStage, requestUpgrade, upgradeOpen, setUpgradeOpen, seatOpen, setSeatOpen,
  suiteStage, suiteMethod, suiteOpen, setSuiteOpen, suiteDeal, onAcceptSuite, onSimulateClear, wallet, onAddMethod }) {
  const act = onAction || (() => {});
  const [pmItem, setPmItem] = useState(null);
  const [bhSel, setBhSel] = useState([]);
  const [invItem, setInvItem] = useState(null); // a sub object, "all", or null
  const [tierDismissed, setTierDismissed] = useState(false);
  const [failDismissed, setFailDismissed] = useState(false);
  const [seats, setSeats] = useState(18); // active seat count
  const [seatPending, setSeatPending] = useState(null); // scheduled reduced count, or null
  const [bundleOpen, setBundleOpen] = useState(false);
  const [bundleRequested, setBundleRequested] = useState(false);
  // "Change payment method" opens the item-scoped modal; everything else fires a toast.
  const handleItemAction = (label, sub) => {
    if (label === "Change payment method") setPmItem(sub);else
    if (label === "View invoices") setInvItem(sub);else
    if (label === "Review upgrade") {if (upgradeStage === "ready") setUpgradeOpen(true);else act(upgradeStage === "requested" ? "Awaiting terms from PM Office." : "Request the upgrade from the tier-limit banner first.");}else
    if (label === "Manage seats") setSeatOpen(true);else
    if (label === "Request bundle change") setBundleOpen(true);else
    act(label);
  };
  /* Items mirror the ops catalog exactly (pricing shape + tier ladders).
     PRE-FLOW STATE (user decision 2026-07-13): no payroll- or claims-
     associated items \u2014 HR standalone (tiered by employees, T2 $600 \u2192 T3
     $1,100, the tier-upgrade demo), Time & Attendance (T1 $600), Mailroom
     per-seat $18/user, Spreadsheet Transformer fixed $250 on a 7-day trial.
     The Payroll Suite joins ONLY via the acquisition flow below. */
  const subs = [
  { id: "hr", name: "HR", icon: "shield-user", grad: "amber", kind: "single",
    pricing: "tier", tier: "Tier 2", band: "up to 150 employees", total: "$600 / month",
    proposed: "Proposed: Tier 3 \u00b7 up to 400 employees \u00b7 $1,100 / month",
    status: "Active", upgradePending: true, renew: "Renews May 14",
    pay: "Visa \u00b7\u00b7\u00b7\u00b7 4242",
    menu: [{ label: "Review upgrade" }, { label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] },
  { id: "time-attendance", name: "Time & Attendance", icon: "calendar", grad: "blue", kind: "single",
    pricing: "tier", tier: "Tier 1", band: "up to 100 users", total: "$600 / month",
    status: "Active", renew: "Renews May 14",
    pay: "Visa \u00b7\u00b7\u00b7\u00b7 4242",
    menu: [{ label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] },
  { id: "mailroom", name: "Mailroom", icon: "doc", grad: "forest", kind: "single",
    pricing: "seat", unit: "$18 / user", qty: seats + " users", total: "$" + seats * 18 + " / month", status: "Active", renew: "Renews Jun 1",
    pay: "Visa \u00b7\u00b7\u00b7\u00b7 4242",
    seatPending: seatPending,
    onCancelPending: () => setSeatPending(null),
    menu: [{ label: "Manage seats" }, { label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] },
  { id: "spreadsheet-transformer", name: "Spreadsheet Transformer", icon: "upload", grad: "gold", kind: "single",
    pricing: "flat", total: "$250 / month",
    status: "Trial", trial: "Trial ends in 3 days", renew: "",
    payNone: "No method \u2014 add before trial ends",
    menu: [{ label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] }];

  // The Payroll Suite item exists ONLY after acceptance. awaiting-clear =
  // accepted on the manual path (check/wire) \u2014 the invoice stays Owed and the
  // suite's apps stay gated until PM Office reconciles the payment.
  const suiteAccepted = suiteStage === "live" || suiteStage === "awaiting-clear";
  if (suiteAccepted) {
    subs.push({ id: "payroll-suite", name: "Payroll Suite", icon: "bank", grad: "forest", kind: "bundle",
      includes: "Includes: Payroll, Customer Configuration, Check Printing, Billing",
      pricing: "flat", total: "$850 / month",
      status: "Active", renew: suiteStage === "live" ? "Renews Jun 1" : "",
      pay: suiteMethod || "\u2014",
      awaitingClear: suiteStage === "awaiting-clear",
      onSimulateClear, changeRequested: bundleRequested,
      menu: [{ label: "Request bundle change", glyph: true }, { label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] });
  }

  // Per-item invoice history (mock). Status vocabulary = the ops AR states —
  // an invoice is an owed-balance object: Owed | Paid | Failed | Overdue.
  // ("Upcoming" is never an invoice; the next-charge forecast renders in the
  // header instead, per the docs.)
  const invByItem = {
    hr: [
    { date: "Apr 14, 2026", amount: "$600", status: "Paid" },
    { date: "Mar 14, 2026", amount: "$600", status: "Paid" },
    { date: "Feb 14, 2026", amount: "$600", status: "Paid" }],

    "time-attendance": [
    { date: "Apr 14, 2026", amount: "$600", status: "Paid" },
    { date: "Mar 14, 2026", amount: "$600", status: "Paid" }],

    mailroom: [
    { date: "May 1, 2026", amount: "$324", status: "Failed" },
    { date: "Apr 1, 2026", amount: "$324", status: "Paid" },
    { date: "Mar 1, 2026", amount: "$324", status: "Paid" }],

    "spreadsheet-transformer": []
  };
  if (suiteAccepted) {
    invByItem["payroll-suite"] = [{ date: "May 1, 2026", amount: "$850", status: suiteStage === "live" ? "Paid" : "Owed" }];
  }
  subs.forEach((s) => {s.inv = invByItem[s.id] || [];});
  // Flattened, with source item attached, newest first.
  const monthRank = { May: 5, Apr: 4, Mar: 3, Feb: 2, Jan: 1 };
  const allInv = subs.flatMap((s) => s.inv.map((v) => ({ ...v, sub: s }))).
  sort((a, b) => {
    const am = monthRank[a.date.slice(0, 3)] || 0,bm = monthRank[b.date.slice(0, 3)] || 0;
    if (bm !== am) return bm - am;
    return (parseInt(b.date.match(/\d+/)) || 0) - (parseInt(a.date.match(/\d+/)) || 0);
  });
  const invoices = [
  ...(suiteAccepted ? [{ date: "May 1", amount: "$850", status: suiteStage === "live" ? "Paid" : "Owed", action: "View" }] : []),
  { date: "May 1", amount: "$324", status: "Failed", action: "Update method" },
  { date: "Apr 14", amount: "$1,200", status: "Paid", action: "View" },
  { date: "Mar 14", amount: "$1,200", status: "Paid", action: "View" },
  { date: "Feb 14", amount: "$1,200", status: "Paid", action: "View" }];


  const Pricing = (s) => {
    if (s.pricing === "seat") return (
      <span className="price-block">
        <span className="price-line">{s.unit} <span className="price-dim">&middot; {s.qty}</span></span>
        <span className="price-total">{s.total}</span>
      </span>);
    if (s.pricing === "tier") return (
      <span className="price-block">
        <span className="price-line">{s.tier} <span className="price-dim">&middot; {s.band}</span></span>
        <span className="price-total">{s.total}</span>
      </span>);
    return (
      <span className="price-block">
        <span className="price-total">{s.total}</span>
        <span className="price-dim">billed monthly</span>
      </span>);
  };

  return (
    <div className="billing">
      <div className="billing-head">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="greeting" style={{ fontSize: "clamp(30px,3.4vw,42px)", marginBottom: 2 }}>Subscriptions</h1>
          <p className="billing-org">Bayside Office Temps</p>
        </div>
        <p className="next-charge">Next charge &mdash; <span className="next-charge-amt">$1,200</span> on May 14</p>
      </div>

      {!tierDismissed && upgradeStage !== "done" &&
      <div className="alert alert-warn">
        <span className="alert-ico"><Icon name="trendup" size={19} /></span>
        <span className="alert-body">
          <span className="alert-eyebrow">{upgradeStage === "ready" ? "Terms ready" : upgradeStage === "requested" ? "Request sent" : "Action needed"}</span>
          <span className="alert-title" style={{ fontWeight: "600" }}>
            {upgradeStage === "ready" ? "Upgrade terms ready \u2014 HR" :
             upgradeStage === "requested" ? "Upgrade requested \u2014 HR" :
             "Tier upgrade needed \u2014 HR"}
          </span>
          <span className="alert-text">
            {upgradeStage === "ready" ? "PM Office issued terms for the Tier 3 upgrade. Review and accept to lift the employee gate." :
             upgradeStage === "requested" ? "Your request was sent to PM Office. Adding employees stays paused until they issue terms for the Tier 3 upgrade." :
             "Your organization has reached the limit of Tier 2 (up to 150 employees). Adding more employees is paused until you request a Tier 3 upgrade from PM Office."}
          </span>
        </span>
        {upgradeStage === "ready" ?
        <button className="cta-fill alert-action" onClick={() => setUpgradeOpen(true)}>Review &amp; accept</button> :
        upgradeStage === "requested" ?
        <button className="cta-fill alert-action" disabled style={{ opacity: .6, cursor: "default" }}>Awaiting terms</button> :
        <button className="cta-fill alert-action" onClick={requestUpgrade}>Request upgrade</button>}
        <button className="alert-x" aria-label="Dismiss" onClick={() => setTierDismissed(true)}><Icon name="x" size={15} /></button>
      </div>
      }

      {suiteStage === "terms-ready" &&
      <div className="alert alert-warn">
        <span className="alert-ico"><Icon name="bank" size={19} /></span>
        <span className="alert-body">
          <span className="alert-eyebrow">Terms ready</span>
          <span className="alert-title" style={{ fontWeight: "600" }}>Payroll Suite &mdash; issued terms</span>
          <span className="alert-text">PM Office priced your request: Payroll, Customer Configuration, Check Printing and Billing as one bundle line at $850/month. Review the agreement and accept to activate the suite.</span>
        </span>
        <button className="cta-fill alert-action" onClick={() => setSuiteOpen(true)}>Review &amp; accept</button>
      </div>
      }

      {!failDismissed &&
      <div className="alert alert-danger">
        <span className="alert-ico"><Icon name="alert" size={19} /></span>
        <span className="alert-body">
          <span className="alert-eyebrow">Payment failed</span>
          <span className="alert-title" style={{ fontWeight: "600" }}>Mailroom &mdash; charge declined</span>
          <span className="alert-text">The payment method on file was declined. Update it to retry the charge.</span>
        </span>
        <button className="cta-fill alert-action" onClick={() => setPmItem(subs.find((x) => x.id === "mailroom"))}>Update method</button>
        <button className="alert-x" aria-label="Dismiss" onClick={() => setFailDismissed(true)}><Icon name="x" size={15} /></button>
      </div>
      }

      <div className="sub-list">
        {subs.map((s) =>
        <div key={s.id} className="sub-card">
            <div className="sub-left">
              <span className="tile lg" style={{ "--th": HUE()[s.grad] }}><Icon name={s.icon} stroke={1.9} /></span>
              <span className="sub-id">
                <span className="sub-name-row">
                  <span className="sub-name">{s.name}</span>
                  {s.kind === "bundle" && <span className="bundle-tag">Bundle</span>}
                </span>
                {s.includes && <span className="sub-includes">{s.includes}</span>}
              </span>
            </div>
            <div className="sub-mid">{Pricing(s)}</div>
            <div className="sub-right">
              {(s.trial || (s.upgradePending && upgradeStage !== "done") || s.failed || s.changeRequested || s.awaitingClear) &&
            <span className="sub-pills">
                {s.trial && <span className="status-pill pending"><span className="sdot" />{s.trial}</span>}
                {s.upgradePending && upgradeStage === "needed" && <span className="status-pill warn"><span className="sdot" />Upgrade needed</span>}
                {s.upgradePending && upgradeStage === "requested" && <span className="status-pill pending"><span className="sdot" />Upgrade requested &mdash; awaiting terms</span>}
                {s.upgradePending && upgradeStage === "ready" && <button className="status-pill ready" onClick={() => setUpgradeOpen(true)}><span className="sdot" />Terms ready &mdash; Review &amp; accept</button>}
                {s.failed && <span className="status-pill denied"><span className="sdot" />Payment failed</span>}
                {s.changeRequested && <span className="status-pill pending"><span className="sdot" />Change requested</span>}
                {s.awaitingClear && <span className="status-pill pending"><span className="sdot" />Awaiting {/^check/i.test(suiteMethod || "") ? "check" : "wire"} &mdash; apps unlock once it clears</span>}
              </span>
            }
              {s.awaitingClear &&
            <span className="sub-meta">Invoice owed &mdash; PM Office reconciles on receipt <button className="link-quiet" onClick={(e) => {e.stopPropagation();s.onSimulateClear && s.onSimulateClear();}}>Simulate payment received</button></span>
            }
              {(s.renew || s.pay) &&
            <span className="sub-meta sub-metaline">{[s.renew, s.pay].filter(Boolean).join(" \u00b7 ")}</span>
            }
              {s.payNone && <span className="sub-meta">No payment method</span>}
              {s.seatPending != null &&
            <span className="sub-meta seat-pending">Reducing to {s.seatPending} seats on Jun 1 <button className="link-quiet seat-cancel" onClick={(e) => {e.stopPropagation();s.onCancelPending();}}>Cancel change</button></span>
            }
            </div>
            <SubKebab onAction={(label) => handleItemAction(label, s)} items={s.menu} />
          </div>
        )}
      </div>

      <div className="section inv-history-card" style={{ marginTop: 38 }}>
        <div className="section-head">
          <span className="section-title">Invoice history</span>
        </div>
        {(() => {
          const payable = invoices.filter((v) => v.action);
          const bhKeys = payable.map((v, i) => v.date + "|" + v.amount + "|" + i);
          const bhAll = bhKeys.length > 0 && bhKeys.every((k) => bhSel.includes(k));
          const bhSome = bhSel.length > 0 && !bhAll;
          const bhKey = (v, i) => v.date + "|" + v.amount + "|" + i;
          return (
            <>
          <table className="inv-table">
          <colgroup>
            <col className="ci-date" />
            <col className="ci-amt" />
            <col className="ci-status" />
            <col className="ci-act" />
          </colgroup>
          <thead>
            <tr>
              <th>Date</th><th>Amount</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((v, i) =>
                  <tr key={i}>
                <td>{v.date}</td>
                <td className="col-amt" style={{ textAlign: "left" }}>{v.amount}</td>
                <td className="col-status"><span className={"status-pill " + (v.status === "Failed" ? "denied" : "neutral")}><span className="sdot" />{v.status}</span></td>
                <td className="inv-action">{v.action ?
                      <button className="icon-dl" aria-label="Download invoice" title="Download invoice" onClick={() => act("Downloading invoice \u2014 " + v.date)}><Icon name="download" size={16} /></button> : null}</td>
              </tr>
                  )}
          </tbody>
        </table>
        <div className="inv-history-foot">
          See your full billing history <button className="link-quiet" onClick={() => setInvItem("all")}>View all invoices</button>
        </div>
          </>);
        })()}
      </div>

      {pmItem && <ChangePaymentModal sub={pmItem} onClose={() => setPmItem(null)} onAction={act} wallet={wallet} onAdd={onAddMethod} />}
      {invItem && <InvoicesModal scope={invItem} subs={subs} allInv={allInv} onClose={() => setInvItem(null)} onAction={act} onUpdateMethod={(s) => {setInvItem(null);setPmItem(s);}} />}
      {seatOpen && <ManageSeatsModal sub={subs.find((x) => x.id === "mailroom")} seats={seats}
      onClose={() => setSeatOpen(false)}
      onIncrease={(n) => {setSeats(n);setSeatPending(null);setSeatOpen(false);act("Added seats \u2014 now " + n + " users.");}}
      onDecrease={(n) => {setSeatPending(n);setSeatOpen(false);act("Seat reduction to " + n + " scheduled for Jun 1.");}} />}
      {upgradeOpen && <ReviewUpgradeModal sub={subs.find((x) => x.id === "hr")} onClose={() => setUpgradeOpen(false)} onAction={act} onAccept={() => setUpgradeStage("done")} />}
      {bundleOpen && <BundleChangeModal sub={subs.find((x) => x.id === "payroll-suite")} onClose={() => setBundleOpen(false)}
      onSubmit={() => {setBundleRequested(true);}} />}
      {suiteOpen && suiteDeal && <AcceptDealModal deal={suiteDeal} onClose={() => setSuiteOpen(false)} onAccept={onAcceptSuite} wallet={wallet} onAdd={onAddMethod} />}
    </div>);

}

/* ---------------- Bundle change request modal ---------------- */
function BundleChangeModal({ sub, onClose, onSubmit }) {
  const [sent, setSent] = useState(false);
  const [intent, setIntent] = useState("add");
  const [detail, setDetail] = useState("");
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const intents = [
  { id: "add", label: "Add an app" },
  { id: "remove", label: "Remove an app" },
  { id: "capacity", label: "Change capacity" },
  { id: "other", label: "Something else" }];


  if (sent) {
    return (
      <div className="modal-scrim" onClick={onClose}>
        <div className="modal cal-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Request sent">
          <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          <div className="bundle-done">
            <span className="bundle-check"><Icon name="check" size={26} stroke={2.4} /></span>
            <div className="bundle-done-title">Request sent</div>
            <p className="bundle-done-text">Our team will review your request and follow up. You can track its status here.</p>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>);
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal cal-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Request bundle change">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        <div className="cal-head">
          <div className="cal-eyebrow">Bundle</div>
          <div className="cal-title">{sub.name}</div>
          <p className="bundle-sub">{sub.includes} &middot; {sub.total}</p>
        </div>
        <div className="bundle-body">
          <p className="bundle-explain">Bundles are configured by our team. Tell us what you&rsquo;d like to change and we&rsquo;ll follow up.</p>
          <div className="field">
            <label className="field-label">What would you like to change?</label>
            <div className="bundle-intents">
              {intents.map((it) =>
              <button key={it.id} type="button" className={"bundle-chip" + (intent === it.id ? " on" : "")} onClick={() => setIntent(it.id)}>
                  <span className={"bundle-radio" + (intent === it.id ? " on" : "")}>{intent === it.id && <span className="bundle-dot" />}</span>
                  {it.label}
                </button>
              )}
            </div>
          </div>
          <div className="field" style={{ marginTop: 16 }}>
            <label className="field-label" htmlFor="bundle-detail">Describe what you&rsquo;d like to change</label>
            <textarea id="bundle-detail" value={detail} onChange={(e) => setDetail(e.target.value)}
            placeholder="Share the specifics &mdash; which app, what capacity, timing, or anything else that helps us scope it." />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => {onSubmit({ intent, detail });setSent(true);}}>Send request</button>
        </div>
      </div>
    </div>);

}

/* ---------------- Manage seats modal ---------------- */
function ManageSeatsModal({ sub, seats, onClose, onIncrease, onDecrease }) {
  const FLOOR = 18,RATE = 18; // Mailroom per-seat rate — mirrors the ops catalog ($18/seat)
  const [count, setCount] = useState(seats);
  const [confirming, setConfirming] = useState(false);
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const delta = count - seats;
  const atFloor = count <= FLOOR;
  const total = count * RATE;
  const dec = () => setCount((c) => Math.max(FLOOR, c - 1));
  const set = (v) => {const n = parseInt(v, 10);if (!isNaN(n)) setCount(Math.max(FLOOR, n));};

  if (confirming) {
    return (
      <div className="modal-scrim" onClick={onClose}>
        <div className="modal seat-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Confirm seat change">
          <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          <div className="seat-head">
            <div className="seat-eyebrow">Confirm change</div>
            <div className="seat-title">Add {delta} seat{delta > 1 ? "s" : ""}?</div>
            <p className="seat-gate">Extra seats are prorated for the current cycle and charged now.</p>
          </div>
          <div className="seat-body">
            <div className="seat-cost">
              <div className="seat-cost-row"><span className="k">Seats</span><span className="v">{seats} &rarr; {count} users</span></div>
              <div className="seat-cost-row due"><span className="k">Due today</span><span className="v">${delta * RATE}<span className="sub">prorated for this cycle</span></span></div>
              <div className="seat-cost-row"><span className="k">Then from Jun 1</span><span className="v">${total} / month</span></div>
            </div>
            <p className="seat-billed">Billed to <strong>Visa &middot;&middot;&middot;&middot; 4242</strong></p>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-text" onClick={() => setConfirming(false)}>Back</button>
            <button type="button" className="btn-primary" onClick={() => onIncrease(count)}>Confirm</button>
          </div>
        </div>
      </div>);
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal seat-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Manage seats">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>

        <div className="seat-head">
          <div className="seat-eyebrow">Manage seats</div>
          <div className="seat-title">{sub.name}</div>
          <p className="seat-gate">Per-seat plan &middot; $18 / user / month &middot; renews Jun 1.</p>
        </div>

        <div className="seat-body">
          <div className="seat-control">
            <span className="seat-control-label">Seats</span>
            <div className="seat-stepper">
              <button className="step-btn" onClick={dec} disabled={atFloor} aria-label="Remove a seat"><Icon name="minus" size={18} /></button>
              <input className="step-input" value={count} onChange={(e) => set(e.target.value)} inputMode="numeric" aria-label="Seat count" />
              <button className="step-btn" onClick={() => setCount((c) => c + 1)} aria-label="Add a seat"><Icon name="plus" size={18} stroke={2} /></button>
            </div>
          </div>

          <div className="seat-cost">
            <div className="seat-cost-row">
              <span className="k">{count} users &times; $18</span>
              <span className="v">${total} / month</span>
            </div>
            {delta > 0 &&
            <div className="seat-cost-row due">
              <span className="k">Due today</span>
              <span className="v">${delta * RATE}<span className="sub">prorated for this cycle</span></span>
            </div>
            }
            {delta < 0 &&
            <div className="seat-cost-row">
              <span className="k">Change</span>
              <span className="v">&minus;${Math.abs(delta) * RATE} / month<span className="sub">at next renewal</span></span>
            </div>
            }
          </div>

          {delta > 0 && <p className="seat-note">New seats are prorated for the current cycle; the full rate begins at the next renewal.</p>}
          {delta < 0 && <p className="seat-note">Reduced seats take effect at your next renewal (Jun 1). You can cancel this scheduled change anytime before then.</p>}
          {atFloor && <p className="seat-note muted">Minimum 18 &mdash; seats in use. To reduce below 18, remove user assignments in User Management first.</p>}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" disabled={delta === 0}
          onClick={() => {if (delta > 0) setConfirming(true);else onDecrease(count);}}>Save changes</button>
        </div>
      </div>
    </div>);

}

/* ---------------- Add payment method (the wallet's capture form) ---------------- */
/* Docs 02 · Subscriptions: methods can be ADDED to the org's wallet;
   "automated capture runs through the payment processor". Mock capture for a
   card or a bank account (ACH) — the new method joins the shared wallet and
   is auto-selected in whichever chooser opened this. */
function AddPaymentMethodModal({ onClose, onAdd }) {
  const [kind, setKind] = useState("card");
  const [name, setName] = useState("");
  const [num, setNum] = useState("");
  const [extra, setExtra] = useState("");
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const digits = num.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  const brand = kind === "ach" ? "ACH" : /^4/.test(digits) ? "Visa" : /^5/.test(digits) ? "Mastercard" : /^3/.test(digits) ? "Amex" : "Card";
  const ready = digits.length >= 4;
  const save = () => {
    if (!ready) return;
    onAdd({
      id: brand.toLowerCase() + "-" + last4 + "-" + Date.now().toString(36),
      kind, glyph: kind === "ach" ? "bank" : "receipt",
      name: brand, num: last4,
      sub: kind === "ach" ? (name || "Business checking") : ("Expires " + (extra || "12 / 29")),
    });
    onClose();
  };
  return (
    <div className="modal-scrim" onClick={onClose}>
      <style>{`
.addpm-modal{width:min(460px,100%);position:relative}
.addpm-modal .modal-close.floating{position:absolute;top:16px;right:16px;left:auto;z-index:2}
.addpm-head{padding:26px 26px 0}
.addpm-eyebrow{font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px}
.addpm-title{font-size:21px;font-weight:500;letter-spacing:-.01em;color:var(--text);line-height:1.15}
.addpm-sub{margin:10px 0 0;font-size:12.5px;line-height:1.5;color:var(--text-2)}
.addpm-body{padding:18px 26px 0;display:flex;flex-direction:column;gap:12px}
.addpm-seg{display:flex;gap:6px}
.addpm-seg button{flex:1;padding:9px 12px;border:1px solid var(--border-strong);border-radius:var(--r-md);font-size:13px;font-weight:500;color:var(--text-2);background:var(--search-bg)}
.addpm-seg button.on{border-color:var(--text-3);color:var(--text);background:var(--surface-hover)}
.addpm-field{display:flex;flex-direction:column;gap:5px}
.addpm-label{font-size:11.5px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--text-3)}
.addpm-input{width:100%;background:var(--search-bg);border:1px solid var(--border-strong);border-radius:var(--r-md);padding:10px 12px;color:var(--text);font-size:13.5px;font-family:var(--font-ui)}
.addpm-input:focus{outline:none;border-color:var(--search-ring);box-shadow:0 0 0 3px var(--accent-soft)}
.addpm-modal .modal-foot{padding:20px 26px 8px}
.addpm-fine{padding:0 26px 20px;font-size:11.5px;color:var(--text-3)}
`}</style>
      <div className="modal addpm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Add a payment method">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        <div className="addpm-head">
          <div className="addpm-eyebrow">Payment wallet</div>
          <div className="addpm-title">Add a payment method</div>
          <p className="addpm-sub">Automated methods are captured through the payment processor &mdash; PM Office never stores your details.</p>
        </div>
        <div className="addpm-body">
          <div className="addpm-seg" role="radiogroup" aria-label="Method type">
            <button className={kind === "card" ? "on" : ""} role="radio" aria-checked={kind === "card"} onClick={() => setKind("card")}>Card</button>
            <button className={kind === "ach" ? "on" : ""} role="radio" aria-checked={kind === "ach"} onClick={() => setKind("ach")}>Bank (ACH)</button>
          </div>
          {kind === "card" ?
          <>
            <div className="addpm-field"><span className="addpm-label">Cardholder name</span>
              <input className="addpm-input" placeholder="e.g. Bayside Office Temps LLC" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="addpm-field"><span className="addpm-label">Card number</span>
              <input className="addpm-input" placeholder="4242 4242 4242 4242" inputMode="numeric" value={num} onChange={(e) => setNum(e.target.value)} /></div>
            <div className="addpm-field"><span className="addpm-label">Expiry (MM / YY)</span>
              <input className="addpm-input" placeholder="12 / 29" value={extra} onChange={(e) => setExtra(e.target.value)} /></div>
          </> :
          <>
            <div className="addpm-field"><span className="addpm-label">Account nickname</span>
              <input className="addpm-input" placeholder="e.g. Operating account" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="addpm-field"><span className="addpm-label">Routing number</span>
              <input className="addpm-input" placeholder="021000021" inputMode="numeric" value={extra} onChange={(e) => setExtra(e.target.value)} /></div>
            <div className="addpm-field"><span className="addpm-label">Account number</span>
              <input className="addpm-input" placeholder="•••• 6789" inputMode="numeric" value={num} onChange={(e) => setNum(e.target.value)} /></div>
          </>}
        </div>
        <div className="modal-foot">
          <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" disabled={!ready} onClick={save}>Add method</button>
        </div>
        <div className="addpm-fine">Added to your organization&rsquo;s wallet &mdash; assignable to any subscription item.</div>
      </div>
    </div>);

}

/* ---------------- Change payment method modal (per item) ---------------- */
function ChangePaymentModal({ sub, onClose, onAction, wallet, onAdd }) {
  const methods = wallet || [
  { id: "visa-4242", kind: "card", glyph: "receipt", name: "Visa", num: "4242", sub: "Expires 09 / 27" },
  { id: "ach-6789", kind: "ach", glyph: "bank", name: "ACH", num: "6789", sub: "Chase business checking" }];

  const currentId = sub.payNone ? "" : /ACH/.test(sub.pay || "") ? (methods.find((m) => m.kind === "ach")?.id ?? "") : (methods.find((m) => m.kind === "card")?.id ?? "");
  const [method, setMethod] = useState(currentId);
  const [adding, setAdding] = useState(false);
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const priceText = sub.pricing === "seat" ? `${sub.unit} \u00b7 ${sub.qty} \u00b7 ${sub.total}` :
  sub.pricing === "tier" ? `${sub.tier} \u00b7 ${sub.band} \u00b7 ${sub.total}` :
  sub.total;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal pm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Change payment method">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>

        <div className="pm-hero">
          <div className="pm-hero-text">
            <div className="modal-sub">Change payment method</div>
            <div className="modal-title">{sub.name}</div>
          </div>
        </div>

        <div className="pm-facts">
          <span className="pm-fact"><span className="pm-fact-k">Plan</span><span className="pm-fact-v">{priceText}</span></span>
          <span className="pm-fact-divider" />
          <span className="pm-fact"><span className="pm-fact-k">{sub.trial ? "Trial" : "Renews"}</span><span className="pm-fact-v">{(sub.renew || "").replace("Renews ", "") || sub.trial}</span></span>
          <span className="pm-fact-divider" />
          <span className="pm-fact"><span className="pm-fact-k">Billed to</span><span className="pm-fact-v">{sub.payNone ? <em className="pm-none">None assigned</em> : sub.pay}</span></span>
        </div>

        <div className="pm-choose">
          <div className="pm-choose-label">Select a payment method</div>
          <div className="pm-options">
            {methods.map((m) => {
              const on = method === m.id;
              return (
                <button key={m.id} className={"pm-option" + (on ? " on" : "")} onClick={() => setMethod(m.id)}>
                  <span className="pm-option-glyph"><Icon name={m.glyph} size={18} /></span>
                  <span className="pm-option-meta">
                    <span className="pm-option-name">{m.name} <span className="pm-option-num">&middot;&middot;&middot;&middot; {m.num}</span></span>
                    <span className="pm-option-sub">{m.sub}</span>
                  </span>
                  <span className={"pm-radio" + (on ? " on" : "")}>{on && <Icon name="check" size={12} stroke={3} />}</span>
                </button>);
            })}
            <button className="pm-option add" onClick={() => setAdding(true)}>
              <span className="pm-option-glyph add"><Icon name="plus" size={18} stroke={2} /></span>
              <span className="pm-option-name">Add new method</span>
            </button>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" disabled={!method}
          onClick={() => {onAction("Payment method updated for " + sub.name);onClose();}}>Save changes</button>
        </div>
      </div>
      {adding && <AddPaymentMethodModal onClose={() => setAdding(false)}
      onAdd={(m) => {onAdd && onAdd(m);setMethod(m.id);}} />}
    </div>);

}

/* ---------------- Review upgrade modal ---------------- */
function ReviewUpgradeModal({ sub, onClose, onAction, onAccept }) {
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <style>{`
.up-modal{width:min(480px,100%);position:relative}
.up-modal .modal-close.floating{position:absolute;top:16px;right:16px;left:auto;z-index:2}
.up-head{padding:26px 26px 0}
.up-eyebrow{font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px}
.up-title{font-size:21px;font-weight:500;letter-spacing:-.01em;color:var(--text);line-height:1.15}
.up-gate{margin:10px 0 0;font-size:13px;line-height:1.5;color:var(--text-2);text-wrap:pretty}
.up-body{padding:22px 26px 0}
.up-compare{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px}
.up-block{display:flex;flex-direction:column;gap:4px;min-width:0}
.up-block.proposed{padding:14px 15px;border:1px solid var(--text-3);border-radius:var(--r-lg);background:var(--surface-hover)}
.up-block.current{padding:14px 15px}
.up-block-label{font-size:10.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3)}
.up-block.proposed .up-block-label{color:var(--text-2)}
.up-tier{font-size:16px;font-weight:500;color:var(--text)}
.up-band{font-size:12px;color:var(--text-2)}
.up-price{font-size:13.5px;font-weight:500;color:var(--text);margin-top:3px}
.up-arrow{display:grid;place-items:center;color:var(--text-3);align-self:center}
.up-cost{margin-top:20px;border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
.up-cost-row{display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:12px 16px;font-size:13.5px;color:var(--text-2)}
.up-cost-row + .up-cost-row{border-top:1px solid var(--hairline)}
.up-cost-row .v{color:var(--text);font-weight:500;white-space:nowrap}
.up-cost-row.due{background:color-mix(in oklch,var(--accent-2) 14%,var(--surface));box-shadow:inset 3px 0 0 var(--accent-2)}
.up-cost-row.due .k{color:var(--text);font-weight:500}
.up-cost-row.due .v{font-size:19px;font-weight:500;color:var(--accent-2)}
.up-cost-row .sub{font-size:11.5px;color:var(--text-3);font-weight:400;display:block;margin-top:2px;text-align:right}
.up-billed{margin:14px 2px 0;font-size:12.5px;color:var(--text-3)}
.up-billed strong{color:var(--text-2);font-weight:500}
.up-modal .modal-foot{padding:22px 26px 16px}
.up-foot-note{padding:0 26px 22px;font-size:12px;color:var(--text-3)}
@media (max-width:520px){.up-compare{grid-template-columns:1fr}.up-arrow{transform:rotate(90deg)}}
`}</style>
      <div className="modal up-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Review upgrade">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>

        <div className="up-head">
          <div className="up-eyebrow">Tier upgrade</div>
          <div className="up-title">{sub.name}</div>
          <p className="up-gate">You&rsquo;ve reached the Tier 2 limit (150 employees). PM Office issued these terms &mdash; adding more employees stays paused until you accept them.</p>
        </div>

        <div className="up-body">
          <div className="up-compare">
            <div className="up-block current">
              <span className="up-block-label">Current</span>
              <span className="up-tier">Tier 2</span>
              <span className="up-band">Up to 150 employees</span>
              <span className="up-price">$600 / month</span>
            </div>
            <span className="up-arrow"><Icon name="chevR" size={18} /></span>
            <div className="up-block proposed">
              <span className="up-block-label">New</span>
              <span className="up-tier">Tier 3</span>
              <span className="up-band">Up to 400 employees</span>
              <span className="up-price">$1,100 / month</span>
            </div>
          </div>

          <div className="up-cost">
            <div className="up-cost-row">
              <span className="k">Monthly increase</span>
              <span className="v">+$500 / month</span>
            </div>
            <div className="up-cost-row due">
              <span className="k">Due today</span>
              <span className="v">$250<span className="sub">prorated for this cycle</span></span>
            </div>
            <div className="up-cost-row">
              <span className="k">Then from May 14, 2026</span>
              <span className="v">$1,100 / month</span>
            </div>
          </div>

          <p className="up-billed">Billed to <strong>Visa &middot;&middot;&middot;&middot; 4242</strong></p>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-text" onClick={onClose}>Not now</button>
          <button type="button" className="btn-primary" onClick={() => {onAccept && onAccept();onAction("Tier 3 upgrade accepted \u2014 adding employees is now unblocked.");onClose();}}>Accept terms</button>
        </div>
        <div className="up-foot-note">Accepting these terms is a financial commitment and immediately lifts the employee gate in HR.</div>
      </div>
    </div>);

}

/* ---------------- Invoices modal (per item or all) ---------------- */
// Ops AR states: Failed/Overdue need attention (red), Owed is in flight, Paid is quiet.
function invStatusClass(s) {return s === "Failed" || s === "Overdue" ? "denied" : s === "Owed" ? "pending" : "neutral";}

function InvoicesModal({ scope, subs, allInv, onClose, onAction, onUpdateMethod }) {
  const isAll = scope === "all";
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const base = isAll ? allInv : scope.inv.map((v) => ({ ...v, sub: scope }));
  // Distinct months (e.g. "May 2026") for the date dropdown, preserving order.
  const months = [];
  base.forEach((r) => {const m = r.date.replace(/^([A-Za-z]+) \d+,/, "$1,");if (!months.includes(m)) months.push(m);});
  const rows = base.filter((r) =>
  (typeFilter === "all" || r.sub.id === typeFilter) && (
  dateFilter === "all" || r.date.replace(/^([A-Za-z]+) \d+,/, "$1,") === dateFilter));

  const keyOf = (r, i) => r.sub.id + "|" + r.date + "|" + i;
  const [selected, setSelected] = useState([]);
  const allKeys = rows.map(keyOf);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selected.includes(k));
  const someSelected = selected.length > 0 && !allSelected;
  const toggleAll = () => setSelected(allSelected ? [] : allKeys);
  const toggleOne = (k) => setSelected((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]);

  const rowAction = (r) => <button className="icon-dl" aria-label={"Download invoice \u2014 " + r.sub.name + " \u00b7 " + r.date} title="Download invoice" onClick={() => onAction("Downloading invoice \u2014 " + r.sub.name + " \u00b7 " + r.date)}><Icon name="download" size={16} /></button>;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <style>{`
.inv-modal{width:min(700px,100%);position:relative;display:flex;flex-direction:column;max-height:84vh}
.inv-modal .modal-close.floating{position:absolute;top:18px;right:18px;left:auto;z-index:2}
.inv-modal-head{padding:24px 24px 18px;border-bottom:1px solid var(--hairline)}
.inv-modal-head .inv-eyebrow{font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px}
.inv-modal-head .inv-h1{font-size:21px;font-weight:500;letter-spacing:-.01em;color:var(--text);line-height:1.15}
.inv-head-row{display:flex;align-items:center;gap:13px}
.inv-head-row .tile.lg{width:46px;height:46px;border-radius:12px;flex:none}
.inv-head-row .tile.lg svg{width:24px;height:24px}
.inv-filters{display:flex;gap:10px;padding:16px 24px;flex-wrap:wrap}
.inv-sel-wrap{display:flex;flex-direction:column;gap:5px}
.inv-sel-label{font-size:11px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--text-3)}
.inv-select{appearance:none;-webkit-appearance:none;background:var(--search-bg);border:1px solid var(--border-strong);border-radius:var(--r-md);padding:9px 14px;color:var(--text);font-size:13.5px;font-family:var(--font-ui);cursor:pointer;min-width:160px}
.inv-select:focus{outline:none;border-color:var(--search-ring);box-shadow:0 0 0 3px var(--accent-soft)}
.inv-tablewrap{overflow-y:auto;overflow-x:hidden;padding:0 24px 22px}
.inv-tbl{width:100%;border-collapse:collapse;table-layout:fixed}
.inv-tbl.v-all col.c-check{width:6%}.inv-tbl.v-all col.c-item{width:26%}.inv-tbl.v-all col.c-date{width:18%}.inv-tbl.v-all col.c-amt{width:14%}.inv-tbl.v-all col.c-status{width:22%}.inv-tbl.v-all col.c-act{width:14%}
.inv-tbl.v-single col.c-check{width:9%}.inv-tbl.v-single col.c-date{width:29%}.inv-tbl.v-single col.c-amt{width:22%}.inv-tbl.v-single col.c-status{width:26%}.inv-tbl.v-single col.c-act{width:14%}
.inv-tbl thead th{position:sticky;top:0;background:var(--surface);text-align:left;font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--text-3);padding:8px 12px;border-bottom:1px solid var(--border)}
.inv-tbl td{padding:13px 12px;font-size:14px;color:var(--text);border-bottom:1px solid var(--hairline);vertical-align:middle;text-align:left}
.inv-tbl tbody tr:last-child td{border-bottom:0}
.inv-tbl .col-date{color:var(--text-2);white-space:nowrap}
.inv-tbl .col-item{min-width:0}
.inv-item-cell{display:flex;align-items:center;gap:10px;min-width:0}
.inv-item-cell .tile{width:28px;height:28px;border-radius:7px;flex:none}
.inv-item-cell .tile svg{width:15px;height:15px}
.inv-item-name{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.inv-tbl .col-amt{font-weight:500;white-space:nowrap;text-align:left}
.inv-tbl .col-status{text-align:left}
.inv-tbl .col-status .status-pill{justify-content:flex-start}
.inv-tbl .col-act{text-align:left}
.inv-tbl .col-check{text-align:left}
.inv-check{width:17px;height:17px;border-radius:5px;border:1.5px solid var(--border-strong);display:inline-grid;place-items:center;color:#fff;cursor:pointer;vertical-align:middle;flex:none}
.inv-check.on{background:linear-gradient(135deg,var(--accent-2),var(--accent));border-color:transparent}
.inv-bulkbar{display:flex;align-items:center;gap:14px;margin:0 24px 12px;padding:10px 14px;background:var(--accent-soft);border:1px solid color-mix(in oklch,var(--accent-2) 30%,transparent);border-radius:var(--r-md)}
.inv-bulkbar .bulk-count{font-size:13px;font-weight:500;color:var(--text)}
.inv-bulkbar .bulk-clear{margin-left:auto;font-size:13px;color:var(--text-2);background:none;cursor:pointer}
.inv-bulkbar .bulk-clear:hover{color:var(--text)}
.sel-head{display:flex;align-items:center;justify-content:space-between;gap:14px}
.sel-count{font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--text)}
.sel-actions{display:flex;align-items:center;gap:16px}
.sel-actions .inv-link{font-size:12.5px;font-weight:500;color:var(--accent-2);text-transform:none;letter-spacing:0}
.sel-actions .inv-link:hover{color:var(--accent-2);text-decoration:underline}
.sel-actions .sel-clear{color:var(--text-2)}
.sel-actions .sel-clear:hover{color:var(--text)}
.icon-dl{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:8px;color:var(--text-3);transition:background .14s,color .14s}
.icon-dl:hover{background:var(--surface-hover);color:var(--text)}
.inv-empty{padding:44px 10px;text-align:center;font-size:14px;color:var(--text-3)}
`}</style>
      <div className="modal inv-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Invoices">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>

        <div className="inv-modal-head">
          {isAll ?
          <>
            <div className="inv-eyebrow">Invoice history</div>
            <div className="inv-h1">All invoices &middot; <span style={{ color: "var(--text-2)", fontWeight: 500 }}>Bayside Office Temps</span></div>
          </> :
          <div className="inv-head-row">
            <div>
              <div className="inv-eyebrow">Invoices</div>
              <div className="inv-h1">{scope.name}</div>
            </div>
          </div>
          }
        </div>

        <div className="inv-filters">
          <span className="inv-sel-wrap">
            <span className="inv-sel-label">Date</span>
            <select className="inv-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All dates</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </span>
          {isAll &&
          <span className="inv-sel-wrap">
            <span className="inv-sel-label">Type</span>
            <select className="inv-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All items</option>
              {subs.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </span>
          }
        </div>

        <div className="inv-tablewrap">
          {rows.length === 0 ?
          <div className="inv-empty">No invoices match &mdash; try a different date or type.</div> :
          <table className={"inv-tbl" + (isAll ? " v-all" : " v-single")}>
            <colgroup>
              <col className="c-check" />
              {isAll && <col className="c-item" />}
              <col className="c-date" />
              <col className="c-amt" />
              <col className="c-status" />
              <col className="c-act" />
            </colgroup>
            <thead>
              <tr>
                <th className="col-check"><span className={"inv-check" + (allSelected ? " on" : "")} role="checkbox" aria-checked={allSelected} onClick={toggleAll}>{(allSelected || someSelected) && <Icon name={allSelected ? "check" : "x"} size={11} stroke={3} />}</span></th>
                {selected.length > 0 ?
                <th className="col-selhead" colSpan={isAll ? 5 : 4}>
                  <span className="sel-head">
                    <span className="sel-count">{selected.length} selected</span>
                    <span className="sel-actions">
                      <button className="inv-link" onClick={() => onAction("Downloading " + selected.length + " invoice" + (selected.length > 1 ? "s" : "") + "\u2026")}>Download</button>
                      <button className="inv-link sel-clear" onClick={() => setSelected([])}>Clear</button>
                    </span>
                  </span>
                </th> :
                <>
                  {isAll && <th className="col-item">Item</th>}
                  <th className="col-date">Date</th>
                  <th className="col-amt">Amount</th>
                  <th className="col-status">Status</th>
                  <th className="col-act"></th>
                </>
                }
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) =>
              <tr key={i}>
                  <td className="col-check"><span className={"inv-check" + (selected.includes(keyOf(r, i)) ? " on" : "")} role="checkbox" aria-checked={selected.includes(keyOf(r, i))} onClick={() => toggleOne(keyOf(r, i))}>{selected.includes(keyOf(r, i)) && <Icon name="check" size={11} stroke={3} />}</span></td>
                  {isAll &&
                <td className="col-item">
                    <span className="inv-item-cell">
                      <span className="tile" style={{ "--th": HUE()[r.sub.grad] }}><Icon name={r.sub.icon} stroke={1.9} /></span>
                      <span className="inv-item-name">{r.sub.name}</span>
                    </span>
                  </td>
                }
                  <td className="col-date">{r.date}</td>
                  <td className="col-amt">{r.amount}</td>
                  <td className="col-status"><span className={"status-pill " + invStatusClass(r.status)}><span className="sdot" />{r.status}</span></td>
                  <td className="col-act">{rowAction(r)}</td>
                </tr>
              )}
            </tbody>
          </table>
          }
        </div>
      </div>
    </div>);

}

/* ---------------- Notifications drawer ---------------- */
function NotificationsDrawer({ groups, onClose, onMarkAll }) {
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Activity">
        <div className="drawer-head">
          <span className="drawer-title">Activity</span>
          <button className="drawer-markall" onClick={onMarkAll}>Mark all as read</button>
        </div>
        <div className="drawer-body">
          {groups.map((g) =>
          <div key={g.group} className="notif-group">
              <div className="notif-group-label">{g.group}</div>
              {g.items.map((n) =>
            <button key={n.id} className={"notif-row" + (n.unread ? " unread" : " read")}>
                  <span className="notif-dot" />
                  <span className="tile" style={{ "--th": HUE()[g.grad] }}><Icon name={g.icon} stroke={1.9} /></span>
                  <span className="notif-meta">
                    <span className="notif-msg">{n.msg}</span>
                    <span className="notif-time">{n.time}</span>
                  </span>
                </button>
            )}
            </div>
          )}
        </div>
      </aside>
    </div>);

}

/* ---------------- Empty ---------------- */
function EmptyState({ query }) {
  return (
    <div className="empty">
      <Icon name="search" size={30} className="e-ico" />
      <h3>Nothing matches &ldquo;{query}&rdquo;</h3>
      <p>Try a broader term, or describe the task you&rsquo;re trying to do.</p>
    </div>);

}

/* ---------------- Inactive-app modal (Explore All Apps) ---------------- */
function AppModal({ app, hasSandbox, requestTarget, onClose, onSandbox, onRequest }) {
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const cat = (window.LAUNCHER_DATA.CATEGORIES.find((c) => c.key === app.cat) || {}).label;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal cal-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={app.name}>
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        <div className="cal-head">
          <div className="cal-eyebrow">{cat || "Catalog app"}</div>
          <div className="cal-title">{app.name}</div>
        </div>
        <div className="modal-desc">
          <p>{app.desc} It brings the workflow into PM Office so your team works from a single source of truth, with role-based access and a full audit trail. Once enabled, it connects to the data you already manage here &mdash; no duplicate entry or exports.</p>
        </div>
        <div className="modal-foot">
          {hasSandbox &&
          <button className="btn-secondary" onClick={() => onSandbox && onSandbox(app)}>Open Sandbox</button>
          }
          <button className="btn-primary" onClick={() => onRequest && onRequest(app, requestTarget)}>Request Access</button>
        </div>
      </div>
    </div>);

}

/* ---------------- Request-a-tool modal ---------------- */
function RequestToolModal({ onClose, onSubmit }) {
  const [need, setNeed] = useState("");
  const [extra, setExtra] = useState("");

  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSubmit = need.trim().length > 0;
  const submit = (e) => {e.preventDefault();if (canSubmit) onSubmit({ need, extra });};

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal cal-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Request a tool" aria-modal="true">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        <div className="cal-head">
          <div className="cal-eyebrow">Custom build</div>
          <div className="cal-title">Request a tool</div>
        </div>
        <form onSubmit={submit}>
          <div className="modal-form">
            <p className="modal-helper">Describe a workflow tool your team needs. We&rsquo;ll send this to the PM Office team, who will reach out to discuss the details and scope the build with you.</p>
            <div className="field">
              <label className="field-label" htmlFor="rt-need">What do you need this tool to do?<span className="req">*</span></label>
              <textarea id="rt-need" value={need} onChange={(e) => setNeed(e.target.value)} required
              placeholder="Describe the workflow, who would use it, and the problem it solves." />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="rt-extra">Anything else we should know? <span className="field-optional">Optional</span></label>
              <textarea id="rt-extra" value={extra} onChange={(e) => setExtra(e.target.value)}
              placeholder="Timeline, expected volume, related apps &mdash; anything that helps us scope it." />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!canSubmit}>Submit request</button>
          </div>
        </form>
      </div>
    </div>);

}

/* ---------------- Intake form (admin-negotiated request — qualifying questions) ---------------- */
/* App-aware intake per the ops catalog (04 · App Catalog): the qualifying
   questions ops authored for the item. Answers return to the waiting request
   in the ops Licensing queue — this submission IS the launcher half of an
   ops request (e.g. Bayside's Payroll Suite request, REQ-1042 ops-side). */
function IntakeFormModal({ form, onClose, onSubmit }) {
  const [vals, setVals] = useState({});
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const set = (k, v) => setVals((p) => ({ ...p, [k]: v }));
  return (
    <div className="modal-scrim" onClick={onClose}>
      <style>{`
.intake-modal{width:min(520px,100%);position:relative}
.intake-modal .modal-close.floating{position:absolute;top:16px;right:16px;left:auto;z-index:2}
.intake-head{padding:26px 26px 0}
.intake-eyebrow{font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px}
.intake-title{font-size:21px;font-weight:500;letter-spacing:-.01em;color:var(--text);line-height:1.15}
.intake-sub{margin:10px 0 0;font-size:13px;line-height:1.5;color:var(--text-2);text-wrap:pretty}
.intake-body{padding:20px 26px 0;display:flex;flex-direction:column;gap:14px;max-height:52vh;overflow-y:auto}
.intake-field{display:flex;flex-direction:column;gap:5px}
.intake-label{font-size:11.5px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--text-3)}
.intake-input{width:100%;background:var(--search-bg);border:1px solid var(--border-strong);border-radius:var(--r-md);padding:10px 12px;color:var(--text);font-size:13.5px;font-family:var(--font-ui)}
.intake-input:focus{outline:none;border-color:var(--search-ring);box-shadow:0 0 0 3px var(--accent-soft)}
.intake-fixed{font-size:13.5px;color:var(--text-2);background:var(--bg-sub);border:1px solid var(--border);border-radius:var(--r-md);padding:10px 12px}
.intake-modal .modal-foot{padding:22px 26px 20px}
`}</style>
      <div className="modal intake-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={form.name + " request"}>
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        <div className="intake-head">
          <div className="intake-eyebrow">Licensing request &middot; Platform Operations</div>
          <div className="intake-title">Request {form.name}</div>
          <p className="intake-sub">This item is licensed through PM Office. Answer the qualifying questions &mdash; your answers go to Platform Operations, who price the request and issue terms for you to review here.</p>
        </div>
        <div className="intake-body">
          {form.fields.map((f) =>
          <div key={f.k} className="intake-field">
              <span className="intake-label">{f.label}</span>
              {f.fixed ?
            <span className="intake-fixed">{f.fixed}</span> :
            <input className="intake-input" placeholder={f.ph || ""} value={vals[f.k] || ""} onChange={(e) => set(f.k, e.target.value)} />}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => onSubmit(vals)}>Send request</button>
        </div>
      </div>
    </div>);

}

/* ---------------- Accept deal modal (issued terms — new app/bundle on a live account) ---------------- */
/* The acceptance rendering contract (02 · Subscriptions): the deal as line
   items by shape · the payment term · the AI-drafted agreement prose
   (read-and-accept) · the owed-invoice preview — then accept-and-pay.
   Automated methods (card/ACH) clear now; check/wire issues an Owed invoice
   PM Office reconciles on receipt — the suite's apps stay gated until then. */
function AcceptDealModal({ deal, onClose, onAccept, wallet, onAdd }) {
  // The wallet's automated methods (charged now through the payment
  // processor) + the manual path (check/wire). New methods can be added
  // right here — the docs' wallet is add-anywhere.
  const walletMethods = (wallet && wallet.length ? wallet : [
  { id: "ach-6789", kind: "ach", glyph: "bank", name: "ACH", num: "6789" },
  { id: "visa-4242", kind: "card", glyph: "receipt", name: "Visa", num: "4242" }]).
  map((w) => ({ key: w.id, kind: "auto", label: w.name + " ···· " + w.num, glyph: w.glyph, sub: "Charged now through the payment processor" }));
  const METHODS = [...walletMethods,
  { key: "check", kind: "manual", short: "check", label: "Check — by mail", glyph: "ledger", sub: "Invoiced — allow mailing and clearing time; apps unlock once it clears" },
  { key: "wire", kind: "manual", short: "wire", label: "Wire transfer", glyph: "bank", sub: "Invoiced — usually settles the same day; apps unlock on receipt" }];

  const [method, setMethod] = useState(walletMethods[0]?.key ?? "check");
  const [adding, setAdding] = useState(false);
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const chosen = METHODS.find((m) => m.key === method) ?? METHODS[0];
  return (
    <div className="modal-scrim" onClick={onClose}>
      <style>{`
.deal-modal{width:min(580px,100%);position:relative;display:flex;flex-direction:column;max-height:88vh}
.deal-modal .modal-close.floating{position:absolute;top:16px;right:16px;left:auto;z-index:2}
.deal-head{padding:26px 26px 0}
.deal-eyebrow{font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--text-3);margin-bottom:6px}
.deal-title{font-size:21px;font-weight:500;letter-spacing:-.01em;color:var(--text);line-height:1.15}
.deal-gate{margin:10px 0 0;font-size:13px;line-height:1.5;color:var(--text-2);text-wrap:pretty}
.deal-body{padding:18px 26px 0;overflow-y:auto}
.deal-sec-label{font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);margin:16px 0 8px}
.deal-sec-label:first-child{margin-top:0}
.deal-lines{border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
.deal-line{display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:12px 16px;font-size:13.5px;color:var(--text-2)}
.deal-line + .deal-line{border-top:1px solid var(--hairline)}
.deal-line .k{color:var(--text);font-weight:500}
.deal-line .k .sub{display:block;font-size:11.5px;color:var(--text-3);font-weight:400;margin-top:2px}
.deal-line .v{color:var(--text);font-weight:500;white-space:nowrap}
.deal-line.due{background:color-mix(in oklch,var(--accent-2) 14%,var(--surface));box-shadow:inset 3px 0 0 var(--accent-2)}
.deal-line.due .v{font-size:17px;color:var(--accent-2)}
.deal-agree{max-height:170px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r-md);padding:12px 14px;background:var(--bg-sub)}
.deal-agree p{font-size:12.5px;line-height:1.55;color:var(--text-2);margin:0 0 10px}
.deal-agree p:last-child{margin-bottom:0}
.deal-invoice{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-2);border:1px dashed var(--border-strong);border-radius:var(--r-md);padding:10px 13px}
.deal-modal .modal-foot{padding:20px 26px 8px}
.deal-fine{padding:0 26px 20px;font-size:11.5px;color:var(--text-3)}
`}</style>
      <div className="modal deal-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Review and accept issued terms">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>

        <div className="deal-head">
          <div className="deal-eyebrow">Issued terms</div>
          <div className="deal-title">{deal.name}</div>
          <p className="deal-gate">PM Office issued these terms for your request. Accepting is a financial and contractual commitment &mdash; the suite&rsquo;s apps activate once the amount due clears.</p>
        </div>

        <div className="deal-body">
          <div className="deal-sec-label">Your deal</div>
          <div className="deal-lines">
            <div className="deal-line">
              <span className="k">{deal.name} &middot; Bundle<span className="sub">Includes {deal.includes} &mdash; priced as one line</span></span>
              <span className="v">{deal.total}</span>
            </div>
            <div className="deal-line due">
              <span className="k">Due at acceptance<span className="sub">Full first charge &mdash; your anniversary billing cycle starts today</span></span>
              <span className="v">{deal.amountDue}</span>
            </div>
          </div>

          <div className="deal-sec-label">Agreement &mdash; read &amp; accept</div>
          <div className="deal-agree">
            {deal.agreement.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className="deal-sec-label">What becomes due</div>
          <div className="deal-invoice"><Icon name="receipt" size={15} /> {deal.invoice}</div>

          <div className="deal-sec-label">Payment method</div>
          <div className="pm-options">
            {METHODS.map((m) => {
              const on = method === m.key;
              return (
                <button key={m.key} className={"pm-option" + (on ? " on" : "")} onClick={() => setMethod(m.key)}>
                  <span className="pm-option-glyph"><Icon name={m.glyph} size={18} /></span>
                  <span className="pm-option-meta">
                    <span className="pm-option-name">{m.label}</span>
                    <span className="pm-option-sub">{m.sub}</span>
                  </span>
                  <span className={"pm-radio" + (on ? " on" : "")}>{on && <Icon name="check" size={12} stroke={3} />}</span>
                </button>);
            })}
            <button className="pm-option add" onClick={() => setAdding(true)}>
              <span className="pm-option-glyph add"><Icon name="plus" size={18} stroke={2} /></span>
              <span className="pm-option-name">Add new method</span>
            </button>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-text" onClick={onClose}>Not now</button>
          <button type="button" className="btn-primary" onClick={() => onAccept(chosen)}>
            {chosen.kind === "manual" ? "Accept — invoice by " + (chosen.short || chosen.label.toLowerCase()) : "Accept & pay " + deal.amountDue}
          </button>
        </div>
        <div className="deal-fine">PM Office is notified of acceptance; settlement happens ops-side and refreshes this display.</div>
      </div>
      {adding && <AddPaymentMethodModal onClose={() => setAdding(false)}
      onAdd={(m) => {onAdd && onAdd(m);setMethod(m.id);}} />}
    </div>);

}

/* ---------------- Sales Rep application (ops-defined program intake) ---------------- */
/* Reuses the cal-modal intake rendering (RequestToolModal / BundleChangeModal): field
   markup, multi-select chips, and the bundle-done success state. No new form engine.
   Fields mirror the ops-authored Sales Reps program intake exactly (see submit handler). */
function RepApplicationModal({ onClose, onSubmit }) {
  const [sent, setSent] = useState(false);
  // Field set is AUTHORED BY OPS (the App Catalog intake builder); the launcher only renders it.
  // Keep this in lockstep with the ops Sales Reps program intake — do not diverge.
  const [affiliate, setAffiliate] = useState("");
  const [audience, setAudience] = useState("");
  const [channels, setChannels] = useState([]);
  const [referrals, setReferrals] = useState("");
  const [url, setUrl] = useState("");
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const channelOpts = ["Newsletter", "YouTube", "Podcast", "Paid ads"];
  const toggleChannel = (c) => setChannels((cs) => cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]);
  const canSubmit = affiliate.trim().length > 0 && audience.trim().length > 0 && channels.length > 0;
  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // Submitted answers carry the ops field labels + values.
    onSubmit({ fields: [
    { label: "Affiliate / company name", value: affiliate.trim() },
    { label: "Who’s your audience?", value: audience.trim() },
    { label: "Channels you promote through", value: channels },
    { label: "Est. monthly referrals", value: referrals.trim() },
    { label: "Website / profile URL", value: url.trim() }] });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="modal-scrim" onClick={onClose}>
        <div className="modal cal-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Application submitted">
          <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
          <div className="bundle-done">
            <span className="bundle-check"><Icon name="check" size={26} stroke={2.4} /></span>
            <div className="bundle-done-title">Application submitted</div>
            <p className="bundle-done-text">Platform Operations will review your application. Track its status in Access Requests.</p>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>);
  }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal cal-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Sales Rep application">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        <div className="cal-head">
          <div className="cal-eyebrow">Platform Operations &middot; Sales Reps Program</div>
          <div className="cal-title">Sales Rep Application</div>
        </div>
        <form onSubmit={submit}>
          <div className="modal-form">
            <p className="modal-helper">Apply to join the Sales Reps program. Platform Operations reviews every application &mdash; you&rsquo;ll see the decision in your Access Requests.</p>
            <div className="field">
              <label className="field-label" htmlFor="rep-affiliate">Affiliate / company name<span className="req">*</span></label>
              <input id="rep-affiliate" type="text" value={affiliate} onChange={(e) => setAffiliate(e.target.value)} required
              placeholder="The name prospects will recognize you by." />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="rep-audience">Who&rsquo;s your audience?<span className="req">*</span></label>
              <p className="field-help">The segment you reach (e.g. SMB payroll buyers).</p>
              <textarea id="rep-audience" value={audience} onChange={(e) => setAudience(e.target.value)} required
              placeholder="Describe who you&rsquo;ll be promoting to." />
            </div>
            <div className="field">
              <label className="field-label">Channels you promote through<span className="req">*</span></label>
              <div className="bundle-intents">
                {channelOpts.map((c) => {
                  const on = channels.includes(c);
                  return (
                    <button key={c} type="button" className={"bundle-chip" + (on ? " on" : "")} onClick={() => toggleChannel(c)}>
                      <span className={"checkbox" + (on ? " on" : "")}>{on && <Icon name="check" size={12} stroke={3} />}</span>
                      {c}
                    </button>);

                })}
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="rep-referrals">Est. monthly referrals <span className="field-optional">Optional</span></label>
              <input id="rep-referrals" type="number" min="0" value={referrals} onChange={(e) => setReferrals(e.target.value)}
              placeholder="e.g. 25" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="rep-url">Website / profile URL <span className="field-optional">Optional</span></label>
              <input id="rep-url" type="text" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://" />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-text" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!canSubmit}>Submit application</button>
          </div>
        </form>
      </div>
    </div>);

}

/* ---------------- Sales Rep Portal (new-tab launch target; active-rep dashboard shell) ---------------- */
/* Chunk 1: membership, deep link, earnings. Earnings + link are mock/read-only (ops-derived);
   membership is the active-rep state (this surface is only reached by active reps). */
function SalesRepPortal({ onBack, theme, onToggleTheme }) {
  const D = window.LAUNCHER_DATA;
  const [copiedKey, setCopiedKey] = useState(null);
  const [packages, setPackages] = useState(() => D.REP_PACKAGES || []);
  const [threadId, setThreadId] = useState(null); // package whose detail (with negotiation) is open
  const [page, setPage] = useState("overview"); // overview | builder | packages | payouts
  const PAGES = [
  { k: "overview", label: "Overview", icon: "compass" },
  { k: "builder", label: "Package builder", icon: "briefcase" },
  { k: "packages", label: "Submitted packages", icon: "claims" },
  { k: "payouts", label: "Payouts", icon: "receipt" }];

  const pkgTimer = React.useRef(null);
  const opsTimer = React.useRef(null);
  const newCount = React.useRef(0);
  // Ops-governed referral link — SINGLE SOURCE is ops (reps-store mints the
  // tag at activation: RT-<REP>[-TOKEN] on launch.pmoffice.app/join?ref=…).
  // The launcher displays it verbatim; lifecycle (regenerate/deactivate) lives at ops.
  const refLink = "https://launch.pmoffice.app/join?ref=RT-OPHELIA-4F2K9";
  const canShare = typeof navigator !== "undefined" && !!navigator.share;
  React.useEffect(() => {
    const prev = document.title;
    document.title = "Sales Rep Portal — PM Office";
    return () => {document.title = prev;};
  }, []);
  React.useEffect(() => () => {clearTimeout(pkgTimer.current);clearTimeout(opsTimer.current);}, []);

  const copy = (key, text) => {
    if (!(navigator.clipboard && navigator.clipboard.writeText)) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      clearTimeout(copy._t);
      copy._t = setTimeout(() => setCopiedKey(null), 1800);
    }).catch(() => {});
  };
  const shareLink = () => {if (canShare) navigator.share({ title: "Join PM Office", url: refLink }).catch(() => {});};

  // Submit a package -> pending; mock the ops round-trip: approve, issue link, seed the opening offer.
  const submitPackage = (data) => {
    newCount.current += 1;
    const n = newCount.current;
    const code = (data.prospect.name.split(/\s+/)[0] || "PKG").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) + "-" + (1000 + n);
    const id = "pkg-new-" + n;
    setPackages((prev) => [{ id, code, status: "submitted", note: data.note, prospect: data.prospect,
      selection: data.selection, bill: null, settled: false, settledBy: null, thread: [] }, ...prev]);
    clearTimeout(pkgTimer.current);
    pkgTimer.current = setTimeout(() => {
      setPackages((prev) => prev.map((p) => p.id !== id ? p : {
        ...p, status: "approved", bill: "$960 / mo",
        thread: [{ by: "ops", at: "Just now", justification: "Opening offer — standard rate for this selection.",
          lines: p.selection.map((s) => ({ id: s.id, name: s.name, initial: "12%", recurring: "10%" })) }]
      }));
    }, 2600);
  };

  // Commission thread (rep side). Accept settles; Counter adds a rep round + a mocked ops reply.
  const acceptOffer = (id) => setPackages((prev) => prev.map((p) => p.id !== id ? p : { ...p, settled: true, settledBy: "rep" }));
  const counterOffer = (id, lines, justification) => {
    setPackages((prev) => prev.map((p) => p.id !== id ? p : { ...p, thread: [...p.thread, { by: "rep", at: "Just now", justification, lines }] }));
    clearTimeout(opsTimer.current);
    opsTimer.current = setTimeout(() => {
      setPackages((prev) => prev.map((p) => {
        if (p.id !== id) return p;
        const repRound = p.thread[p.thread.length - 1];
        return { ...p, thread: [...p.thread, { by: "ops", at: "Just now",
          justification: "Reviewed your counter — we can agree to these terms.",
          lines: repRound.lines.map((l) => ({ ...l })) }] };
      }));
    }, 2600);
  };
  const openPkg = packages.find((p) => p.id === threadId);

  // Earnings read from the single source (also feeds Payouts). Current period = periods[0].
  const cur = D.REP_EARNINGS.periods[0];
  const earn = { period: "This period · " + cur.period.replace(/\s+\d{4}$/, ""), total: cur.total, initial: cur.initial, recurring: cur.recurring };

  return (
    <div className="app">
      <style>{`
/* Sales Rep Portal — uses the real .app/.sidebar/.main shell + .glass/.btn/.status-pill/.field/.inv-table */
.srp-gridbtn{margin-left:auto;flex:none;width:32px;height:32px;border-radius:9px;display:grid;place-items:center;color:var(--text-3);transition:background .14s,color .14s}
.srp-gridbtn:hover{background:var(--surface-hover);color:var(--text)}
.srp-h1{font-family:var(--font-display);font-weight:500;font-size:clamp(28px,3vw,38px);line-height:1.05;letter-spacing:-.018em;color:var(--text);margin:0}
.srp-surface{border-radius:var(--r-lg);padding:22px}
.srp-wiz{padding:24px;border-radius:var(--r-lg)}
.srp-tablewrap{border-radius:var(--r-lg);padding:2px 22px 12px}
.srp-tablewrap .inv-table{margin-top:0}
.srp-tablewrap .inv-table tbody tr.srp-tr-click{cursor:pointer}
.srp-tablewrap .inv-table tbody tr.srp-tr-click:hover td{background:var(--surface-hover)}
.srp-statuswrap{display:inline-flex;align-items:center;gap:6px}
.srp-info{position:relative;display:inline-flex;align-items:center;color:var(--text-3);cursor:help}
.srp-info:hover,.srp-info:focus-visible{color:var(--accent);outline:none}
.srp-tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);width:236px;background:var(--surface);color:var(--text-2);border:1px solid var(--border-strong);border-radius:var(--r-md);box-shadow:var(--shadow-pop);padding:9px 11px;font-size:12px;line-height:1.45;font-weight:400;letter-spacing:0;text-transform:none;opacity:0;visibility:hidden;transition:opacity .14s;z-index:60;pointer-events:none}
.srp-info:hover .srp-tip,.srp-info:focus-within .srp-tip{opacity:1;visibility:visible}
.srp-card{padding:20px;border:1px solid var(--border);border-radius:var(--r-lg);background:var(--surface)}
.srp-membership{display:flex;align-items:center;justify-content:space-between;gap:16px;border-radius:var(--r-lg);padding:18px 20px;margin-bottom:16px}
.srp-mem-left{display:flex;align-items:center;gap:14px;min-width:0}
.srp-mem-tile{width:46px;height:46px;border-radius:12px;flex:none}
.srp-mem-tile svg{width:23px;height:23px}
.srp-mem-row{display:flex;align-items:center;gap:10px}
.srp-mem-name{font-size:16px;font-weight:600;color:var(--text)}
.srp-mem-sub{margin-top:3px;font-size:12.5px;color:var(--text-2);line-height:1.45}
.srp-free{flex:none;font-size:12px;font-weight:500;color:var(--accent);background:var(--accent-soft);border:1px solid color-mix(in oklch,var(--accent) 22%,transparent);border-radius:999px;padding:5px 12px;white-space:nowrap}
.srp-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.srp-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:4px}
.srp-card-k{display:inline-flex;align-items:center;gap:7px;font-size:14.5px;font-weight:600;color:var(--text)}
.srp-card-d{margin:0 0 14px;font-size:13px;line-height:1.5;color:var(--text-2)}
.srp-link-row{display:flex;gap:8px;align-items:stretch}
.srp-link{flex:1;min-width:0;background:var(--search-bg);border:1px solid var(--border-strong);border-radius:var(--r-md);padding:10px 12px;color:var(--text-2);font-size:13px;font-family:var(--font-ui);text-overflow:ellipsis}
.srp-link:focus{outline:none;border-color:var(--search-ring);box-shadow:0 0 0 3px var(--accent-soft);color:var(--text)}
.srp-linkbtn{display:inline-flex;align-items:center;gap:6px;flex:none;font-size:13px;font-weight:500;color:var(--text);background:var(--surface-2);border:1px solid var(--border-strong);border-radius:var(--r-md);padding:0 13px;transition:background .14s,border-color .14s}
.srp-linkbtn:hover{background:var(--surface-hover);border-color:var(--text-3)}
.srp-linkbtn.ghost{padding:0 10px;color:var(--text-2)}
.srp-period{font-size:12px;color:var(--text-3)}
.srp-earn-total{font-family:var(--font-display);font-weight:500;font-size:clamp(34px,3.4vw,46px);letter-spacing:-.02em;color:var(--text);line-height:1.04;margin-top:2px}
.srp-earn-split{display:flex;gap:10px;margin-top:16px}
.srp-stat{flex:1;display:flex;flex-direction:column;gap:2px;padding:11px 13px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--bg-sub)}
.srp-stat-v{font-size:17px;font-weight:600;color:var(--text)}
.srp-stat-k{font-size:11.5px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--text-3)}
.srp-fine{margin:14px 0 0;font-size:11.5px;line-height:1.45;color:var(--text-3)}
.srp-sec-sub{margin:5px 0 14px;font-size:13px;line-height:1.5;color:var(--text-2)}
/* sub-page heads */
.srp-page-head{margin-bottom:20px}
.srp-page-sub{margin:6px 0 0;font-size:13.5px;line-height:1.5;color:var(--text-2);max-width:64ch}
/* package builder wizard */
.srp-steps{display:flex;align-items:center;margin-bottom:24px}
.srp-step{display:flex;align-items:center;gap:9px}
.srp-step-num{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:12.5px;font-weight:600;border:1.5px solid var(--border-strong);color:var(--text-3);background:var(--surface);flex:none}
.srp-step.active .srp-step-num{border-color:var(--accent-2);color:var(--accent);background:var(--accent-soft)}
.srp-step.done .srp-step-num{border-color:transparent;color:#fff;background:linear-gradient(135deg,var(--accent-2),var(--accent))}
.srp-step-label{font-size:13px;font-weight:500;color:var(--text-3);white-space:nowrap}
.srp-step.active .srp-step-label{color:var(--text)}
.srp-step.done .srp-step-label{color:var(--text-2)}
.srp-step-bar{flex:1;height:1.5px;background:var(--border);margin:0 12px;min-width:16px}
.srp-step-bar.done{background:var(--accent-2)}
.srp-wiz-body{min-height:150px}
.srp-wiz-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:22px;padding-top:18px;border-top:1px solid var(--hairline)}
.srp-rev{display:flex;flex-direction:column;gap:16px}
.srp-rev-row{display:flex;flex-direction:column;gap:5px}
.srp-rev-k{font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--text-3)}
.srp-rev-v{font-size:14px;color:var(--text)}
.srp-rev-v.muted{color:var(--text-3)}
.srp-rev-sel{display:flex;flex-wrap:wrap;gap:7px}
.srp-wiz-done{padding:8px 0 0}
.srp-wiz-done-foot{display:flex;justify-content:center;gap:8px;margin-top:8px}
/* package detail modal (summary + relocated negotiation) */
.srp-det-sum{padding:14px 26px 16px;display:flex;flex-direction:column;gap:12px;border-bottom:1px solid var(--hairline)}
.srp-det-status{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.srp-det-bill{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:2px}
.srp-det-bill-k{font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--text-3)}
.srp-det-bill-v{font-size:15px;font-weight:600;color:var(--text)}
.srp-det-bill-note{font-size:12px;color:var(--text-3)}
.srp-det-msg{padding:18px 26px;font-size:13.5px;line-height:1.5;color:var(--text-2)}
.srp-det-th-label{padding:16px 26px 2px;font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3)}
/* package builder */
.srp-fields{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.srp-pick{margin-top:18px}
.srp-pick-label{font-size:11px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);margin:0 0 8px}
.srp-pick-label.apps{margin-top:16px}
.srp-pick-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.srp-pick-scroll{max-height:228px;overflow-y:auto;padding-right:4px}
.srp-pick-item{display:flex;align-items:center;gap:10px;text-align:left;width:100%;padding:9px 11px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--surface);transition:border-color .14s,background .14s}
.srp-pick-item:hover{border-color:var(--border-strong);background:var(--surface-hover)}
.srp-pick-item.on{border-color:var(--accent-2);background:var(--accent-soft)}
.srp-pick-tile{width:30px;height:30px;border-radius:8px;flex:none}
.srp-pick-tile svg{width:16px;height:16px}
.srp-pick-name{display:flex;align-items:center;gap:7px;flex:1;min-width:0;font-size:13.5px;font-weight:500;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.srp-tag{font-size:10px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--accent-2);background:var(--accent-soft);border-radius:5px;padding:1px 6px;flex:none}
.srp-build-foot{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-top:18px}
.srp-build-count{font-size:13px;color:var(--text-2)}
.srp-build-sent{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--accent)}
/* submitted packages */
.srp-empty{padding:22px;text-align:center;font-size:13.5px;color:var(--text-3);border:1px dashed var(--border-strong);border-radius:var(--r-lg)}
.srp-pkg-sel{display:flex;flex-wrap:wrap;gap:7px}
.srp-pkg-chip{display:inline-flex;align-items:center;gap:7px;padding:5px 10px 5px 6px;border:1px solid var(--border);border-radius:999px;background:var(--bg-sub);font-size:12.5px;font-weight:500;color:var(--text-2)}
.srp-pkg-chip .tile{width:22px;height:22px;border-radius:6px;flex:none}
.srp-pkg-chip .tile svg{width:13px;height:13px}
.srp-pkg-act{display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:500;color:var(--accent-2);padding:7px 12px;border-radius:var(--r-md);border:1px solid color-mix(in oklch,var(--accent-2) 32%,var(--border));transition:background .14s}
.srp-pkg-act:hover{background:var(--accent-soft)}
/* commission thread modal */
.srp-th-modal{width:min(540px,100%);position:relative}
.srp-th-modal .modal-close.floating{position:absolute;top:16px;right:16px;left:auto;z-index:2}
.srp-th-head{padding:24px 26px 0}
.srp-th-body{padding:14px 26px 0;max-height:54vh;overflow-y:auto}
.srp-round{padding:14px 0;border-top:1px solid var(--hairline)}
.srp-round:first-child{border-top:0;padding-top:6px}
.srp-round-head{display:flex;align-items:center;gap:9px;margin-bottom:9px}
.srp-by{font-size:10px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;padding:2px 8px;border-radius:5px;background:var(--surface-2);color:var(--text-2)}
.srp-by.rep{background:var(--accent-soft);color:var(--accent)}
.srp-round-at{font-size:11.5px;color:var(--text-3);margin-left:auto}
.srp-line{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:5px 0;font-size:13px}
.srp-line-name{color:var(--text);font-weight:500;min-width:0}
.srp-line-rates{color:var(--text-2);white-space:nowrap}
.srp-just{margin:9px 0 0;font-size:12.5px;line-height:1.5;color:var(--text-2);background:var(--bg-sub);border-radius:var(--r-md);padding:9px 11px}
.srp-settled{display:flex;align-items:center;gap:8px;margin:16px 26px 0;padding:11px 13px;border-radius:var(--r-md);background:var(--accent-soft);color:var(--accent);font-size:13px;font-weight:500}
.srp-await{margin:16px 26px 0;padding:11px 13px;border-radius:var(--r-md);background:var(--surface-2);color:var(--text-2);font-size:12.5px}
.srp-cline{padding:12px 0;border-top:1px solid var(--hairline)}
.srp-cline:first-child{border-top:0}
.srp-cline-name{font-size:13px;font-weight:500;color:var(--text);margin-bottom:8px}
.srp-cline-inputs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.srp-cin{display:flex;flex-direction:column;gap:4px}
.srp-cin label{font-size:10.5px;font-weight:500;letter-spacing:.04em;text-transform:uppercase;color:var(--text-3)}
.srp-cin input{width:100%;background:var(--search-bg);border:1px solid var(--border-strong);border-radius:var(--r-md);padding:8px 10px;color:var(--text);font-size:13px;font-family:var(--font-ui)}
.srp-cin input:focus{outline:none;border-color:var(--search-ring);box-shadow:0 0 0 3px var(--accent-soft)}
.srp-counter-just{padding:14px 0 0}
/* shared table — submitted packages + payouts */
.srp-table{width:100%;border-collapse:collapse;margin-top:4px}
.srp-table th{text-align:left;font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--text-3);padding:9px 10px;border-bottom:1px solid var(--border)}
.srp-table td{padding:14px 10px;font-size:14px;color:var(--text);border-bottom:1px solid var(--hairline);vertical-align:top}
.srp-table tr:last-child td{border-bottom:0}
.srp-table th:first-child,.srp-table td:first-child{padding-left:2px}
.srp-table th:last-child,.srp-table td:last-child{padding-right:2px}
tr.srp-tr-click{cursor:pointer;transition:background .12s}
tr.srp-tr-click:hover{background:var(--surface-hover)}
.srp-pay-period{font-weight:500}
.srp-pay-cur{font-size:10px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;color:var(--accent-2);background:var(--accent-soft);border-radius:5px;padding:1px 6px;margin-left:8px}
.srp-pay-amt{font-weight:500;white-space:nowrap}
.srp-pay-date{color:var(--text-2);white-space:nowrap}
.srp-pay-adj{font-size:12px;color:var(--text-3);margin-top:4px}
.srp-pk-prospect{font-weight:500;color:var(--text)}
.srp-pk-co{font-size:12.5px;color:var(--text-3);margin-top:2px}
.srp-pk-sel{display:flex;flex-wrap:wrap;gap:6px;max-width:300px}
.srp-pk-comm{font-size:13px;color:var(--text-2)}
.srp-pk-comm.muted{color:var(--text-3)}
.srp-pk-dash{color:var(--text-3)}
@media (max-width:720px){.srp-row{grid-template-columns:1fr}.srp-fields{grid-template-columns:1fr}.srp-pick-grid{grid-template-columns:1fr}.srp-membership{flex-direction:column;align-items:flex-start}}
`}</style>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo"><Logo size={26} /></span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <div className="brand-name">Sales Rep Portal</div>
            <div className="brand-sub">Sales Reps Program</div>
          </span>
          <button className="srp-gridbtn" onClick={onBack} aria-label="Back to launcher" title="Back to PM Office launcher"><Icon name="grid" size={18} /></button>
        </div>

        <nav className="nav">
          {PAGES.map((t) =>
          <button key={t.k} className={"nav-item" + (page === t.k ? " active" : "")} onClick={() => setPage(t.k)}>
            <Icon name={t.icon} size={18} className="nav-ico" />
            <span>{t.label}</span>
          </button>
          )}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-foot">
          <button className="foot-item" onClick={onToggleTheme}>
            <Icon name="theme" size={18} className="nav-ico" />
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>

        <div className="user-card">
          <span className="user-av-wrap">
            <span className="user-av" aria-label="Ophelia Crosby"
            style={{ display: "grid", placeItems: "center", color: "#fff", fontWeight: 500, fontSize: 14, backgroundImage: "linear-gradient(140deg,#f59e0b,#c2410c)" }}>OC</span>
            <span className="user-dot" />
          </span>
          <span style={{ minWidth: 0 }}>
            <div className="user-name">Ophelia Crosby</div>
            <div className="user-role">ophelia.crosby@example.com</div>
          </span>
          <Icon name="chevrons" size={16} className="user-chevs" />
        </div>
      </aside>

      <main className="main">
        <div className="main-inner">
          {page === "overview" &&
          <>
            <div className="srp-page-head">
              <div className="eyebrow">Sales Reps Program</div>
              <h1 className="greeting">Your rep <span className="accent">dashboard</span></h1>
              <p className="subhead">Your membership, referral link and earnings at a glance.</p>
            </div>

            <section className="glass srp-membership">
              <div className="srp-mem-left">
                <span className="tile lg srp-mem-tile" style={{ "--th": HUE().teal }}><Icon name="groups" stroke={1.9} /></span>
                <div className="srp-mem-id">
                  <div className="srp-mem-row">
                    <span className="srp-mem-name">Sales Rep</span>
                    <span className="status-pill accepted"><span className="sdot" />Active</span>
                  </div>
                  <div className="srp-mem-sub">A free, included app &mdash; your membership lives here, not in Subscriptions.</div>
                </div>
              </div>
              <span className="srp-free">Included &middot; Free</span>
            </section>

            <div className="srp-row">
              <section className="glass srp-surface">
                <div className="srp-card-head"><span className="srp-card-k"><Icon name="link" size={16} /> Your referral link</span></div>
                <p className="srp-card-d">Your rep tag in a join link &mdash; share it to start capturing leads. Self-serve sign-up through the link is coming soon.</p>
                <div className="srp-link-row">
                  <input className="srp-link" value={refLink} readOnly onFocus={(e) => e.target.select()} aria-label="Referral link" />
                  <button type="button" className="srp-linkbtn" onClick={() => copy("ref", refLink)}>
                    <Icon name={copiedKey === "ref" ? "check" : "copy"} size={15} /> {copiedKey === "ref" ? "Copied" : "Copy"}
                  </button>
                  {canShare && <button type="button" className="srp-linkbtn ghost" onClick={shareLink} aria-label="Share link"><Icon name="share" size={15} /></button>}
                </div>
                <p className="srp-fine">A lightweight lead-capture stub for now &mdash; the packages you build are what credit you today.</p>
              </section>

              <section className="glass srp-surface">
                <div className="srp-card-head"><span className="srp-card-k">Earnings</span><span className="srp-period">{earn.period}</span></div>
                <div className="srp-earn-total">{earn.total}</div>
                <div className="srp-earn-split">
                  <div className="srp-stat"><span className="srp-stat-v">{earn.initial}</span><span className="srp-stat-k">Initial</span></div>
                  <div className="srp-stat"><span className="srp-stat-v">{earn.recurring}</span><span className="srp-stat-k">Recurring</span></div>
                </div>
                <p className="srp-fine">Commission is a live % of billed revenue, per line. Read-only &mdash; derived from Platform Operations.</p>
              </section>
            </div>
          </>}

          {page === "builder" &&
          <>
            <div className="srp-page-head">
              <div className="eyebrow">Sales Reps Program</div>
              <h1 className="srp-h1">Package builder</h1>
              <p className="srp-page-sub">Build a package for a prospect, then send it to Platform Operations to price and approve.</p>
            </div>
            {/* Selection comes from the ops-owned commercial CATALOG (8 apps +
                the two catalog bundles) — platform apps are not packageable. */}
            <PackageBuilder apps={D.CATALOG} bundles={D.BUNDLES}
            onSubmit={submitPackage} onSubmitted={() => setPage("packages")} />
          </>}

          {page === "packages" &&
          <>
            <div className="srp-page-head">
              <div className="eyebrow">Sales Reps Program</div>
              <h1 className="srp-h1">Submitted packages</h1>
              <p className="srp-page-sub">Your packages and where each one stands. Open a package to view or negotiate its commission.</p>
            </div>
            <SubmittedPackages packages={packages} onOpenDetail={setThreadId} />
          </>}

          {page === "payouts" &&
          <>
            <div className="srp-page-head">
              <div className="eyebrow">Sales Reps Program</div>
              <h1 className="srp-h1">Payouts</h1>
              <p className="srp-page-sub">Your commission disbursements by period &mdash; the payout view of your earnings. Read-only.</p>
            </div>
            <PayoutsCard earnings={D.REP_EARNINGS} />
          </>}
        </div>
      </main>
      {openPkg && <PackageDetailModal pkg={openPkg} onClose={() => setThreadId(null)} onAccept={acceptOffer} onCounter={counterOffer} copiedKey={copiedKey} onCopy={copy} />}
    </div>);

}

/* ---------------- Package builder (chunk 2): build a package FOR a prospect ---------------- */
/* Selection only — no prospect pricing (ops owns it). Reuses the existing catalog (apps + bundles). */
function PackageBuilder({ apps, bundles, onSubmit, onSubmitted }) {
  const STEPS = ["Prospect", "Selection", "Review"];
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [sel, setSel] = useState([]); // keys: "app:<id>" / "bundle:<id>"
  const [note, setNote] = useState("");

  const keyOf = (type, id) => type + ":" + id;
  const toggle = (k) => setSel((s) => s.includes(k) ? s.filter((x) => x !== k) : [...s, k]);
  const resolve = () => sel.map((k) => {
    const i = k.indexOf(":");
    const type = k.slice(0, i), id = k.slice(i + 1);
    const src = (type === "bundle" ? bundles : apps).find((x) => x.id === id) || {};
    return { id, name: src.name, icon: src.icon, grad: src.grad, bundle: type === "bundle" };
  });

  const stepValid = step === 0 ? (name.trim().length > 0 && company.trim().length > 0 && /.+@.+\..+/.test(email.trim())) : step === 1 ? sel.length > 0 : true;
  const next = () => {if (stepValid && step < 2) setStep(step + 1);};
  const back = () => {if (step > 0) setStep(step - 1);};
  const submit = () => {
    onSubmit({ prospect: { name: name.trim(), email: email.trim(), company: company.trim() }, selection: resolve(), note: note.trim() });
    setDone(true);
  };
  const reset = () => {setDone(false);setStep(0);setName("");setEmail("");setCompany("");setSel([]);setNote("");};

  const pickItem = (item, type) => {
    const k = keyOf(type, item.id);
    const on = sel.includes(k);
    return (
      <button key={k} type="button" className={"srp-pick-item" + (on ? " on" : "")} onClick={() => toggle(k)}>
        <span className={"checkbox" + (on ? " on" : "")}>{on && <Icon name="check" size={11} stroke={3} />}</span>
        <span className="tile srp-pick-tile" style={{ "--th": HUE()[item.grad] }}><Icon name={item.icon} stroke={1.9} /></span>
        <span className="srp-pick-name">{item.name}{type === "bundle" && <span className="srp-tag">Bundle</span>}</span>
      </button>);

  };

  if (done) {
    return (
      <div className="glass srp-wiz">
        <div className="bundle-done">
          <span className="bundle-check"><Icon name="check" size={26} stroke={2.4} /></span>
          <div className="bundle-done-title">Package submitted</div>
          <p className="bundle-done-text">Sent to Platform Operations &mdash; pending approval. You&rsquo;ll find it in Submitted packages.</p>
        </div>
        <div className="srp-wiz-done-foot">
          <button type="button" className="btn-text" onClick={reset}>Build another</button>
          <button type="button" className="btn-primary" onClick={() => {reset();onSubmitted && onSubmitted();}}>View submitted packages</button>
        </div>
      </div>);

  }

  const selItems = resolve();
  return (
    <div className="glass srp-wiz">
      <div className="srp-steps">
        {STEPS.map((s, i) =>
        <React.Fragment key={s}>
          {i > 0 && <span className={"srp-step-bar" + (i <= step ? " done" : "")} />}
          <div className={"srp-step" + (i === step ? " active" : i < step ? " done" : "")}>
            <span className="srp-step-num">{i < step ? <Icon name="check" size={13} stroke={3} /> : i + 1}</span>
            <span className="srp-step-label">{s}</span>
          </div>
        </React.Fragment>
        )}
      </div>

      <div className="srp-wiz-body">
        {step === 0 &&
        <div className="srp-fields">
          <div className="field">
            <label className="field-label" htmlFor="pb-name">Prospect name / label<span className="req">*</span></label>
            <input id="pb-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Who is this package for?" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="pb-email">Contact email<span className="req">*</span></label>
            <input id="pb-email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="pb-co">Org / company<span className="req">*</span></label>
            <input id="pb-co" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
          </div>
        </div>}

        {step === 1 &&
        <div className="srp-pick" style={{ marginTop: 0 }}>
          <p className="srp-pick-label">Bundles</p>
          <div className="srp-pick-grid">{bundles.map((b) => pickItem(b, "bundle"))}</div>
          <p className="srp-pick-label apps">Apps</p>
          <div className="srp-pick-grid srp-pick-scroll">{apps.map((a) => pickItem(a, "app"))}</div>
        </div>}

        {step === 2 &&
        <div className="srp-rev">
          <div className="srp-rev-row">
            <span className="srp-rev-k">Prospect</span>
            <span className="srp-rev-v">{name}{company ? " · " + company : ""}{email ? " · " + email : ""}</span>
          </div>
          <div className="srp-rev-row">
            <span className="srp-rev-k">Selection ({selItems.length})</span>
            <div className="srp-rev-sel">
              {selItems.map((s) =>
              <span key={s.id} className="srp-pkg-chip">
                  <span className="tile" style={{ "--th": HUE()[s.grad] }}><Icon name={s.icon} stroke={1.9} /></span>
                  {s.name}{s.bundle && <span className="srp-tag">Bundle</span>}
                </span>
              )}
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="pb-note">Note to Platform Operations <span className="field-optional">Optional</span></label>
            <textarea id="pb-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything ops should know to price this — prospect context, timing, etc." />
          </div>
          <p className="srp-fine" style={{ marginTop: 0 }}>You don&rsquo;t set pricing &mdash; Platform Operations prices and approves every package.</p>
        </div>}
      </div>

      <div className="srp-wiz-foot">
        <button type="button" className="btn-text" onClick={back} style={step === 0 ? { visibility: "hidden" } : null}>Back</button>
        {step < 2 ?
        <button type="button" className="btn-primary" onClick={next} disabled={!stepValid}>Next</button> :
        <button type="button" className="btn-primary" onClick={submit}>Submit for approval</button>}
      </div>
    </div>);

}

/* ---------------- Submitted packages: two-axis status (deal + commission) ---------------- */
/* DEAL axis = package.status; COMMISSION axis derived from settled/thread. Two independent badges. */
const DEAL_META = {
  submitted: { label: "Submitted", pill: "pending" },
  approved: { label: "Approved", pill: "warn" },
  invited: { label: "Invited", pill: "neutral" },
  signedup: { label: "Signed up", pill: "neutral" },
  live: { label: "Live", pill: "accepted" },
  declined: { label: "Declined", pill: "denied" },
  expired: { label: "Expired", pill: "neutral" } };

function commissionMeta(p) {
  if (p.settled) return { label: "Settled", pill: "accepted" };
  if (!p.thread || !p.thread.length) return null;
  if (p.thread.length > 1) return { label: "In negotiation", pill: "warn" };
  return { label: "Offered", pill: "neutral" };
}

function DealBadge({ status }) {
  const m = DEAL_META[status] || DEAL_META.submitted;
  return (
    <span className="srp-statuswrap">
      <span className={"status-pill " + m.pill}><span className="sdot" />{m.label}</span>
      {status === "live" &&
      <span className="srp-info" tabIndex={0} role="img" aria-label="About the Live status" onClick={(e) => e.stopPropagation()}>
        <Icon name="info" size={14} />
        <span className="srp-tip">Live &mdash; the prospect signed up and paid through your attribution; commission is now accruing.</span>
      </span>}
    </span>);

}

function CommissionBadge({ pkg }) {
  const c = commissionMeta(pkg);
  if (!c) return <span className="srp-pk-dash">—</span>;
  return <span className={"status-pill " + c.pill}><span className="sdot" />{c.label}</span>;
}

function SubmittedPackages({ packages, onOpenDetail }) {
  if (!packages.length) return <p className="srp-empty">No packages yet &mdash; build one in Package builder.</p>;
  return (
    <div className="glass srp-tablewrap">
      <table className="inv-table">
        <colgroup><col style={{ width: "24%" }} /><col style={{ width: "27%" }} /><col style={{ width: "17%" }} /><col style={{ width: "17%" }} /><col style={{ width: "15%" }} /></colgroup>
        <thead><tr><th>Prospect</th><th>Selection</th><th>Deal</th><th>Commission</th><th className="col-amt">Prospect price</th></tr></thead>
        <tbody>
        {packages.map((p) =>
          <tr key={p.id} className="srp-tr-click" role="button" tabIndex={0} onClick={() => onOpenDetail(p.id)}
          onKeyDown={(e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();onOpenDetail(p.id);}}}>
            <td>
              <div className="srp-pk-prospect">{p.prospect.name}</div>
              {p.prospect.company && <div className="srp-pk-co">{p.prospect.company}</div>}
            </td>
            <td>
              <div className="srp-pk-sel">
                {p.selection.map((s) =>
                <span key={s.id} className="srp-pkg-chip">
                    <span className="tile" style={{ "--th": HUE()[s.grad] }}><Icon name={s.icon} stroke={1.9} /></span>
                    {s.name}{s.bundle && <span className="srp-tag">Bundle</span>}
                  </span>
                )}
              </div>
            </td>
            <td className="col-status"><DealBadge status={p.status} /></td>
            <td className="col-status"><CommissionBadge pkg={p} /></td>
            <td className="col-amt">{p.bill || <span className="srp-pk-dash">—</span>}</td>
          </tr>
        )}
        </tbody>
      </table>
    </div>);

}

/* ---------------- Package detail + commission negotiation (opened from the Submitted packages table) ---------------- */
/* Same package object + negotiation thread as before — single source, relocated to the row detail. */
function PackageDetailModal({ pkg, onClose, onAccept, onCounter, copiedKey, onCopy }) {
  const [mode, setMode] = useState("thread"); // thread | counter
  const [rates, setRates] = useState([]);
  const [justification, setJustification] = useState("");
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === "Escape") onClose();};
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hasThread = pkg.thread.length > 0;
  const latest = pkg.thread[pkg.thread.length - 1];
  const repCanAct = !pkg.settled && latest && latest.by === "ops";
  const awaiting = !pkg.settled && latest && latest.by === "rep";

  const startCounter = () => {
    setRates(latest.lines.map((l) => ({ id: l.id, name: l.name, initial: l.initial, recurring: l.recurring })));
    setJustification("");
    setMode("counter");
  };
  const setRate = (i, field, v) => setRates((rs) => rs.map((r, j) => j === i ? { ...r, [field]: v } : r));
  const canSend = justification.trim().length > 0;
  const sendCounter = () => {
    if (!canSend) return;
    onCounter(pkg.id, rates.map((r) => ({ id: r.id, name: r.name, initial: r.initial, recurring: r.recurring })), justification.trim());
    setMode("thread");
  };

  const round = (r, i) =>
  <div key={i} className="srp-round">
      <div className="srp-round-head">
        <span className={"srp-by" + (r.by === "rep" ? " rep" : "")}>{r.by === "rep" ? "You" : "Platform Operations"}</span>
        <span className="srp-round-at">{r.at}</span>
      </div>
      {r.lines.map((l) =>
    <div key={l.id} className="srp-line">
          <span className="srp-line-name">{l.name}</span>
          <span className="srp-line-rates">Initial {l.initial} &middot; Recurring {l.recurring}</span>
        </div>
    )}
      {r.justification && <p className="srp-just">{r.justification}</p>}
    </div>;


  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal srp-th-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Package detail">
        <button className="modal-close floating" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button>
        <div className="srp-th-head">
          <div className="cal-eyebrow">Package &middot; {pkg.code}</div>
          <div className="cal-title">{pkg.prospect.name}</div>
        </div>

        {mode === "thread" ?
        <>
          <div className="srp-det-sum">
            <div className="srp-det-status">
              <DealBadge status={pkg.status} />
              <CommissionBadge pkg={pkg} />
            </div>
            <div className="srp-pkg-sel">
              {pkg.selection.map((s) =>
              <span key={s.id} className="srp-pkg-chip">
                  <span className="tile" style={{ "--th": HUE()[s.grad] }}><Icon name={s.icon} stroke={1.9} /></span>
                  {s.name}{s.bundle && <span className="srp-tag">Bundle</span>}
                </span>
              )}
            </div>
            {pkg.bill &&
            <div className="srp-det-bill">
              <span className="srp-det-bill-k">Prospect price</span>
              <span className="srp-det-bill-v">{pkg.bill}</span>
              <span className="srp-det-bill-note">committed &middot; set by ops</span>
            </div>}
          </div>

          {hasThread ?
          <>
            <div className="srp-det-th-label">Commission negotiation</div>
            <div className="srp-th-body">{pkg.thread.map(round)}</div>
            {pkg.settled ?
            <div className="srp-settled"><Icon name="check" size={16} stroke={2.4} /> Settled &mdash; {pkg.settledBy === "rep" ? "you accepted the offer" : "ops accepted your terms"}.</div> :
            awaiting ?
            <div className="srp-await">Counter sent &mdash; awaiting Platform Operations&rsquo; response&hellip;</div> :
            repCanAct ?
            <div className="modal-foot">
              <button type="button" className="btn-text" onClick={startCounter}>Counter</button>
              <button type="button" className="btn-primary" onClick={() => onAccept(pkg.id)}>Accept offer</button>
            </div> : null}
          </> :
          <div className="srp-det-msg">{pkg.status === "declined" ? "This package was declined by Platform Operations." : "Commission terms appear here once Platform Operations approves this package."}</div>}
        </> :

        <>
          <div className="srp-th-body">
            <p className="srp-sec-sub" style={{ marginTop: 0 }}>Propose revised rates per line. A counter requires a justification.</p>
            {rates.map((r, i) =>
            <div key={r.id} className="srp-cline">
                <div className="srp-cline-name">{r.name}</div>
                <div className="srp-cline-inputs">
                  <span className="srp-cin"><label>Initial</label><input value={r.initial} onChange={(e) => setRate(i, "initial", e.target.value)} /></span>
                  <span className="srp-cin"><label>Recurring</label><input value={r.recurring} onChange={(e) => setRate(i, "recurring", e.target.value)} /></span>
                </div>
              </div>
            )}
            <div className="field srp-counter-just">
              <label className="field-label" htmlFor="ct-just">Justification<span className="req">*</span></label>
              <textarea id="ct-just" value={justification} onChange={(e) => setJustification(e.target.value)} required
              placeholder="Explain why these rates — sourcing, account size, term, etc." />
            </div>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn-text" onClick={() => setMode("thread")}>Cancel</button>
            <button type="button" className="btn-primary" disabled={!canSend} onClick={sendCounter}>Send counter</button>
          </div>
        </>}
      </div>
    </div>);

}

/* ---------------- Payouts (chunk 4): read-only disbursement view of the same earnings source ---------------- */
function PayoutsCard({ earnings }) {
  const PILL = { pending: "pending", scheduled: "neutral", paid: "accepted", failed: "denied" };
  const LABEL = { pending: "Pending", scheduled: "Scheduled", paid: "Paid", failed: "Failed" };
  return (
    <div className="glass srp-tablewrap">
      <table className="inv-table">
        <colgroup><col style={{ width: "34%" }} /><col style={{ width: "22%" }} /><col style={{ width: "22%" }} /><col style={{ width: "22%" }} /></colgroup>
        <thead><tr><th>Period</th><th className="col-amt">Amount</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {earnings.periods.map((p, i) =>
          <tr key={p.period}>
              <td>
                <span className="srp-pay-period">{p.period}</span>{i === 0 && <span className="srp-pay-cur">Current</span>}
                {p.adjustment && <div className="srp-pay-adj">{p.adjustment.label} &middot; {p.adjustment.amount}</div>}
              </td>
              <td className="col-amt">{p.total}</td>
              <td className="col-status"><span className={"status-pill " + PILL[p.payout.status]}><span className="sdot" />{LABEL[p.payout.status]}</span></td>
              <td className="srp-pay-date">{p.payout.date || "—"}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

/* ---------------- Toast ---------------- */
function Toast({ text }) {
  return (
    <div className="toast" role="status">
      <span className="dot" />{text}
    </div>);

}

Object.assign(window, { Tile, Sidebar, SearchBar, RouteResult, Controls, Section, AppRow, AppCard, ExploreCard, AppModal, RequestToolModal, RepApplicationModal, SalesRepPortal, Toast, RequestsView, ChatView, BillingScreen, NotificationsDrawer, EmptyState });