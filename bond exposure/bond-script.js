// ─── ISO3 → ISO2 fallback ─────────────────────────────────────────────────────
const ISO3_TO_ISO2 = {
  AFG:"AF",ALB:"AL",DZA:"DZ",AND:"AD",AGO:"AO",ATG:"AG",ARG:"AR",ARM:"AM",
  AUS:"AU",AUT:"AT",AZE:"AZ",BHS:"BS",BHR:"BH",BGD:"BD",BRB:"BB",BLR:"BY",
  BEL:"BE",BLZ:"BZ",BEN:"BJ",BTN:"BT",BOL:"BO",BIH:"BA",BWA:"BW",BRA:"BR",
  BRN:"BN",BGR:"BG",BFA:"BF",BDI:"BI",KHM:"KH",CMR:"CM",CAN:"CA",CPV:"CV",
  CAF:"CF",TCD:"TD",CHL:"CL",CHN:"CN",COL:"CO",COM:"KM",COD:"CD",COG:"CG",
  CRI:"CR",CIV:"CI",HRV:"HR",CUB:"CU",CYP:"CY",CZE:"CZ",DNK:"DK",DJI:"DJ",
  DOM:"DO",ECU:"EC",EGY:"EG",SLV:"SV",GNQ:"GQ",ERI:"ER",EST:"EE",ETH:"ET",
  FJI:"FJ",FIN:"FI",FRA:"FR",GAB:"GA",GMB:"GM",GEO:"GE",DEU:"DE",GHA:"GH",
  GRC:"GR",GTM:"GT",GIN:"GN",GNB:"GW",GUY:"GY",HTI:"HT",HND:"HN",HUN:"HU",
  ISL:"IS",IND:"IN",IDN:"ID",IRN:"IR",IRQ:"IQ",IRL:"IE",ISR:"IL",ITA:"IT",
  JAM:"JM",JPN:"JP",JOR:"JO",KAZ:"KZ",KEN:"KE",PRK:"KP",KOR:"KR",KWT:"KW",
  KGZ:"KG",LAO:"LA",LVA:"LV",LBN:"LB",LSO:"LS",LBR:"LR",LBY:"LY",LIE:"LI",
  LTU:"LT",LUX:"LU",MKD:"MK",MDG:"MG",MWI:"MW",MYS:"MY",MDV:"MV",MLI:"ML",
  MLT:"MT",MRT:"MR",MUS:"MU",MEX:"MX",MDA:"MD",MCO:"MC",MNG:"MN",MNE:"ME",
  MAR:"MA",MOZ:"MZ",MMR:"MM",NAM:"NA",NPL:"NP",NLD:"NL",NZL:"NZ",NIC:"NI",
  NER:"NE",NGA:"NG",NOR:"NO",OMN:"OM",PAK:"PK",PAN:"PA",PNG:"PG",PRY:"PY",
  PER:"PE",PHL:"PH",POL:"PL",PRT:"PT",QAT:"QA",ROU:"RO",RUS:"RU",RWA:"RW",
  SAU:"SA",SEN:"SN",SRB:"RS",SLE:"SL",SVK:"SK",SVN:"SI",SOM:"SO",ZAF:"ZA",
  SSD:"SS",ESP:"ES",LKA:"LK",SDN:"SD",SUR:"SR",SWZ:"SZ",SWE:"SE",CHE:"CH",
  SYR:"SY",TWN:"TW",TJK:"TJ",TZA:"TZ",THA:"TH",TLS:"TL",TGO:"TG",TTO:"TT",
  TUN:"TN",TUR:"TR",TKM:"TM",UGA:"UG",UKR:"UA",ARE:"AE",GBR:"GB",USA:"US",
  URY:"UY",UZB:"UZ",VEN:"VE",VNM:"VN",YEM:"YE",ZMB:"ZM",ZWE:"ZW",
  KSV:"XK",PSE:"PS",SGP:"SG",HKG:"HK",
};

