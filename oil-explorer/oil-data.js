// Oil trade data: OIL_TRADE[exporter][importer] = thousand barrels per day (kb/d)
// Source: EIA, Energy Institute Statistical Review of World Energy 2024, approx 2023 figures
// ISO2 codes used throughout

const OIL_TRADE = {
  // RUSSIA
  "RU": {
    "CN": 1940, "IN": 1760, "TR": 430,  "DE": 120,  "NL": 90,
    "IT": 80,   "FR": 60,   "SK": 70,   "HU": 100,  "BG": 60,
    "FI": 50,   "PL": 40,   "GR": 55,   "RO": 30,   "BE": 35,
    "KR": 80,   "JP": 60,   "SG": 45,   "EG": 40,   "CU": 30,
    "TT": 20,   "BH": 20,   "MA": 25,   "LK": 15,   "PK": 120,
    "BD": 30,   "MM": 20,   "VN": 25,
  },
  // SAUDI ARABIA
  "SA": {
    "CN": 1760, "IN": 650,  "JP": 870,  "KR": 730,  "US": 480,
    "SG": 200,  "TW": 120,  "TH": 130,  "PH": 90,   "MY": 110,
    "FR": 80,   "NL": 90,   "IT": 120,  "PL": 40,   "ES": 60,
    "GR": 50,   "BE": 40,   "EG": 60,   "JO": 50,   "PK": 80,
    "BD": 40,   "ID": 70,   "AU": 60,   "NZ": 20,   "GB": 70,
    "DE": 50,   "TR": 80,
  },
  // UNITED STATES
  "US": {
    "CA": 980,  "MX": 290,  "GB": 220,  "NL": 310,  "KR": 420,
    "JP": 290,  "IN": 350,  "FR": 160,  "IT": 120,  "ES": 110,
    "DE": 100,  "AU": 80,   "SG": 90,   "TW": 80,   "BE": 70,
    "PL": 90,   "CL": 40,   "BR": 70,   "CN": 180,  "TH": 50,
    "PH": 40,   "MY": 35,   "NO": 40,   "IL": 30,   "TR": 50,
    "PT": 30,   "GR": 30,   "HR": 20,   "LT": 35,   "FI": 25,
  },
  // IRAQ
  "IQ": {
    "CN": 1200, "IN": 1070, "KR": 220,  "IT": 200,  "US": 230,
    "GR": 80,   "NL": 70,   "ES": 90,   "TR": 150,  "JP": 100,
    "DE": 60,   "PL": 50,   "FR": 60,   "SG": 50,   "TW": 40,
    "TH": 30,   "PH": 25,   "MY": 30,   "BE": 30,   "GB": 50,
    "PT": 20,   "AU": 30,
  },
  // CANADA
  "CA": {
    "US": 3970, "CN": 280,  "GB": 40,   "DE": 30,   "NL": 35,
    "IT": 20,   "ES": 20,   "IN": 60,   "KR": 40,
  },
  // UAE
  "AE": {
    "JP": 650,  "CN": 520,  "IN": 380,  "KR": 290,  "TW": 100,
    "TH": 80,   "SG": 90,   "PK": 60,   "AU": 40,   "PH": 50,
    "MY": 45,   "ID": 35,   "US": 50,   "GB": 30,   "NL": 25,
    "FR": 20,   "IT": 30,   "TR": 40,   "EG": 25,
  },
  // IRAN
  "IR": {
    "CN": 1500, "SY": 30,   "VE": 20,   "IQ": 40,   "TR": 30,
    "PK": 20,   "IN": 30,
  },
  // KUWAIT
  "KW": {
    "CN": 380,  "IN": 260,  "JP": 200,  "KR": 190,  "TW": 60,
    "SG": 50,   "TH": 40,   "IT": 30,   "NL": 25,   "US": 80,
    "AU": 20,   "PH": 25,
  },
  // NORWAY
  "NO": {
    "NL": 290,  "DE": 240,  "GB": 280,  "FR": 130,  "SE": 90,
    "DK": 70,   "US": 80,   "PL": 60,   "FI": 50,   "BE": 50,
    "IT": 40,   "ES": 35,   "CN": 60,   "IN": 30,   "SG": 25,
  },
  // NIGERIA
  "NG": {
    "IN": 220,  "NL": 180,  "ES": 130,  "IT": 110,  "FR": 90,
    "US": 160,  "CN": 180,  "GB": 70,   "DE": 50,   "GH": 30,
    "SG": 40,   "AU": 25,   "PT": 30,   "BE": 35,   "CA": 20,
    "ZA": 20,
  },
  // ANGOLA
  "AO": {
    "CN": 1020, "IN": 180,  "FR": 110,  "NL": 90,   "ES": 60,
    "US": 90,   "SG": 50,   "IT": 40,   "KR": 50,   "TW": 35,
    "PT": 30,   "BE": 25,   "CA": 20,
  },
  // BRAZIL
  "BR": {
    "CN": 620,  "US": 180,  "IN": 120,  "NL": 90,   "SG": 70,
    "JP": 60,   "KR": 80,   "DE": 40,   "ES": 40,   "IT": 30,
    "GB": 35,   "AU": 25,   "TW": 30,
  },
  // KAZAKHSTAN
  "KZ": {
    "CN": 300,  "IT": 250,  "NL": 160,  "FR": 90,   "DE": 80,
    "AT": 40,   "ES": 30,   "SK": 30,   "RU": 80,   "TR": 40,
    "KR": 20,   "IN": 30,
  },
  // MEXICO
  "MX": {
    "US": 730,  "IN": 90,   "KR": 70,   "CN": 80,   "ES": 40,
    "NL": 30,   "DE": 20,   "CA": 40,
  },
  // VENEZUELA
  "VE": {
    "CN": 400,  "US": 190,  "IN": 80,   "SG": 40,   "CU": 60,
    "TR": 20,
  },
  // LIBYA
  "LY": {
    "IT": 230,  "DE": 90,   "ES": 70,   "CN": 80,   "FR": 60,
    "GR": 55,   "TR": 50,   "AT": 30,   "NL": 40,   "US": 30,
    "GB": 25,
  },
  // ALGERIA
  "DZ": {
    "IT": 360,  "FR": 160,  "ES": 120,  "DE": 50,   "NL": 40,
    "GB": 30,   "TR": 50,   "US": 30,   "CA": 20,   "PT": 25,
    "GR": 30,
  },
  // OMAN
  "OM": {
    "CN": 650,  "IN": 200,  "JP": 130,  "KR": 100,  "TH": 50,
    "SG": 40,   "TW": 35,   "PK": 30,   "MY": 25,
  },
  // COLOMBIA
  "CO": {
    "US": 380,  "IN": 90,   "CN": 70,   "ES": 50,   "KR": 30,
    "PH": 20,   "AU": 20,   "GB": 25,
  },
  // ECUADOR
  "EC": {
    "US": 200,  "CN": 130,  "IN": 40,   "CL": 25,   "PE": 20,
    "KR": 20,
  },
  // MALAYSIA
  "MY": {
    "CN": 180,  "IN": 80,   "JP": 70,   "KR": 60,   "AU": 30,
    "TH": 40,   "SG": 50,   "TW": 25,
  },
  // AZERBAIJAN
  "AZ": {
    "IT": 190,  "DE": 60,   "IL": 50,   "GE": 30,   "TR": 40,
    "FR": 30,   "GR": 25,   "HR": 20,   "CH": 15,
  },
  // GHANA
  "GH": {
    "US": 40,   "CN": 35,   "GB": 25,   "NL": 20,   "SG": 15,
    "IT": 15,
  },
  // UNITED KINGDOM (North Sea)
  "GB": {
    "NL": 90,   "DE": 60,   "FR": 50,   "NO": 40,   "US": 30,
    "IE": 25,   "SE": 20,   "DK": 15,
  },
  // QATAR
  "QA": {
    "CN": 80,   "IN": 50,   "JP": 60,   "KR": 50,   "GB": 30,
    "IT": 25,   "SG": 30,
  },
};

