// ─── ISO3 → ISO2 ───────────────────────────────────────────────────────────
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

// ─── COUNTRY FLAGS (emoji by ISO2) ─────────────────────────────────────────
function isoToFlag(iso2) {
  if (!iso2) return '🌐';
  return [...iso2.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0)))
    .join('');
}

// ─── PANEL GROUP STRUCTURE ─────────────────────────────────────────────────
// Defines exactly what shows in the panel and how groups nest
const PANEL_GROUPS = [
  {
    id: 'power8',
    title: 'Key Eight Measures of Power',
    items: [
      { key: 'Education' },
      { key: 'Innovation and Technology' },
      { key: 'Competitiveness' },
      { key: 'Military' },
      { key: 'Trade' },
      { key: 'Economic Output' },
      { key: 'Financial Center' },
      { key: 'Reserve Currency Status' },
    ]
  },
  {
    id: 'additional',
    title: 'Additional Measures of Power',
    items: [
      { key: 'Geology' },
      { key: 'Acts of Nature' },
      { key: 'Infrastructure & Investment' },
      { key: 'Character/Determination/Civility' },
      { key: 'Governance/Rule of Law' },
    ]
  },
  {
    id: 'growth',
    title: 'Future Growth',
    items: [
      { key: 'Future Growth Estimate' },
      { key: 'Working-Age Pop. Growth' },
      { key: 'Growth Per Worker Estimate' },
    ]
  },
  {
    id: 'productivity',
    title: 'Productivity',
    subgroups: [
      {
        label: 'What You Pay vs. What You Get',
        items: [
          { key: 'Productivity (income adjusted)' },
          { key: 'What You Pay vs. What You Get' },
          { key: 'Education' },
          { key: 'Labor Productivity' },
          { key: 'Working Hard' },
          { key: 'Investing' },
        ]
      },
      {
        label: 'Culture',
        items: [
          { key: 'Culture' },
          { key: 'Corruption' },
          { key: 'Bureaucracy' },
          { key: 'Rule of Law' },
          { key: 'Savoring Life vs. Achieving' },
          { key: 'Innovation' },
          { key: 'Self Sufficiency' },
        ]
      }
    ]
  },
  {
    id: 'wellbeing',
    title: 'Wellbeing',
    items: [
      { key: 'Happiness Index' },
      { key: 'Health Index' },
    ]
  },
  {
    id: 'cycles',
    title: 'Three Big Cycles',
    subgroups: [
      {
        label: 'Economic / Financial Position',
        items: [
          { key: 'Economic/Financial Position' },
          { key: 'Debt Burden' },
          { key: 'Expected Growth' },
        ]
      },
      {
        label: 'Internal Order',
        items: [
          { key: 'Internal Order' },
          { key: 'Wealth/Values Gap' },
          { key: 'Internal Conflict' },
        ]
      },
      {
        label: 'External Order',
        items: [
          { key: 'External Order' },
        ]
      }
    ]
  },
];

