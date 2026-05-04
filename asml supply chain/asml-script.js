/* asml-script.js — flow chart, inline subsystem expansion, zoomable map, side panel */
(function () {
  const $ = (id) => document.getElementById(id);

  // ── Country → flag emoji ─────────────────────────────
  const FLAGS = {
    "Germany":        "🇩🇪",
    "Netherlands":    "🇳🇱",
    "USA":            "🇺🇸",
    "United States":  "🇺🇸",
    "Japan":          "🇯🇵",
    "Taiwan":         "🇹🇼",
    "United Kingdom": "🇬🇧",
    "UK":             "🇬🇧",
    "China":          "🇨🇳",
    "Indonesia":      "🇮🇩",
    "Malaysia":       "🇲🇾",
    "Bolivia":        "🇧🇴",
    "Ukraine":        "🇺🇦",
    "Chile":          "🇨🇱",
    "Australia":      "🇦🇺",
  };
  function flagFor(text) {
    if (!text) return "🏭";
    for (const k of Object.keys(FLAGS)) if (text.includes(k)) return FLAGS[k];
    return "🏭";
  }

  // ── Supplier coordinates (city-level lon/lat) ────────
  const SUPPLIER_COORDS = {
    "zeiss":         [10.10,  48.78],
    "trumpf":        [9.07,   48.83],
    "cymer":         [-117.16,32.72],
    "gigaphoton":    [139.80, 36.31],
    "vdl":           [5.48,   51.44],
    "prodrive":      [5.50,   51.51],
    "corning":       [-77.05, 42.14],
    "edwards":       [-0.13,  50.96],
    "pfeiffer":      [8.46,   50.61],
    "neways":        [5.50,   51.51],
    "mks":           [-71.13, 42.66],
    "brion":         [-121.95,37.35],
    "hmi":           [120.97, 24.81],
    "berliner-glas": [13.41,  52.52],
    "schott":        [8.27,   49.99],
  };

  // ── Country centroids for Tier-3 markers (lon/lat) ───
  const COUNTRY_CENTROIDS = {
    "Indonesia": [118.0,  -2.5],
    "China":     [104.0,  35.0],
    "Malaysia":  [102.0,   4.0],
    "Bolivia":   [-65.0, -17.0],
    "Ukraine":   [ 32.0,  49.0],
    "USA":       [-98.0,  39.0],
    "Chile":     [-71.0, -30.0],
    "Australia": [134.0, -25.0],
    "Germany":   [ 10.0,  51.0],
    "Japan":     [138.0,  36.0],
  };

  function hexAlpha(hex, alpha) { return hex + alpha; }
  function truncate(s, n) {
    if (!s) return "";
    if (s.length <= n) return s;
    return s.slice(0, n).replace(/\s+\S*$/, "") + "…";
  }

  // ── Subsystem icons (one emoji per subsystem) ────────
  const SUBSYS_ICONS = {
    "euv-source":       "💡",
    "optical-system":   "🔍",
    "stage-system":     "⚙️",
    "frame-vacuum":     "🏗️",
    "control-software": "🖥️",
  };
  function iconFor(subsysId) { return SUBSYS_ICONS[subsysId] || "▸"; }

  // ── Parse supplier ownership into a short tag ────────
  function ownershipTag(o) {
    const t = (o || "").toLowerCase();
    if (t.includes("subsidiary"))                       return "ASML subsidiary";
    if (t.includes("strategic"))                        return "Strategic partner";
    if (t.includes("stake") || t.includes("asml owns")) return "ASML-invested";
    if (t.includes("foundation"))                       return "Foundation-owned";
    if (t.includes("public"))                           return "Public";
    return "Independent";
  }

  // ── Resolve a free-text supplier string to supplier IDs ───
  // Subcomponent .supplier strings vary: "TRUMPF", "Cymer (ASML)",
  // "Zeiss / Cymer", "Edwards Vacuum + Pfeiffer Vacuum",
  // "ASML in-house" (no match), "Hoya, Toppan, DNP" (no match).
  const SUPPLIER_KEYWORDS = {
    "trumpf":        ["TRUMPF"],
    "cymer":         ["Cymer"],
    "zeiss":         ["Zeiss"],
    "vdl":           ["VDL"],
    "prodrive":      ["Prodrive"],
    "edwards":       ["Edwards"],
    "pfeiffer":      ["Pfeiffer"],
    "mks":           ["MKS"],
    "neways":        ["Neways"],
    "brion":         ["Brion"],
    "hmi":           ["Hermes Microvision", "HMI"],
    "berliner-glas": ["Berliner Glas"],
    "schott":        ["Schott"],
    "corning":       ["Corning"],
    "gigaphoton":    ["Gigaphoton"],
  };
  function resolveSupplierIds(supplierStr) {
    const out = [];
    for (const [id, kws] of Object.entries(SUPPLIER_KEYWORDS)) {
      if (kws.some((kw) => supplierStr.includes(kw))) out.push(id);
    }
    return out;
  }

  // ── Reusable info-toggle binder (scoped to a root) ───
  function bindInfoToggle(root) {
    root.querySelectorAll("[data-info-toggle]").forEach((btn) => {
      const key = btn.dataset.infoToggle;
      const target = root.querySelector(`[data-info-target="${key}"]`);
      if (!target) return;
      btn.addEventListener("click", () => {
        const open = target.hasAttribute("data-open");
        if (open) {
          target.removeAttribute("data-open");
          btn.textContent = "ⓘ Read full description";
        } else {
          target.setAttribute("data-open", "");
          btn.textContent = "Hide description";
        }
      });
    });
  }

  // ── ① MACHINE NODE ───────────────────────────────────
  function renderMachine() {
    const m = ASML_DATA.meta;
    $("machine-title").textContent = `${m.machineModel}`;
    const stats = [
      { label: "Price / unit",        value: m.machinePrice },
      { label: "Weight",              value: m.machineWeight },
      { label: "Components",          value: m.components },
      { label: "Tier-1 Suppliers",    value: m.totalSuppliers },
      { label: "Single-source",       value: m.criticalSuppliers },
      { label: "BOM outsourced",      value: m.outsourcedBOM },
      { label: "Shipping containers", value: m.shippingContainers },
      { label: "Last updated",        value: m.lastUpdated },
    ];
    $("machine-stats").innerHTML = stats.map(
      (s) => `<div class="machine-stat">
        <span class="machine-stat-num">${s.value}</span>
        <span class="machine-stat-label">${s.label}</span>
      </div>`
    ).join("");
  }

  // ── ② SUBSYSTEM ROW + INLINE EXPAND ──────────────────
  let activeSubsysId = null;

  function renderSubsystems() {
    const wrap = $("subsys-row");
    wrap.innerHTML = ASML_DATA.subsystems.map((s) => {
      const pillStyle = `color:${s.color};background:${hexAlpha(s.color, "1a")};border-color:${hexAlpha(s.color, "55")}`;
      return `
        <div class="subsys-card" data-id="${s.id}" style="--ss-color:${s.color}">
          <div class="subsys-card-head">
            <span class="subsys-icon">${iconFor(s.id)}</span>
            <h3>${s.name}</h3>
          </div>
          <div class="subsys-meta">
            <span class="subsys-pill" style="${pillStyle}">${s.subcomponents.length} parts</span>
            <span class="subsys-pill" style="${pillStyle}">${s.keySuppliers.length} suppliers</span>
          </div>
          <div class="subsys-card-cta">Show ↓</div>
        </div>`;
    }).join("");

    wrap.querySelectorAll(".subsys-card").forEach((el) => {
      el.addEventListener("click", () => toggleExpand(el.dataset.id));
    });
  }

  function toggleExpand(id) {
    if (activeSubsysId === id) {
      collapseExpand();
      return;
    }
    expandSubsystem(id);
  }

  function collapseExpand() {
    activeSubsysId = null;
    const exp = $("subsys-expand");
    exp.hidden = true;
    exp.innerHTML = "";
    document.querySelectorAll(".subsys-card.active").forEach((c) => c.classList.remove("active"));
  }

  function expandSubsystem(id) {
    const s = ASML_DATA.subsystems.find((x) => x.id === id);
    if (!s) return;
    activeSubsysId = id;

    document.querySelectorAll(".subsys-card.active").forEach((c) => c.classList.remove("active"));
    document.querySelector(`.subsys-card[data-id="${id}"]`)?.classList.add("active");

    const suppliers = (s.keySuppliers || [])
      .map((sid) => ASML_DATA.suppliers.find((x) => x.id === sid))
      .filter(Boolean);

    const exp = $("subsys-expand");
    exp.style.setProperty("--ss-color", s.color);
    exp.hidden = false;
    exp.innerHTML = `
      <div class="expand-top">
        <div class="expand-title">
          <span class="subsys-icon">${iconFor(s.id)}</span>
          <div>
            <h3>${s.name}</h3>
            <div class="expand-sub">${s.subcomponents.length} components · ${s.keySuppliers.length} suppliers</div>
          </div>
        </div>
        <button class="expand-close" id="expand-close" type="button" title="Close">✕</button>
      </div>
      <div class="hero-fact">${s.keyFact}</div>
      <div class="expand-cols">
        <div>
          <div class="expand-col-title">Components</div>
          <div class="expand-link-list">
            ${s.subcomponents.map((c) => `
              <button class="expand-link-btn" data-go-component="${c.id}" data-sub-id="${s.id}" type="button">
                <span class="name">${c.name}</span>
                <span class="meta">${flagFor(c.supplierCountry)} ${c.supplier}</span>
              </button>`).join("")}
          </div>
        </div>
        <div>
          <div class="expand-col-title">Key suppliers</div>
          <div class="expand-link-list">
            ${suppliers.map((sp) => `
              <button class="expand-link-btn" data-go-supplier="${sp.id}" type="button">
                <span class="name">${flagFor(sp.country)} ${sp.name}</span>
                <span class="meta">${sp.country}</span>
              </button>`).join("")}
          </div>
        </div>
      </div>
      <button class="info-toggle" data-info-toggle="ss-${s.id}" type="button">ⓘ Read full description</button>
      <div class="info-extra" data-info-target="ss-${s.id}">
        <div class="panel-section-text">${s.description}</div>
      </div>
    `;

    $("expand-close").addEventListener("click", collapseExpand);
    exp.querySelectorAll("[data-go-component]").forEach((el) => {
      el.addEventListener("click", () => openSubcomponent(el.dataset.subId, el.dataset.goComponent));
    });
    exp.querySelectorAll("[data-go-supplier]").forEach((el) => {
      el.addEventListener("click", () => openSupplier(el.dataset.goSupplier));
    });
    bindInfoToggle(exp);

    // Smooth scroll the expand panel into view
    setTimeout(() => exp.scrollIntoView({ behavior: "smooth", block: "nearest" }), 30);
  }

  // ── ③ SUPPLIERS GRID ─────────────────────────────────
  let activeCat = "all";
  function renderCatFilter() {
    const cats = ASML_DATA.categories;
    const wrap = $("cat-filter");
    const allChip = `<button class="cat-chip ${activeCat === "all" ? "active" : ""}" data-cat="all">All (${ASML_DATA.suppliers.length})</button>`;
    const chips = cats.map((c) => {
      const count = ASML_DATA.suppliers.filter((s) => s.category === c.id).length;
      const isActive = activeCat === c.id;
      const style = isActive
        ? `background:${hexAlpha(c.color, "1a")};color:${c.color};border-color:${c.color}`
        : "";
      return `<button class="cat-chip ${isActive ? "active" : ""}" data-cat="${c.id}" style="${style}">${c.label} (${count})</button>`;
    }).join("");
    wrap.innerHTML = allChip + chips;
    wrap.querySelectorAll("[data-cat]").forEach((b) => {
      b.addEventListener("click", () => {
        activeCat = b.dataset.cat;
        renderCatFilter();
        renderSuppliers();
      });
    });
  }

  function renderSuppliers() {
    const list = activeCat === "all"
      ? ASML_DATA.suppliers
      : ASML_DATA.suppliers.filter((s) => s.category === activeCat);
    const cats = ASML_DATA.categories.reduce((a, c) => ((a[c.id] = c), a), {});
    const wrap = $("supplier-grid");
    wrap.innerHTML = list.map((s) => {
      const c = cats[s.category];
      return `
        <div class="supplier-card" data-id="${s.id}"
          style="--cat-color:${c.color};--cat-bg:${hexAlpha(c.color, "1a")}">
          <div class="supplier-name">${s.name}</div>
          <div class="supplier-loc">${flagFor(s.country)} ${s.city}, ${s.country}</div>
          <span class="supplier-cat">${c.label}</span>
        </div>`;
    }).join("");
    wrap.querySelectorAll("[data-id]").forEach((el) => {
      el.addEventListener("click", () => openSupplier(el.dataset.id));
    });
  }

  // ── ④ RAW MATERIALS GRID ─────────────────────────────
  function riskClass(t) {
    t = (t || "").toLowerCase();
    if (t.includes("critical")) return "raw-risk--critical";
    if (t.startsWith("high"))   return "raw-risk--high";
    if (t.includes("med"))      return "raw-risk--medium";
    return "raw-risk--low";
  }
  function riskLabel(t) {
    t = (t || "").toLowerCase();
    if (t.includes("critical")) return "Critical";
    if (t.startsWith("high"))   return "High";
    if (t.includes("low-med"))  return "Low–Medium";
    if (t.includes("med"))      return "Medium";
    return "Low";
  }
  function renderRawMaterials() {
    $("raw-list").innerHTML = ASML_DATA.rawMaterials.map((r) => `
      <div class="raw-row">
        <div class="raw-name">${r.material}</div>
        <div class="raw-use">${r.use}</div>
        <span class="raw-risk ${riskClass(r.risk)}">${riskLabel(r.risk)} risk</span>
        <div class="raw-sources">Sources: ${r.primarySources.join(" · ")}</div>
      </div>`).join("");
  }

  // ── ⑤ WORLD MAP ──────────────────────────────────────
  const MAP_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";
  const VIEW_INIT = { x: 0, y: 0, w: 2000, h: 1001 };
  let viewBox = { ...VIEW_INIT };
  let tier3On = false;
  let tier3Markers = [];

  function project([lon, lat]) {
    return [(lon + 180) / 360 * 2000, (90 - lat) / 180 * 1001];
  }
  function geoToPath(geometry) {
    let d = "";
    const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    for (const poly of polys) for (const ring of poly) {
      ring.forEach(([lon, lat], i) => {
        const [x, y] = project([lon, lat]);
        d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
      });
      d += "Z";
    }
    return d;
  }

  function renderMapLegend() {
    $("map-legend").innerHTML = ASML_DATA.categories.map(
      (c) => `<span class="map-legend-item">
          <span class="map-legend-dot" style="background:${c.color}"></span>${c.label}
        </span>`
    ).join("");
  }

  function renderMap() {
    const svg = $("world-map");
    const tip = $("tooltip");
    const mapWrap = $("map-wrap");
    const cats = ASML_DATA.categories.reduce((a, c) => ((a[c.id] = c), a), {});

    fetch(MAP_URL)
      .then((r) => r.json())
      .then((geo) => {
        $("loading").style.display = "none";

        const supplierCountries = new Set(ASML_DATA.suppliers.map((s) => s.country));
        const NAME_MAP = { "USA": "United States of America", "UK": "United Kingdom" };
        const supplierGeoNames = new Set([...supplierCountries].map((c) => NAME_MAP[c] || c));

        // Country shapes
        geo.features.forEach((f) => {
          if (!f.geometry) return;
          const name = f.properties?.name || "";
          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", geoToPath(f.geometry));
          path.setAttribute("class", "country-path");
          if (supplierGeoNames.has(name)) path.classList.add("has-supplier");
          svg.appendChild(path);
        });

        // Tier-1 supplier dots
        ASML_DATA.suppliers.forEach((s) => {
          const coord = SUPPLIER_COORDS[s.id];
          if (!coord) return;
          const [x, y] = project(coord);
          const cat = cats[s.category];

          const glow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          glow.setAttribute("cx", x); glow.setAttribute("cy", y);
          glow.setAttribute("r", 11); glow.setAttribute("fill", cat.color);
          glow.setAttribute("class", "supplier-dot-glow");
          svg.appendChild(glow);

          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("cx", x); dot.setAttribute("cy", y);
          dot.setAttribute("r", 5); dot.setAttribute("fill", cat.color);
          dot.setAttribute("stroke", "#0a0e14"); dot.setAttribute("stroke-width", "1.4");
          dot.setAttribute("class", "supplier-dot");
          dot.addEventListener("mousemove", (e) => showT1Tooltip(e, s, cat));
          dot.addEventListener("mouseleave", () => tip.classList.remove("show"));
          dot.addEventListener("click", (e) => { e.stopPropagation(); openSupplier(s.id); });
          svg.appendChild(dot);
        });

        // Build (and hide) Tier-3 markers
        buildTier3Markers(svg);
      })
      .catch(() => {
        $("loading").innerHTML = '<p style="color:var(--muted)">Could not load world map.</p>';
      });

    function showT1Tooltip(e, s, cat) {
      const rect = mapWrap.getBoundingClientRect();
      tip.innerHTML = `
        <strong>${s.name}</strong>
        <div class="tt-loc">${flagFor(s.country)} ${s.city}, ${s.country}</div>
        <div class="tt-cat" style="color:${cat.color}">${cat.label}</div>`;
      tip.style.left = (e.clientX - rect.left + 14) + "px";
      tip.style.top  = (e.clientY - rect.top  - 10) + "px";
      tip.classList.add("show");
    }
  }

  // ── Tier-3 raw material markers ──────────────────────
  function buildTier3Markers(svg) {
    const tip = $("tooltip");
    const mapWrap = $("map-wrap");

    // Build country -> [materials] map
    const byCountry = {};
    ASML_DATA.rawMaterials.forEach((mat) => {
      mat.primarySources.forEach((src) => {
        for (const country of Object.keys(COUNTRY_CENTROIDS)) {
          if (src.includes(country)) {
            if (!byCountry[country]) byCountry[country] = [];
            if (!byCountry[country].some((m) => m.material === mat.material)) {
              byCountry[country].push(mat);
            }
            break;
          }
        }
      });
    });

    Object.entries(byCountry).forEach(([country, mats]) => {
      const [lon, lat] = COUNTRY_CENTROIDS[country];
      const [x, y] = project([lon, lat]);

      const glow = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      glow.setAttribute("x", x - 11); glow.setAttribute("y", y - 11);
      glow.setAttribute("width", 22); glow.setAttribute("height", 22);
      glow.setAttribute("transform", `rotate(45 ${x} ${y})`);
      glow.setAttribute("fill", "#e2b44b");
      glow.setAttribute("class", "tier3-glow");
      glow.style.display = "none";
      svg.appendChild(glow);

      const diamond = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      diamond.setAttribute("x", x - 6); diamond.setAttribute("y", y - 6);
      diamond.setAttribute("width", 12); diamond.setAttribute("height", 12);
      diamond.setAttribute("transform", `rotate(45 ${x} ${y})`);
      diamond.setAttribute("fill", "#e2b44b");
      diamond.setAttribute("stroke", "#0a0e14");
      diamond.setAttribute("stroke-width", "1.4");
      diamond.setAttribute("class", "tier3-marker");
      diamond.style.display = "none";

      diamond.addEventListener("mousemove", (e) => {
        const rect = mapWrap.getBoundingClientRect();
        const list = mats.map((m) => `${m.material} — ${m.use}`).join("<br>");
        tip.innerHTML = `
          <strong>${flagFor(country)} ${country}</strong>
          <div class="tt-cat" style="color:#e2b44b">Raw materials source</div>
          <div class="tt-mat">${list}</div>`;
        tip.style.left = (e.clientX - rect.left + 14) + "px";
        tip.style.top  = (e.clientY - rect.top  - 10) + "px";
        tip.classList.add("show");
      });
      diamond.addEventListener("mouseleave", () => tip.classList.remove("show"));
      svg.appendChild(diamond);

      tier3Markers.push(glow, diamond);
    });
  }

  function setTier3(on) {
    tier3On = on;
    tier3Markers.forEach((el) => { el.style.display = on ? "" : "none"; });
    const btn = $("tier3-toggle");
    btn.classList.toggle("on", on);
    btn.querySelector(".toggle-dot").style.background = on ? "" : "";
  }

  // ── ZOOM + PAN on SVG viewBox ────────────────────────
  function applyViewBox() {
    $("world-map").setAttribute("viewBox",
      `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
  }
  function clampViewBox() {
    // Keep within bounds. Allow zooming in to 5x.
    const minW = 2000 / 8, minH = 1001 / 8;
    if (viewBox.w < minW) viewBox.w = minW;
    if (viewBox.h < minH) viewBox.h = minH;
    if (viewBox.w > 2000) viewBox.w = 2000;
    if (viewBox.h > 1001) viewBox.h = 1001;
    if (viewBox.x < 0) viewBox.x = 0;
    if (viewBox.y < 0) viewBox.y = 0;
    if (viewBox.x + viewBox.w > 2000) viewBox.x = 2000 - viewBox.w;
    if (viewBox.y + viewBox.h > 1001) viewBox.y = 1001 - viewBox.h;
  }
  function zoomAt(factor, cx, cy) {
    // Zoom keeping cursor point (cx, cy in px relative to map) anchored.
    const svg = $("world-map");
    const rect = svg.getBoundingClientRect();
    const px = cx / rect.width;
    const py = cy / rect.height;
    const sx = viewBox.x + px * viewBox.w;
    const sy = viewBox.y + py * viewBox.h;
    viewBox.w *= factor;
    viewBox.h *= factor;
    viewBox.x = sx - px * viewBox.w;
    viewBox.y = sy - py * viewBox.h;
    clampViewBox();
    applyViewBox();
  }
  function attachZoomPan() {
    const svg = $("world-map");

    // Wheel zoom
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const factor = e.deltaY < 0 ? 0.85 : 1.18;
      zoomAt(factor, e.clientX - rect.left, e.clientY - rect.top);
    }, { passive: false });

    // Drag pan
    let panning = false, lastX = 0, lastY = 0;
    svg.addEventListener("mousedown", (e) => {
      panning = true; lastX = e.clientX; lastY = e.clientY;
      svg.classList.add("panning");
    });
    window.addEventListener("mousemove", (e) => {
      if (!panning) return;
      const rect = svg.getBoundingClientRect();
      const dx = (e.clientX - lastX) * (viewBox.w / rect.width);
      const dy = (e.clientY - lastY) * (viewBox.h / rect.height);
      viewBox.x -= dx; viewBox.y -= dy;
      lastX = e.clientX; lastY = e.clientY;
      clampViewBox(); applyViewBox();
    });
    window.addEventListener("mouseup", () => {
      panning = false;
      svg.classList.remove("panning");
    });

    // Buttons
    $("zoom-in").addEventListener("click", () => {
      const rect = svg.getBoundingClientRect();
      zoomAt(0.7, rect.width / 2, rect.height / 2);
    });
    $("zoom-out").addEventListener("click", () => {
      const rect = svg.getBoundingClientRect();
      zoomAt(1.4, rect.width / 2, rect.height / 2);
    });
    $("zoom-reset").addEventListener("click", () => {
      viewBox = { ...VIEW_INIT };
      applyViewBox();
    });
  }

  function attachTier3Toggle() {
    $("tier3-toggle").addEventListener("click", () => setTier3(!tier3On));
  }

  // ── SIDE PANEL (component / supplier) ────────────────
  function showPanel() {
    $("panel-empty").style.display = "none";
    const c = $("panel-content");
    c.style.display = "flex";
    c.style.flexDirection = "column";
    $("panel-scroll").scrollTop = 0;
  }
  function closePanel() {
    $("panel-empty").style.display = "flex";
    $("panel-content").style.display = "none";
  }
  $("panel-close").addEventListener("click", closePanel);

  function riskPillClass(t) {
    t = (t || "").toLowerCase();
    if (t.includes("critical")) return "risk-pill--critical";
    if (t.startsWith("high"))   return "risk-pill--high";
    if (t.includes("med"))      return "risk-pill--medium";
    return "risk-pill--low";
  }
  function sourceList(ids) {
    const sources = (ids || [])
      .map((id) => ASML_DATA.sources.find((s) => s.id === id))
      .filter(Boolean);
    if (!sources.length) return "";
    return `
      <div class="panel-section">
        <div class="panel-section-title">Sources</div>
        <div>
          ${sources.map((s) =>
            `<a class="panel-source-link" href="${s.url}" target="_blank" rel="noopener">→ ${s.label}</a>`
          ).join("")}
        </div>
      </div>`;
  }

  function openSubcomponent(subId, id) {
    const sub = ASML_DATA.subsystems.find((x) => x.id === subId);
    const c = sub && sub.subcomponents.find((x) => x.id === id);
    if (!c) return;
    showPanel();
    $("panel-flag").textContent = flagFor(c.supplierCountry);
    $("panel-flag").style.color = "";
    $("panel-name").textContent = c.name;
    $("panel-rank-line").textContent = `Component of ${sub.name}`;

    // Resolve supplier(s) so the pill is clickable when a tier-1 match exists
    const supplierIds = resolveSupplierIds(c.supplier);
    let supplierHtml;
    if (supplierIds.length === 0) {
      supplierHtml = `<span class="supplier-pill">${flagFor(c.supplierCountry)} ${c.supplier}</span>`;
    } else {
      supplierHtml = supplierIds.map((sid) => {
        const sp = ASML_DATA.suppliers.find((x) => x.id === sid);
        return `<button class="supplier-pill supplier-pill--btn" data-go-supplier="${sp.id}" type="button">${flagFor(sp.country)} ${sp.name} →</button>`;
      }).join(" ");
    }

    $("panel-scroll").innerHTML = `
      <div class="panel-section">
        <div class="panel-section-fact">${c.keySpec}</div>
      </div>
      <div class="panel-section">
        <div class="panel-section-title">Supplier${supplierIds.length > 1 ? "s" : ""}</div>
        <div class="supplier-pill-row">${supplierHtml}</div>
      </div>
      <div class="panel-section">
        <button class="info-toggle" data-info-toggle="cmp-${c.id}" type="button">ⓘ Read full description</button>
        <div class="info-extra" data-info-target="cmp-${c.id}">
          <div class="panel-section-text">${c.description}</div>
        </div>
      </div>
      ${sourceList(c.sources)}
    `;
    $("panel-scroll").querySelectorAll("[data-go-supplier]").forEach((el) => {
      el.addEventListener("click", () => openSupplier(el.dataset.goSupplier));
    });
    bindInfoToggle($("panel-scroll"));
  }

  function openSupplier(id) {
    const s = ASML_DATA.suppliers.find((x) => x.id === id);
    if (!s) return;
    showPanel();
    $("panel-flag").textContent = flagFor(s.country);
    $("panel-flag").style.color = "";
    $("panel-name").textContent = s.name;
    $("panel-rank-line").textContent = `${s.city}, ${s.country} · ${s.categoryLabel}`;

    // Short risk label for the hero pill (e.g. "High", "Medium", "Critical")
    const riskRaw = (s.geopoliticalRisk || "").toLowerCase();
    let riskShort = "Low";
    if (riskRaw.includes("critical")) riskShort = "Critical";
    else if (riskRaw.startsWith("high")) riskShort = "High";
    else if (riskRaw.includes("low-med")) riskShort = "Low–Medium";
    else if (riskRaw.includes("med")) riskShort = "Medium";

    const ownerExtra =
      (s.acquisitionAmount ? `<div class="extra-line">Deal: ${s.acquisitionAmount}</div>` : "") +
      (s.investmentAmount  ? `<div class="extra-line">Investment: ${s.investmentAmount}</div>` : "");

    $("panel-scroll").innerHTML = `
      <div class="panel-section">
        <div class="hero-pills">
          <span class="hero-pill">${s.categoryLabel}</span>
          <span class="hero-pill">${ownershipTag(s.ownership)}</span>
          <span class="risk-pill ${riskPillClass(s.geopoliticalRisk)}">${riskShort} risk</span>
        </div>
      </div>
      <div class="panel-section">
        <div class="panel-section-fact">${s.keyFact}</div>
      </div>
      <div class="panel-section">
        <div class="panel-section-title">What they supply</div>
        <ul class="panel-list">
          ${s.components.map((c) => `<li>${c}</li>`).join("")}
        </ul>
      </div>
      <div class="panel-section">
        <button class="info-toggle" data-info-toggle="sup-${s.id}" type="button">ⓘ Read full description</button>
        <div class="info-extra" data-info-target="sup-${s.id}">
          <div class="panel-section-text">${s.description}</div>
          <div class="extra-block">
            <div class="panel-section-title">Ownership</div>
            <div class="panel-section-text">${s.ownership || ""}</div>
            ${ownerExtra}
          </div>
        </div>
      </div>
      ${sourceList(s.sources)}
    `;
    bindInfoToggle($("panel-scroll"));
  }

  // ── INIT ─────────────────────────────────────────────
  renderMachine();
  renderSubsystems();
  renderMapLegend();
  renderMap();
  attachZoomPan();
  attachTier3Toggle();
  renderCatFilter();
  renderSuppliers();
  renderRawMaterials();
})();
