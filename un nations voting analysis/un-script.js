let meta, rawData, countryStats;

const lookup = {};
const breakdown = {};

function getKey() {
  const d = document.getElementById('decade-select').value;
  const s = document.getElementById('subject-select').value;
  if (d !== 'all' && s !== 'all') return `all|${s}`;
  return `${d}|${s}`;
}

function getScores(country) {
  return lookup[getKey()]?.[country] || {};
}

// Returns [pct_yy, pct_nn, pct_aa] for a pair, or null if unavailable or not yet generated.
// pct_disagree is implied as (1 - score).
function getBreakdown(cA, cB) {
  const bd = breakdown[getKey()]?.[cA]?.[cB];
  // Validate: all three values must be finite numbers (JSON may be pre-breakdown format)
  if (!bd || typeof bd[0] !== 'number' || !isFinite(bd[0])) return null;
  return bd;
}

// Renders a compact stacked bar showing vote composition: YY / NN / AA / disagree
function breakdownBar(score, bd) {
  if (!bd) return '';
  const [yy, nn, aa] = bd;
  const dis = Math.max(0, Math.round((1 - score) * 1000) / 1000);
  const toW = v => (v * 100).toFixed(1);
  return `<div class="bd-bar" title="Both Yes: ${toW(yy)}%  Both No: ${toW(nn)}%  Both Abstain: ${toW(aa)}%  Disagree: ${toW(dis)}%">` +
    `<div class="bd-seg bd-yy" style="width:${toW(yy)}%" ></div>` +
    `<div class="bd-seg bd-nn" style="width:${toW(nn)}%" ></div>` +
    `<div class="bd-seg bd-aa" style="width:${toW(aa)}%" ></div>` +
    `<div class="bd-seg bd-dis" style="width:${toW(dis)}%"></div>` +
    `</div>`;
}

function getAverageAlignment(iso3) {
  const data = lookup[getKey()];
  if (!data || !data[iso3]) return null;
  const others = Object.values(data[iso3]);
  if (!others.length) return null;
  return others.reduce((a, b) => a + b, 0) / others.length;
}

function lerp(a, b, t) {
  const ah = parseInt(a.slice(1),16), bh = parseInt(b.slice(1),16);
  const ar=(ah>>16)&0xff, ag=(ah>>8)&0xff, ab=ah&0xff;
  const br=(bh>>16)&0xff, bg=(bh>>8)&0xff, bb=bh&0xff;
  const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), bl=Math.round(ab+(bb-ab)*t);
  return `#${((r<<16)|(g<<8)|bl).toString(16).padStart(6,'0')}`;
}
function scoreColor(score) {
  if (score === undefined || score === null) return '#141c28';
  if (score < 0.5) return lerp('#c0392b', '#e2b44b', score * 2);
  if (score > 0.5) return lerp('#e2b44b', '#27ae60', (score - 0.5) * 2);
  return '#e2b44b';
}

const NAMES = {
  AFG:"Afghanistan",ALB:"Albania",DZA:"Algeria",AND:"Andorra",AGO:"Angola",
  ATG:"Antigua & Barbuda",ARG:"Argentina",ARM:"Armenia",AUS:"Australia",AUT:"Austria",
  AZE:"Azerbaijan",BHS:"Bahamas",BHR:"Bahrain",BGD:"Bangladesh",BRB:"Barbados",
  BLR:"Belarus",BEL:"Belgium",BLZ:"Belize",BEN:"Benin",BTN:"Bhutan",BOL:"Bolivia",
  BIH:"Bosnia & Herz.",BWA:"Botswana",BRA:"Brazil",BRN:"Brunei",BGR:"Bulgaria",
  BFA:"Burkina Faso",BDI:"Burundi",CPV:"Cabo Verde",KHM:"Cambodia",CMR:"Cameroon",
  CAN:"Canada",CAF:"Cent. African Rep.",TCD:"Chad",CHL:"Chile",CHN:"China",
  COL:"Colombia",COM:"Comoros",COD:"Congo (DRC)",COG:"Congo (Rep.)",CRI:"Costa Rica",
  CIV:"Cote d'Ivoire",HRV:"Croatia",CUB:"Cuba",CYP:"Cyprus",CZE:"Czechia",
  DNK:"Denmark",DJI:"Djibouti",DMA:"Dominica",DOM:"Dominican Rep.",ECU:"Ecuador",
  EGY:"Egypt",SLV:"El Salvador",GNQ:"Eq. Guinea",ERI:"Eritrea",EST:"Estonia",
  SWZ:"Eswatini",ETH:"Ethiopia",FJI:"Fiji",FIN:"Finland",FRA:"France",GAB:"Gabon",
  GMB:"Gambia",GEO:"Georgia",DEU:"Germany",GHA:"Ghana",GRC:"Greece",GRD:"Grenada",
  GTM:"Guatemala",GIN:"Guinea",GNB:"Guinea-Bissau",GUY:"Guyana",HTI:"Haiti",
  HND:"Honduras",HUN:"Hungary",ISL:"Iceland",IND:"India",IDN:"Indonesia",IRN:"Iran",
  IRQ:"Iraq",IRL:"Ireland",ISR:"Israel",ITA:"Italy",JAM:"Jamaica",JPN:"Japan",
  JOR:"Jordan",KAZ:"Kazakhstan",KEN:"Kenya",PRK:"Korea (N.)",KOR:"Korea (S.)",
  KWT:"Kuwait",KGZ:"Kyrgyzstan",LAO:"Laos",LVA:"Latvia",LBN:"Lebanon",LSO:"Lesotho",
  LBR:"Liberia",LBY:"Libya",LIE:"Liechtenstein",LTU:"Lithuania",LUX:"Luxembourg",
  MDG:"Madagascar",MWI:"Malawi",MYS:"Malaysia",MDV:"Maldives",MLI:"Mali",MLT:"Malta",
  MHL:"Marshall Islands",MRT:"Mauritania",MUS:"Mauritius",MEX:"Mexico",
  FSM:"Micronesia",MDA:"Moldova",MCO:"Monaco",MNG:"Mongolia",MNE:"Montenegro",
  MAR:"Morocco",MOZ:"Mozambique",MMR:"Myanmar",NAM:"Namibia",NRU:"Nauru",NPL:"Nepal",
  NLD:"Netherlands",NZL:"New Zealand",NIC:"Nicaragua",NER:"Niger",NGA:"Nigeria",
  MKD:"N. Macedonia",NOR:"Norway",OMN:"Oman",PAK:"Pakistan",PLW:"Palau",
  PAN:"Panama",PNG:"Papua New Guinea",PRY:"Paraguay",PER:"Peru",PHL:"Philippines",
  POL:"Poland",PRT:"Portugal",QAT:"Qatar",ROU:"Romania",RUS:"Russia",RWA:"Rwanda",
  KNA:"St Kitts & Nevis",LCA:"St Lucia",VCT:"St Vincent",WSM:"Samoa",SMR:"San Marino",
  STP:"Sao Tome",SAU:"Saudi Arabia",SEN:"Senegal",SRB:"Serbia",SYC:"Seychelles",
  SLE:"Sierra Leone",SGP:"Singapore",SVK:"Slovakia",SVN:"Slovenia",SLB:"Solomon Is.",
  SOM:"Somalia",ZAF:"South Africa",SSD:"South Sudan",ESP:"Spain",LKA:"Sri Lanka",
  SDN:"Sudan",SUR:"Suriname",SWE:"Sweden",CHE:"Switzerland",SYR:"Syria",
  TJK:"Tajikistan",TZA:"Tanzania",THA:"Thailand",TLS:"Timor-Leste",TGO:"Togo",
  TON:"Tonga",TTO:"Trinidad & Tobago",TUN:"Tunisia",TUR:"Turkiye",TKM:"Turkmenistan",
  TUV:"Tuvalu",UGA:"Uganda",UKR:"Ukraine",ARE:"UAE",GBR:"United Kingdom",
  USA:"United States",URY:"Uruguay",UZB:"Uzbekistan",VUT:"Vanuatu",VEN:"Venezuela",
  VNM:"Vietnam",YEM:"Yemen",ZMB:"Zambia",ZWE:"Zimbabwe",
  YUG:"Yugoslavia",CSK:"Czechoslovakia",DDR:"East Germany",SCG:"Serbia & Montenegro"
};

function getName(c) { return NAMES[c] || c; }