// ─── DETERMINANT EXPLANATIONS ───────────────────────────────────────────────
const EXPLANATIONS = {
  'Education': 'Quality and accessibility of education; a foundation for long-term productivity and innovation.',
  'Innovation and Technology': 'Capacity to develop and adopt new technologies; a key driver of economic competitiveness.',
  'Competitiveness': 'Ability to produce goods and services efficiently and compete in global markets.',
  'Military': 'Strength of armed forces; underpins geopolitical influence and national security.',
  'Trade': 'Share of global trade flows; reflects economic openness and market reach.',
  'Economic Output': 'Size and productivity of the economy relative to other nations.',
  'Financial Center': 'Depth and influence of financial markets; ability to attract global capital.',
  'Reserve Currency Status': 'Degree to which the currency is held as a global reserve; amplifies monetary power.',
  'Geology': 'Natural resource endowment - oil, gas, minerals - that supports economic independence.',
  'Resource Allocation Efficiency': 'How effectively the country deploys its resources to generate output.',
  'Acts of Nature': 'Vulnerability to natural disasters, climate and geographic risks.',
  'Infrastructure & Investment': 'Quality of roads, ports, digital networks and capital investment levels.',
  'Character/Determination/Civility': 'Cultural traits such as work ethic, civic trust and social cohesion.',
  'Governance/Rule of Law': 'Quality of institutions, legal frameworks and protection of property rights.',
  'Future Growth Estimate': 'Projected annual real GDP growth rate combining demographics and productivity.',
  'Working-Age Pop. Growth': 'Rate of change of the working-age population; affects labour supply.',
  'Growth Per Worker Estimate': 'Productivity growth - how much more output each worker is expected to generate.',
  'Productivity (income adjusted)': 'Productivity relative to income level; high value = more output per dollar of wages.',
  'What You Pay vs. What You Get': 'Value derived from the workforce relative to its cost.',
  'Labor Productivity': 'Output produced per hour worked.',
  'Working Hard': 'Cultural tendency toward long hours and strong work ethic.',
  'Investing': 'Rate of capital formation; investing in machinery, R&D and infrastructure.',
  'Culture': 'Composite of cultural factors that enable or hinder growth and cooperation.',
  'Corruption': 'Perceived level of public sector corruption; higher score = less corrupt.',
  'Bureaucracy': 'Efficiency and responsiveness of government administration.',
  'Rule of Law': 'Extent to which laws are applied equally and predictably.',
  'Savoring Life vs. Achieving': 'Balance between leisure orientation and achievement orientation.',
  'Innovation': 'Output of new ideas, patents and knowledge-intensive activity.',
  'Self Sufficiency': 'Ability to meet domestic needs without relying on external supply.',
  'Indebtedness': 'Debt burden relative to income; lower indebtedness supports future growth.',
  'Happiness Index': 'Population-level subjective wellbeing and life satisfaction.',
  'Health Index': 'Population health outcomes including life expectancy and healthcare quality.',
  'Economic/Financial Position': 'Overall balance-sheet health: assets vs. liabilities.',
  'Debt Burden': 'Level of government, corporate and household debt relative to GDP.',
  'Expected Growth': 'Forward-looking growth expectations embedded in asset prices and surveys.',
  'Internal Order': 'Political stability and absence of internal conflict or social unrest.',
  'Wealth/Values Gap': 'Degree of inequality - both economic and cultural - within society.',
  'Internal Conflict': 'Frequency and intensity of domestic political or social conflict.',
  'External Order': 'Geopolitical stability; quality of relationships with foreign powers.',
};

// ─── STATE ─────────────────────────────────────────────────────────────────
const MAP_URL        = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
let pathMap          = {};
let iso2ToCountry    = {};
let selectedCountry  = null;
let currentMetric    = 'Strength Gauge (0-1)'; // default — first CHOROPLETH_METRICS entry
const collapsedGroups = new Set(); // track which accordions are closed
const HIDDEN_CLASS = 'is-hidden';

function showElement(id) {
  document.getElementById(id).classList.remove(HIDDEN_CLASS);
}

function hideElement(id) {
  document.getElementById(id).classList.add(HIDDEN_CLASS);
}

// ─── COLOUR HELPERS ────────────────────────────────────────────────────────
function lerp(a, b, t) {
  const ah = parseInt(a.slice(1),16), bh = parseInt(b.slice(1),16);
  const ar=(ah>>16)&0xff, ag=(ah>>8)&0xff, ab=ah&0xff;
  const br=(bh>>16)&0xff, bg=(bh>>8)&0xff, bb=bh&0xff;
  const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), bl=Math.round(ab+(bb-ab)*t);
  return `#${((r<<16)|(g<<8)|bl).toString(16).padStart(6,'0')}`;
}
function divColor(v, absMax) {
  if (v===null||v===undefined) return '#1e2836';
  const t = Math.max(-1,Math.min(1,v/absMax));
  if (t<0) return lerp('#1e2836','#c0392b',-t);
  if (t>0) return lerp('#1e2836','#27ae60',t);
  return '#1e2836';
}