// ─── FLAG EMOJI ───────────────────────────────────────────────────────────────
function isoToFlag(iso2) {
  if (!iso2) return '🌐';
  return [...iso2.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('');
}

// ─── CATEGORY DISPLAY CONFIG ──────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  debt:         { label: 'Public Debt',          icon: '🏛️' },
  fiscal:       { label: 'Fiscal Position',      icon: '📊' },
  sustainability:{ label: 'Debt Sustainability', icon: '📈' },
  private_debt: { label: 'Private Debt',         icon: '🏦' },
  reserves:     { label: 'Reserves',             icon: '🛡️' },
  capital:      { label: 'Capital Openness',     icon: '🔓' },
};

// ─── COLOUR SCALES per indicator ─────────────────────────────────────────────
// Format: [[value, hex], ...]  — interpolated between stops
const SCALES = {
  // Gross debt: green → yellow → red
  GGXWDG_NGDP: { lo: 0,   hi: 200, stops: [[0,'#1a3a2a'],[40,'#27ae60'],[80,'#e2b44b'],[120,'#c0392b'],[200,'#7b0000']] },
  // Fiscal balance: surplus = green, deficit = red (symmetric around 0)
  GGXCNL_NGDP: { lo: -15, hi: 15,  stops: [[-15,'#7b0000'],[-5,'#c0392b'],[0,'#e2b44b'],[5,'#27ae60'],[15,'#1a3a2a']], diverging: true },
  // Interest paid: low = green, high = red
  ie:           { lo: 0,   hi: 10,  stops: [[0,'#1a3a2a'],[3,'#27ae60'],[6,'#e2b44b'],[10,'#c0392b']] },
  // Primary balance: deficit red, surplus green
  pb:           { lo: -10, hi: 10,  stops: [[-10,'#7b0000'],[-3,'#c0392b'],[0,'#e2b44b'],[3,'#27ae60'],[10,'#1a3a2a']], diverging: true },
  // Real bond yield: very negative = hot, 0 ok, very positive = risky
  rltir:        { lo: -10, hi: 10,  stops: [[-10,'#27ae60'],[0,'#e2b44b'],[5,'#c0392b'],[10,'#7b0000']], diverging: true },
  // GDP growth: negative = red, positive = green
  NGDP_RPCH:   { lo: -10, hi: 10,  stops: [[-10,'#7b0000'],[0,'#e2b44b'],[5,'#27ae60'],[10,'#1a3a2a']], diverging: true },
  // Current account: deficit = warm, surplus = cool
  BCA_NGDPD:   { lo: -15, hi: 15,  stops: [[-15,'#7b0000'],[-5,'#c0392b'],[0,'#e2b44b'],[5,'#27ae60'],[15,'#1a3a2a']], diverging: true },
  // Inflation: low = green, high = red
  PCPIPCH:     { lo: 0,   hi: 30,  stops: [[0,'#1a3a2a'],[3,'#27ae60'],[8,'#e2b44b'],[20,'#c0392b'],[30,'#7b0000']] },
  // Private debt
  Privatedebt_all: { lo: 0, hi: 300, stops: [[0,'#1a3a2a'],[80,'#27ae60'],[150,'#e2b44b'],[220,'#c0392b'],[300,'#7b0000']] },
  HH_ALL:      { lo: 0,   hi: 150, stops: [[0,'#1a3a2a'],[40,'#27ae60'],[80,'#e2b44b'],[120,'#c0392b'],[150,'#7b0000']] },
  NFC_ALL:     { lo: 0,   hi: 200, stops: [[0,'#1a3a2a'],[60,'#27ae60'],[100,'#e2b44b'],[150,'#c0392b'],[200,'#7b0000']] },
  // Reserves: higher = greener
  Reserves_ARA:{ lo: 0,   hi: 3,   stops: [[0,'#7b0000'],[0.5,'#c0392b'],[1,'#e2b44b'],[1.5,'#27ae60'],[3,'#1a3a2a']] },
  Reserves_M:  { lo: 0,   hi: 24,  stops: [[0,'#7b0000'],[2,'#c0392b'],[3,'#e2b44b'],[6,'#27ae60'],[24,'#1a3a2a']] },
  Reserves_STD:{ lo: 0,   hi: 5,   stops: [[0,'#7b0000'],[0.5,'#c0392b'],[1,'#e2b44b'],[2,'#27ae60'],[5,'#1a3a2a']] },
  // Capital openness: open = blue, closed = muted
  ka_new:      { lo: 0,   hi: 1,   stops: [[0,'#1e2836'],[0.3,'#3a5a7a'],[0.6,'#4a86b8'],[1,'#6ab0e0']] },
  Ka_bo:       { lo: 0,   hi: 1,   stops: [[0,'#1e2836'],[0.3,'#3a5a7a'],[0.6,'#4a86b8'],[1,'#6ab0e0']] },
};

