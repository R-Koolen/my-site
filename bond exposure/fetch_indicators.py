"""
fetch_indicators.py
Fetches multiple IMF DataMapper indicators and writes bond-data.js.
API: https://www.imf.org/external/datamapper/api/v1/
"""

import requests, json, time
from pathlib import Path

BASE     = "https://www.imf.org/external/datamapper/api/v1"
OUT_FILE = Path(__file__).parent / "bond-data.js"
PREFER_YEAR = 2023

# ── Indicators ─────────────────────────────────────────────────────────────────
# Each entry: label shown in UI, unit string, category key, optional description
INDICATORS = {
    # ── Debt ──────────────────────────────────────────────────────────────────
    "GGXWDG_NGDP": {
        "label": "Gross Public Debt", "unit": "% of GDP", "category": "debt",
        "info": "General government gross debt as a share of GDP (IMF WEO). "
                "Includes all liabilities (bonds, loans, etc.) of central + local governments.",
    },
    # ── Fiscal ────────────────────────────────────────────────────────────────
    "GGXCNL_NGDP": {
        "label": "Fiscal Balance", "unit": "% of GDP", "category": "fiscal",
        "info": "Net lending/borrowing of the general government (% GDP). "
                "Positive = surplus, negative = deficit.",
    },
    "ie": {
        "label": "Interest Paid", "unit": "% of GDP", "category": "fiscal",
        "info": "Interest payments on public debt as a share of GDP. "
                "High values indicate a heavy debt-service burden.",
    },
    "pb": {
        "label": "Primary Balance", "unit": "% of GDP", "category": "fiscal",
        "info": "Fiscal balance excluding interest payments. "
                "Shows whether the government can service existing debt from current revenues.",
    },
    # ── Debt sustainability ────────────────────────────────────────────────────
    "rltir": {
        "label": "Real Bond Yield", "unit": "%", "category": "sustainability",
        "info": "Real long-term government bond yield (nominal yield minus inflation). "
                "When this exceeds GDP growth, debt tends to snowball.",
    },
    "NGDP_RPCH": {
        "label": "Real GDP Growth", "unit": "%", "category": "sustainability",
        "info": "Annual growth rate of real GDP. Strong growth helps stabilise "
                "the debt/GDP ratio even without fiscal surpluses.",
    },
    "BCA_NGDPD": {
        "label": "Current Account", "unit": "% of GDP", "category": "sustainability",
        "info": "External current account balance as a share of GDP. "
                "Persistent deficits can indicate reliance on foreign capital.",
    },
    "PCPIPCH": {
        "label": "Inflation (CPI)", "unit": "%", "category": "sustainability",
        "info": "Annual average change in consumer prices. "
                "High inflation erodes the real value of nominal debt.",
    },
    # ── Private debt ──────────────────────────────────────────────────────────
    "Privatedebt_all": {
        "label": "Total Private Debt", "unit": "% of GDP", "category": "private_debt",
        "info": "Total household + corporate debt (all instruments). "
                "High private debt amplifies financial stability risks.",
    },
    "HH_ALL": {
        "label": "Household Debt", "unit": "% of GDP", "category": "private_debt",
        "info": "Household debt (all instruments, % GDP). "
                "High levels constrain consumer spending and raise default risk.",
    },
    "NFC_ALL": {
        "label": "Corporate Debt", "unit": "% of GDP", "category": "private_debt",
        "info": "Non-financial corporate debt (all instruments, % GDP). "
                "Elevated corporate leverage raises insolvency risk during downturns.",
    },
    # ── Reserves ──────────────────────────────────────────────────────────────
    "Reserves_ARA": {
        "label": "Reserves / ARA", "unit": "ratio", "category": "reserves",
        "info": "FX reserves relative to the IMF Assessing Reserve Adequacy (ARA) metric. "
                "Values ≥ 1 indicate adequate buffers against external shocks.",
    },
    "Reserves_M": {
        "label": "Reserves (months)", "unit": "months", "category": "reserves",
        "info": "FX reserves expressed as months of imports. "
                "3 months is a commonly cited minimum adequacy threshold.",
    },
    "Reserves_STD": {
        "label": "Reserves / Short-term Debt", "unit": "ratio", "category": "reserves",
        "info": "FX reserves relative to short-term external debt. "
                "A ratio > 1 (Greenspan-Guidotti rule) suggests ability to weather sudden stops.",
    },
    # ── Capital openness ──────────────────────────────────────────────────────
    "ka_new": {
        "label": "Capital Openness", "unit": "index (0–1)", "category": "capital",
        "info": "Overall capital account openness index (Fernández et al.). "
                "1 = fully liberalised, 0 = fully closed.",
    },
    "Ka_bo": {
        "label": "Bond Market Openness", "unit": "index (0–1)", "category": "capital",
        "info": "Openness of the bond market to cross-border flows. "
                "Higher values indicate fewer restrictions on foreign bond investment.",
    },
}