// ─── INIT ──────────────────────────────────────────────────────────────────
async function loadAll() {
  try {
    const geo = await fetch(MAP_URL).then(r=>r.json());
    renderMap(geo);
    buildMetricSelect();
    applyMetric(currentMetric);
    document.getElementById('loading').style.display = 'none';
  } catch(e) {
    document.getElementById('loading').innerHTML =
      '<p style="color:#c0392b">Failed to load map. Please refresh.</p>';
  }
}

// ─── MAP ──────────────────────────────────────────────────────────────────
function project([lon,lat]) {
  return [(lon+180)/360*2000,(90-lat)/180*1001];
}
function toPath(geometry) {
  let d='';
  const polys = geometry.type==='Polygon'?[geometry.coordinates]:geometry.coordinates;
  for (const poly of polys)
    for (const ring of poly) {
      ring.forEach(([lon,lat],i)=>{
        const [x,y]=project([lon,lat]);
        d+=i===0?`M${x},${y}`:`L${x},${y}`;
      });
      d+='Z';
    }
  return d;
}
function renderMap(geo) {
  const svg = document.getElementById('world-map');
  for (const [name,iso2] of Object.entries(COUNTRY_TO_ISO2)) iso2ToCountry[iso2]=name;
  geo.features.forEach(f=>{
    const iso3=f.id?.toUpperCase(), iso2=ISO3_TO_ISO2[iso3]||iso3;
    const geoName=f.properties?.name||iso2;
    if (!iso3||!f.geometry) return;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',toPath(f.geometry));
    p.setAttribute('class','country-path');
    const cn=iso2ToCountry[iso2];
    p.addEventListener('click',()=>onCountryClick(cn,iso2));
    p.addEventListener('mousemove',e=>showMapTooltip(e,geoName,cn));
    p.addEventListener('mouseleave',hideMapTooltip);
    svg.appendChild(p); pathMap[iso2]=p;
  });
}

// ─── CHOROPLETH METRICS ────────────────────────────────────────────────────
// key = exact key in COUNTRY_DATA; label = display name; section = optgroup
const CHOROPLETH_METRICS = [
  { key: "Strength Gauge (0-1)",        label: "Strength Gauge",              section: "Summary" },
  { key: "Future Growth Estimate",      label: "Future Growth Estimate",      section: "Future Growth" },
  { key: "Education",                   label: "Education",                   section: "Key Eight Measures of Power" },
  { key: "Innovation and Technology",   label: "Innovation & Technology",     section: "Key Eight Measures of Power" },
  { key: "Competitiveness",             label: "Competitiveness",             section: "Key Eight Measures of Power" },
  { key: "Military",                    label: "Military",                    section: "Key Eight Measures of Power" },
  { key: "Trade",                       label: "Trade",                       section: "Key Eight Measures of Power" },
  { key: "Economic Output",             label: "Economic Output",             section: "Key Eight Measures of Power" },
  { key: "Financial Center",            label: "Financial Center",            section: "Key Eight Measures of Power" },
  { key: "Reserve Currency Status",     label: "Reserve Currency Status",     section: "Key Eight Measures of Power" },
  { key: "Economic/Financial Position", label: "Economic/Financial Position", section: "Cycles" },
  { key: "Internal Order",              label: "Internal Order",              section: "Cycles" },
  { key: "External Order",              label: "External Order",              section: "Cycles" },
];

// ─── METRIC SELECT ─────────────────────────────────────────────────────────
function buildMetricSelect() {
  const sel = document.getElementById('metric-select');
  const groups = {};
  CHOROPLETH_METRICS.forEach(m => {
    if (!groups[m.section]) {
      const og = document.createElement('optgroup');
      og.label = m.section;
      sel.appendChild(og);
      groups[m.section] = og;
    }
    const o = document.createElement('option');
    o.value = m.key;
    o.textContent = m.label;
    groups[m.section].appendChild(o);
  });
  sel.value = currentMetric;
  sel.addEventListener('change', () => applyMetric(sel.value));
}

