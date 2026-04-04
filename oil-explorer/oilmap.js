// ─── CONFIG ────────────────────────────────────────────────────────────────
const MAP_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

// ─── STATE ─────────────────────────────────────────────────────────────────
let selectedISO  = null;
let activeTab    = 'exports'; // 'exports' | 'imports'
let pathMap      = {};        // iso -> SVG path element

// ─── DERIVED LOOKUPS (built from OIL_TRADE) ────────────────────────────────
// importMap[importer][exporter] = kb/d  (reverse of OIL_TRADE)
const importMap = {};
for (const [exporter, dests] of Object.entries(OIL_TRADE)) {
  for (const [importer, kbpd] of Object.entries(dests)) {
    if (!importMap[importer]) importMap[importer] = {};
    importMap[importer][exporter] = kbpd;
  }
}

// ─── INIT ──────────────────────────────────────────────────────────────────
async function loadAll() {
  try {
    const geoJson = await fetch(MAP_URL).then(r => r.json());
    renderMap(geoJson);
    document.getElementById('loading').style.display = 'none';
  } catch (e) {
    document.getElementById('loading').innerHTML =
      '<p style="color:#f85149">Failed to load map. Please refresh.</p>';
  }
}

// ─── MAP RENDERING ─────────────────────────────────────────────────────────
function project([lon, lat]) {
  return [(lon + 180) / 360 * 2000, (90 - lat) / 180 * 1001];
}

function coordsToPath(geometry) {
  let d = '';
  const polys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
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
    const iso  = feature.id?.toUpperCase();
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

// ─── INTENSITY CLASS ───────────────────────────────────────────────────────
// Returns 1–5 based on value relative to the max in the set
function intensityClass(value, max, type) {
  const ratio = value / max;
  let level;
  if      (ratio > 0.7)  level = 5;
  else if (ratio > 0.45) level = 4;
  else if (ratio > 0.25) level = 3;
  else if (ratio > 0.10) level = 2;
  else                   level = 1;
  return `${type}-${level}`;
}

// ─── SELECT COUNTRY ────────────────────────────────────────────────────────
function selectCountry(iso, name) {
  if (selectedISO === iso) { clearSelection(); return; }

  resetMapColors();
  selectedISO = iso;
  if (pathMap[iso]) pathMap[iso].classList.add('selected');

  const exports_ = OIL_TRADE[iso]   || {};   // countries that BUY from selected
  const imports_ = importMap[iso]   || {};   // countries that SELL to selected

  // Colour export destinations green
  const maxExp = Math.max(...Object.values(exports_), 1);
  for (const [dest, kbpd] of Object.entries(exports_)) {
    const el = pathMap[dest];
    if (el) el.classList.add(intensityClass(kbpd, maxExp, 'export'));
  }

  // Colour import sources red
  const maxImp = Math.max(...Object.values(imports_), 1);
  for (const [src, kbpd] of Object.entries(imports_)) {
    const el = pathMap[src];
    if (el && src !== iso) el.classList.add(intensityClass(kbpd, maxImp, 'import'));
  }

  // Sidebar
  document.getElementById('selected-name').textContent = name;
  document.getElementById('selected-sub').textContent  =
    COUNTRY_NAMES[iso] ? `${iso} · oil trade flows` : iso;
  document.getElementById('stats').style.display     = 'grid';
  document.getElementById('tab-bar').style.display   = 'flex';
  document.getElementById('search-wrap').style.display = 'block';
  document.getElementById('stat-exports').textContent = Object.keys(exports_).length || '—';
  document.getElementById('stat-imports').textContent = Object.keys(imports_).length || '—';

  activeTab = 'exports';
  document.getElementById('tab-exp').classList.add('active');
  document.getElementById('tab-imp').classList.remove('active');
  document.getElementById('search').value = '';
  renderList();
}

function clearSelection() {
  selectedISO = null;
  resetMapColors();
  document.getElementById('selected-name').textContent  = 'Select a country';
  document.getElementById('selected-sub').textContent   = 'Click any country on the map';
  document.getElementById('stats').style.display        = 'none';
  document.getElementById('tab-bar').style.display      = 'none';
  document.getElementById('search-wrap').style.display  = 'none';
  document.getElementById('search').value               = '';
  document.getElementById('country-list').innerHTML     =
    '<div class="empty-state">Select a country on the map to explore its oil trade flows.</div>';
}

function resetMapColors() {
  Object.values(pathMap).forEach(p => {
    p.className = 'country-path';
  });
}

// ─── TAB SWITCHING ─────────────────────────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  document.getElementById('tab-exp').classList.toggle('active', tab === 'exports');
  document.getElementById('tab-imp').classList.toggle('active', tab === 'imports');
  document.getElementById('search').value = '';
  renderList();
}

// ─── SIDEBAR LIST ──────────────────────────────────────────────────────────
function renderList(filter = '') {
  const list = document.getElementById('country-list');
  if (!selectedISO) return;

  const data   = activeTab === 'exports'
    ? OIL_TRADE[selectedISO]  || {}
    : importMap[selectedISO]  || {};

  const isExport = activeTab === 'exports';

  let entries = Object.entries(data)
    .map(([iso, kbpd]) => ({
      iso,
      name: COUNTRY_NAMES[iso] || pathMap[iso]?.getAttribute('data-name') || iso,
      kbpd,
    }))
    .sort((a, b) => b.kbpd - a.kbpd);

  if (filter) {
    entries = entries.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()));
  }

  if (entries.length === 0) {
    list.innerHTML = `<div class="empty-state">No ${activeTab} data for this country.</div>`;
    return;
  }

  const color = isExport ? '#3fb950' : '#f85149';
  const arrow = isExport ? '📤' : '📥';

  list.innerHTML = entries.map(({ iso, name, kbpd }) =>
    `<div class="country-item" onclick="selectCountry('${iso}','${name.replace(/'/g,"\\'")}')">
      <span>${name}</span>
      <span class="badge" style="color:${color}">${arrow} ${kbpd.toLocaleString()} kb/d</span>
    </div>`
  ).join('');
}

// ─── TOOLTIP ───────────────────────────────────────────────────────────────
const tooltipEl = document.getElementById('tooltip');

function showTooltip(e, iso, name) {
  const rect = document.querySelector('.map-wrap').getBoundingClientRect();
  let detail = '';

  if (selectedISO && selectedISO !== iso) {
    const expVal = OIL_TRADE[selectedISO]?.[iso];
    const impVal = importMap[selectedISO]?.[iso];
    if (expVal) detail += `📤 Exports ${expVal.toLocaleString()} kb/d`;
    if (impVal) detail += `${expVal ? '<br>' : ''}📥 Imports ${impVal.toLocaleString()} kb/d`;
    if (!expVal && !impVal) detail = '— No trade data';
  }

  tooltipEl.innerHTML = `<strong>${name}</strong>${detail ? `<span>${detail}</span>` : ''}`;
  tooltipEl.style.left = (e.clientX - rect.left + 12) + 'px';
  tooltipEl.style.top  = (e.clientY - rect.top  - 10) + 'px';
  tooltipEl.classList.add('show');
}

function hideTooltip() { tooltipEl.classList.remove('show'); }

// ─── SEARCH ────────────────────────────────────────────────────────────────
document.getElementById('search').addEventListener('input', function () {
  if (selectedISO) renderList(this.value);
});

// ─── START ─────────────────────────────────────────────────────────────────
loadAll();