function getFlag(iso3) {
  const map = {
    AFG:"AF",ALB:"AL",DZA:"DZ",AND:"AD",AGO:"AO",ATG:"AG",ARG:"AR",ARM:"AM",
    AUS:"AU",AUT:"AT",AZE:"AZ",BHS:"BS",BHR:"BH",BGD:"BD",BRB:"BB",BLR:"BY",
    BEL:"BE",BLZ:"BZ",BEN:"BJ",BTN:"BT",BOL:"BO",BIH:"BA",BWA:"BW",BRA:"BR",
    BRN:"BN",BGR:"BG",BFA:"BF",BDI:"BI",CPV:"CV",KHM:"KH",CMR:"CM",CAN:"CA",
    CAF:"CF",TCD:"TD",CHL:"CL",CHN:"CN",COL:"CO",COM:"KM",COD:"CD",COG:"CG",
    CRI:"CR",CIV:"CI",HRV:"HR",CUB:"CU",CYP:"CY",CZE:"CZ",DNK:"DK",DJI:"DJ",
    DMA:"DM",DOM:"DO",ECU:"EC",EGY:"EG",SLV:"SV",GNQ:"GQ",ERI:"ER",EST:"EE",
    SWZ:"SZ",ETH:"ET",FJI:"FJ",FIN:"FI",FRA:"FR",GAB:"GA",GMB:"GM",GEO:"GE",
    DEU:"DE",GHA:"GH",GRC:"GR",GRD:"GD",GTM:"GT",GIN:"GN",GNB:"GW",GUY:"GY",
    HTI:"HT",HND:"HN",HUN:"HU",ISL:"IS",IND:"IN",IDN:"ID",IRN:"IR",IRQ:"IQ",
    IRL:"IE",ISR:"IL",ITA:"IT",JAM:"JM",JPN:"JP",JOR:"JO",KAZ:"KZ",KEN:"KE",
    PRK:"KP",KOR:"KR",KWT:"KW",KGZ:"KG",LAO:"LA",LVA:"LV",LBN:"LB",LSO:"LS",
    LBR:"LR",LBY:"LY",LIE:"LI",LTU:"LT",LUX:"LU",MDG:"MG",MWI:"MW",MYS:"MY",
    MDV:"MV",MLI:"ML",MLT:"MT",MHL:"MH",MRT:"MR",MUS:"MU",MEX:"MX",FSM:"FM",
    MDA:"MD",MCO:"MC",MNG:"MN",MNE:"ME",MAR:"MA",MOZ:"MZ",MMR:"MM",NAM:"NA",
    NRU:"NR",NPL:"NP",NLD:"NL",NZL:"NZ",NIC:"NI",NER:"NE",NGA:"NG",MKD:"MK",
    NOR:"NO",OMN:"OM",PAK:"PK",PLW:"PW",PAN:"PA",PNG:"PG",PRY:"PY",PER:"PE",
    PHL:"PH",POL:"PL",PRT:"PT",QAT:"QA",ROU:"RO",RUS:"RU",RWA:"RW",KNA:"KN",
    LCA:"LC",VCT:"VC",WSM:"WS",SMR:"SM",STP:"ST",SAU:"SA",SEN:"SN",SRB:"RS",
    SYC:"SC",SLE:"SL",SGP:"SG",SVK:"SK",SVN:"SI",SLB:"SB",SOM:"SO",ZAF:"ZA",
    SSD:"SS",ESP:"ES",LKA:"LK",SDN:"SD",SUR:"SR",SWE:"SE",CHE:"CH",SYR:"SY",
    TJK:"TJ",TZA:"TZ",THA:"TH",TLS:"TL",TGO:"TG",TON:"TO",TTO:"TT",TUN:"TN",
    TUR:"TR",TKM:"TM",TUV:"TV",UGA:"UG",UKR:"UA",ARE:"AE",GBR:"GB",USA:"US",
    URY:"UY",UZB:"UZ",VUT:"VU",VEN:"VE",VNM:"VN",YEM:"YE",ZMB:"ZM",ZWE:"ZW"
  };
  const iso2 = map[iso3];
  if (!iso2) return "\uD83C\uDF10";
  return iso2.split("").map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("");
}


// Continent grouping
const CONTINENT = {
  // Africa
  DZA:"Africa",AGO:"Africa",BEN:"Africa",BWA:"Africa",BFA:"Africa",BDI:"Africa",
  CPV:"Africa",CMR:"Africa",CAF:"Africa",TCD:"Africa",COM:"Africa",COD:"Africa",
  COG:"Africa",CIV:"Africa",DJI:"Africa",EGY:"Africa",GNQ:"Africa",ERI:"Africa",
  SWZ:"Africa",ETH:"Africa",GAB:"Africa",GMB:"Africa",GHA:"Africa",GIN:"Africa",
  GNB:"Africa",KEN:"Africa",LSO:"Africa",LBR:"Africa",LBY:"Africa",MDG:"Africa",
  MWI:"Africa",MLI:"Africa",MRT:"Africa",MUS:"Africa",MAR:"Africa",MOZ:"Africa",
  MMR:"Africa",NAM:"Africa",NER:"Africa",NGA:"Africa",RWA:"Africa",STP:"Africa",
  SEN:"Africa",SYC:"Africa",SLE:"Africa",SOM:"Africa",ZAF:"Africa",SSD:"Africa",
  SDN:"Africa",TZA:"Africa",TGO:"Africa",TUN:"Africa",UGA:"Africa",ZMB:"Africa",
  ZWE:"Africa",
  // Americas
  ATG:"Americas",ARG:"Americas",BHS:"Americas",BRB:"Americas",BLZ:"Americas",
  BOL:"Americas",BRA:"Americas",CAN:"Americas",CHL:"Americas",COL:"Americas",
  CRI:"Americas",CUB:"Americas",DMA:"Americas",DOM:"Americas",ECU:"Americas",
  SLV:"Americas",GRD:"Americas",GTM:"Americas",GUY:"Americas",HTI:"Americas",
  HND:"Americas",JAM:"Americas",MEX:"Americas",NIC:"Americas",PAN:"Americas",
  PRY:"Americas",PER:"Americas",KNA:"Americas",LCA:"Americas",VCT:"Americas",
  SUR:"Americas",TTO:"Americas",USA:"Americas",URY:"Americas",VEN:"Americas",
  // Asia
  AFG:"Asia",ARM:"Asia",AZE:"Asia",BHR:"Asia",BGD:"Asia",BTN:"Asia",BRN:"Asia",
  KHM:"Asia",CHN:"Asia",CYP:"Asia",GEO:"Asia",IND:"Asia",IDN:"Asia",IRN:"Asia",
  IRQ:"Asia",ISR:"Asia",JPN:"Asia",JOR:"Asia",KAZ:"Asia",PRK:"Asia",KOR:"Asia",
  KWT:"Asia",KGZ:"Asia",LAO:"Asia",LBN:"Asia",MYS:"Asia",MDV:"Asia",MNG:"Asia",
  NPL:"Asia",OMN:"Asia",PAK:"Asia",PHL:"Asia",QAT:"Asia",SAU:"Asia",SGP:"Asia",
  LKA:"Asia",SYR:"Asia",TJK:"Asia",THA:"Asia",TLS:"Asia",TUR:"Asia",TKM:"Asia",
  ARE:"Asia",UZB:"Asia",VNM:"Asia",YEM:"Asia",
  // Europe
  ALB:"Europe",AND:"Europe",AUT:"Europe",BLR:"Europe",BEL:"Europe",BIH:"Europe",
  BGR:"Europe",HRV:"Europe",CZE:"Europe",DNK:"Europe",EST:"Europe",FIN:"Europe",
  FRA:"Europe",DEU:"Europe",GRC:"Europe",HUN:"Europe",ISL:"Europe",IRL:"Europe",
  ITA:"Europe",LVA:"Europe",LIE:"Europe",LTU:"Europe",LUX:"Europe",MLT:"Europe",
  MDA:"Europe",MCO:"Europe",MNE:"Europe",NLD:"Europe",MKD:"Europe",NOR:"Europe",
  POL:"Europe",PRT:"Europe",ROU:"Europe",RUS:"Europe",SMR:"Europe",SRB:"Europe",
  SVK:"Europe",SVN:"Europe",ESP:"Europe",SWE:"Europe",CHE:"Europe",UKR:"Europe",
  GBR:"Europe",
  // Oceania
  AUS:"Oceania",FJI:"Oceania",FSM:"Oceania",MHL:"Oceania",NRU:"Oceania",
  NZL:"Oceania",PLW:"Oceania",PNG:"Oceania",WSM:"Oceania",SLB:"Oceania",
  TON:"Oceania",TUV:"Oceania",VUT:"Oceania",
  // Middle East (subset of Asia, listed separately for grouping)
};

