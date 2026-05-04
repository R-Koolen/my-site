const ASML_DATA = {

  meta: {
    title: "ASML EUV Machine — Supply Chain & Component Map",
    description:
      "Interactive data for ASML's EUV lithography machine (NXE series). Covers the supply chain of ~5,150 suppliers, the 5 main machine subsystems, and their sub-components. Based on public filings, analyst reports, and ASML disclosures.",
    lastUpdated: "2025",
    machineModel: "NXE:3800E (EUV) / TWINSCAN NXT (DUV)",
    machinePrice: "~€350M per EUV unit",
    machineWeight: "~180 tonnes",
    components: "700,000+",
    totalSuppliers: "~5,150",
    criticalSuppliers: "~200 single-source",
    outsourcedBOM: "80–90%",
    shippingContainers: 40,
  },

  sources: [
    {
      id: "asml-annual-report",
      label: "ASML Annual Report 2023/2024",
      url: "https://www.asml.com/en/investors/annual-report",
      type: "Primary",
      notes: "Official supplier count (~5,150), BOM outsourcing figures, subsystem descriptions",
    },
    {
      id: "asml-supply-chain-story",
      label: "ASML — 6 Ingredients of a Robust Supply Chain",
      url: "https://www.asml.com/en/news/stories/2023/6-ingredients-robust-supply-chain",
      type: "Primary",
      notes: "ASML's own explanation of supplier strategy; 80% BOM figure",
    },
    {
      id: "asml-euv-story",
      label: "ASML — Making EUV: From Lab to Fab",
      url: "https://www.asml.com/en/news/stories/2022/making-euv-lab-to-fab",
      type: "Primary",
      notes: "Details on Cymer, TRUMPF, Zeiss R&D history; EUV source development",
    },
    {
      id: "entropy-capital-bom",
      label: "Entropy Capital — ASML Supply Chain & Bill of Materials Analysis",
      url: "https://entropycapital.substack.com/p/asmls-supply-chain-bill-of-materials",
      type: "Analyst",
      notes: "Forensic BOM breakdown, tariff impact analysis, Tier 1/2/3 supplier mapping",
    },
    {
      id: "trendforce-euv",
      label: "TrendForce — ASML EUV Dominance",
      url: "https://www.trendforce.com/insights/asml-euv",
      type: "Analyst",
      notes: "Supplier network >5,150, Zeiss stake acquisition, single-source risk",
    },
    {
      id: "bismarck-asml",
      label: "Bismarck Analysis — The Tradition of Knowledge Behind ASML",
      url: "https://brief.bismarckanalysis.com/p/the-tradition-of-knowledge-behind",
      type: "Analyst",
      notes: "Zeiss partnership history, Cymer acquisition rationale, Veldhoven factory",
    },
    {
      id: "works-in-progress",
      label: "Works in Progress — The World's Most Complex Machine",
      url: "https://worksinprogress.co/issue/the-worlds-most-complex-machine/",
      type: "Journalist",
      notes: "Historical context, modular design philosophy, EUV development narrative",
    },
    {
      id: "robotsops-suppliers",
      label: "RobotsOps — Complete List of ASML Suppliers",
      url: "https://www.robotsops.com/complete-list-of-all-suppliers-and-vendors-for-asml/",
      type: "Aggregator",
      notes: "Comprehensive supplier list with roles",
    },
    {
      id: "seeking-alpha-asml",
      label: "Seeking Alpha — ASML: The Key Bottleneck in the Global Semiconductor Supply Chain",
      url: "https://seekingalpha.com/article/4769571-asml-the-key-bottleneck-in-the-global-semiconductor-supply-chain",
      type: "Analyst",
      notes: "Market share, EUV monopoly, DUV dominance (~90%), foundry capex share",
    },
    {
      id: "fraunhofer-euv",
      label: "Fraunhofer Institute — EUV Mirror Development",
      url: "https://www.fraunhofer.de/en/press/research-news/2020/september/deutscher-zukunftspreis-2020-euv-developers-from-trumpf-zeiss-and-fraunhofer-nominated.html",
      type: "Primary",
      notes: "Details on Zeiss/TRUMPF/Fraunhofer mirror and laser development for EUV",
    },
    {
      id: "sec-conflict-minerals",
      label: "ASML Form SD — Conflict Minerals Report 2024",
      url: "https://www.sec.gov/Archives/edgar/data/0000937966/000162828025028043/a2024conflictmineralsreport.htm",
      type: "Primary / SEC Filing",
      notes: "Multi-tier supplier structure, raw material sourcing disclosure",
    },
    {
      id: "quartr-asml",
      label: "Quartr — ASML: Architecting Earth's Most Complex Machines",
      url: "https://quartr.com/insights/edge/asml-architecting-earths-most-complex-machines",
      type: "Analyst",
      notes: "700,000+ components figure, 80% COGS from external suppliers, assembly model",
    },
  ],

  // ─────────────────────────────────────────────
  // SUPPLY CHAIN: Tier-1 Suppliers
  // ─────────────────────────────────────────────
  suppliers: [
    {
      id: "zeiss",
      name: "Carl Zeiss SMT",
      country: "Germany",
      city: "Oberkochen",
      category: "optics",
      categoryLabel: "Optics",
      ownership: "Strategic partner (ASML owns 24.9% of Zeiss SMT since 2016)",
      investmentAmount: "€1 billion (2016 stake acquisition)",
      components: [
        "EUV multi-layer mirrors (6 per machine)",
        "DUV lens systems",
        "Illuminator optics",
        "Collector mirror coatings (Mo/Si multilayer)",
        "Projection optics box (POB)",
      ],
      description:
        "Carl Zeiss SMT is ASML's most critical and longest-standing supplier, providing the precision optics that are the heart of every lithography machine. For EUV, Zeiss developed the world's most precise mirrors — polished to sub-atomic smoothness (surface roughness below 0.05 nm, 1,000× smoother than a standard mirror). ASML and Zeiss describe themselves as 'two companies, one business.' The relationship dates to ASML's founding in 1984. ASML acquired a 24.9% stake in the Zeiss semiconductor unit in 2016 for €1 billion to co-invest in EUV R&D.",
      keyFact:
        "EUV mirror accuracy is smaller than the diameter of a single silicon atom. Zeiss is the only company in the world capable of producing them.",
      geopoliticalRisk: "High — sole source, Germany-based, subject to export controls",
      sources: ["trendforce-euv", "bismarck-asml", "entropy-capital-bom", "fraunhofer-euv"],
    },
    {
      id: "trumpf",
      name: "TRUMPF GmbH + Co. KG",
      country: "Germany",
      city: "Ditzingen",
      category: "laser",
      categoryLabel: "Laser & light source",
      ownership: "Independent (privately held)",
      components: [
        "CO₂ pre-pulse laser module",
        "CO₂ main pulse laser module (50 kHz, ~20 mJ per pulse)",
      ],
      description:
        "TRUMPF supplies the CO₂ drive laser that generates the EUV light. The laser fires at 50,000 pulses per second and is the most powerful pulsed industrial laser in the world. A pre-pulse first flattens each tin droplet into a disk; the main pulse then vaporizes it into a plasma that emits EUV radiation. TRUMPF executives have stated that only TRUMPF can build these lasers — there is no alternative supplier. The laser technology took decades of R&D in collaboration with ASML and the Fraunhofer Institute.",
      keyFact:
        "TRUMPF is the sole supplier of this laser globally. Without it, no EUV machine can be made.",
      geopoliticalRisk: "Critical — sole source, Germany-based",
      sources: ["entropy-capital-bom", "asml-euv-story", "fraunhofer-euv", "bismarck-asml"],
    },
    {
      id: "cymer",
      name: "Cymer (ASML subsidiary)",
      country: "USA",
      city: "San Diego, California",
      category: "laser",
      categoryLabel: "Laser & light source",
      ownership: "ASML subsidiary (acquired 2012 for $2.5B)",
      acquisitionAmount: "$2.5 billion (2012–2013)",
      components: [
        "EUV light source vessel",
        "Tin droplet generator (50,000 drops/sec)",
        "Excimer laser modules for DUV (193 nm ArF)",
        "EUV source control systems",
      ],
      description:
        "Cymer was acquired by ASML in 2012 for $2.5 billion specifically to maintain control over EUV light source development and accelerate its commercialization. Based in San Diego, Cymer designs the EUV source vessel that houses the tin plasma process. It also produces excimer laser light sources for ASML's DUV machines. The EUV source — roughly the size of a small car — is one of the most complex engineered objects ever built.",
      keyFact:
        "The EUV source fires 50,000 molten tin droplets per second, each ~30 µm in diameter, and vaporizes them with a laser to produce EUV light.",
      geopoliticalRisk: "Medium — US-based, subject to US export controls",
      sources: ["bismarck-asml", "asml-euv-story", "entropy-capital-bom"],
    },
    {
      id: "gigaphoton",
      name: "Gigaphoton",
      country: "Japan",
      city: "Oyama, Tochigi",
      category: "laser",
      categoryLabel: "Laser & light source",
      ownership: "Independent (joint venture of Komatsu and Ushio)",
      components: [
        "Alternative excimer laser modules for DUV lithography",
      ],
      description:
        "Gigaphoton is an alternative excimer laser supplier for ASML's DUV lithography systems, primarily used by Japanese chipmakers. It provides 193 nm ArF and 248 nm KrF excimer laser light sources. It serves as a secondary option to Cymer for DUV tools, providing some supply redundancy in that segment.",
      keyFact:
        "Alternative to Cymer for DUV laser sources; used mainly by Japanese semiconductor manufacturers.",
      geopoliticalRisk: "Low-medium — Japan-based, adds supply redundancy for DUV",
      sources: ["entropy-capital-bom", "robotsops-suppliers"],
    },
    {
      id: "vdl",
      name: "VDL Enabling Technologies Group (ETG)",
      country: "Netherlands",
      city: "Eindhoven",
      category: "mechanical",
      categoryLabel: "Mechanical & structural",
      ownership: "VDL Group (independent, privately held)",
      components: [
        "Machine undertray / main frame",
        "Wafer stage mechanical assemblies",
        "Reticle handler modules",
        "High-precision structural modules",
      ],
      description:
        "VDL ETG is one of ASML's largest Dutch suppliers and produces the structural chassis of the EUV machine — the undertray that everything else is built upon. VDL specializes in high-precision mechatronics and module manufacturing. The frames are produced at large scale and shipped in sections to Veldhoven for assembly. VDL is a cornerstone of the Dutch high-tech manufacturing ecosystem that has grown up around ASML.",
      keyFact:
        "The machine undertray produced by VDL ETG weighs several tonnes and must maintain structural rigidity at the nanometer level.",
      geopoliticalRisk: "Low — Netherlands-based, within the same ecosystem as ASML",
      sources: ["robotsops-suppliers", "entropy-capital-bom"],
    },
    {
      id: "prodrive",
      name: "Prodrive Technologies",
      country: "Netherlands",
      city: "Son en Breugel",
      category: "mechanical",
      categoryLabel: "Mechanical & structural",
      ownership: "Independent",
      components: [
        "Precision motion systems",
        "Electromagnetic actuators for wafer/reticle stages",
        "Power electronics for stage drives",
      ],
      description:
        "Prodrive Technologies supplies advanced mechatronics and motion control systems for ASML's wafer and reticle stages. Their electromagnetic linear motors and precision positioning systems are integral to achieving the sub-nanometer stage accuracy that EUV lithography demands.",
      keyFact:
        "Prodrive's actuators enable stage positioning with nanometer accuracy while moving at speeds of up to 2 m/s.",
      geopoliticalRisk: "Low — Netherlands-based",
      sources: ["robotsops-suppliers", "entropy-capital-bom"],
    },
    {
      id: "corning",
      name: "Corning",
      country: "USA",
      city: "Corning, New York",
      category: "mechanical",
      categoryLabel: "Mechanical & structural",
      ownership: "Public (NYSE: GLW)",
      components: [
        "Ultra-Low Expansion (ULE) glass for mirror substrates",
      ],
      description:
        "Corning produces Ultra-Low Expansion (ULE) titanium silicate glass, which is used as the substrate material for EUV mirrors. ULE glass expands almost negligibly with temperature changes — a critical property when mirror position must remain stable to sub-nanometer accuracy during machine operation.",
      keyFact:
        "ULE glass has a coefficient of thermal expansion near zero (0 ± 30 ppb/°C), essential for EUV mirror substrates.",
      geopoliticalRisk: "Medium — US-based, potentially subject to US tariffs",
      sources: ["entropy-capital-bom"],
    },
    {
      id: "edwards",
      name: "Edwards Vacuum",
      country: "United Kingdom",
      city: "Burgess Hill, West Sussex",
      category: "vacuum",
      categoryLabel: "Vacuum systems",
      ownership: "Atlas Copco subsidiary",
      components: [
        "Turbomolecular vacuum pumps",
        "Dry vacuum pumps (backing pumps)",
        "Abatement systems for process gases",
      ],
      description:
        "Edwards Vacuum provides the vacuum and abatement solutions essential for EUV lithography. Because EUV light (13.5 nm) is absorbed by air within millimeters at atmospheric pressure, the entire optical path from source to wafer must operate in near-perfect vacuum (down to 10⁻⁸ mbar). Edwards pumps create and maintain these extreme vacuum conditions throughout the machine.",
      keyFact:
        "EUV light would travel less than 1 mm in air before being completely absorbed — vacuum is non-negotiable.",
      geopoliticalRisk: "Low-medium — UK-based",
      sources: ["robotsops-suppliers", "entropy-capital-bom"],
    },
    {
      id: "pfeiffer",
      name: "Pfeiffer Vacuum Technology AG",
      country: "Germany",
      city: "Asslar",
      category: "vacuum",
      categoryLabel: "Vacuum systems",
      ownership: "Public (Frankfurt: PFV), majority owned by Busch Group",
      components: [
        "Turbomolecular pumps",
        "Vacuum gauges and measurement instruments",
        "Leak detection systems",
      ],
      description:
        "Pfeiffer Vacuum supplies turbomolecular pumps and vacuum measurement equipment used throughout the EUV machine's multiple vacuum stages. Different sections of the machine operate at different vacuum levels, requiring a range of pump types and precision measurement instruments.",
      keyFact:
        "Multiple vacuum stages in a single EUV machine require pumps that can span from rough vacuum (1 mbar) to ultra-high vacuum (10⁻⁸ mbar).",
      geopoliticalRisk: "Low — Germany-based",
      sources: ["robotsops-suppliers"],
    },
    {
      id: "neways",
      name: "Neways Electronics International",
      country: "Netherlands",
      city: "Son en Breugel",
      category: "electronics",
      categoryLabel: "Electronics & power",
      ownership: "Public (Euronext Amsterdam: NEWAY)",
      components: [
        "Electrical control units (ECUs)",
        "Power control modules",
        "Printed circuit board assemblies",
        "Wiring harness systems",
      ],
      description:
        "Neways Electronics is one of ASML's key Dutch electronics suppliers, producing the electrical control units, power electronics, and wiring systems that run throughout the machine. These components coordinate the real-time control of hundreds of actuators, sensors, and subsystems operating simultaneously.",
      keyFact:
        "ASML is one of Neways' largest customers, representing a significant portion of their revenue.",
      geopoliticalRisk: "Low — Netherlands-based",
      sources: ["robotsops-suppliers", "entropy-capital-bom"],
    },
    {
      id: "mks",
      name: "MKS Instruments",
      country: "USA",
      city: "Andover, Massachusetts",
      category: "electronics",
      categoryLabel: "Electronics & power",
      ownership: "Public (NASDAQ: MKSI)",
      components: [
        "Gas flow controllers and pressure sensors",
        "Power delivery systems for plasma processes",
        "Gas control manifolds for hydrogen supply",
      ],
      description:
        "MKS Instruments provides gas and pressure control systems critical for the EUV source. The hydrogen gas flow that mitigates tin debris around the collector mirror, the nitrogen purge systems, and various process gas controls are all managed by MKS equipment. Precision gas flow control directly impacts EUV source efficiency and collector mirror lifetime.",
      keyFact:
        "MKS gas controllers regulate the hydrogen flow that extends collector mirror lifetime by chemically removing tin debris.",
      geopoliticalRisk: "Medium — US-based, subject to US export controls",
      sources: ["robotsops-suppliers", "entropy-capital-bom"],
    },
    {
      id: "brion",
      name: "Brion Technologies (ASML subsidiary)",
      country: "USA",
      city: "Santa Clara, California",
      category: "software",
      categoryLabel: "Software & IP",
      ownership: "ASML subsidiary (acquired 2007)",
      components: [
        "Optical proximity correction (OPC) software",
        "Resolution enhancement technology (RET) tools",
        "Computational lithography simulation software",
      ],
      description:
        "Brion Technologies, acquired by ASML in 2007, provides the computational lithography software that chipmakers use to prepare mask patterns before they are manufactured. OPC software pre-distorts the circuit patterns on the mask to compensate for diffraction and optical effects during exposure, ensuring the final printed pattern matches the desired design. Brion dominates this software market.",
      keyFact:
        "Without OPC software, modern chip patterns could not be printed accurately — diffraction effects at EUV wavelengths would produce a blurred, unusable image.",
      geopoliticalRisk: "Low — US-based ASML subsidiary",
      sources: ["bismarck-asml", "entropy-capital-bom"],
    },
    {
      id: "hmi",
      name: "Hermes Microvision (HMI)",
      country: "Taiwan",
      city: "Hsinchu",
      category: "software",
      categoryLabel: "Software & IP",
      ownership: "ASML subsidiary (acquired 2016 for $3.1B)",
      acquisitionAmount: "$3.1 billion (2016)",
      components: [
        "e-beam wafer inspection systems",
        "Electron-beam review tools",
        "In-line defect monitoring systems",
      ],
      description:
        "Hermes Microvision was acquired by ASML in 2016 for $3.1 billion. HMI produces electron beam inspection tools that chipmakers use to verify chip layer quality during and after lithography. These tools detect defects at the nanometer scale and feed data back into the process control loop, helping chipmakers maximize yield. HMI's tools are complementary to the ASML scanner.",
      keyFact:
        "e-beam inspection by HMI can detect individual missing or extra atoms in a chip pattern — essential for sub-3nm process nodes.",
      geopoliticalRisk: "Medium — Taiwan-based",
      sources: ["bismarck-asml", "entropy-capital-bom"],
    },
    {
      id: "berliner-glas",
      name: "Berliner Glas",
      country: "Germany",
      city: "Berlin",
      category: "optics",
      categoryLabel: "Optics",
      ownership: "ASML subsidiary (acquired 2020)",
      components: [
        "Specialized optical glass components",
        "Mirror substrates and carriers",
        "Ultra-flat glass wafer carriers for stage",
      ],
      description:
        "Berliner Glas produces highly specialized optical glass components used throughout ASML's machines. This includes mirror substrates and the ultra-flat glass carriers used in the wafer stage. ASML acquired Berliner Glas in 2020 to secure this critical supply. Their manufacturing involves grinding and polishing glass to extreme flatness tolerances.",
      keyFact:
        "Berliner Glas was fully acquired by ASML in 2020, making it a wholly-owned subsidiary.",
      geopoliticalRisk: "Low — Germany-based ASML subsidiary",
      sources: ["entropy-capital-bom", "robotsops-suppliers"],
    },
    {
      id: "schott",
      name: "Schott AG",
      country: "Germany",
      city: "Mainz",
      category: "optics",
      categoryLabel: "Optics",
      ownership: "Non-profit foundation (Carl Zeiss Foundation)",
      components: [
        "Purified optical glass for DUV lenses",
        "Calcium fluoride (CaF₂) crystals for 193 nm DUV optics",
        "Specialty glass for optical components",
      ],
      description:
        "Schott AG supplies the high-purity optical glass and calcium fluoride crystals used in DUV lens systems. CaF₂ is one of the few materials transparent at 193 nm ArF excimer laser wavelengths. Schott grows large CaF₂ crystals to extremely high purity standards required for ASML's DUV lenses.",
      keyFact:
        "Calcium fluoride crystals for DUV lenses must be grown to sizes of 30+ cm and purity levels of parts-per-billion — a process taking months.",
      geopoliticalRisk: "Low — Germany-based",
      sources: ["entropy-capital-bom"],
    },
  ],

  // ─────────────────────────────────────────────
  // MACHINE COMPONENTS: Main Subsystems & Sub-components
  // ─────────────────────────────────────────────
  subsystems: [
    {
      id: "euv-source",
      name: "EUV light source",
      shortName: "EUV source",
      category: "euv-source",
      color: "#BA7517",
      colorLight: "#FAEEDA",
      description:
        "The EUV light source generates 13.5 nm extreme ultraviolet light through laser-produced plasma (LPP). It is the most complex subsystem in the machine — roughly the size of a small car — and must deliver 250W+ of EUV power to enable high-throughput wafer exposure. The entire source module is largely assembled in the USA (Cymer, San Diego) before integration at Veldhoven.",
      keyFact:
        "The EUV source fires 50,000 molten tin droplets per second and vaporizes each one with a laser pulse to create plasma that emits EUV light.",
      keySuppliers: ["cymer", "trumpf", "zeiss", "mks"],
      sources: ["asml-euv-story", "entropy-capital-bom", "trendforce-euv"],
      subcomponents: [
        {
          id: "co2-prepulse",
          name: "CO₂ pre-pulse laser",
          supplier: "TRUMPF",
          supplierCountry: "Germany",
          description:
            "A lower-energy CO₂ laser pre-pulse hits each tin droplet first, flattening it from a sphere (~30 µm) into a thin disk (~300 µm diameter). This dramatically increases the surface area exposed to the main pulse, maximizing EUV conversion efficiency. Pre-pulse and main pulse are precisely timed at 50,000 events per second.",
          keySpec: "Timing precision: sub-nanosecond; flattens droplet to ~300 µm disk",
          sources: ["entropy-capital-bom", "fraunhofer-euv"],
        },
        {
          id: "co2-mainpulse",
          name: "CO₂ main pulse laser",
          supplier: "TRUMPF",
          supplierCountry: "Germany",
          description:
            "The primary high-power CO₂ laser pulse (~20 mJ, 50 kHz repetition rate) vaporizes the flattened tin disk, heating it to plasma temperatures (>200,000 K). This plasma emits photons at 13.5 nm — the EUV wavelength used for lithography. This is the most powerful pulsed industrial CO₂ laser in the world, with no commercial alternative.",
          keySpec: "~20 mJ per pulse · 50,000 Hz · ~500 W average power output",
          sources: ["entropy-capital-bom", "fraunhofer-euv"],
        },
        {
          id: "droplet-generator",
          name: "Tin droplet generator",
          supplier: "Cymer (ASML)",
          supplierCountry: "USA",
          description:
            "The droplet generator produces a continuous stream of 50,000 molten tin (Sn) droplets per second at precise intervals. Each droplet is approximately 30 µm in diameter. The timing accuracy of each droplet relative to the laser pulse is critical — a mistimed droplet wastes laser energy and reduces EUV power output. Raw tin is sourced from global mining operations (Indonesia, Malaysia, China, Bolivia).",
          keySpec: "50,000 droplets/sec · ~30 µm diameter · molten tin at ~232°C+",
          sources: ["asml-euv-story", "entropy-capital-bom"],
        },
        {
          id: "collector-mirror",
          name: "Ellipsoidal collector mirror",
          supplier: "Zeiss / Cymer",
          supplierCountry: "Germany / USA",
          description:
            "The collector mirror is an ellipsoidal reflector that captures EUV photons emitted from the tin plasma in a wide solid angle and focuses them into the illuminator. It is coated with molybdenum/silicon (Mo/Si) multilayer reflective coatings by Zeiss. Because tin debris continuously deposits on the mirror surface, it has a limited operational lifetime and must be periodically replaced. The hydrogen gas flow system (see H₂ debris mitigation) extends its life.",
          keySpec: "Mo/Si multilayer coating · ellipsoidal geometry · limited lifetime due to Sn contamination",
          sources: ["entropy-capital-bom", "fraunhofer-euv"],
        },
        {
          id: "h2-debris",
          name: "H₂ debris mitigation system",
          supplier: "MKS Instruments + industrial gas suppliers",
          supplierCountry: "USA / various",
          description:
            "Hydrogen gas is continuously flowed through the source chamber around the collector mirror. Hydrogen reacts with tin debris (Sn) deposited on optical surfaces, forming tin hydride gas (SnH₄), which is then removed by the vacuum pumping system. This process extends collector mirror lifetime from days to months. The hydrogen supply itself is a Tier-2 dependency, with specialized industrial gas companies providing semiconductor-grade H₂.",
          keySpec: "Continuous H₂ flow · forms volatile SnH₄ · 10–20× mirror lifetime extension",
          sources: ["entropy-capital-bom"],
        },
      ],
    },

    {
      id: "optical-system",
      name: "Optical system (projection optics)",
      shortName: "Optics",
      category: "optics",
      color: "#534AB7",
      colorLight: "#EEEDFE",
      description:
        "The optical system shapes, guides, and focuses the EUV beam from the source through the photomask (reticle) and onto the silicon wafer. All optics are reflective mirrors — no lenses exist for 13.5 nm EUV wavelengths. Each mirror absorbs ~30% of incident EUV light, so the overall optical efficiency from source to wafer is only ~1–2%. Every mirror surface must be polished to below 0.05 nm RMS roughness — the most precise manufactured objects on Earth. Carl Zeiss SMT is the sole supplier.",
      keyFact:
        "EUV mirrors must be polished to 0.05 nm surface roughness — about 1,000× smoother than an ordinary mirror and smoother than a single atomic layer.",
      keySuppliers: ["zeiss", "berliner-glas", "schott", "corning"],
      sources: ["trendforce-euv", "entropy-capital-bom", "fraunhofer-euv"],
      subcomponents: [
        {
          id: "illuminator",
          name: "Illuminator (beam shaping optics)",
          supplier: "Carl Zeiss SMT",
          supplierCountry: "Germany",
          description:
            "The illuminator consists of a series of EUV mirrors (field facet mirror and pupil facet mirror) that homogenize and shape the EUV beam into a uniform, well-defined illumination field before it reaches the reticle. It controls the angular distribution of the light (the illumination mode: dipole, annular, quadrupole), which affects the resolution and depth of focus of the printed pattern.",
          keySpec: "Controls illumination mode · field and pupil facet mirrors · Zeiss sole supplier",
          sources: ["entropy-capital-bom", "fraunhofer-euv"],
        },
        {
          id: "reticle-mask",
          name: "Reticle (EUV photomask)",
          supplier: "Hoya, Toppan, DNP (mask shops)",
          supplierCountry: "Japan",
          description:
            "The EUV reticle is a reflective photomask — unlike DUV, which uses transmissive glass masks, EUV masks reflect the light. They are built on a quartz substrate with a Mo/Si multilayer reflective coating and an absorber layer (TaN) patterned with the circuit blueprint. EUV masks are extremely expensive (>$100,000 each) and sensitive to contamination. The pellicle protects the mask surface during use.",
          keySpec: "6-inch reflective EUV mask · Mo/Si multilayer + TaN absorber · >$100k per mask",
          sources: ["entropy-capital-bom"],
        },
        {
          id: "pellicle",
          name: "EUV pellicle",
          supplier: "Asahi Kasei, Mitsui, ASML (R&D)",
          supplierCountry: "Japan / Netherlands",
          description:
            "The pellicle is an ultra-thin membrane (40–50 nm thick) stretched over the reticle to protect it from particle contamination during exposure. For EUV, the pellicle must transmit >90% of EUV light while surviving the intense radiation environment. EUV pellicles made from silicon nitride (Si₃N₄) or carbon nanotube membranes are a major ongoing R&D challenge. Not all production runs use pellicles — some chipmakers expose masks without them.",
          keySpec: "40–50 nm thick · >90% EUV transmittance · Si₃N₄ or CNT material",
          sources: ["entropy-capital-bom"],
        },
        {
          id: "pob",
          name: "Projection optics box (POB)",
          supplier: "Carl Zeiss SMT",
          supplierCountry: "Germany",
          description:
            "The POB is the most critical and complex optical assembly: six ultra-smooth aspherical mirrors mounted in a vibration-isolated, thermally controlled vacuum vessel. It demagnifies the reticle pattern by 4× and projects it onto the wafer with sub-nanometer overlay accuracy. The mirrors are mounted on kinematic mounts with active actuators that can fine-tune their position in real time. The POB alone takes Zeiss months to manufacture and calibrate.",
          keySpec: "6 aspherical mirrors · 4× demagnification · sub-nm overlay · vacuum vessel · active mounts",
          sources: ["entropy-capital-bom", "fraunhofer-euv", "trendforce-euv"],
        },
        {
          id: "mirror-coatings",
          name: "Mo/Si multilayer mirror coatings",
          supplier: "Carl Zeiss SMT + Fraunhofer IWS",
          supplierCountry: "Germany",
          description:
            "EUV mirrors cannot use conventional reflective coatings — at 13.5 nm, only multilayer interference coatings of molybdenum and silicon (Mo/Si) achieve useful reflectivity (~70% per mirror). Each mirror has ~40–50 alternating Mo/Si layers, each precisely 3.4 nm thick (one quarter-wavelength of EUV). Zeiss deposits these coatings in collaboration with the Fraunhofer Institute for laser technology (IWS) in Dresden.",
          keySpec: "~40–50 Mo/Si bilayers · each layer 3.4 nm · ~67–70% reflectivity per mirror",
          sources: ["fraunhofer-euv", "entropy-capital-bom"],
        },
      ],
    },

    {
      id: "stage-system",
      name: "Stage system (wafer & reticle)",
      shortName: "Stage system",
      category: "stage",
      color: "#0F6E56",
      colorLight: "#E1F5EE",
      description:
        "The stage system positions the silicon wafer and the photomask (reticle) with sub-nanometer precision while both move at high speed during scanning exposure. The wafer stage moves at up to 2 m/s; the reticle stage at 4× that speed (because of the 4× optical demagnification). Achieving nanometer positioning accuracy at meter-per-second speeds is one of the defining engineering challenges of lithography — the equivalent of parking a car to within the width of a human hair at 100 km/h.",
      keyFact:
        "The wafer and reticle stages must maintain relative positioning accuracy below 1 nm while accelerating at 10–20 m/s² — one of the most demanding motion control problems in engineering.",
      keySuppliers: ["vdl", "prodrive", "neways"],
      sources: ["entropy-capital-bom", "robotsops-suppliers"],
      subcomponents: [
        {
          id: "wafer-stage",
          name: "Wafer stage",
          supplier: "VDL ETG / Prodrive Technologies",
          supplierCountry: "Netherlands",
          description:
            "The wafer stage holds and moves the silicon wafer across the exposure field. It uses a two-stage architecture: a long-stroke stage for coarse positioning across the full wafer (300 mm diameter) and a short-stroke stage for fine nm-level positioning during exposure. Lorentz-force electromagnetic linear motors drive the stage. The stage floats on a thin air bearing or operates in vacuum with magnetic levitation for the most advanced machines.",
          keySpec: "Speed: 0–2 m/s · Acceleration: 10–20 m/s² · Position accuracy: <1 nm",
          sources: ["entropy-capital-bom"],
        },
        {
          id: "reticle-stage",
          name: "Reticle stage",
          supplier: "VDL ETG / ASML in-house",
          supplierCountry: "Netherlands",
          description:
            "The reticle stage holds the 6-inch EUV photomask and moves it synchronously with the wafer stage. Because the optics demagnify by 4×, the reticle stage must move at exactly 4× the speed of the wafer stage while maintaining sub-nm relative positioning. It operates in vacuum to avoid EUV absorption. Precise synchronization of wafer and reticle stages is critical for pattern placement accuracy.",
          keySpec: "4× wafer stage speed · sub-nm synchronization · vacuum operation",
          sources: ["entropy-capital-bom"],
        },
        {
          id: "metrology-sensors",
          name: "Metrology & alignment sensors",
          supplier: "ASML in-house + Zygo (USA)",
          supplierCountry: "Netherlands / USA",
          description:
            "Laser interferometers and optical encoders continuously measure stage positions at kHz update rates. Alignment sensors detect alignment marks on the wafer to register each new layer to previous ones. The metrology system feeds position data into the servo control loop, which corrects errors in real time. ASML's YieldStar tool provides advanced diffraction-based overlay metrology for post-exposure verification.",
          keySpec: "Position measurement at kHz · overlay metrology to <1 nm · real-time feedback",
          sources: ["entropy-capital-bom"],
        },
        {
          id: "em-actuators",
          name: "Electromagnetic (Lorentz) actuators",
          supplier: "Prodrive Technologies / ASML in-house",
          supplierCountry: "Netherlands",
          description:
            "Lorentz-force linear motors provide the fine positioning force for both stages. These electromagnetic actuators have no mechanical contact (unlike ball-screw drives), eliminating friction, backlash, and wear. They allow precise force control at high bandwidth. The actuators must generate large forces (hundreds of Newtons) while being controlled to nanometer-level displacement.",
          keySpec: "Contactless · high bandwidth · hundreds of Newtons force · nm displacement control",
          sources: ["entropy-capital-bom"],
        },
      ],
    },

    {
      id: "frame-vacuum",
      name: "Frame, vacuum & thermal systems",
      shortName: "Frame & vacuum",
      category: "frame",
      color: "#993C1D",
      colorLight: "#FAECE7",
      description:
        "The frame, vacuum, and thermal systems create the physical environment in which nanometer-precision operations can occur. The machine frame provides structural rigidity and active vibration isolation. The vacuum system removes air from the EUV optical path (EUV is absorbed by air within millimeters). Thermal management maintains temperature stability to millikelvin levels, preventing thermal expansion from disrupting nanometer-scale alignment. The full machine ships in 40 freight containers and takes months to install and calibrate on-site at chipmakers' fabs.",
      keyFact:
        "EUV light is absorbed in <1 mm of air. The entire 180-tonne machine's optical path must operate in near-perfect vacuum (10⁻⁸ mbar).",
      keySuppliers: ["vdl", "edwards", "pfeiffer"],
      sources: ["entropy-capital-bom", "quartr-asml"],
      subcomponents: [
        {
          id: "machine-frame",
          name: "Machine frame (undertray)",
          supplier: "VDL Enabling Technologies Group",
          supplierCountry: "Netherlands",
          description:
            "The machine frame — sometimes called the undertray — is the structural backbone of the EUV machine. It is manufactured by VDL ETG in Eindhoven and shipped in sections to ASML's Veldhoven factory. The frame includes active vibration isolation mounts: pneumatic or electromagnetic isolators that detect and cancel floor vibrations in real time. Without this isolation, even footsteps in the factory could blur the EUV exposure pattern.",
          keySpec: "Active vibration isolation · pneumatic/EM mounts · multi-tonne structure",
          sources: ["entropy-capital-bom", "robotsops-suppliers"],
        },
        {
          id: "vacuum-vessel",
          name: "Vacuum vessel & chambers",
          supplier: "ASML in-house / VDL ETG",
          supplierCountry: "Netherlands",
          description:
            "The entire EUV optical path — from the source through the illuminator, past the reticle, through the projection optics, and down to the wafer — is enclosed in interconnected vacuum chambers. Different sections operate at different pressures: the source region (10⁻² mbar with H₂ flow), the optical path (10⁻⁶ mbar), and the projection optics (10⁻⁸ mbar or better). Airlocks allow wafer and reticle loading without breaking vacuum.",
          keySpec: "Multiple chambers · 10⁻² to 10⁻⁸ mbar gradient · airlock wafer loading",
          sources: ["entropy-capital-bom"],
        },
        {
          id: "vacuum-pumps",
          name: "Vacuum pumps",
          supplier: "Edwards Vacuum + Pfeiffer Vacuum",
          supplierCountry: "UK / Germany",
          description:
            "Multiple vacuum pump stages are required: roughing/dry pumps bring the chamber from atmospheric pressure to ~1 mbar; turbomolecular pumps then achieve high vacuum (10⁻⁶ to 10⁻⁸ mbar). Edwards Vacuum provides dry vacuum pumps and abatement systems; Pfeiffer provides turbomolecular pumps and vacuum gauges. The pumping systems must run reliably 24/7, as venting and re-pumping the chambers takes many hours.",
          keySpec: "Dry + turbo pump stages · 24/7 operation · atm → 10⁻⁸ mbar",
          sources: ["robotsops-suppliers", "entropy-capital-bom"],
        },
        {
          id: "thermal-control",
          name: "Thermal management system",
          supplier: "ASML in-house + specialized HVAC partners",
          supplierCountry: "Netherlands",
          description:
            "Temperature stability is critical throughout the EUV machine. A 1°C change in temperature would cause a steel beam to expand by ~11 µm — vastly larger than the sub-nm tolerances required. Water cooling loops run through all major structural components. Active thermal control uses heaters and coolers to maintain temperatures to millikelvin (0.001°C) stability. The machine also requires a precisely temperature-controlled cleanroom environment.",
          keySpec: "mK (0.001°C) temperature stability · water cooling loops · active thermal actuators",
          sources: ["entropy-capital-bom"],
        },
        {
          id: "cleanroom-interface",
          name: "Cleanroom interface & FOUP handling",
          supplier: "ASML in-house + robotics suppliers",
          supplierCountry: "Netherlands / USA",
          description:
            "The front-end module of the EUV machine interfaces with the chipmaker's cleanroom infrastructure. Wafer-handling robots load and unload silicon wafers from standardized 300mm FOUP (Front Opening Unified Pod) containers without exposing them to contamination. The system connects to the fab's automated material handling system (AMHS) and operates 24/7 in cleanroom environments of ISO class 1–3.",
          keySpec: "300mm FOUP handling · ISO class 1–3 cleanroom · 24/7 automated operation",
          sources: ["entropy-capital-bom"],
        },
      ],
    },

    {
      id: "control-software",
      name: "Control systems & software",
      shortName: "Control & software",
      category: "control",
      color: "#993556",
      colorLight: "#FBEAF0",
      description:
        "The control and software systems are the nervous system of the EUV machine — coordinating thousands of actuators, sensors, and subsystems in real time. ASML employs approximately 5,000 software engineers. The software stack runs multiple time-critical control loops simultaneously: stage motion control (kHz), dose and focus adjustment (Hz to kHz), alignment (per wafer), and yield analysis (per lot). The overall system intelligence is what allows ASML machines to achieve >95% uptime in high-volume manufacturing.",
      keyFact:
        "ASML employs ~5,000 software engineers. The machine's software is as critical to performance as its hardware — and arguably harder to replicate.",
      keySuppliers: ["brion", "hmi", "neways", "mks"],
      sources: ["entropy-capital-bom", "quartr-asml"],
      subcomponents: [
        {
          id: "motion-control",
          name: "Real-time motion control",
          supplier: "ASML in-house + Neways Electronics",
          supplierCountry: "Netherlands",
          description:
            "Real-time servo controllers manage the wafer and reticle stages at kHz update rates. The control algorithms predict and compensate for vibration, stage dynamics, cable drag, and thermal drift. Model-based feedforward control, combined with high-bandwidth feedback from the metrology system, achieves the sub-nm positioning accuracy required. The electronics hardware (DSPs, FPGAs, power amplifiers) are largely supplied by Neways.",
          keySpec: "kHz update rate · feedforward + feedback control · DSP/FPGA implementation",
          sources: ["entropy-capital-bom", "robotsops-suppliers"],
        },
        {
          id: "computational-litho",
          name: "Computational lithography (OPC/RET)",
          supplier: "Brion Technologies (ASML subsidiary)",
          supplierCountry: "USA",
          description:
            "Optical proximity correction (OPC) software pre-distorts mask patterns before mask manufacturing to compensate for diffraction and process effects during exposure. Without OPC, the printed chip patterns would be blurred and unusable at modern feature sizes. Resolution enhancement technology (RET) further improves resolution using phase-shift masks and other techniques. Brion (acquired by ASML in 2007) dominates this market and its tools are used by virtually all leading chipmakers.",
          keySpec: "OPC / RET · run before mask manufacture · critical for <10nm nodes",
          sources: ["bismarck-asml", "entropy-capital-bom"],
        },
        {
          id: "dose-focus",
          name: "Dose & focus control",
          supplier: "ASML in-house",
          supplierCountry: "Netherlands",
          description:
            "The dose control system monitors and adjusts EUV energy delivered per unit area on the wafer. Dose errors of even a few percent can ruin an exposure layer. Focus sensors (aerial image sensors, through-the-lens sensors) continuously measure the focal plane and adjust the position of the wafer stage or optical elements in real time. Across a 300mm wafer, focus must be maintained to within a few nanometers.",
          keySpec: "Dose uniformity <1% · focus control to ±1–2 nm across 300mm wafer",
          sources: ["entropy-capital-bom"],
        },
        {
          id: "overlay-alignment",
          name: "Overlay & alignment system",
          supplier: "ASML in-house (YieldStar tool)",
          supplierCountry: "Netherlands",
          description:
            "Modern chips are built from 50–100 stacked layers, each printed by a separate lithography step. The overlay system ensures each new layer is aligned to the previous ones within <1 nm. The machine reads alignment marks on the wafer using diffraction-based alignment sensors. After exposure, ASML's YieldStar standalone metrology tool measures overlay accuracy and feeds corrections back into the scanner's recipe. This closed-loop overlay control is essential for yield at advanced nodes.",
          keySpec: "<1 nm overlay accuracy · diffraction-based alignment · closed-loop via YieldStar",
          sources: ["entropy-capital-bom"],
        },
        {
          id: "ebeam-inspection",
          name: "e-beam wafer inspection",
          supplier: "Hermes Microvision (ASML subsidiary)",
          supplierCountry: "Taiwan",
          description:
            "Electron beam inspection tools scan wafers for defects after each process step. HMI's e-beam tools can detect individual missing or extra atoms in a chip pattern. The inspection data feeds into process control systems to catch yield-killing defects early. HMI was acquired by ASML in 2016 for $3.1 billion to extend ASML's role from lithography equipment into the broader process control and inspection market.",
          keySpec: "Atomic-scale defect detection · 100% wafer inspection capability · $3.1B acquisition",
          sources: ["bismarck-asml", "entropy-capital-bom"],
        },
      ],
    },
  ],

  // ─────────────────────────────────────────────
  // RAW MATERIALS (Tier 3 dependencies)
  // ─────────────────────────────────────────────
  rawMaterials: [
    {
      material: "Tin (Sn)",
      use: "EUV plasma target (droplet generator)",
      primarySources: ["Indonesia", "China", "Malaysia", "Bolivia"],
      risk: "Medium — geographically concentrated but not single-source",
      notes: "High-purity tin required. Significant portion from Southeast Asia.",
    },
    {
      material: "Neon (Ne)",
      use: "Buffer gas in DUV excimer lasers (ArF, KrF)",
      primarySources: ["Ukraine (historically 45–54%)", "USA", "China"],
      risk: "High — Ukraine-Russia conflict in 2022 cut ~50% of global semiconductor-grade neon supply",
      notes: "ASML and suppliers have worked to diversify sourcing post-2022.",
    },
    {
      material: "Molybdenum (Mo)",
      use: "Mo/Si multilayer mirror coatings",
      primarySources: ["China", "USA", "Chile"],
      risk: "Medium — China dominates production; multiple global sources exist",
      notes: "Used in alternating layers with silicon for EUV mirror coatings.",
    },
    {
      material: "Neodymium (Nd)",
      use: "Permanent magnets in electromagnetic actuators and motors",
      primarySources: ["China (~85% of global supply)", "Australia", "USA"],
      risk: "High — China controls rare earth supply chains",
      notes: "Used in Lorentz-force actuators in wafer and reticle stages.",
    },
    {
      material: "Ultra-pure silicon (Si)",
      use: "Mirror substrates, wafer carriers",
      primarySources: ["Germany", "Japan", "USA"],
      risk: "Low — multiple high-quality suppliers",
      notes: "Quartz/fused silica for optics from specialized glass makers.",
    },
    {
      material: "Calcium fluoride (CaF₂)",
      use: "DUV lens elements (193 nm transparent)",
      primarySources: ["Schott (Germany)", "Nikon / Canon in-house (Japan)"],
      risk: "Medium — crystal growth is slow (months per boule), limited suppliers",
      notes: "Only material transparent at 193nm. Schott is the primary external supplier.",
    },
    {
      material: "Hydrogen (H₂)",
      use: "EUV source debris mitigation",
      primarySources: ["Industrial gas suppliers globally (Air Liquide, Linde, Air Products)"],
      risk: "Low — commodity gas with global supply",
      notes: "Semiconductor-grade purity required.",
    },
  ],

  // ─────────────────────────────────────────────
  // SUPPLIER CATEGORIES (for filtering/legend)
  // ─────────────────────────────────────────────
  categories: [
    { id: "optics",      label: "Optics",               color: "#534AB7", colorLight: "#EEEDFE" },
    { id: "laser",       label: "Laser & light source",  color: "#BA7517", colorLight: "#FAEEDA" },
    { id: "mechanical",  label: "Mechanical & structural",color: "#0F6E56", colorLight: "#E1F5EE" },
    { id: "vacuum",      label: "Vacuum systems",         color: "#993C1D", colorLight: "#FAECE7" },
    { id: "electronics", label: "Electronics & power",   color: "#185FA5", colorLight: "#E6F1FB" },
    { id: "software",    label: "Software & IP",         color: "#993556", colorLight: "#FBEAF0" },
  ],

  // ─────────────────────────────────────────────
  // HELPER METHODS (can be called directly on the object)
  // ─────────────────────────────────────────────
  helpers: {
    getSuppliersByCategory(categoryId) {
      return ASML_DATA.suppliers.filter(s => s.category === categoryId);
    },
    getSupplierById(id) {
      return ASML_DATA.suppliers.find(s => s.id === id);
    },
    getSubsystemById(id) {
      return ASML_DATA.subsystems.find(s => s.id === id);
    },
    getSubcomponentById(subsystemId, subcomponentId) {
      const sub = ASML_DATA.subsystems.find(s => s.id === subsystemId);
      if (!sub) return null;
      return sub.subcomponents.find(c => c.id === subcomponentId);
    },
    getSourceById(id) {
      return ASML_DATA.sources.find(s => s.id === id);
    },
    getSuppliersForSubsystem(subsystemId) {
      const sub = ASML_DATA.subsystems.find(s => s.id === subsystemId);
      if (!sub) return [];
      return sub.keySuppliers.map(id => ASML_DATA.suppliers.find(s => s.id === id)).filter(Boolean);
    },
    getSourcesForSupplier(supplierId) {
      const supplier = ASML_DATA.suppliers.find(s => s.id === supplierId);
      if (!supplier) return [];
      return supplier.sources.map(id => ASML_DATA.sources.find(s => s.id === id)).filter(Boolean);
    },
    getAllCountries() {
      return [...new Set(ASML_DATA.suppliers.map(s => s.country))].sort();
    },
    getSuppliersByCountry(country) {
      return ASML_DATA.suppliers.filter(s => s.country === country);
    },
  },
};

// Make available as ES module export or global
if (typeof module !== "undefined" && module.exports) {
  module.exports = ASML_DATA;
}