function applyMetric(key) {
  currentMetric = key;

  // Sync dropdown
  const sel = document.getElementById('metric-select');
  if (sel.value !== key) sel.value = key;

  const isGauge   = UNITS[key] === 'index_0_1';
  const isPercent = UNITS[key] === 'percent';
  const vals = Object.values(COUNTRY_DATA).map(d => d[key]).filter(v => v != null);
  const absMax = Math.max(...vals.map(Math.abs), 0.01);

  // Legend — for gauge show 0→max, for z-scores/percent show −max→+max
  if (isGauge) {
    document.getElementById('legend-lo').textContent = '0';
    document.getElementById('legend-hi').textContent = Math.max(...vals).toFixed(2);
  } else if (isPercent) {
    document.getElementById('legend-lo').textContent = '−' + (absMax * 100).toFixed(1) + '%';
    document.getElementById('legend-hi').textContent = '+' + (absMax * 100).toFixed(1) + '%';
  } else {
    document.getElementById('legend-lo').textContent = '−' + absMax.toFixed(1);
    document.getElementById('legend-hi').textContent = '+' + absMax.toFixed(1);
  }

  // Paint countries
  for (const [iso2, path] of Object.entries(pathMap)) {
    const n = iso2ToCountry[iso2];
    const v = n ? COUNTRY_DATA[n]?.[key] : undefined;
    if (v != null) { path.style.fill = divColor(v, absMax); path.classList.remove('no-data'); }
    else           { path.style.fill = '#1e2836'; path.classList.add('no-data'); }
  }

  // Highlight active card in sidebar (if panel is open)
  document.querySelectorAll('.det-card').forEach(c => {
    c.classList.toggle('det-card--active', c.dataset.metricKey === key);
  });
}

// ─── MAP TOOLTIP ───────────────────────────────────────────────────────────
const mapTip=document.getElementById('tooltip');
function showMapTooltip(e,geoName,cn) {
  const rect=document.querySelector('.map-wrap').getBoundingClientRect();
  const v=cn?COUNTRY_DATA[cn]?.[currentMetric]:undefined;
  const sign=v!=null?(v>=0?'+':''):'';
  const col=v>0.05?'#27ae60':v<-0.05?'#c0392b':'#7a8fa8';
  mapTip.innerHTML=`<strong>${cn||geoName}</strong><span class="tl">${currentMetric}</span><br><span class="tv" style="color:${col}">${v!=null?sign+v.toFixed(2):'—'}</span>`;
  mapTip.style.left=(e.clientX-rect.left+14)+'px';
  mapTip.style.top=(e.clientY-rect.top-10)+'px';
  mapTip.classList.add('show');
}
function hideMapTooltip() { mapTip.classList.remove('show'); }