// Democracy vs Autocracy (simplified/approximate, based on Freedom House/V-Dem)
const REGIME = {
  // Democracies
  ARG:"Democracy",AUS:"Democracy",AUT:"Democracy",BEL:"Democracy",BLZ:"Democracy",
  BEN:"Democracy",BOL:"Democracy",BWA:"Democracy",BRA:"Democracy",BGR:"Democracy",
  CPV:"Democracy",CAN:"Democracy",CHL:"Democracy",COL:"Democracy",CRI:"Democracy",
  HRV:"Democracy",CYP:"Democracy",CZE:"Democracy",DNK:"Democracy",DOM:"Democracy",
  ECU:"Democracy",EST:"Democracy",FJI:"Democracy",FIN:"Democracy",FRA:"Democracy",
  DEU:"Democracy",GHA:"Democracy",GRC:"Democracy",GRD:"Democracy",GTM:"Democracy",
  GUY:"Democracy",HTI:"Democracy",HND:"Democracy",HUN:"Democracy",ISL:"Democracy",
  IND:"Democracy",IRL:"Democracy",ISR:"Democracy",ITA:"Democracy",JAM:"Democracy",
  JPN:"Democracy",KOR:"Democracy",LVA:"Democracy",LTU:"Democracy",LUX:"Democracy",
  MLT:"Democracy",MHL:"Democracy",MEX:"Democracy",MDA:"Democracy",MNG:"Democracy",
  MNE:"Democracy",NAM:"Democracy",NLD:"Democracy",NZL:"Democracy",NIC:"Democracy",
  MKD:"Democracy",NOR:"Democracy",PAN:"Democracy",PNG:"Democracy",PRY:"Democracy",
  PER:"Democracy",PHL:"Democracy",POL:"Democracy",PRT:"Democracy",ROU:"Democracy",
  WSM:"Democracy",SMR:"Democracy",SRB:"Democracy",SVK:"Democracy",SVN:"Democracy",
  ZAF:"Democracy",ESP:"Democracy",LKA:"Democracy",SUR:"Democracy",SWE:"Democracy",
  CHE:"Democracy",TLS:"Democracy",TTO:"Democracy",TUN:"Democracy",UKR:"Democracy",
  GBR:"Democracy",USA:"Democracy",URY:"Democracy",VUT:"Democracy",ZMB:"Democracy",
  // Autocracies / Hybrid
  AFG:"Autocracy",DZA:"Autocracy",AGO:"Autocracy",AZE:"Autocracy",BHR:"Autocracy",
  BGD:"Autocracy",BLR:"Autocracy",BTN:"Autocracy",BRN:"Autocracy",BFA:"Autocracy",
  BDI:"Autocracy",KHM:"Autocracy",CMR:"Autocracy",CAF:"Autocracy",TCD:"Autocracy",
  CHN:"Autocracy",COM:"Autocracy",COD:"Autocracy",COG:"Autocracy",CIV:"Autocracy",
  CUB:"Autocracy",DJI:"Autocracy",EGY:"Autocracy",GNQ:"Autocracy",ERI:"Autocracy",
  SWZ:"Autocracy",ETH:"Autocracy",GAB:"Autocracy",GMB:"Autocracy",GIN:"Autocracy",
  GNB:"Autocracy",IRN:"Autocracy",IRQ:"Autocracy",JOR:"Autocracy",KAZ:"Autocracy",
  PRK:"Autocracy",KWT:"Autocracy",KGZ:"Autocracy",LAO:"Autocracy",LBN:"Autocracy",
  LSO:"Autocracy",LBR:"Autocracy",LBY:"Autocracy",MDG:"Autocracy",MWI:"Autocracy",
  MYS:"Autocracy",MDV:"Autocracy",MLI:"Autocracy",MRT:"Autocracy",MAR:"Autocracy",
  MOZ:"Autocracy",MMR:"Autocracy",NER:"Autocracy",NGA:"Autocracy",OMN:"Autocracy",
  PAK:"Autocracy",QAT:"Autocracy",RUS:"Autocracy",RWA:"Autocracy",SAU:"Autocracy",
  SGP:"Autocracy",SOM:"Autocracy",SSD:"Autocracy",SDN:"Autocracy",SYR:"Autocracy",
  TJK:"Autocracy",TZA:"Autocracy",TGO:"Autocracy",TUR:"Autocracy",TKM:"Autocracy",
  UGA:"Autocracy",ARE:"Autocracy",UZB:"Autocracy",VEN:"Autocracy",VNM:"Autocracy",
  YEM:"Autocracy",ZWE:"Autocracy",ARM:"Autocracy",GEO:"Democracy",IDN:"Democracy",
  KEN:"Democracy",SEN:"Democracy",SLE:"Democracy",
};

// Dominant religion
const RELIGION = {
  // Christian
  AGO:"Christian",ATG:"Christian",ARG:"Christian",ARM:"Christian",AUS:"Christian",
  AUT:"Christian",BLZ:"Christian",BEN:"Christian",BOL:"Christian",BIH:"Christian",
  BWA:"Christian",BRA:"Christian",BGR:"Christian",BFA:"Christian",BDI:"Christian",
  CMR:"Christian",CAN:"Christian",CAF:"Christian",CHL:"Christian",COL:"Christian",
  COD:"Christian",COG:"Christian",CRI:"Christian",CIV:"Christian",HRV:"Christian",
  CUB:"Christian",CYP:"Christian",CZE:"Christian",DNK:"Christian",DMA:"Christian",
  DOM:"Christian",ECU:"Christian",SLV:"Christian",ERI:"Christian",EST:"Christian",
  SWZ:"Christian",ETH:"Christian",FJI:"Christian",FIN:"Christian",FRA:"Christian",
  GAB:"Christian",GMB:"Christian",GHA:"Christian",GRC:"Christian",GRD:"Christian",
  GTM:"Christian",GUY:"Christian",HTI:"Christian",HND:"Christian",HUN:"Christian",
  ISL:"Christian",IRL:"Christian",ITA:"Christian",JAM:"Christian",KEN:"Christian",
  KOR:"Christian",LVA:"Christian",LBR:"Christian",LIE:"Christian",LTU:"Christian",
  LUX:"Christian",MDG:"Christian",MWI:"Christian",MLT:"Christian",MHL:"Christian",
  FSM:"Christian",MDA:"Christian",MCO:"Christian",MNG:"Christian",MNE:"Christian",
  MOZ:"Christian",NAM:"Christian",NZL:"Christian",NGA:"Christian",MKD:"Christian",
  NOR:"Christian",PNG:"Christian",PRY:"Christian",PER:"Christian",PHL:"Christian",
  POL:"Christian",PRT:"Christian",ROU:"Christian",RUS:"Christian",RWA:"Christian",
  KNA:"Christian",LCA:"Christian",VCT:"Christian",WSM:"Christian",SMR:"Christian",
  STP:"Christian",SRB:"Christian",SYC:"Christian",SLE:"Christian",SLB:"Christian",
  ZAF:"Christian",SSD:"Christian",ESP:"Christian",SUR:"Christian",SWE:"Christian",
  CHE:"Christian",TLS:"Christian",TGO:"Christian",TON:"Christian",TTO:"Christian",
  TUV:"Christian",UGA:"Christian",UKR:"Christian",GBR:"Christian",USA:"Christian",
  URY:"Christian",VUT:"Christian",ZMB:"Christian",ZWE:"Christian",PLW:"Christian",
  // Islam
  AFG:"Islam",DZA:"Islam",AZE:"Islam",BHR:"Islam",BGD:"Islam",BRN:"Islam",
  TCD:"Islam",COM:"Islam",DJI:"Islam",EGY:"Islam",GNQ:"Islam",GMB:"Islam",
  GIN:"Islam",GNB:"Islam",IDN:"Islam",IRN:"Islam",IRQ:"Islam",JOR:"Islam",
  KAZ:"Islam",KWT:"Islam",KGZ:"Islam",LBN:"Islam",LBY:"Islam",MDV:"Islam",
  MLI:"Islam",MRT:"Islam",MAR:"Islam",MMR:"Islam",NER:"Islam",OMN:"Islam",
  PAK:"Islam",QAT:"Islam",SAU:"Islam",SEN:"Islam",SOM:"Islam",SDN:"Islam",
  SYR:"Islam",TJK:"Islam",TUN:"Islam",TUR:"Islam",TKM:"Islam",ARE:"Islam",
  UZB:"Islam",YEM:"Islam",MYS:"Islam",
  // Non-religious / Mixed / Other
  CHN:"Non-religious",PRK:"Non-religious",VNM:"Non-religious",
  // Hindu
  IND:"Hindu",NPL:"Hindu",MUS:"Hindu",
  // Buddhist
  BTN:"Buddhist",KHM:"Buddhist",LAO:"Buddhist",MNG:"Buddhist",
  LKA:"Buddhist",THA:"Buddhist",
  // Jewish
  ISR:"Jewish",
  // Other/Mixed
  CPV:"Christian",NRU:"Christian",
  // Shinto/Buddhist mix
  JPN:"Buddhist",
  // Mixed
  SGP:"Non-religious",
};

