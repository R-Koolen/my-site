// ─── CONFIG ────────────────────────────────────────────────────────────────
const VISA_CSV_URL = 'https://raw.githubusercontent.com/ilyankou/passport-index-dataset/refs/heads/master/passport-index-tidy-iso3.csv';
const MAP_URL      = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

// ─── STATE ─────────────────────────────────────────────────────────────────
let visaData    = {};   // { "NL": { "DE": "VF", "US": "VR", ... }, ... }
let selectedISO = null;
let pathMap     = {};   // iso -> SVG path element
let allDestinations = [];

// ─── REQUIREMENT HELPERS ────────────────────────────────────────────────────
// Normalises a raw requirement value into a category string
function getCategory(req) {
  if (!req) return 'unknown';
  const r = req.trim().toLowerCase();
  if (!isNaN(r) && r !== '')   return 'visa-free';    // numeric days = visa free
  if (r === 'visa free')       return 'visa-free';
  if (r === 'visa on arrival') return 'on-arrival';
  if (r === 'eta')             return 'eta';
  if (r === 'e-visa')          return 'e-visa';
  if (r === 'visa required')   return 'visa-required';
  if (r === 'no admission')    return 'no-admission';
  return 'unknown';
}

// Human-readable badge label
function getLabel(req) {
  const cat  = getCategory(req);
  const days = parseInt(req);
  if (cat === 'visa-free' && !isNaN(days)) return `${days} days free`;
  const labels = {
    'visa-free':    'Visa-free',
    'on-arrival':   'On arrival',
    'eta':          'ETA',
    'e-visa':       'e-Visa',
    'visa-required':'Required',
    'no-admission': 'No entry',
  };
  return labels[cat] || req;
}

// CSS variable name for colour
function getColor(req) {
  const colors = {
    'visa-free':     'green',
    'on-arrival':    'yellow',
    'eta':           'orange',
    'e-visa':        'orange',
    'visa-required': 'orange',
    'no-admission':  'red',
  };
  return colors[getCategory(req)] || 'muted';
}

// Sort order (lower = shown first / better access)
const CATEGORY_ORDER = {
  'visa-free': 0, 'on-arrival': 1, 'eta': 2,
  'e-visa': 3, 'visa-required': 4, 'no-admission': 5, 'unknown': 6,
};

// Map category to SVG path CSS class
const CATEGORY_CLASS = {
  'visa-free':     'visa-free',
  'on-arrival':    'visa-on-arrival',
  'eta':           'visa-orange',
  'e-visa':        'visa-orange',
  'visa-required': 'visa-orange',
  'no-admission':  'visa-no-admission',
};

// ─── INIT ──────────────────────────────────────────────────────────────────
async function loadAll() {
  try {
    const [csvText, geoJson] = await Promise.all([
      fetch(VISA_CSV_URL).then(r => r.text()),
      fetch(MAP_URL).then(r => r.json())
    ]);

    parseCSV(csvText);
    renderMap(geoJson);
    document.getElementById('loading').style.display = 'none';
  } catch (e) {
    document.getElementById('loading').innerHTML =
      '<p style="color:var(--red)">Failed to load data. Please refresh.</p>';
  }
}

// ─── DATA PARSING ──────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').slice(1); // skip header row
  lines.forEach(line => {
    const parts = line.split(',');
    if (parts.length < 3) return;
    const from = parts[0].trim();
    const to   = parts[1].trim();
    const req  = parts.slice(2).join(',').trim().toLowerCase(); // handles any commas in value
    if (!visaData[from]) visaData[from] = {};
    visaData[from][to] = req;
  });
}

// ─── MAP RENDERING ─────────────────────────────────────────────────────────
function project([lon, lat]) {
  // Equirectangular projection mapped to viewBox 2000x1001
  const x = (lon + 180) / 360 * 2000;
  const y = (90 - lat) / 180 * 1001;
  return [x, y];
}

function coordsToPath(geometry) {
  let d = '';
  const polys = geometry.type === 'Polygon'
    ? [geometry.coordinates]
    : geometry.coordinates;

  for (const poly of polys) {
    for (const ring of poly) {
      ring.forEach(([lon, lat], i) => {
        const [x, y] = project([lon, lat]);
        d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
      });
      d += 'Z';
    }
  }
  return d;
}

function renderMap(geojson) {
  const svg = document.getElementById('world-map');

  geojson.features.forEach(feature => {
    const iso  = feature.id ? feature.id.toUpperCase() : null;
    const name = feature.properties?.name || iso;
    if (!iso || !feature.geometry) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', coordsToPath(feature.geometry));
    path.setAttribute('class', 'country-path');
    path.setAttribute('data-iso', iso);
    path.setAttribute('data-name', name);

    path.addEventListener('click',      ()  => selectCountry(iso, name));
    path.addEventListener('mousemove',  (e) => showTooltip(e, iso, name));
    path.addEventListener('mouseleave', ()  => hideTooltip());

    svg.appendChild(path);
    pathMap[iso] = path;
  });
}