def fetch(url, retries=3):
    for attempt in range(retries):
        try:
            r = requests.get(url, timeout=30)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            if attempt == retries - 1:
                raise
            print(f"    retry {attempt+1}: {e}")
            time.sleep(2)


def pick_year(yearly):
    valid = {int(y): v for y, v in yearly.items() if v is not None}
    if not valid:
        return None, None
    if PREFER_YEAR in valid:
        return PREFER_YEAR, round(valid[PREFER_YEAR], 2)
    earlier = [y for y in valid if y <= PREFER_YEAR]
    if not earlier:
        return None, None
    yr = max(earlier)
    return yr, round(valid[yr], 2)


# ── 1. Country ISO2 lookup (ISO2 keys from /countries) ────────────────────────
# DataMapper uses ISO2 as the country key in /countries but ISO3 in indicator series.
# The /countries endpoint has NO iso3 field — we use a hardcoded fallback.
ISO3_TO_ISO2 = {
    "AFG":"AF","ALB":"AL","DZA":"DZ","AND":"AD","AGO":"AO","ATG":"AG","ARG":"AR","ARM":"AM",
    "AUS":"AU","AUT":"AT","AZE":"AZ","BHS":"BS","BHR":"BH","BGD":"BD","BRB":"BB","BLR":"BY",
    "BEL":"BE","BLZ":"BZ","BEN":"BJ","BTN":"BT","BOL":"BO","BIH":"BA","BWA":"BW","BRA":"BR",
    "BRN":"BN","BGR":"BG","BFA":"BF","BDI":"BI","KHM":"KH","CMR":"CM","CAN":"CA","CPV":"CV",
    "CAF":"CF","TCD":"TD","CHL":"CL","CHN":"CN","COL":"CO","COM":"KM","COD":"CD","COG":"CG",
    "CRI":"CR","CIV":"CI","HRV":"HR","CUB":"CU","CYP":"CY","CZE":"CZ","DNK":"DK","DJI":"DJ",
    "DOM":"DO","ECU":"EC","EGY":"EG","SLV":"SV","GNQ":"GQ","ERI":"ER","EST":"EE","ETH":"ET",
    "FJI":"FJ","FIN":"FI","FRA":"FR","GAB":"GA","GMB":"GM","GEO":"GE","DEU":"DE","GHA":"GH",
    "GRC":"GR","GTM":"GT","GIN":"GN","GNB":"GW","GUY":"GY","HTI":"HT","HND":"HN","HUN":"HU",
    "ISL":"IS","IND":"IN","IDN":"ID","IRN":"IR","IRQ":"IQ","IRL":"IE","ISR":"IL","ITA":"IT",
    "JAM":"JM","JPN":"JP","JOR":"JO","KAZ":"KZ","KEN":"KE","PRK":"KP","KOR":"KR","KWT":"KW",
    "KGZ":"KG","LAO":"LA","LVA":"LV","LBN":"LB","LSO":"LS","LBR":"LR","LBY":"LY","LIE":"LI",
    "LTU":"LT","LUX":"LU","MKD":"MK","MDG":"MG","MWI":"MW","MYS":"MY","MDV":"MV","MLI":"ML",
    "MLT":"MT","MRT":"MR","MUS":"MU","MEX":"MX","MDA":"MD","MCO":"MC","MNG":"MN","MNE":"ME",
    "MAR":"MA","MOZ":"MZ","MMR":"MM","NAM":"NA","NPL":"NP","NLD":"NL","NZL":"NZ","NIC":"NI",
    "NER":"NE","NGA":"NG","NOR":"NO","OMN":"OM","PAK":"PK","PAN":"PA","PNG":"PG","PRY":"PY",
    "PER":"PE","PHL":"PH","POL":"PL","PRT":"PT","QAT":"QA","ROU":"RO","RUS":"RU","RWA":"RW",
    "SAU":"SA","SEN":"SN","SRB":"RS","SLE":"SL","SVK":"SK","SVN":"SI","SOM":"SO","ZAF":"ZA",
    "SSD":"SS","ESP":"ES","LKA":"LK","SDN":"SD","SUR":"SR","SWZ":"SZ","SWE":"SE","CHE":"CH",
    "SYR":"SY","TWN":"TW","TJK":"TJ","TZA":"TZ","THA":"TH","TLS":"TL","TGO":"TG","TTO":"TT",
    "TUN":"TN","TUR":"TR","TKM":"TM","UGA":"UG","UKR":"UA","ARE":"AE","GBR":"GB","USA":"US",
    "URY":"UY","UZB":"UZ","VEN":"VE","VNM":"VN","YEM":"YE","ZMB":"ZM","ZWE":"ZW",
    "KSV":"XK","PSE":"PS","SGP":"SG","HKG":"HK","MAC":"MO","MHL":"MH","FSM":"FM",
    "NRU":"NR","PLW":"PW","WSM":"WS","TON":"TO","TUV":"TV","VUT":"VU","KIR":"KI",
}