const CONTINENT_COLORS = {
  "Africa":   "#e8a838",
  "Americas": "#4caf90",
  "Asia":     "#e05c5c",
  "Europe":   "#5b9bd5",
  "Oceania":  "#a97de8",
};
const REGIME_COLORS = {
  "Democracy": "#27ae60",
  "Autocracy": "#c0392b",
};
const RELIGION_COLORS = {
  "Christian":    "#5b9bd5",
  "Islam":        "#27ae60",
  "Non-religious":"#7a8fa8",
  "Hindu":        "#e8a838",
  "Buddhist":     "#e05c5c",
  "Jewish":       "#a97de8",
};

const decadeSelect  = document.getElementById('decade-select');
const subjectSelect = document.getElementById('subject-select');

// Called by initApp after data is ready
function populateSelects() {
  meta.decades.forEach(d => {
    const o = document.createElement('option');
    o.value = d;
    o.textContent = d === 'all' ? 'All Time' : `${d}s`;
    decadeSelect.appendChild(o);
  });

  meta.subjects.forEach(s => {
    if (s === 'all') return;
    const o = document.createElement('option');
    o.value = s;
    o.textContent = s.replace(/--/g, ' \u203a ').replace(/UN\. /g, 'UN ');
    subjectSelect.appendChild(o);
  });
  const allOpt = document.createElement('option');
  allOpt.value = 'all'; allOpt.textContent = 'All Subjects';
  subjectSelect.insertBefore(allOpt, subjectSelect.firstChild);
  subjectSelect.value = 'all';

  decadeSelect.addEventListener('change', onFilterChange);
  subjectSelect.addEventListener('change', onFilterChange);
}

function onFilterChange() {
  updateMap();
  if (currentMode === 'heatmap') renderHeatmap();
  updatePanel();
}

let selectedCountry = null;
let currentMode = 'map';
let mapColorMode = 'avg';
const HIDDEN_CLASS = 'is-hidden';

function showElement(id) {
  document.getElementById(id).classList.remove(HIDDEN_CLASS);
}

function hideElement(id) {
  document.getElementById(id).classList.add(HIDDEN_CLASS);
}

const svg = document.getElementById('world-map');
const tooltip = document.getElementById('tooltip');
let zoomScale = 1, panX = 0, panY = 0;
let isDragging = false, dragStart = null, panStart = null;

const VW = 2000, VH = 1001;
let numToA3 = {};
const pathMap = {};

async function initMap() {
  try {
    const [worldRes, isoRes] = await Promise.all([
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
      fetch('https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-3/slim-3.json')
    ]);
    const [world, isoData] = await Promise.all([worldRes.json(), isoRes.json()]);
    isoData.forEach(c => { numToA3[c['country-code']] = c['alpha-3']; });

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js';
    script.onload = () => {
      const topoScript = document.createElement('script');
      topoScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js';
      topoScript.onload = () => buildMap(world);
      document.head.appendChild(topoScript);
    };
    document.head.appendChild(script);
  } catch(e) {
    document.getElementById('loading').innerHTML = '<p style="color:var(--neg)">Failed to load map. Check connection.</p>';
  }
}

function buildMap(world) {
  // Natural Earth I - same projection as rd.html
  const proj = d3.geoNaturalEarth1()
    .scale(320).translate([VW/2, VH/2]);
  const pathFn = d3.geoPath().projection(proj);
  const countries = topojson.feature(world, world.objects.countries);

  const sphere = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  sphere.setAttribute('d', pathFn({type:'Sphere'}));
  sphere.setAttribute('fill', '#0d1219');
  sphere.setAttribute('stroke', 'none');
  svg.appendChild(sphere);

  const grat = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  grat.setAttribute('d', pathFn(d3.geoGraticule()()));
  grat.setAttribute('fill', 'none');
  grat.setAttribute('stroke', 'rgba(30,40,54,0.7)');
  grat.setAttribute('stroke-width', '0.4');
  svg.appendChild(grat);

  countries.features.forEach(feat => {
    const iso3 = numToA3[String(feat.id).padStart(3, '0')] || '';
    const d = pathFn(feat);
    if (!d) return;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'country-path no-data');
    path.setAttribute('data-iso3', iso3);
    path.addEventListener('mouseenter', onCountryHover);
    path.addEventListener('mousemove',  onCountryMove);
    path.addEventListener('mouseleave', onCountryLeave);
    path.addEventListener('click',      onCountryClick);
    svg.appendChild(path);
    if (iso3) pathMap[iso3] = path;
  });

  document.getElementById('loading').style.display = 'none';
  setupMapInteraction();
  // Render average alignment by default
  updateMap();
}

// Zoom/pan
function setupMapInteraction() {
  svg.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 1/1.15;
    zoomAround(e.offsetX, e.offsetY, factor);
  }, {passive: false});
  svg.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = false;
    dragStart = {x: e.clientX, y: e.clientY};
    panStart  = {x: panX, y: panY};
  });
  window.addEventListener('mousemove', e => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging = true;
    if (isDragging) {
      panX = panStart.x + dx;
      panY = panStart.y + dy;
      applyTransform();
    }
  });
  window.addEventListener('mouseup', () => { dragStart = null; });
}

function zoomAround(cx, cy, factor) {
  const rect = svg.getBoundingClientRect();
  const mx = cx - rect.left;
  const my = cy - rect.top;
  const newScale = Math.max(0.5, Math.min(12, zoomScale * factor));
  const f = newScale / zoomScale; // use clamped factor
  panX = mx * (1 - f) + panX * f;
  panY = my * (1 - f) + panY * f;
  zoomScale = newScale;
  applyTransform();
}

function mapZoom(factor) {
  const rect = svg.getBoundingClientRect();
  zoomAround(rect.width/2, rect.height/2, factor);
}

function mapReset() {
  zoomScale = 1; panX = 0; panY = 0;
  applyTransform();
}

function applyTransform() {
  const rect = svg.getBoundingClientRect();
  const w = VW / zoomScale;
  const h = VH / zoomScale;
  const x = -panX / rect.width  * w;
  const y = -panY / rect.height * h;
  svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
}

function onCountryHover(e) {
  if (isDragging) return;
  const iso3 = this.getAttribute('data-iso3');
  const name = getName(iso3);

  let html = `<strong>${name}</strong>`;

  if (selectedCountry && iso3 && iso3 !== selectedCountry) {
    const score = getScores(selectedCountry)[iso3];
    if (score !== undefined) {
      html += `<div class="tv" style="color:${scoreColor(score)}">${(score*100).toFixed(1)}% agreement with ${getName(selectedCountry)}</div>`;
      const bd = getBreakdown(selectedCountry, iso3);
      if (bd) {
        const [yy, nn, aa] = bd;
        const dis = Math.max(0, 1 - score);
        html += `<div class="tl" style="font-size:0.68rem;margin-top:2px">` +
          `<span style="color:#27ae60">\u2022 Yes ${(yy*100).toFixed(0)}%</span> ` +
          `<span style="color:#c0392b">\u2022 No ${(nn*100).toFixed(0)}%</span> ` +
          `<span style="color:#e2b44b">\u2022 Abst ${(aa*100).toFixed(0)}%</span> ` +
          `<span style="color:#4a5a6e">\u2022 Dis ${(dis*100).toFixed(0)}%</span></div>`;
      }
    } else {
      html += `<div class="tl">No voting data vs ${getName(selectedCountry)}</div>`;
    }
  } else if (!selectedCountry && mapColorMode === 'avg') {
    const avg = getAverageAlignment(iso3);
    if (avg !== null) {
      html += `<div class="tv" style="color:${scoreColor(avg)}">${(avg*100).toFixed(1)}% avg global alignment</div>`;
      html += `<div class="tl">Click to explore country-specific scores</div>`;
    } else {
      html += `<div class="tl">No data for current filter</div>`;
    }
  } else {
    html += `<div class="tl">Click to explore alignment</div>`;
  }

  tooltip.innerHTML = html;
  tooltip.classList.add('show');
  positionTooltip(e);
}

function onCountryMove(e) { positionTooltip(e); }
function onCountryLeave() { tooltip.classList.remove('show'); }

