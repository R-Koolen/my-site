// ─── CONFIG ────────────────────────────────────────────────────────────────
const MAP_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

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
  KSV:"XK",PSE:"PS",SGP:"SG",
};

// ─── STATE ─────────────────────────────────────────────────────────────────
let pathMap      = {};   // iso2 -> SVG path
let iso2ToCountry = {}; // iso2 -> country name
let selectedCountry = null;
let activeSection   = 'Key Eight Measures of Power';
let currentMetric   = CHOROPLETH_METRICS[0].key;

// ─── COLOUR SCALE ──────────────────────────────────────────────────────────
function lerpColor(a, b, t) {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`;
}

function metricColor(value, min, max) {
  if (value === null || value === undefined) return '#1a2535';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  if (t < 0.5) return lerpColor('#1a3a5c', '#2d6a8f', t * 2);
  return lerpColor('#2d6a8f', '#e2b44b', (t - 0.5) * 2);
}

// ─── INIT ──────────────────────────────────────────────────────────────────
async function loadAll() {
  try {
    const geo = await fetch(MAP_URL).then(r => r.json());
    renderMap(geo);
    buildMetricSelect();
    applyMetric(currentMetric);
    document.getElementById('loading').style.display = 'none';
  } catch(e) {
    document.getElementById('loading').innerHTML =
      '<p style="color:#f85149">Failed to load map. Please refresh.</p>';
  }
}

// ─── MAP ──────────────────────────────────────────────────────────────────
function project([lon, lat]) {
  return [(lon + 180) / 360 * 2000, (90 - lat) / 180 * 1001];
}

function coordsToPath(geometry) {
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

function renderMap(geo) {
  const svg = document.getElementById('world-map');

  // Build reverse lookup: iso2 -> country name
  for (const [name, iso2] of Object.entries(COUNTRY_TO_ISO2)) {
    iso2ToCountry[iso2] = name;
  }

  geo.features.forEach(f => {
    const iso3 = f.id?.toUpperCase();
    const iso2 = ISO3_TO_ISO2[iso3] || iso3;
    const geoName = f.properties?.name || iso2;
    if (!iso3 || !f.geometry) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', coordsToPath(f.geometry));
    path.setAttribute('class', 'country-path');
    path.setAttribute('data-iso', iso2);
    path.setAttribute('data-name', geoName);

    const countryName = iso2ToCountry[iso2];
    path.addEventListener('click',      () => selectCountry(countryName || null, iso2));
    path.addEventListener('mousemove',  e  => showTooltip(e, iso2, geoName, countryName));
    path.addEventListener('mouseleave', () => hideTooltip());

    svg.appendChild(path);
    pathMap[iso2] = path;
  });
}

// ─── METRIC SELECT ─────────────────────────────────────────────────────────
function buildMetricSelect() {
  const sel = document.getElementById('metric-select');
  let lastSection = '';
  CHOROPLETH_METRICS.forEach(m => {
    if (m.section !== lastSection) {
      const og = document.createElement('optgroup');
      og.label = m.section;
      sel.appendChild(og);
      lastSection = m.section;
    }
    const opt = document.createElement('option');
    opt.value = m.key;
    opt.textContent = m.label;
    sel.lastChild.appendChild(opt);
  });
  sel.addEventListener('change', () => applyMetric(sel.value));
}

function applyMetric(metricKey) {
  currentMetric = metricKey;
  const isPercent = UNITS[metricKey] === 'percent';
  const isGauge   = UNITS[metricKey] === 'index_0_1';

  // Collect all values for this metric
  const vals = Object.entries(COUNTRY_DATA)
    .map(([, d]) => d[metricKey])
    .filter(v => v !== undefined && v !== null);
  const min = Math.min(...vals);
  const max = Math.max(...vals);

  // Update legend
  const fmt = v => isPercent ? (v * 100).toFixed(1) + '%' : isGauge ? v.toFixed(2) : v.toFixed(1);
  document.getElementById('legend-lo').textContent = fmt(min);
  document.getElementById('legend-hi').textContent = fmt(max);

  // Paint countries
  for (const [iso2, path] of Object.entries(pathMap)) {
    const name = iso2ToCountry[iso2];
    const val  = name ? COUNTRY_DATA[name]?.[metricKey] : undefined;
    if (val !== undefined && val !== null) {
      path.style.fill = metricColor(val, min, max);
      path.classList.remove('no-data');
    } else {
      path.style.fill = '#1a2535';
      path.classList.add('no-data');
    }
  }
}

// ─── TOOLTIP ───────────────────────────────────────────────────────────────
const tooltipEl = document.getElementById('tooltip');

function showTooltip(e, iso2, geoName, countryName) {
  const rect = document.querySelector('.map-wrap').getBoundingClientRect();
  const name = countryName || geoName;
  const val  = countryName ? COUNTRY_DATA[countryName]?.[currentMetric] : undefined;
  const metricLabel = CHOROPLETH_METRICS.find(m => m.key === currentMetric)?.label || currentMetric;
  const isPercent = UNITS[currentMetric] === 'percent';
  const isGauge   = UNITS[currentMetric] === 'index_0_1';

  let valStr = '—';
  if (val !== undefined && val !== null) {
    valStr = isPercent ? (val * 100).toFixed(1) + '%' : isGauge ? val.toFixed(2) : val.toFixed(2);
  }

  tooltipEl.innerHTML = `
    <strong>${name}</strong>
    <span class="tl">${metricLabel}</span><br>
    <span class="tv">${valStr}</span>
  `;
  tooltipEl.style.left = (e.clientX - rect.left + 14) + 'px';
  tooltipEl.style.top  = (e.clientY - rect.top  - 10) + 'px';
  tooltipEl.classList.add('show');
}

function hideTooltip() { tooltipEl.classList.remove('show'); }

// ─── COUNTRY SELECTION ─────────────────────────────────────────────────────
function selectCountry(name, iso2) {
  if (!name) return; // no data country

  // Deselect previous
  if (selectedCountry) {
    const prev = COUNTRY_TO_ISO2[selectedCountry];
    if (prev && pathMap[prev]) pathMap[prev].classList.remove('selected');
  }

  if (selectedCountry === name) {
    selectedCountry = null;
    closePanel();
    return;
  }

  selectedCountry = name;
  if (pathMap[iso2]) pathMap[iso2].classList.add('selected');
  openPanel(name);
}

function closePanel() {
  document.getElementById('panel-empty').style.display   = 'flex';
  document.getElementById('panel-content').style.display = 'none';
}

function openPanel(name) {
  const data = COUNTRY_DATA[name];
  if (!data) return;

  document.getElementById('panel-empty').style.display   = 'none';
  document.getElementById('panel-content').style.display = 'flex';

  document.getElementById('panel-name').textContent = name;

  // Gauge
  const gauge = data['Strength Gauge (0-1)'] ?? 0;
  document.getElementById('gauge-fill').style.width = (gauge * 100) + '%';
  document.getElementById('gauge-val').textContent  = gauge.toFixed(2);

  // Render active tab
  renderSection(name, activeSection);

  // Tab click
  document.querySelectorAll('.ptab').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSection = btn.dataset.section;
      renderSection(name, activeSection);
    };
  });

  document.getElementById('panel-close').onclick = () => {
    const iso2 = COUNTRY_TO_ISO2[name];
    if (iso2 && pathMap[iso2]) pathMap[iso2].classList.remove('selected');
    selectedCountry = null;
    closePanel();
  };
}

// ─── SECTION RENDERER ──────────────────────────────────────────────────────
function renderSection(countryName, section) {
  const data      = COUNTRY_DATA[countryName];
  const metrics   = SECTIONS[section] || [];
  const container = document.getElementById('panel-rows');
  document.getElementById('panel-section-title').textContent = section;

  // Collect all country values for each metric for comparison sparkline
  const allCountries = Object.keys(COUNTRY_DATA);

  container.innerHTML = metrics.map(metric => {
    const val     = data[metric];
    const isPercent = UNITS[metric] === 'percent';
    const isGauge   = UNITS[metric] === 'index_0_1';

    let valStr = '—';
    let valClass = 'neu';
    if (val !== undefined && val !== null) {
      valStr = isPercent
        ? (val * 100).toFixed(2) + '%'
        : isGauge
        ? val.toFixed(2)
        : (val >= 0 ? '+' : '') + val.toFixed(2);
      valClass = val > 0.05 ? 'pos' : val < -0.05 ? 'neg' : 'neu';
    }

    // Bar chart: show value relative to range across all countries
    const allVals = allCountries
      .map(c => COUNTRY_DATA[c][metric])
      .filter(v => v !== undefined && v !== null);
    const minV = Math.min(...allVals);
    const maxV = Math.max(...allVals);
    const barHtml = buildBar(val, minV, maxV, isPercent || isGauge);

    // Sparkline comparing all countries
    const sparkHtml = buildSparkline(metric, allCountries, countryName, allVals, minV, maxV);

    return `
      <div class="det-row">
        <div class="det-label">
          <span class="det-label-name">${metric}</span>
          <span class="det-value ${valClass}">${valStr}</span>
        </div>
        ${barHtml}
        ${sparkHtml}
      </div>`;
  }).join('');
}

function buildBar(val, min, max, clamp01 = false) {
  if (val === undefined || val === null) return '';
  const range = max - min || 1;

  // For z-scores: show diverging bar centred at 0
  // For index/percent: show simple fill bar
  if (clamp01) {
    const pct = Math.max(0, Math.min(100, ((val - min) / range) * 100));
    return `<div class="bar-wrap">
      <div class="bar-track" style="background:var(--border);">
        <div class="bar-pos-side" style="width:${pct}%;background:var(--accent);"></div>
      </div>
    </div>`;
  }

  // Diverging: find zero position
  const zeroPct  = Math.max(0, Math.min(100, ((-min) / range) * 100));
  const valPct   = Math.max(0, Math.min(100, ((val - min) / range) * 100));

  const leftPct  = val < 0 ? Math.min(zeroPct, valPct) : zeroPct;
  const widthPct = Math.abs(zeroPct - valPct);
  const isPos    = val >= 0;

  return `<div class="bar-wrap">
    <div class="bar-track" style="background:var(--border);position:relative;">
      <div style="position:absolute;left:${leftPct}%;width:${widthPct}%;height:8px;border-radius:2px;background:${isPos ? '#3fb950' : '#f85149'};"></div>
    </div>
  </div>`;
}

function buildSparkline(metric, countries, highlighted, allVals, min, max) {
  const range = max - min || 1;
  const bars = countries.map(c => {
    const v = COUNTRY_DATA[c][metric];
    if (v === undefined || v === null) return '';
    const h   = Math.max(4, Math.round(((v - min) / range) * 24));
    const col = v >= 0 ? '#3fb95088' : '#f8514988';
    const isHL = c === highlighted;
    return `<div class="spark-bar${isHL ? ' highlight' : ''}" title="${c}: ${v}" style="height:${h}px;background:${isHL ? (v>=0?'#3fb950':'#f85149') : col};"></div>`;
  }).join('');
  return `<div class="spark-wrap">${bars}</div>`;
}

// ─── HOME CARD UPDATE ──────────────────────────────────────────────────────
// Update home page to add power-index card (handled separately)

// ─── START ─────────────────────────────────────────────────────────────────
loadAll();