# Country names from ISO2 (DataMapper /countries)
print("Fetching country names...")
raw = fetch(f"{BASE}/countries")
iso2_to_name = {k: v.get("label", k) for k, v in raw.get("countries", {}).items()}
print(f"  {len(iso2_to_name)} countries")


# ── 2. Fetch indicators ────────────────────────────────────────────────────────
series_by_ind = {}
for code in INDICATORS:
    print(f"Fetching {code}...")
    try:
        data = fetch(f"{BASE}/{code}")
        series = data.get("values", {}).get(code, {})
        series_by_ind[code] = series
        print(f"  {len(series)} series")
    except Exception as e:
        print(f"  FAILED: {e}")
        series_by_ind[code] = {}


# ── 3. Assemble per-country ────────────────────────────────────────────────────
all_iso3 = set()
for s in series_by_ind.values():
    all_iso3.update(s.keys())

output = {}
for iso3 in sorted(all_iso3):
    iso2 = ISO3_TO_ISO2.get(iso3, "")
    name = iso2_to_name.get(iso2, iso3)
    entry = {"name": name, "iso2": iso2}
    for code in INDICATORS:
        yr, val = pick_year(series_by_ind.get(code, {}).get(iso3, {}))
        if val is not None:
            entry[code] = {"v": val, "y": yr}
    output[iso3] = entry

print(f"\nAssembled {len(output)} countries")


# ── 4. Indicator metadata (without verbose info for JS) ───────────────────────
meta = {
    k: {"label": v["label"], "unit": v["unit"], "category": v["category"], "info": v["info"]}
    for k, v in INDICATORS.items()
}

lines = [
    "// Auto-generated by fetch_indicators.py",
    f"// Source: IMF DataMapper  |  Reference year: {PREFER_YEAR} (or nearest earlier)",
    f"// {len(output)} countries  |  {len(INDICATORS)} indicators",
    "",
    f"const INDICATOR_META = {json.dumps(meta, indent=2)};",
    "",
    "const COUNTRY_DATA = {",
]
items = list(output.items())
for i, (iso3, row) in enumerate(items):
    comma = "," if i < len(items) - 1 else ""
    lines.append(f'  "{iso3}": {json.dumps(row, ensure_ascii=False)}{comma}')
lines.append("};")

OUT_FILE.write_text("\n".join(lines), encoding="utf-8")
print(f"Written: {OUT_FILE}  ({OUT_FILE.stat().st_size / 1024:.1f} KB)")
print("Done.")
