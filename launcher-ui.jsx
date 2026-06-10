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
function Sidebar({ theme, onToggleTheme, query, setQuery, screen, onNavigate, onRequestTool, recents, onOpenRecent, org, orgs, onSwitchOrg }) {
  const nav = [
  { icon: "browse", label: "Apps", screen: "home" },
  { icon: "receipt", label: "Subscriptions", screen: "billing" },
  { icon: "requests", label: "Access Requests", badge: 10, screen: "requests" }];

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
        <button className="foot-item" onClick={onRequestTool}><Icon name="plus" size={18} className="nav-ico" /><span>Request a tool</span></button>
        <button className="foot-item" onClick={onToggleTheme}>
          <Icon name="theme" size={18} className="nav-ico" />
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>

      <div className="user-card">
        <span className="user-av-wrap">
          <span className="user-av" aria-label="Ophelia Crosby"
          style={{ display: "grid", placeItems: "center", color: "#fff", fontWeight: 500, fontSize: 14,
            backgroundImage: "linear-gradient(140deg,#f59e0b,#c2410c)" }}>OC</span>
          <span className="user-dot" />
        </span>
        <span style={{ minWidth: 0 }}>
          <div className="user-name">Ophelia Crosby</div>
          <div className="user-role">ophelia.crosby@example.com</div>
        </span>
        <Icon name="chevrons" size={16} className="user-chevs" />
      </div>
    </aside>);

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
        <Icon name="sparkle" size={22} className="spark" style={{ stroke: "rgb(37, 235, 115)" }} />
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
                  {s} {s === sort && <Icon name="chevR" size={14} style={{ color: "var(--accent)", transform: "rotate(0)" }} />}
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
    <div className="app-row" style={highlight ? { outline: "2px solid var(--accent-soft)", outlineOffset: -2 } : undefined}
    onClick={onOpen && app.inplace ? () => onOpen(app) : undefined}>
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
    <div className="card" style={highlight ? { outline: "2px solid var(--accent-soft)", outlineOffset: -2 } : null}
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
function ExploreCard({ app, action, helper, onLaunch, onRequest, onTrial, onSubscribe, onDemo }) {
  const stop = (fn) => (e) => {e.stopPropagation();fn && fn(app);};
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
function RequestsView({ onReview, onOpenBilling, upgradeStage, onRequestTierUpgrade, onOpenTierReview, onOpenManageSeats }) {
  const R = window.LAUNCHER_DATA.REQUESTS;
  const statusLabel = { pending: "Pending", accepted: "Accepted", denied: "Denied" };
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
        <Section title="Incoming" count={R.incoming.length}>
          <div className="rows">
            {R.incoming.map((r) => {
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

        <Section title="Sent" count={R.sent.length}>
          <div className="rows">
            {R.sent.map((r) =>
            <div key={r.id} className="app-row">
                <Tile app={{ grad: r.grad, icon: r.icon }} />
                <span className="meta">
                  <span className="name">{r.app} <span className="req-arrow">&rarr;</span> {r.to}</span>
                  <span className="time">{r.time}</span>
                </span>
                <span className="row-actions">
                  <span className={"status-pill " + r.status}><span className="sdot" />{statusLabel[r.status]}</span>
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

function BillingScreen({ onAction, upgradeStage, setUpgradeStage, requestUpgrade, upgradeOpen, setUpgradeOpen, seatOpen, setSeatOpen }) {
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
  const subs = [
  { id: "crm", name: "CRM Sales Funnel", icon: "groups", grad: "blue", kind: "single",
    pricing: "flat", total: "$200 / month", status: "Active", renew: "Renews May 14",
    pay: "Visa \u00b7\u00b7\u00b7\u00b7 4242",
    menu: [{ label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] },
  { id: "payroll", name: "Payroll Bundle", icon: "bank", grad: "forest", kind: "bundle",
    includes: "Includes: Check Printing, Year-end & W-2, Accounting",
    pricing: "flat", total: "$540 / month", status: "Active", renew: "Renews May 14",
    pay: "ACH \u00b7\u00b7\u00b7\u00b7 6789", changeRequested: bundleRequested,
    menu: [{ label: "Request bundle change", glyph: true }, { label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] },
  { id: "check", name: "Check Printing Add-on", icon: "printer", grad: "purple", kind: "single",
    pricing: "seat", unit: "$12 / user", qty: seats + " users", total: "$" + seats * 12 + " / month", status: "Active", renew: "Renews Jun 1",
    pay: "Visa \u00b7\u00b7\u00b7\u00b7 4242",
    seatPending: seatPending,
    onCancelPending: () => setSeatPending(null),
    menu: [{ label: "Manage seats" }, { label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] },
  { id: "cust-config", name: "Customer Configuration", icon: "briefcase", grad: "blue", kind: "single",
    pricing: "tier", tier: "Tier 2", band: "100k\u2013250k employees", total: "$1,400 / month",
    proposed: "Proposed: Tier 3 \u00b7 250k\u2013500k employees \u00b7 $2,400 / month",
    status: "Active", upgradePending: true, renew: "Renews May 14",
    pay: "Visa \u00b7\u00b7\u00b7\u00b7 4242",
    menu: [{ label: "Review upgrade" }, { label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] },
  { id: "people", name: "People Directory", icon: "directory", grad: "teal", kind: "single",
    pricing: "tier", tier: "Tier 2", band: "100k\u2013250k employees", total: "$1,400 / month",
    status: "Trial", trial: "Trial ends in 9 days", renew: "",
    payNone: "No method \u2014 add before trial ends",
    menu: [{ label: "Change payment method" }, { label: "View invoices" }, { divider: true }, { label: "Cancel subscription", danger: true }] }];

  // Per-item invoice history (mock). status: Paid | Scheduled | Failed
  const invByItem = {
    crm: [
    { date: "Apr 14, 2026", amount: "$200", status: "Paid" },
    { date: "Mar 14, 2026", amount: "$200", status: "Paid" },
    { date: "Feb 14, 2026", amount: "$200", status: "Paid" }],

    payroll: [
    { date: "Apr 14, 2026", amount: "$540", status: "Paid" },
    { date: "Mar 14, 2026", amount: "$540", status: "Paid" },
    { date: "Feb 14, 2026", amount: "$540", status: "Paid" }],

    check: [
    { date: "May 1, 2026", amount: "$216", status: "Failed" },
    { date: "Apr 1, 2026", amount: "$216", status: "Paid" },
    { date: "Mar 1, 2026", amount: "$216", status: "Paid" }],

    "cust-config": [
    { date: "Apr 14, 2026", amount: "$1,400", status: "Paid" },
    { date: "Mar 14, 2026", amount: "$1,400", status: "Paid" }],

    people: []
  };
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
  { date: "May 1", amount: "$216", status: "Failed", action: "Update method" },
  { date: "Apr 14", amount: "$2,480", status: "Paid", action: "View" },
  { date: "Mar 14", amount: "$2,264", status: "Paid", action: "View" },
  { date: "Feb 14", amount: "$2,264", status: "Paid", action: "View" }];


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
          <p className="billing-org">Metro Temps LLC</p>
        </div>
        <p className="next-charge">Next charge &mdash; <span className="next-charge-amt">$2,480</span> on May 14</p>
      </div>

      {!tierDismissed && upgradeStage !== "done" &&
      <div className="alert alert-warn">
        <span className="alert-ico"><Icon name="trendup" size={19} /></span>
        <span className="alert-body">
          <span className="alert-eyebrow">{upgradeStage === "ready" ? "Terms ready" : upgradeStage === "requested" ? "Request sent" : "Action needed"}</span>
          <span className="alert-title" style={{ fontWeight: "600" }}>
            {upgradeStage === "ready" ? "Upgrade terms ready \u2014 Customer Configuration" :
             upgradeStage === "requested" ? "Upgrade requested \u2014 Customer Configuration" :
             "Tier upgrade needed \u2014 Customer Configuration"}
          </span>
          <span className="alert-text">
            {upgradeStage === "ready" ? "PM Office issued terms for the Tier 3 upgrade. Review and accept to lift the record-adding gate." :
             upgradeStage === "requested" ? "Your request was sent to PM Office. Record-adding stays paused until they issue terms for the Tier 3 upgrade." :
             "Your organization has reached the limit of Tier 2 (100k\u2013250k employees). Adding more records is paused until you request a Tier 3 upgrade from PM Office."}
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

      {!failDismissed &&
      <div className="alert alert-danger">
        <span className="alert-ico"><Icon name="alert" size={19} /></span>
        <span className="alert-body">
          <span className="alert-eyebrow">Payment failed</span>
          <span className="alert-title" style={{ fontWeight: "600" }}>Check Printing Add-on &mdash; charge declined</span>
          <span className="alert-text">The payment method on file was declined. Update it to retry the charge.</span>
        </span>
        <button className="cta-fill alert-action" onClick={() => setPmItem(subs.find((x) => x.id === "check"))}>Update method</button>
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
              {(s.trial || (s.upgradePending && upgradeStage !== "done") || s.failed || s.changeRequested) &&
            <span className="sub-pills">
                {s.trial && <span className="status-pill pending"><span className="sdot" />{s.trial}</span>}
                {s.upgradePending && upgradeStage === "needed" && <span className="status-pill warn"><span className="sdot" />Upgrade needed</span>}
                {s.upgradePending && upgradeStage === "requested" && <span className="status-pill pending"><span className="sdot" />Upgrade requested &mdash; awaiting terms</span>}
                {s.upgradePending && upgradeStage === "ready" && <button className="status-pill ready" onClick={() => setUpgradeOpen(true)}><span className="sdot" />Terms ready &mdash; Review &amp; accept</button>}
                {s.failed && <span className="status-pill denied"><span className="sdot" />Payment failed</span>}
                {s.changeRequested && <span className="status-pill pending"><span className="sdot" />Change requested</span>}
              </span>
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

      {pmItem && <ChangePaymentModal sub={pmItem} onClose={() => setPmItem(null)} onAction={act} />}
      {invItem && <InvoicesModal scope={invItem} subs={subs} allInv={allInv} onClose={() => setInvItem(null)} onAction={act} onUpdateMethod={(s) => {setInvItem(null);setPmItem(s);}} />}
      {seatOpen && <ManageSeatsModal sub={subs.find((x) => x.id === "check")} seats={seats}
      onClose={() => setSeatOpen(false)}
      onIncrease={(n) => {setSeats(n);setSeatPending(null);setSeatOpen(false);act("Added seats \u2014 now " + n + " users.");}}
      onDecrease={(n) => {setSeatPending(n);setSeatOpen(false);act("Seat reduction to " + n + " scheduled for Jun 1.");}} />}
      {upgradeOpen && <ReviewUpgradeModal sub={subs.find((x) => x.id === "cust-config")} onClose={() => setUpgradeOpen(false)} onAction={act} onAccept={() => setUpgradeStage("done")} />}
      {bundleOpen && <BundleChangeModal sub={subs.find((x) => x.id === "payroll")} onClose={() => setBundleOpen(false)}
      onSubmit={() => {setBundleRequested(true);}} />}
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
  const FLOOR = 18,RATE = 12;
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
          <p className="seat-gate">Per-seat plan &middot; $12 / user / month &middot; renews Jun 1.</p>
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
              <span className="k">{count} users &times; $12</span>
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

/* ---------------- Change payment method modal (per item) ---------------- */
function ChangePaymentModal({ sub, onClose, onAction }) {
  const methods = [
  { id: "visa", glyph: "receipt", name: "Visa", num: "4242", sub: "Expires 09 / 27" },
  { id: "ach", glyph: "bank", name: "ACH transfer", num: "6789", sub: "Chase business checking" }];

  const currentId = sub.payNone ? "" : /ACH/.test(sub.pay || "") ? "ach" : "visa";
  const [method, setMethod] = useState(currentId);
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
            <button className="pm-option add" onClick={() => onAction("Add new payment method")}>
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
.up-eyebrow{font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--accent-2);margin-bottom:6px}
.up-title{font-size:21px;font-weight:500;letter-spacing:-.01em;color:var(--text);line-height:1.15}
.up-gate{margin:10px 0 0;font-size:13px;line-height:1.5;color:var(--text-2);text-wrap:pretty}
.up-body{padding:22px 26px 0}
.up-compare{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px}
.up-block{display:flex;flex-direction:column;gap:4px;min-width:0}
.up-block.proposed{padding:14px 15px;border:1px solid color-mix(in oklch,var(--accent-2) 40%,var(--border));border-radius:var(--r-lg);background:var(--accent-soft)}
.up-block.current{padding:14px 15px}
.up-block-label{font-size:10.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3)}
.up-block.proposed .up-block-label{color:var(--accent-2)}
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
          <p className="up-gate">You&rsquo;ve reached the Tier 2 limit (100k&ndash;250k employees). PM Office issued these terms &mdash; adding more records stays paused until you accept them.</p>
        </div>

        <div className="up-body">
          <div className="up-compare">
            <div className="up-block current">
              <span className="up-block-label">Current</span>
              <span className="up-tier">Tier 2</span>
              <span className="up-band">100k&ndash;250k employees</span>
              <span className="up-price">$1,400 / month</span>
            </div>
            <span className="up-arrow"><Icon name="chevR" size={18} /></span>
            <div className="up-block proposed">
              <span className="up-block-label">New</span>
              <span className="up-tier">Tier 3</span>
              <span className="up-band">250k&ndash;500k employees</span>
              <span className="up-price">$2,400 / month</span>
            </div>
          </div>

          <div className="up-cost">
            <div className="up-cost-row">
              <span className="k">Monthly increase</span>
              <span className="v">+$1,000 / month</span>
            </div>
            <div className="up-cost-row due">
              <span className="k">Due today</span>
              <span className="v">$520<span className="sub">prorated for this cycle</span></span>
            </div>
            <div className="up-cost-row">
              <span className="k">Then from May 14, 2026</span>
              <span className="v">$2,400 / month</span>
            </div>
          </div>

          <p className="up-billed">Billed to <strong>Visa &middot;&middot;&middot;&middot; 4242</strong></p>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn-text" onClick={onClose}>Not now</button>
          <button type="button" className="btn-primary" onClick={() => {onAccept && onAccept();onAction("Tier 3 upgrade accepted \u2014 record-adding is now unblocked.");onClose();}}>Accept terms</button>
        </div>
        <div className="up-foot-note">Accepting these terms is a financial commitment and immediately lifts the record-adding gate in Customer Configuration.</div>
      </div>
    </div>);

}

/* ---------------- Invoices modal (per item or all) ---------------- */
function invStatusClass(s) {return s === "Failed" ? "denied" : "neutral";}

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
.inv-modal-head .inv-eyebrow{font-size:11px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:var(--accent-2);margin-bottom:6px}
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
            <div className="inv-h1">All invoices &middot; <span style={{ color: "var(--text-2)", fontWeight: 500 }}>Metro Temps LLC</span></div>
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

/* ---------------- Toast ---------------- */
function Toast({ text }) {
  return (
    <div className="toast" role="status">
      <span className="dot" />{text}
    </div>);

}

Object.assign(window, { Tile, Sidebar, SearchBar, RouteResult, Controls, Section, AppRow, AppCard, ExploreCard, AppModal, RequestToolModal, Toast, RequestsView, ChatView, BillingScreen, NotificationsDrawer, EmptyState });