function positionTooltip(e) {
  const rect = document.querySelector('.map-wrap').getBoundingClientRect();
  let x = e.clientX - rect.left + 14;
  let y = e.clientY - rect.top  - 10;
  if (x + 230 > rect.width)  x -= 240;
  if (y + 80  > rect.height) y -= 90;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

function onCountryClick(e) {
  if (isDragging) return;
  const iso3 = this.getAttribute('data-iso3');
  if (!iso3) return;
  if (iso3 === selectedCountry) {
    clearSelection();
    return;
  }
  selectedCountry = iso3;
  mapColorMode = 'selected';
  updateMap();
  updatePanel();
}

function clearSelection() {
  selectedCountry = null;
  mapColorMode = 'avg';
  updateMap();
  document.getElementById('panel-empty').classList.toggle(HIDDEN_CLASS, currentMode === 'heatmap');
  hideElement('panel-content');
  hideElement('compare-pane');
}

function updateMap() {
  if (selectedCountry) {
    // Color by alignment with selected country
    const scores = getScores(selectedCountry);
    Object.entries(pathMap).forEach(([iso3, el]) => {
      el.classList.remove('selected');
      if (iso3 === selectedCountry) {
        el.style.fill = '#2980b9';
        el.classList.remove('no-data');
        el.classList.add('selected');
        return;
      }
      const s = scores[iso3];
      if (s !== undefined) {
        el.style.fill = scoreColor(s);
        el.classList.remove('no-data');
      } else {
        el.style.fill = '#141c28';
        el.classList.add('no-data');
      }
    });
  } else {
    // Default: color each country by its average alignment across all partners
    Object.entries(pathMap).forEach(([iso3, el]) => {
      el.classList.remove('selected');
      const avg = getAverageAlignment(iso3);
      if (avg !== null) {
        el.style.fill = scoreColor(avg);
        el.classList.remove('no-data');
      } else {
        el.style.fill = '#1a2535';
        el.classList.add('no-data');
      }
    });
    // Update the header subtitle to reflect the mode
    updateHeaderSub();
  }
}

function updateHeaderSub() {
  const d = decadeSelect.options[decadeSelect.selectedIndex]?.text || 'All Time';
  const s = subjectSelect.options[subjectSelect.selectedIndex]?.text || 'All Subjects';
  const sub = document.getElementById('header-sub');
  if (sub) {
    sub.textContent = selectedCountry
      ? `Showing alignment with ${getName(selectedCountry)} \u2022 ${d} \u2022 ${s}`
      : `Showing average global alignment \u2022 ${d} \u2022 ${s}`;
  }
}

let currentTab = 'countries';

function setTab(tab) {
  currentTab = tab;
  ['countries','subjects','trend'].forEach(t => {
    document.getElementById('tab-btn-' + t).classList.toggle('active', t === tab);
    document.getElementById('tab-' + t).classList.toggle(HIDDEN_CLASS, t !== tab);
  });
  if (tab === 'subjects') renderSubjectProfile();
  if (tab === 'trend')    requestAnimationFrame(renderTrendChart);
}

function updatePanel() {
  if (!selectedCountry) {
    updateHeaderSub();
    return;
  }
  const scores = getScores(selectedCountry);
  const entries = Object.entries(scores).filter(([c]) => c !== selectedCountry).sort((a,b) => b[1]-a[1]);
  const avg = entries.length ? entries.reduce((s,[,v]) => s+v, 0) / entries.length : 0;

  hideElement('panel-empty');
  showElement('panel-content');

  document.getElementById('panel-flag').textContent = getFlag(selectedCountry);
  document.getElementById('panel-name').textContent  = getName(selectedCountry);

  const d = decadeSelect.value;
  const s = subjectSelect.value;
  const dLabel = d === 'all' ? 'All time' : d + 's';
  const sLabel = s === 'all' ? 'All subjects' : s.replace(/--/g,' \u203a ');
  document.getElementById('panel-sub').textContent = `${dLabel} \u2022 ${sLabel}`;

  document.getElementById('gauge-val').textContent = (avg*100).toFixed(1) + '%';
  const fill = document.getElementById('gauge-fill');
  fill.style.width = (avg*100) + '%';
  fill.style.background = `linear-gradient(to right, #1a4a2e, ${scoreColor(avg)})`;
  document.getElementById('gauge-meta').textContent =
    `${entries.length} partner countries \u2022 avg alignment`;

  // Vote distribution for this country
  renderVoteBreakdown(selectedCountry);

  // Countries tab
  const body = document.getElementById('panel-body');
  body.innerHTML = entries.map(([code, score], i) => {
    const pct = (score*100).toFixed(1);
    const col = scoreColor(score);
    const cls = i < 5 ? 'top-align' : (i >= entries.length-5 ? 'low-align' : '');
    const bd  = getBreakdown(selectedCountry, code);
    const bdBar = bd ? breakdownBar(score, bd) : '';
    return `<div class="country-item ${cls}" onclick="selectFromPanel('${code}')">
      <span class="ci-rank">${i+1}</span>
      <span class="ci-name">${getName(code)}</span>
      <div class="ci-right">
        <span class="ci-score" style="color:${col}">${pct}%</span>
        <div class="ci-bar"><div class="ci-bar-fill" style="width:${pct}%;background:${col}"></div></div>
        ${bdBar}
      </div>
    </div>`;
  }).join('');

  // Re-render active tab content
  if (currentTab === 'subjects') renderSubjectProfile();
  if (currentTab === 'trend')    renderTrendChart();

  updateHeaderSub();
}

function selectFromPanel(iso3) {
  // Clicking a country in the sidebar opens a direct country-vs-country comparison
  openComparison(iso3);
}

function renderVoteBreakdown(iso3) {
  const vbEl = document.getElementById('vote-beh');
  const rows = document.getElementById('vb-rows');
  const st = countryStats[iso3];
  if (!st) {
    vbEl.classList.add(HIDDEN_CLASS);
    return;
  }
  vbEl.classList.remove(HIDDEN_CLASS);
  const [y, n, a, x] = st;
  const labels = [['Yes', y, 'vb-y'], ['No', n, 'vb-n'], ['Abstain', a, 'vb-a'], ['Absent', x, 'vb-x']];
  rows.innerHTML = labels.map(([label, v, cls]) =>
    `<div class="vb-row">
      <span class="vb-label">${label}</span>
      <div class="vb-track"><div class="vb-fill ${cls}" style="width:${(v*100).toFixed(1)}%"></div></div>
      <span class="vb-pct">${(v*100).toFixed(1)}%</span>
    </div>`
  ).join('');
}

let compareCountry = null;
let currentCmpTab  = 'behaviour';

function openComparison(iso3) {
  compareCountry = iso3;

  // Fill header
  document.getElementById('cmp-flag-a').textContent = getFlag(selectedCountry);
  document.getElementById('cmp-name-a').textContent  = getName(selectedCountry);
  document.getElementById('cmp-flag-b').textContent = getFlag(compareCountry);
  document.getElementById('cmp-name-b').textContent  = getName(compareCountry);

  // Overall score (all-time, all-subjects)
  const score = lookup['all|all']?.[selectedCountry]?.[compareCountry];
  const scoreEl = document.getElementById('cmp-score-val');
  const fillEl  = document.getElementById('cmp-score-fill');
  if (score !== undefined) {
    scoreEl.textContent = (score * 100).toFixed(1) + '%';
    scoreEl.style.color = scoreColor(score);
    fillEl.style.width  = (score * 100) + '%';
    fillEl.style.background = `linear-gradient(to right, #1a4a2e, ${scoreColor(score)})`;
  } else {
    scoreEl.textContent = 'N/A';
    scoreEl.style.color = 'var(--muted)';
    fillEl.style.width  = '0%';
  }

  // Show compare pane, hide normal tabs
  showElement('compare-pane');

  setCmpTab(currentCmpTab);
}

function closeComparison() {
  compareCountry = null;
  hideElement('compare-pane');
}

function setCmpTab(tab) {
  currentCmpTab = tab;
  ['behaviour', 'subjects', 'trend'].forEach(t => {
    document.getElementById('ctab-btn-' + t).classList.toggle('active', t === tab);
    document.getElementById('ctab-' + t).classList.toggle(HIDDEN_CLASS, t !== tab);
  });
  if (tab === 'behaviour') renderCmpBehaviour();
  if (tab === 'subjects')  renderCmpSubjects();
  if (tab === 'trend')     requestAnimationFrame(renderCmpTrend);
}

function renderCmpBehaviour() {
  const cA = selectedCountry, cB = compareCountry;
  const el = document.getElementById('cmp-beh-content');

  function countryBars(iso3) {
    const st = countryStats[iso3];
    if (!st || typeof st[0] !== 'number') {
      return '<div style="color:var(--muted);font-size:0.75rem">Re-run the notebook to generate vote stats.</div>';
    }
    const [y, n, a, x] = st;
    const rows = [
      ['Yes',    y, 'cmp-y'],
      ['No',     n, 'cmp-n'],
      ['Abstain',a, 'cmp-a'],
      ['Absent', x, 'cmp-x'],
    ];
    return rows.map(([lbl, v, cls]) =>
      `<div class="cmp-vb-row">
        <span class="cmp-vb-label">${lbl}</span>
        <div class="cmp-vb-track"><div class="cmp-vb-fill ${cls}" style="width:${(v*100).toFixed(1)}%"></div></div>
        <span class="cmp-vb-pct">${(v*100).toFixed(1)}%</span>
      </div>`
    ).join('');
  }

  // Pair breakdown - use all|all key for widest coverage; validate values are real numbers
  const bdRaw = breakdown['all|all']?.[cA]?.[cB];
  const score  = lookup['all|all']?.[cA]?.[cB];
  const bd = (bdRaw && typeof bdRaw[0] === 'number' && isFinite(bdRaw[0])) ? bdRaw : null;
  let pairHtml = '';
  if (bd && score !== undefined) {
    const [yy, nn, aa] = bd;
    const dis = Math.max(0, 1 - score);
    const segs = [
      [yy,  'cmp-yy',  `Both Yes: ${(yy*100).toFixed(1)}%`],
      [nn,  'cmp-nn',  `Both No: ${(nn*100).toFixed(1)}%`],
      [aa,  'cmp-aa',  `Both Abstain: ${(aa*100).toFixed(1)}%`],
      [dis, 'cmp-dis', `Disagree: ${(dis*100).toFixed(1)}%`],
    ];
    const bar = segs.map(([v, cls]) =>
      `<div class="cmp-pair-seg ${cls}" style="width:${(v*100).toFixed(2)}%"></div>`
    ).join('');
    const legend = segs.map(([, cls, lbl]) =>
      `<div class="cmp-pair-leg-item">
        <div class="cmp-pair-leg-dot" style="background:${cls === 'cmp-yy' ? '#27ae60' : cls === 'cmp-nn' ? '#c0392b' : cls === 'cmp-aa' ? '#e2b44b' : '#2a3a4e'}"></div>
        ${lbl}
      </div>`
    ).join('');
    pairHtml = `
      <div class="cmp-beh-section">
        <div class="cmp-beh-title">Agreement composition (all-time)</div>
        <div class="cmp-pair-bar-wrap">${bar}</div>
        <div class="cmp-pair-legend">${legend}</div>
      </div>`;
  } else if (score !== undefined) {
    pairHtml = `
      <div class="cmp-beh-section">
        <div class="cmp-beh-title">Agreement composition</div>
        <div style="color:var(--muted);font-size:0.75rem">Re-run the notebook to generate breakdown data.</div>
      </div>`;
  }

  el.innerHTML = `
    <div class="cmp-beh-section">
      <div class="cmp-beh-title">Vote distribution - ${getName(cA)}</div>
      <div class="cmp-beh-country">${countryBars(cA)}</div>
    </div>
    <div class="cmp-beh-section">
      <div class="cmp-beh-title">Vote distribution - ${getName(cB)}</div>
      <div class="cmp-beh-country">${countryBars(cB)}</div>
    </div>
    ${pairHtml}`;
}

function renderCmpSubjects() {
  const cA = selectedCountry, cB = compareCountry;
  const subjects = meta.subjects.filter(s => s !== 'all');
  const rows = [];

  subjects.forEach(subj => {
    const score = lookup[`all|${subj}`]?.[cA]?.[cB];
    if (score === undefined) return;
    rows.push({ subj, score });
  });

  rows.sort((a, b) => b.score - a.score);

  const list = document.getElementById('cmp-subject-list');
  if (!rows.length) {
    list.innerHTML = '<div style="padding:20px 16px;color:var(--muted);font-size:0.78rem">No subject data for this pair.</div>';
    return;
  }

  list.innerHTML = rows.map(({ subj, score }) => {
    const pct = (score * 100).toFixed(1);
    const col = scoreColor(score);
    const name = subj.replace(/--/g, ' \u203a ');
    return `<div class="subject-item">
      <div class="subj-name">${name}</div>
      <div class="subj-right">
        <span class="subj-score" style="color:${col}">${pct}%</span>
        <div class="subj-bar"><div class="subj-bar-fill" style="width:${pct}%;background:${col}"></div></div>
      </div>
    </div>`;
  }).join('');
}

function renderCmpTrend() {
  const cA = selectedCountry, cB = compareCountry;
  const decades = meta.decades.filter(d => d !== 'all');

  const pts = [];
  decades.forEach(d => {
    const s = lookup[`${d}|all`]?.[cA]?.[cB];
    if (s === undefined) return;
    pts.push({ decade: d, avg: s });
  });

  const canvas = document.getElementById('cmp-trend-canvas');
  const wrap   = canvas.parentElement;
  const W = wrap.clientWidth - 32;
  const H = Math.max(140, wrap.clientHeight - 16);
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  if (!pts.length) {
    ctx.fillStyle = '#5a6a7e';
    ctx.font = '12px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No decade data for this pair', W / 2, H / 2);
    return;
  }

  const PAD = { top: 16, right: 16, bottom: 32, left: 42 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top  - PAD.bottom;
  const xStep = cW / Math.max(pts.length - 1, 1);

  // Grid
  ctx.strokeStyle = '#1e2836'; ctx.lineWidth = 1;
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    const y = PAD.top + cH * (1 - v);
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + cW, y); ctx.stroke();
    ctx.fillStyle = '#5a6a7e'; ctx.font = '9px Manrope, sans-serif';
    ctx.textAlign = 'right'; ctx.fillText((v * 100).toFixed(0) + '%', PAD.left - 5, y + 3);
  });

  // X labels
  ctx.fillStyle = '#5a6a7e'; ctx.font = '9px Manrope, sans-serif'; ctx.textAlign = 'center';
  pts.forEach(({ decade }, i) => ctx.fillText(decade + 's', PAD.left + i * xStep, H - PAD.bottom + 14));

  // Line + fill
  ctx.beginPath();
  pts.forEach(({ avg }, i) => {
    const x = PAD.left + i * xStep, y = PAD.top + cH * (1 - avg);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#7a8fa8'; ctx.lineWidth = 1.5; ctx.stroke();

  ctx.beginPath();
  pts.forEach(({ avg }, i) => {
    const x = PAD.left + i * xStep, y = PAD.top + cH * (1 - avg);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(PAD.left + (pts.length - 1) * xStep, PAD.top + cH);
  ctx.lineTo(PAD.left, PAD.top + cH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(122,143,168,0.12)'; ctx.fill();

  // Dots
  pts.forEach(({ avg }, i) => {
    const x = PAD.left + i * xStep, y = PAD.top + cH * (1 - avg);
    const col = scoreColor(avg);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = '#0a0e14'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = col; ctx.font = '700 9px Manrope, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText((avg * 100).toFixed(0) + '%', x, y - 8);
  });
}

function renderSubjectProfile() {
  if (!selectedCountry) return;
  const compCountry = null; // future: allow benchmark selection
  const d = decadeSelect.value;

  const subjects = meta.subjects.filter(s => s !== 'all');
  const rows = [];

  subjects.forEach(subj => {
    const data = lookup[`all|${subj}`];
    if (!data || !data[selectedCountry]) return;

    let score;
    if (compCountry && data[selectedCountry][compCountry] !== undefined) {
      score = data[selectedCountry][compCountry];
    } else {
      const vals = Object.values(data[selectedCountry]);
      if (!vals.length) return;
      score = vals.reduce((a, b) => a + b, 0) / vals.length;
    }
    rows.push({ subj, score });
  });

  rows.sort((a, b) => b.score - a.score);

  const label = compCountry ? `vs ${getName(compCountry)}` : 'vs world avg';
  const list = document.getElementById('subject-list');
  if (!rows.length) {
    list.innerHTML = '<div style="padding:20px 16px;color:var(--muted);font-size:0.78rem">No subject data available.</div>';
    return;
  }

  list.innerHTML = rows.map(({ subj, score }) => {
    const pct = (score * 100).toFixed(1);
    const col = scoreColor(score);
    const name = subj.replace(/--/g, ' \u203a ');
    return `<div class="subject-item">
      <div class="subj-name">${name}</div>
      <div class="subj-right">
        <span class="subj-score" style="color:${col}">${pct}%</span>
        <div class="subj-bar"><div class="subj-bar-fill" style="width:${pct}%;background:${col}"></div></div>
      </div>
    </div>`;
  }).join('');
}

function renderTrendChart() {
  if (!selectedCountry) return;
  const s = subjectSelect.value;
  const decades = meta.decades.filter(d => d !== 'all');

  // Collect data points
  const points = [];
  // All-decades trend (subject = 'all': use decade|all keys; subject selected: use decade|subj keys)
  decades.forEach(d => {
    const key = s !== 'all' ? `${d}|${s}` : `${d}|all`;
    const data = lookup[key];
    if (!data || !data[selectedCountry]) return;
    const vals = Object.values(data[selectedCountry]);
    if (!vals.length) return;
    points.push({ decade: d, avg: vals.reduce((a, b) => a + b, 0) / vals.length });
  });

  const pts = points;

  const canvas = document.getElementById('trend-canvas');
  const wrap = canvas.parentElement;
  const W = wrap.clientWidth - 32;
  const H = Math.max(140, wrap.clientHeight - 16);
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  if (!pts.length) {
    ctx.fillStyle = '#5a6a7e';
    ctx.font = '12px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No decade data available', W/2, H/2);
    return;
  }

  const PAD = { top: 16, right: 16, bottom: 32, left: 42 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  // Y axis: 0-100%
  const yMin = 0, yMax = 1;
  const xStep = cW / Math.max(pts.length - 1, 1);

  // Grid lines
  ctx.strokeStyle = '#1e2836';
  ctx.lineWidth = 1;
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    const y = PAD.top + cH * (1 - (v - yMin) / (yMax - yMin));
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + cW, y);
    ctx.stroke();
    ctx.fillStyle = '#5a6a7e';
    ctx.font = '9px Manrope, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText((v*100).toFixed(0) + '%', PAD.left - 5, y + 3);
  });

  // X axis labels
  ctx.fillStyle = '#5a6a7e';
  ctx.font = '9px Manrope, sans-serif';
  ctx.textAlign = 'center';
  pts.forEach(({ decade }, i) => {
    const x = PAD.left + i * xStep;
    ctx.fillText(decade + 's', x, H - PAD.bottom + 14);
  });

  // Line
  ctx.beginPath();
  pts.forEach(({ avg }, i) => {
    const x = PAD.left + i * xStep;
    const y = PAD.top + cH * (1 - avg);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#7a8fa8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Filled area
  ctx.beginPath();
  pts.forEach(({ avg }, i) => {
    const x = PAD.left + i * xStep;
    const y = PAD.top + cH * (1 - avg);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(PAD.left + (pts.length-1)*xStep, PAD.top + cH);
  ctx.lineTo(PAD.left, PAD.top + cH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(122,143,168,0.12)';
  ctx.fill();

  // Dots + value labels
  pts.forEach(({ avg }, i) => {
    const x = PAD.left + i * xStep;
    const y = PAD.top + cH * (1 - avg);
    const col = scoreColor(avg);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI*2);
    ctx.fillStyle = col;
    ctx.fill();
    ctx.strokeStyle = '#0a0e14';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // label above dot
    ctx.fillStyle = col;
    ctx.font = '700 9px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((avg*100).toFixed(0) + '%', x, y - 8);
  });
}

let heatmapCountries = [];
let heatmapMat = null;
let heatmapGroupMode = 'none'; // 'none' | 'continent' | 'regime' | 'religion'

// Inject the group-by control into the heatmap area (called once)
function injectHeatmapGroupControl() {
  const wrap = document.getElementById('heatmap-wrap');
  if (document.getElementById('heatmap-group-bar')) return;

  const bar = document.createElement('div');
  bar.id = 'heatmap-group-bar';
  bar.style.cssText = 'display:flex;align-items:center;gap:10px;flex-shrink:0;flex-wrap:wrap;';
  bar.innerHTML = `
    <span style="font-size:0.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.07em;">Group by</span>
    <div style="display:flex;gap:4px;" id="heatmap-group-btns">
      <button class="mode-btn active" data-group="none"    onclick="setHeatmapGroup('none')">None</button>
      <button class="mode-btn"        data-group="continent" onclick="setHeatmapGroup('continent')">Continent</button>
      <button class="mode-btn"        data-group="regime"  onclick="setHeatmapGroup('regime')">Democracy</button>
      <button class="mode-btn"        data-group="religion" onclick="setHeatmapGroup('religion')">Religion</button>
    </div>
    <div id="heatmap-group-legend" style="display:flex;gap:10px;flex-wrap:wrap;margin-left:8px;"></div>
  `;
  // Insert before the meta text
  wrap.insertBefore(bar, wrap.firstChild);
}

function setHeatmapGroup(mode) {
  heatmapGroupMode = mode;
  document.querySelectorAll('#heatmap-group-btns .mode-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-group') === mode);
  });
  renderHeatmap();
}

function renderHeatmap() {
  injectHeatmapGroupControl();

  const key = getKey();
  const pairs = rawData[key];
  if (!pairs || !pairs.length) {
    document.getElementById('heatmap-meta').innerHTML = '<span style="color:var(--neg)">No data for this combination.</span>';
    return;
  }

  // Gather countries
  const cSet = new Set();
  pairs.forEach(([a,b]) => { cSet.add(a); cSet.add(b); });
  let allCountries = [...cSet].sort();

  // Sort by group if needed
  const groupMap = heatmapGroupMode === 'continent' ? CONTINENT
                 : heatmapGroupMode === 'regime'    ? REGIME
                 : heatmapGroupMode === 'religion'  ? RELIGION
                 : null;

  if (groupMap) {
    allCountries = allCountries.slice().sort((a, b) => {
      const ga = groupMap[a] || 'zzz';
      const gb = groupMap[b] || 'zzz';
      if (ga !== gb) return ga.localeCompare(gb);
      return (NAMES[a]||a).localeCompare(NAMES[b]||b);
    });
  }

  heatmapCountries = allCountries;
  const n = heatmapCountries.length;
  const idx = {};
  heatmapCountries.forEach((c,i) => idx[c] = i);

  // Build matrix
  heatmapMat = new Float32Array(n*n).fill(-1);
  pairs.forEach(([a,b,s]) => {
    const i = idx[a], j = idx[b];
    if (i === undefined || j === undefined) return;
    heatmapMat[i*n+j] = s;
    heatmapMat[j*n+i] = s;
  });
  for (let i=0; i<n; i++) heatmapMat[i*n+i] = 1;

  const maxDim = Math.min(window.innerWidth - 380, window.innerHeight - 120);
  const cell = Math.max(4, Math.floor(maxDim / n));

  const canvas = document.getElementById('heatmap-canvas');
  canvas.width  = n * cell + 80;
  canvas.height = n * cell + 80;
  const ctx = canvas.getContext('2d');
  const MARGIN = 80;

  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw group color bands behind the matrix (left stripe + top stripe)
  if (groupMap) {
    const colorMap = heatmapGroupMode === 'continent' ? CONTINENT_COLORS
                   : heatmapGroupMode === 'regime'    ? REGIME_COLORS
                   : RELIGION_COLORS;
    for (let i = 0; i < n; i++) {
      const grp = groupMap[heatmapCountries[i]] || null;
      const col = grp ? (colorMap[grp] || '#3a4a5e') : '#3a4a5e';
      ctx.fillStyle = col + '55'; // semi-transparent band
      ctx.fillRect(MARGIN - 6, MARGIN + i*cell, 4, cell-1);
      ctx.fillRect(MARGIN + i*cell, MARGIN - 6, cell-1, 4);
    }
  }

  // Draw cells
  for (let i=0; i<n; i++) {
    for (let j=0; j<n; j++) {
      const s = heatmapMat[i*n+j];
      ctx.fillStyle = s >= 0 ? scoreColor(s) : '#111720';
      ctx.fillRect(MARGIN + j*cell, MARGIN + i*cell, cell-1, cell-1);
    }
  }

  // Draw group separator lines
  if (groupMap) {
    const colorMap = heatmapGroupMode === 'continent' ? CONTINENT_COLORS
                   : heatmapGroupMode === 'regime'    ? REGIME_COLORS
                   : RELIGION_COLORS;
    let lastGroup = null;
    for (let i = 0; i < n; i++) {
      const grp = groupMap[heatmapCountries[i]] || '';
      if (grp !== lastGroup && lastGroup !== null) {
        const col = colorMap[grp] || '#7a8fa8';
        ctx.strokeStyle = col + 'cc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(MARGIN, MARGIN + i*cell);
        ctx.lineTo(MARGIN + n*cell, MARGIN + i*cell);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(MARGIN + i*cell, MARGIN);
        ctx.lineTo(MARGIN + i*cell, MARGIN + n*cell);
        ctx.stroke();
      }
      lastGroup = grp;
    }
  }

  // Highlight selected country
  if (selectedCountry && idx[selectedCountry] !== undefined) {
    const si = idx[selectedCountry];
    ctx.strokeStyle = '#e2b44b';
    ctx.lineWidth = 2;
    ctx.strokeRect(MARGIN + si*cell - 1, MARGIN, cell+1, n*cell);
    ctx.strokeRect(MARGIN, MARGIN + si*cell - 1, n*cell, cell+1);
  }

  // Labels
  ctx.fillStyle = '#5a6a7e';
  ctx.font = `${Math.min(10, cell-1)}px Manrope, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const labelEvery = Math.max(1, Math.ceil(10 / cell));
  for (let i=0; i<n; i++) {
    if (i % labelEvery !== 0) continue;
    const label = getName(heatmapCountries[i]).substring(0, 12);
    ctx.save();
    ctx.fillText(label, MARGIN - 10, MARGIN + i*cell + cell/2);
    ctx.translate(MARGIN + i*cell + cell/2, MARGIN - 10);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = 'left';
    ctx.fillText(label, 0, 0);
    ctx.restore();
  }

  ctx.strokeStyle = 'rgba(30,40,54,0.8)';
  ctx.lineWidth = 0.5;
  for (let i=0; i<=n; i+=10) {
    ctx.beginPath();
    ctx.moveTo(MARGIN + i*cell, MARGIN);
    ctx.lineTo(MARGIN + i*cell, MARGIN + n*cell);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN + i*cell);
    ctx.lineTo(MARGIN + n*cell, MARGIN + i*cell);
    ctx.stroke();
  }

  const d = decadeSelect.options[decadeSelect.selectedIndex].text;
  const s = subjectSelect.options[subjectSelect.selectedIndex].text;
  document.getElementById('heatmap-meta').innerHTML =
    `<strong>${n}</strong> countries \u2022 <strong>${d}</strong> \u2022 <strong>${s}</strong> \u2022 hover to inspect`;

  // Update group legend
  const legendEl = document.getElementById('heatmap-group-legend');
  if (legendEl) {
    if (groupMap) {
      const colorMap = heatmapGroupMode === 'continent' ? CONTINENT_COLORS
                     : heatmapGroupMode === 'regime'    ? REGIME_COLORS
                     : RELIGION_COLORS;
      const groups = [...new Set(heatmapCountries.map(c => groupMap[c]).filter(Boolean))].sort();
      legendEl.innerHTML = groups.map(g =>
        `<span style="display:flex;align-items:center;gap:4px;font-size:0.65rem;color:var(--muted)">
          <span style="width:10px;height:10px;border-radius:2px;background:${colorMap[g]||'#3a4a5e'};flex-shrink:0;"></span>
          ${g}
        </span>`
      ).join('');
    } else {
      legendEl.innerHTML = '';
    }
  }

  // Mouse events
  canvas.onmousemove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top)  * scaleY;
    const col = Math.floor((cx - MARGIN) / cell);
    const row = Math.floor((cy - MARGIN) / cell);
    const ht = document.getElementById('heatmap-tooltip');
    if (col < 0 || row < 0 || col >= n || row >= n) { ht.style.display = 'none'; return; }
    const cA = heatmapCountries[row], cB = heatmapCountries[col];
    const score = heatmapMat[row*n+col];
    ht.style.display = 'block';
    ht.style.left = (e.clientX + 14) + 'px';
    ht.style.top  = (e.clientY - 10) + 'px';
    if (groupMap) {
      const gA = groupMap[cA], gB = groupMap[cB];
      let extra = '';
      if (gA) extra += `<span style="color:var(--muted);font-size:0.68rem">${gA}</span>`;
      if (gA && gB && gA !== gB) extra += ` <span style="color:var(--muted)">\u2192</span> <span style="color:var(--muted);font-size:0.68rem">${gB}</span>`;
      extra = extra ? `<div style="margin-bottom:3px">${extra}</div>` : '';
      const bd = score >= 0 ? getBreakdown(cA, cB) : null;
      const bdHtml = bd ? (() => {
        const [yy, nn, aa] = bd;
        const dis = Math.max(0, 1 - score);
        return `<div style="margin-top:4px;font-size:0.68rem;color:var(--muted)">` +
          `<span style="color:#27ae60">Yes ${(yy*100).toFixed(0)}%</span> ` +
          `<span style="color:#c0392b">No ${(nn*100).toFixed(0)}%</span> ` +
          `<span style="color:#e2b44b">Abst ${(aa*100).toFixed(0)}%</span> ` +
          `<span style="color:#4a5a6e">Dis ${(dis*100).toFixed(0)}%</span></div>`;
      })() : '';
      ht.innerHTML = `<strong>${getName(cA)} \u00d7 ${getName(cB)}</strong>${extra}` +
        (score >= 0
          ? `<span style="color:${scoreColor(score)}">${(score*100).toFixed(1)}% agreement</span>${bdHtml}`
          : '<span style="color:var(--muted)">No data</span>');
      return;
    }
    const bd = score >= 0 ? getBreakdown(cA, cB) : null;
    const bdHtml = bd ? (() => {
      const [yy, nn, aa] = bd;
      const dis = Math.max(0, 1 - score);
      return `<div style="margin-top:4px;font-size:0.68rem;color:var(--muted)">` +
        `<span style="color:#27ae60">Yes ${(yy*100).toFixed(0)}%</span> ` +
        `<span style="color:#c0392b">No ${(nn*100).toFixed(0)}%</span> ` +
        `<span style="color:#e2b44b">Abst ${(aa*100).toFixed(0)}%</span> ` +
        `<span style="color:#4a5a6e">Dis ${(dis*100).toFixed(0)}%</span></div>`;
    })() : '';
    ht.innerHTML = `<strong>${getName(cA)} \u00d7 ${getName(cB)}</strong>` +
      (score >= 0
        ? `<span style="color:${scoreColor(score)}">${(score*100).toFixed(1)}% agreement</span>${bdHtml}`
        : '<span style="color:var(--muted)">No data</span>');
  };
  canvas.onmouseleave = () => { document.getElementById('heatmap-tooltip').style.display = 'none'; };
  canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const col = Math.floor(((e.clientX - rect.left)*scaleX - MARGIN) / cell);
    if (col < 0 || col >= n) return;
    const iso3 = heatmapCountries[col];
    selectedCountry = iso3;
    mapColorMode = 'selected';
    updatePanel();
    renderHeatmap();
  };
}

function setMode(mode) {
  currentMode = mode;
  const panel = document.getElementById('panel');
  const main = document.querySelector('.dashboard-shell--un .dashboard-main');
  document.getElementById('btn-map').classList.toggle('active', mode==='map');
  document.getElementById('btn-heatmap').classList.toggle('active', mode==='heatmap');
  document.getElementById('map-wrap').classList.toggle(HIDDEN_CLASS, mode !== 'map');
  document.getElementById('heatmap-wrap').classList.toggle(HIDDEN_CLASS, mode !== 'heatmap');
  panel.classList.toggle(HIDDEN_CLASS, mode === 'heatmap');
  main.classList.toggle('heatmap-mode', mode === 'heatmap');
  if (mode === 'heatmap') renderHeatmap();
}

// Called by un-data.js after un_voting_data.json is fetched.
// bundle = { meta: {countries, decades, subjects}, data: {"decade|subject": [[cA,cB,score,yy,nn,aa],...]} }
function initApp(bundle) {
  meta         = bundle.meta;
  rawData      = bundle.data;
  countryStats = bundle.stats || {};

  // Build score lookup and breakdown lookup
  for (const [key, pairs] of Object.entries(rawData)) {
    const m = {}, bd = {};
    for (const [cA, cB, score, pct_yy, pct_nn, pct_aa] of pairs) {
      if (!m[cA])  m[cA]  = {};
      if (!m[cB])  m[cB]  = {};
      if (!bd[cA]) bd[cA] = {};
      if (!bd[cB]) bd[cB] = {};
      m[cA][cB]  = score;
      m[cB][cA]  = score;
      bd[cA][cB] = [pct_yy, pct_nn, pct_aa];
      bd[cB][cA] = [pct_yy, pct_nn, pct_aa];
    }
    lookup[key]    = m;
    breakdown[key] = bd;
  }

  populateSelects();
  initMap();
}