// Country name lookup (ISO2 -> display name)
const COUNTRY_NAMES = {
  AE:"United Arab Emirates", AO:"Angola",      AT:"Austria",
  AU:"Australia",            AZ:"Azerbaijan",  BD:"Bangladesh",
  BE:"Belgium",              BG:"Bulgaria",    BH:"Bahrain",
  BR:"Brazil",               CA:"Canada",      CH:"Switzerland",
  CL:"Chile",                CN:"China",       CO:"Colombia",
  CU:"Cuba",                 DE:"Germany",     DK:"Denmark",
  DZ:"Algeria",              EC:"Ecuador",     EG:"Egypt",
  ES:"Spain",                FI:"Finland",     FR:"France",
  GB:"United Kingdom",       GE:"Georgia",     GH:"Ghana",
  GR:"Greece",               HR:"Croatia",     HU:"Hungary",
  ID:"Indonesia",            IE:"Ireland",     IL:"Israel",
  IN:"India",                IQ:"Iraq",        IR:"Iran",
  IT:"Italy",                JO:"Jordan",      JP:"Japan",
  KR:"South Korea",          KW:"Kuwait",      KZ:"Kazakhstan",
  LK:"Sri Lanka",            LT:"Lithuania",   LY:"Libya",
  MA:"Morocco",              MM:"Myanmar",     MX:"Mexico",
  MY:"Malaysia",             NG:"Nigeria",     NL:"Netherlands",
  NO:"Norway",               NZ:"New Zealand", OM:"Oman",
  PE:"Peru",                 PH:"Philippines", PK:"Pakistan",
  PL:"Poland",               PT:"Portugal",    QA:"Qatar",
  RO:"Romania",              RU:"Russia",      SA:"Saudi Arabia",
  SE:"Sweden",               SG:"Singapore",   SK:"Slovakia",
  SY:"Syria",                TH:"Thailand",    TR:"Turkey",
  TT:"Trinidad and Tobago",  TW:"Taiwan",      US:"United States",
  VE:"Venezuela",            VN:"Vietnam",     ZA:"South Africa",
};