// ─── COUNTRY CLICK ─────────────────────────────────────────────────────────
function onCountryClick(name, iso2) {
  if (!name) return;
  if (selectedCountry) {
    const p=COUNTRY_TO_ISO2[selectedCountry]; if(p&&pathMap[p]) pathMap[p].classList.remove('selected');
  }
  if (selectedCountry===name) { selectedCountry=null; closePanel(); return; }
  selectedCountry=name;
  if (pathMap[iso2]) pathMap[iso2].classList.add('selected');
  openPanel(name);
}
function closePanel() {
  showElement('panel-empty');
  hideElement('panel-content');
}
function openPanel(name) {
  hideElement('panel-empty');
  showElement('panel-content');

  const data=COUNTRY_DATA[name]||{};
  const iso2=COUNTRY_TO_ISO2[name];

  // ── TOP ──
  document.getElementById('panel-flag').textContent = isoToFlag(iso2);
  document.getElementById('panel-name').textContent = name;

  // Rank by Strength Gauge
  const ranked = Object.entries(COUNTRY_DATA)
    .map(([n,d])=>({n, g:d['Strength Gauge (0-1)']??0}))
    .sort((a,b)=>b.g-a.g);
  const rank = ranked.findIndex(r=>r.n===name)+1;
  document.getElementById('panel-rank-line').textContent = `Ranked #${rank} of ${ranked.length} countries`;

  // ── GAUGE ──
  const gauge = data['Strength Gauge (0-1)']??0;
  document.getElementById('gauge-fill').style.width = (gauge*100)+'%';
  document.getElementById('gauge-val').textContent  = gauge.toFixed(2);
  document.getElementById('gauge-rank').textContent = `Top ${Math.round((rank/ranked.length)*100)}% globally`;

  // ── MIDDLE ──
  renderBody(name, data);

  // ── BOTTOM ──
  renderStrengthsWeaknesses(name, data);

  document.getElementById('panel-close').onclick=()=>{
    const i=COUNTRY_TO_ISO2[name]; if(i&&pathMap[i]) pathMap[i].classList.remove('selected');
    selectedCountry=null; closePanel();
  };
}

// ─── RENDER BODY ───────────────────────────────────────────────────────────
function renderBody(name, data) {
  const body = document.getElementById('panel-body');
  body.innerHTML = '';

  PANEL_GROUPS.forEach(group => {
    const isCollapsed = collapsedGroups.has(group.id);

    // Group header (accordion)
    const hdr = document.createElement('div');
    hdr.className = 'group-header';
    hdr.innerHTML = `<span class="group-title">${group.title}</span>
      <span class="group-toggle${isCollapsed?'':' open'}">▾</span>`;
    body.appendChild(hdr);

    // Group content wrapper
    const content = document.createElement('div');
    content.className = 'group-content';
    if (isCollapsed) content.classList.add(HIDDEN_CLASS);
    body.appendChild(content);

    hdr.addEventListener('click', () => {
      const open = !content.classList.contains(HIDDEN_CLASS);
      content.classList.toggle(HIDDEN_CLASS, open);
      hdr.querySelector('.group-toggle').classList.toggle('open', !open);
      if (open) collapsedGroups.add(group.id);
      else collapsedGroups.delete(group.id);
    });

    // Items directly in group
    if (group.items) {
      group.items.forEach(item => content.appendChild(makeDet(item.key, data)));
    }

    // Subgroups
    if (group.subgroups) {
      group.subgroups.forEach(sg => {
        const sl = document.createElement('div');
        sl.className = 'subgroup-label';
        sl.textContent = sg.label;
        content.appendChild(sl);
        sg.items.forEach(item => content.appendChild(makeDet(item.key, data)));
      });
    }
  });
}