// Default map metric
let activeMetric = 'GGXWDG_NGDP';

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
function lerpHex(a, b, t) {
  const ah = parseInt(a.slice(1),16), bh = parseInt(b.slice(1),16);
  const ar=(ah>>16)&0xff, ag=(ah>>8)&0xff, ab=ah&0xff;
  const br=(bh>>16)&0xff, bg=(bh>>8)&0xff, bb=bh&0xff;
  const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), bl=Math.round(ab+(bb-ab)*t);
  return `#${((r<<16)|(g<<8)|bl).toString(16).padStart(6,'0')}`;
}

function metricColor(code, v) {
  if (v == null) return '#151d28';
  const scale = SCALES[code];
  if (!scale) return '#263142';
  const stops = scale.stops;
  for (let i = 1; i < stops.length; i++) {
    const [lo, cLo] = stops[i-1];
    const [hi, cHi] = stops[i];
    if (v <= hi || i === stops.length - 1) {
      const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
      return lerpHex(cLo, cHi, t);
    }
  }
  return stops[stops.length-1][1];
}

// ─── LEGEND ───────────────────────────────────────────────────────────────────
function buildLegend(code) {
  const scale = SCALES[code];
  if (!scale) return;
  const stops = scale.stops.map(([v, c]) => {
    const pct = ((v - scale.lo) / (scale.hi - scale.lo) * 100).toFixed(1);
    return `${c} ${pct}%`;
  }).join(', ');
  document.getElementById('legend-gradient').style.background = `linear-gradient(to right, ${stops})`;
  const meta = INDICATOR_META[code];
  document.getElementById('legend-lo').textContent = scale.lo + (meta ? ' ' + meta.unit : '');
  document.getElementById('legend-hi').textContent = scale.hi + '+';
}

// ─── METRIC SELECTOR ─────────────────────────────────────────────────────────
function buildSelector() {
  const sel = document.getElementById('map-metric-select');
  // Group by category
  const groups = {};
  for (const [code, meta] of Object.entries(INDICATOR_META)) {
    if (!groups[meta.category]) groups[meta.category] = [];
    groups[meta.category].push({ code, label: meta.label });
  }
  for (const [cat, items] of Object.entries(groups)) {
    const cfg = CATEGORY_CONFIG[cat] || { label: cat };
    const og = document.createElement('optgroup');
    og.label = cfg.icon ? `${cfg.icon} ${cfg.label}` : cfg.label;
    for (const { code, label } of items) {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = label;
      if (code === activeMetric) opt.selected = true;
      og.appendChild(opt);
    }
    sel.appendChild(og);
  }
  sel.addEventListener('change', () => {
    activeMetric = sel.value;
    recolorMap();
    buildLegend(activeMetric);
    // Re-open panel if country is selected
    if (selectedIso3) openPanel(selectedIso3, '');
  });
}

// ─── STATE ────────────────────────────────────────────────────────────────────
const MAP_URL    = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
let pathMap      = {};
let selectedIso3 = null;

// ─── MAP PROJECTION ───────────────────────────────────────────────────────────
function project([lon, lat]) {
  return [(lon + 180) / 360 * 2000, (90 - lat) / 180 * 1001];
}
function toPath(geometry) {
  let d = '';
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  for (const poly of polys)
    for (const ring of poly) {
      ring.forEach(([lon, lat], i) => {
        const [x, y] = project([lon, lat]);
        d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
      });
      d += 'Z';
    }
  return d;
}

