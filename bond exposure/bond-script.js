// ─── ISO3 → ISO2 fallback (for countries missing iso2 in the data file) ──────
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

// ─── COLOUR SCALE ─────────────────────────────────────────────────────────────
// Low debt = blue-green, high debt = deep red, thresholds roughly:
// <40% safe, 40-80% moderate, 80-120% elevated, >120% high
const COLOUR_STOPS = [
  [  0, '#1a3a2a'],
  [ 40, '#27ae60'],
  [ 80, '#e2b44b'],
  [120, '#c0392b'],
  [250, '#7b0000'],
];

function debtColor(v) {
  if (v == null) return '#151d28';
  for (let i = 1; i < COLOUR_STOPS.length; i++) {
    const [lo, cLo] = COLOUR_STOPS[i - 1];
    const [hi, cHi] = COLOUR_STOPS[i];
    if (v <= hi || i === COLOUR_STOPS.length - 1) {
      const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
      return lerpHex(cLo, cHi, t);
    }
  }
  return COLOUR_STOPS[COLOUR_STOPS.length - 1][1];
}

function lerpHex(a, b, t) {
  const ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
  const ar=(ah>>16)&0xff, ag=(ah>>8)&0xff, ab=ah&0xff;
  const br=(bh>>16)&0xff, bg=(bh>>8)&0xff, bb=bh&0xff;
  const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), bl=Math.round(ab+(bb-ab)*t);
  return `#${((r<<16)|(g<<8)|bl).toString(16).padStart(6,'0')}`;
}

// ─── STATE ────────────────────────────────────────────────────────────────────
const MAP_URL    = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
let pathMap      = {};   // iso3 → <path>
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
    const row = DEBT_GDP[iso3];
    if (row) {
      p.style.fill = debtColor(row.value);
    } else {
      p.style.fill = '#151d28';
      p.classList.add('no-data');
    }
    p.addEventListener('click',      ()  => onCountryClick(iso3, geoName));
    p.addEventListener('mousemove',  e   => showTooltip(e, iso3, geoName));
    p.addEventListener('mouseleave', ()  => hideTooltip());
    svg.appendChild(p);
    pathMap[iso3] = p;
  });
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
const tip = document.getElementById('tooltip');
function showTooltip(e, iso3, geoName) {
  const row  = DEBT_GDP[iso3];
  const name = row ? row.name : geoName;
  const val  = row ? `${row.value}% of GDP` : 'No data';
  const yr   = row ? ` <span style="color:var(--muted)">(${row.year})</span>` : '';
  const col  = row ? debtColor(row.value) : '#5a6a7e';
  const rect = document.querySelector('.map-wrap').getBoundingClientRect();
  tip.innerHTML = `<strong>${name}</strong><br>
    <span class="tv" style="color:${col}">${val}</span>${yr}`;
  tip.style.left = (e.clientX - rect.left + 14) + 'px';
  tip.style.top  = (e.clientY - rect.top  - 10) + 'px';
  tip.classList.add('show');
}
function hideTooltip() { tip.classList.remove('show'); }

// ─── COUNTRY CLICK → PANEL ───────────────────────────────────────────────────
function onCountryClick(iso3, geoName) {
  // Deselect previous
  if (selectedIso3 && pathMap[selectedIso3]) {
    pathMap[selectedIso3].classList.remove('selected');
  }
  // Toggle off if same country
  if (selectedIso3 === iso3) {
    selectedIso3 = null;
    closePanel();
    return;
  }
  selectedIso3 = iso3;
  if (pathMap[iso3]) pathMap[iso3].classList.add('selected');
  openPanel(iso3, geoName);
}

function closePanel() {
  document.getElementById('panel-empty').style.display   = 'flex';
  document.getElementById('panel-content').style.display = 'none';
}

function openPanel(iso3, geoName) {
  document.getElementById('panel-empty').style.display   = 'none';
  document.getElementById('panel-content').style.display = 'flex';

  const row  = DEBT_GDP[iso3];
  const iso2 = row?.iso2 || ISO3_TO_ISO2[iso3] || '';
  const name = row?.name || geoName;

  // Flag + name
  document.getElementById('panel-flag').textContent = isoToFlag(iso2);
  document.getElementById('panel-name').textContent = name;

  // Debt value + year
  if (row) {
    const val = row.value;
    document.getElementById('panel-value').textContent = `${val}%`;
    document.getElementById('panel-value').style.color = debtColor(val);
    document.getElementById('panel-year').textContent  = `of GDP · ${row.year}`;

    // Gauge bar (0–200% scale)
    const pct = Math.min(val / 200 * 100, 100);
    document.getElementById('gauge-fill').style.width = pct + '%';
    document.getElementById('gauge-fill').style.background = debtColor(val);

    // Context label
    let label, labelColor;
    if      (val <  40) { label = 'Low debt';      labelColor = '#27ae60'; }
    else if (val <  80) { label = 'Moderate debt';  labelColor = '#7ecf8a'; }
    else if (val < 120) { label = 'Elevated debt';  labelColor = '#e2b44b'; }
    else if (val < 200) { label = 'High debt';      labelColor = '#c0392b'; }
    else                { label = 'Very high debt'; labelColor = '#7b0000'; }
    document.getElementById('panel-label').textContent = label;
    document.getElementById('panel-label').style.color = labelColor;

    // Global rank
    const all = Object.values(DEBT_GDP)
      .filter(r => r.value != null)
      .sort((a, b) => b.value - a.value);
    const rank = all.findIndex(r => r.iso2 === iso2 || r.name === name) + 1;
    document.getElementById('panel-rank').textContent =
      rank > 0 ? `Ranked #${rank} of ${all.length} countries` : '';
  } else {
    document.getElementById('panel-value').textContent = '—';
    document.getElementById('panel-value').style.color = '#5a6a7e';
    document.getElementById('panel-year').textContent  = 'No data available';
    document.getElementById('panel-label').textContent = '';
    document.getElementById('panel-rank').textContent  = '';
    document.getElementById('gauge-fill').style.width  = '0%';
  }

  document.getElementById('panel-close').onclick = () => {
    if (pathMap[iso3]) pathMap[iso3].classList.remove('selected');
    selectedIso3 = null;
    closePanel();
  };
}

// ─── LEGEND ───────────────────────────────────────────────────────────────────
function buildLegend() {
  const bar = document.getElementById('legend-gradient');
  const stops = COLOUR_STOPS.map(([pct, col]) => `${col} ${pct / 250 * 100}%`).join(', ');
  bar.style.background = `linear-gradient(to right, ${stops})`;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
async function loadAll() {
  try {
    buildLegend();
    const geo = await fetch(MAP_URL).then(r => r.json());
    renderMap(geo);
    document.getElementById('loading').style.display = 'none';
  } catch (e) {
    document.getElementById('loading').innerHTML =
      '<p style="color:#c0392b">Failed to load map. Please refresh.</p>';
  }
}

loadAll();