// ─── BUILD ONE DETERMINANT CARD ────────────────────────────────────────────
function makeDet(key, data) {
  const val = data[key];
  const allVals = Object.values(COUNTRY_DATA).map(d=>d[key]).filter(v=>v!=null);
  const absMax  = Math.max(...allVals.map(Math.abs), 0.01);
  const isPercent = UNITS[key]==='percent';
  const isGauge   = UNITS[key]==='index_0_1';

  // Score string
  let scoreStr='—', scoreClass='neu';
  if (val!=null) {
    if (isPercent)    scoreStr = (val*100).toFixed(1)+'%';
    else if (isGauge) scoreStr = val.toFixed(2);
    else              scoreStr = (val>=0?'+':'')+val.toFixed(2);
    scoreClass = val>0.05?'pos':val<-0.05?'neg':'neu';
  }

  // Percentile rank (higher z-score = higher percentile)
  let pctStr = '';
  if (val!=null && allVals.length>1) {
    const below = allVals.filter(v=>v<=val).length;
    const pct   = Math.round((below/allVals.length)*100);
    pctStr = `${pct}th pct · #${allVals.slice().sort((a,b)=>b-a).indexOf(val)+1}/${allVals.length}`;
  }

  // Bar geometry (diverging, centred at 50%)
  const magnitude = val!=null ? Math.min(Math.abs(val)/absMax,1)*50 : 0;
  const barColor  = val>=0 ? '#27ae60' : '#c0392b';
  const barStyle  = val>=0
    ? `left:50%;width:${magnitude}%;background:${barColor}`
    : `left:${50-magnitude}%;width:${magnitude}%;background:${barColor}`;

  const card = document.createElement('div');
  card.className = 'det-card';
  card.dataset.metricKey = key;
  // If this metric is in the choropleth list, mark it as clickable
  const inChoropleth = CHOROPLETH_METRICS.some(m => m.key === key);
  if (inChoropleth) card.classList.add('det-card--mappable');
  if (currentMetric === key) card.classList.add('det-card--active');

  card.innerHTML = `
    <div class="det-name">
      ${key}
      ${inChoropleth ? `<span class="det-map-hint" title="Click to colour map by this metric">🗺</span>` : ''}
      ${EXPLANATIONS[key] ? `<button class="det-info-btn" data-key="${key}" title="Info">i</button>` : ''}
    </div>
    <div class="det-score-block">
      <span class="det-score ${scoreClass}">${scoreStr}</span>
      <span class="det-pct">${pctStr}</span>
    </div>
    <div class="det-bar-wrap">
      <div class="det-bar-axis"></div>
      <div class="det-bar-fill" style="${barStyle}"></div>
    </div>`;

  // Click card body → recolour map if metric is in choropleth list
  if (inChoropleth) {
    card.addEventListener('click', e => {
      if (e.target.classList.contains('det-info-btn')) return; // don't fire on info button
      applyMetric(key);
    });
  }

  // Info button → floating tooltip
  const btn = card.querySelector('.det-info-btn');
  if (btn) {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      showDetTooltip(e, key);
    });
  }

  return card;
}

// ─── DET TOOLTIP (explanation) ─────────────────────────────────────────────
const detTip = document.getElementById('det-tooltip');
let detTipVisible = false;

function showDetTooltip(e, key) {
  const ex = EXPLANATIONS[key];
  if (!ex) return;
  detTip.innerHTML = `<strong>${key}</strong>${ex}`;

  // Position near button, keep in viewport
  const bx = e.clientX, by = e.clientY;
  detTip.style.left = Math.min(bx+12, window.innerWidth-260)+'px';
  detTip.style.top  = Math.max(by-60, 8)+'px';
  detTip.classList.add('show');
  detTipVisible = true;
}

document.addEventListener('click', e => {
  if (detTipVisible && !e.target.classList.contains('det-info-btn')) {
    detTip.classList.remove('show'); detTipVisible = false;
  }
});

// ─── STRENGTHS & WEAKNESSES ────────────────────────────────────────────────
function renderStrengthsWeaknesses(name, data) {
  // Collect all z-score metrics (exclude percent / gauge)
  const scored = Object.entries(data)
    .filter(([k,v]) => v!=null && !UNITS[k])   // z_score metrics only
    .sort((a,b)=>b[1]-a[1]);

  const top3    = scored.slice(0,3);
  const bottom3 = scored.slice(-3).reverse();

  const strEl = document.getElementById('sw-strengths');
  const wkEl  = document.getElementById('sw-weaknesses');

  strEl.innerHTML = top3.map(([k,v])=>`
    <div class="sw-item">
      <span class="sw-name">${k}</span>
      <span class="sw-val pos">+${v.toFixed(1)}</span>
    </div>`).join('');

  wkEl.innerHTML = bottom3.map(([k,v])=>`
    <div class="sw-item">
      <span class="sw-name">${k}</span>
      <span class="sw-val neg">${v.toFixed(1)}</span>
    </div>`).join('');
}

// ─── START ─────────────────────────────────────────────────────────────────
loadAll();