// ─── RENDER MAP ───────────────────────────────────────────────────────────────
function renderMap(geo) {
  const svg = document.getElementById('world-map');
  geo.features.forEach(f => {
    const iso3 = f.id?.toUpperCase();
    if (!iso3 || !f.geometry) return;
    const geoName = f.properties?.name || iso3;
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', toPath(f.geometry));
    p.setAttribute('class', 'country-path');
    const row = COUNTRY_DATA[iso3];
    const val = row?.[activeMetric]?.v;
    p.style.fill = val != null ? metricColor(activeMetric, val) : '#151d28';
    if (!row) p.classList.add('no-data');
    p.addEventListener('click',      ()  => onCountryClick(iso3, geoName));
    p.addEventListener('mousemove',  e   => showTooltip(e, iso3, geoName));
    p.addEventListener('mouseleave', ()  => hideTooltip());
    svg.appendChild(p);
    pathMap[iso3] = p;
  });
}

function recolorMap() {
  for (const [iso3, p] of Object.entries(pathMap)) {
    const row = COUNTRY_DATA[iso3];
    const val = row?.[activeMetric]?.v;
    p.style.fill = val != null ? metricColor(activeMetric, val) : '#151d28';
  }
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
const tip = document.getElementById('tooltip');
function showTooltip(e, iso3, geoName) {
  const row  = COUNTRY_DATA[iso3];
  const name = row ? row.name : geoName;
  const meta = INDICATOR_META[activeMetric];
  const entry = row?.[activeMetric];
  const val  = entry != null ? `${entry.v} ${meta?.unit || ''}` : 'No data';
  const yr   = entry ? ` <span style="color:var(--muted)">(${entry.y})</span>` : '';
  const col  = entry != null ? metricColor(activeMetric, entry.v) : '#5a6a7e';
  const rect = document.querySelector('.map-wrap').getBoundingClientRect();
  tip.innerHTML = `<strong>${name}</strong><br>
    <span style="font-size:0.7rem;color:var(--muted)">${meta?.label || activeMetric}</span><br>
    <span class="tv" style="color:${col}">${val}</span>${yr}`;
  tip.style.left = (e.clientX - rect.left + 14) + 'px';
  tip.style.top  = (e.clientY - rect.top  - 10) + 'px';
  tip.classList.add('show');
}
function hideTooltip() { tip.classList.remove('show'); }

// ─── COUNTRY CLICK ────────────────────────────────────────────────────────────
function onCountryClick(iso3, geoName) {
  if (selectedIso3 && pathMap[selectedIso3]) pathMap[selectedIso3].classList.remove('selected');
  if (selectedIso3 === iso3) { selectedIso3 = null; closePanel(); return; }
  selectedIso3 = iso3;
  if (pathMap[iso3]) pathMap[iso3].classList.add('selected');
  openPanel(iso3, geoName);
}

function closePanel() {
  document.getElementById('panel-empty').style.display   = 'flex';
  document.getElementById('panel-content').style.display = 'none';
}

// ─── PANEL ────────────────────────────────────────────────────────────────────
function openPanel(iso3, geoName) {
  document.getElementById('panel-empty').style.display   = 'none';
  document.getElementById('panel-content').style.display = 'flex';

  const row  = COUNTRY_DATA[iso3] || {};
  const iso2 = row.iso2 || ISO3_TO_ISO2[iso3] || '';
  const name = row.name || geoName || iso3;

  document.getElementById('panel-flag').textContent = isoToFlag(iso2);
  document.getElementById('panel-name').textContent = name;

  // Rank by active metric
  const all = Object.values(COUNTRY_DATA)
    .filter(r => r[activeMetric] != null)
    .sort((a, b) => b[activeMetric].v - a[activeMetric].v);
  const rank = all.findIndex(r => r.name === name || r.iso2 === iso2) + 1;
  const meta = INDICATOR_META[activeMetric];
  document.getElementById('panel-rank').textContent =
    rank > 0 ? `#${rank} of ${all.length} · ${meta?.label || ''}` : '';

  // Build accordion sections
  const scroll = document.getElementById('panel-scroll');
  scroll.innerHTML = '';

  // Group indicators by category
  const groups = {};
  for (const [code, m] of Object.entries(INDICATOR_META)) {
    if (!groups[m.category]) groups[m.category] = [];
    groups[m.category].push(code);
  }

  let firstOpen = true;
  for (const [cat, codes] of Object.entries(groups)) {
    const cfg = CATEGORY_CONFIG[cat] || { label: cat, icon: '' };

    // Check if at least one indicator has data
    const hasAny = codes.some(c => row[c] != null);

    const section = document.createElement('div');
    section.className = 'accordion-section' + (firstOpen ? ' open' : '');

    const header = document.createElement('div');
    header.className = 'accordion-header';
    header.innerHTML = `
      <span class="acc-icon">${cfg.icon}</span>
      <span class="acc-label">${cfg.label}</span>
      <svg class="acc-chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>`;
    header.addEventListener('click', () => section.classList.toggle('open'));

    const body = document.createElement('div');
    body.className = 'accordion-body';

    if (!hasAny) {
      body.innerHTML = '<div class="acc-no-data">No data available</div>';
    } else {
      for (const code of codes) {
        const m = INDICATOR_META[code];
        const entry = row[code];
        const isActive = code === activeMetric;

        const row_el = document.createElement('div');
        row_el.className = 'acc-row' + (isActive ? ' active-metric' : '');

        const valColor = entry != null ? metricColor(code, entry.v) : 'var(--muted)';
        const valText  = entry != null ? `${entry.v}` : '—';
        const yrText   = entry != null ? entry.y : '';

        row_el.innerHTML = `
          <div class="acc-row-left">
            <span class="acc-row-label">${m.label}</span>
            <button class="info-btn" data-info="${escHtml(m.info)}" title="About this metric">ⓘ</button>
          </div>
          <div class="acc-row-right">
            <span class="acc-row-val" style="color:${valColor}">${valText}</span>
            <span class="acc-row-unit">${entry != null ? m.unit : ''}</span>
            ${yrText ? `<span class="acc-row-yr">${yrText}</span>` : ''}
          </div>`;

        body.appendChild(row_el);
      }
    }

    section.appendChild(header);
    section.appendChild(body);
    scroll.appendChild(section);

    if (firstOpen && hasAny) firstOpen = false;
  }

  // Info button popover
  scroll.querySelectorAll('.info-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      showInfoPopover(btn, btn.dataset.info);
    });
  });

  document.getElementById('panel-close').onclick = () => {
    if (pathMap[iso3]) pathMap[iso3].classList.remove('selected');
    selectedIso3 = null;
    closePanel();
  };
}

function escHtml(s) {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ─── INFO POPOVER ─────────────────────────────────────────────────────────────
let activePopover = null;
function showInfoPopover(anchor, text) {
  if (activePopover) { activePopover.remove(); activePopover = null; return; }
  const pop = document.createElement('div');
  pop.className = 'info-popover';
  pop.textContent = text;
  document.body.appendChild(pop);
  activePopover = pop;

  const rect = anchor.getBoundingClientRect();
  const pw = 240;
  let left = rect.left - pw - 8;
  if (left < 4) left = rect.right + 8;
  pop.style.left = left + 'px';
  pop.style.top  = Math.max(4, rect.top - 8) + 'px';

  const close = () => { pop.remove(); activePopover = null; document.removeEventListener('click', close); };
  setTimeout(() => document.addEventListener('click', close), 0);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
async function loadAll() {
  try {
    buildSelector();
    buildLegend(activeMetric);
    const geo = await fetch(MAP_URL).then(r => r.json());
    renderMap(geo);
    document.getElementById('loading').style.display = 'none';
  } catch (e) {
    document.getElementById('loading').innerHTML =
      '<p style="color:#c0392b">Failed to load map. Please refresh.</p>';
  }
}

loadAll();