// ─── TOOLTIP ───────────────────────────────────────────────────────────────
const tooltipEl = document.getElementById('tooltip');

function showTooltip(e, iso, name) {
  const rect = document.querySelector('.map-wrap').getBoundingClientRect();
  let statusText = '';

  if (selectedISO && selectedISO !== iso) {
    const req = visaData[selectedISO]?.[iso];
    const cat = getCategory(req);
    if      (cat === 'visa-free')    statusText = `✅ ${getLabel(req)}`;
    else if (cat === 'on-arrival')   statusText = '🟡 Visa on arrival';
    else if (cat === 'eta')          statusText = '🟡 ETA required';
    else if (cat === 'e-visa')       statusText = '🟠 e-Visa required';
    else if (cat === 'visa-required')statusText = '🔴 Visa required';
    else if (cat === 'no-admission') statusText = '⛔ No admission';
    else                             statusText = '— No data';
  }

  tooltipEl.innerHTML = `<strong>${name}</strong>${statusText ? `<span>${statusText}</span>` : ''}`;
  tooltipEl.style.left = (e.clientX - rect.left + 12) + 'px';
  tooltipEl.style.top  = (e.clientY - rect.top  - 10) + 'px';
  tooltipEl.classList.add('show');
}

function hideTooltip() {
  tooltipEl.classList.remove('show');
}

// ─── COUNTRY SELECTION ─────────────────────────────────────────────────────
function selectCountry(iso, name) {
  // Click selected country again to deselect
  if (selectedISO === iso) {
    clearSelection();
    return;
  }

  resetMapColors();
  selectedISO = iso;

  if (pathMap[iso]) pathMap[iso].classList.add('selected');

  const countryVisa = visaData[iso] || {};
  let vfCount = 0, voaCount = 0;

  Object.entries(countryVisa).forEach(([dest, req]) => {
    const el  = pathMap[dest];
    if (!el) return;
    const cat = getCategory(req);
    const cls = CATEGORY_CLASS[cat];
    if (cls) el.classList.add(cls);
    else     el.classList.add('no-data');
    if (cat === 'visa-free')  vfCount++;
    if (cat === 'on-arrival') voaCount++;
  });

  // Update sidebar header
  document.getElementById('selected-name').textContent = name;
  document.getElementById('selected-sub').textContent  = `${iso} passport`;

  // Update stats
  document.getElementById('stats').style.display      = 'grid';
  document.getElementById('stat-vf').textContent       = vfCount;
  document.getElementById('stat-voa').textContent      = voaCount;

  // Show search & list
  document.getElementById('search-wrap').style.display = 'block';
  document.getElementById('search').value = '';
  renderCountryList(countryVisa);
}

function clearSelection() {
  selectedISO = null;
  resetMapColors();

  document.getElementById('selected-name').textContent    = 'Select a country';
  document.getElementById('selected-sub').textContent     = 'Click any country on the map';
  document.getElementById('stats').style.display         = 'none';
  document.getElementById('search-wrap').style.display   = 'none';
  document.getElementById('search').value                = '';
  document.getElementById('country-list').innerHTML =
    '<div class="empty-state">Select a country on the map to explore its visa-free destinations.</div>';
}

function resetMapColors() {
  Object.values(pathMap).forEach(p =>
    p.classList.remove('visa-free', 'visa-on-arrival', 'visa-orange', 'visa-no-admission', 'selected', 'no-data')
  );
}

// ─── DESTINATION LIST ──────────────────────────────────────────────────────
function renderCountryList(countryVisa, filter = '') {
  const list = document.getElementById('country-list');

  allDestinations = Object.entries(countryVisa)
    .map(([iso, req]) => ({
      iso,
      name: pathMap[iso]?.getAttribute('data-name') || iso,
      req,
      cat: getCategory(req),
    }))
    .sort((a, b) => {
      const diff = (CATEGORY_ORDER[a.cat] ?? 6) - (CATEGORY_ORDER[b.cat] ?? 6);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });

  const filtered = filter
    ? allDestinations.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()))
    : allDestinations;

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">No results found.</div>';
    return;
  }

  list.innerHTML = filtered.map(({ iso, name, req }) => {
    const label = getLabel(req);
    const color = getColor(req);
    return `<div class="country-item" data-iso="${iso}" onclick="selectCountry('${iso}','${name.replace(/'/g, "\\'")}')">
      <span>${name}</span>
      <span class="badge" style="color:var(--${color})">${label}</span>
    </div>`;
  }).join('');
}

// ─── SEARCH ────────────────────────────────────────────────────────────────
document.getElementById('search').addEventListener('input', function () {
  if (selectedISO) {
    renderCountryList(visaData[selectedISO] || {}, this.value);
  }
});

// ─── START ─────────────────────────────────────────────────────────────────
loadAll();