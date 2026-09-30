# Climate Earth mix design: research notes and a local build plan

Status: research only. No code written yet. See "Decision needed" at the bottom.

## 1. What "ClimaEarth" actually is

The company is **Climate Earth** (climateearth.com). It makes LCA/EPD software for concrete, cement
and aggregates. What it sells:

| Product | What it does |
|---|---|
| **EPD Generator / EPD Advantage Pro** | Produces per-mix Environmental Product Declarations (GWP etc.) on demand. The ready-mix generator is third-party verified through ASTM's EPD program. |
| **AI Mix Design Suite / AI Mix Design Agent** | Takes a producer's existing mix data and suggests re-proportioned mixes that hit strength and workability with less cement. They claim 5–10% cement reduction. It's trained on what they call the largest low-carbon concrete database in the world. |
| **Tarantula Curve tool** | Digital version of Tyler Ley's (Oklahoma State) combined aggregate gradation envelope. Better particle packing means less paste, and so less cement. |
| **ACI 323 parameters** | Checks mixes against ACI 323 (the low-carbon concrete code) GWP limits. |
| Integrations | Command Alkon (CommandQC, COMMANDseries), Quadrel, Stonemont, GCP. One-click EPDs straight from the batch/QC system. |

Who it's for: **ready-mix and precast concrete producers**, meaning their QC managers.

## 2. The core problem with "building it locally"

Climate Earth's value has three layers. Only the first can be rebuilt cheaply:

1. **Mix arithmetic (easy, deterministic, maybe 1–2 weeks of work).**
   - ACI 211.1 absolute-volume proportioning: target strength, w/cm, air, water demand, then SCM split,
     then aggregate volumes, then admixture dosage.
   - Combined gradation check: sum the coarse + fine sieve analyses by blend ratio, then test against Tarantula limits.
     Group limits verified so far: #8–#30 retained ≥ 15% (cohesion) and #30–#200 retained 24–34%
     (workability). **The per-sieve upper/lower limits still need to be read from Iowa DOT IM 532 or
     FHWA-HIF-15-019.** Those sources were blocked from this environment, so no numbers have been guessed here.
   - GWP per m³ = Σ (kg of ingredient × emission factor). That's a linear sum and nothing more.
2. **Strength prediction / "AI" (hard, needs data).** Suggesting a mix that will *actually* hit 28-day
   strength needs a model trained on real batches with real cylinder breaks. Climate Earth's moat is
   the dataset, not the algorithm.
3. **Verified EPDs (can't be built locally at all).** An EPD is only accepted for Buy Clean or ACI 323
   submittals if it follows the concrete PCR and is third-party verified. A GWP number computed in-house is
   an *estimate*. It can't be put in front of a specifier as an EPD.

## 3. Open-source starting point for layer 2

**BOxCrete** (Meta, MIT licence): github.com/facebookresearch/SustainableConcrete. Paper arXiv 2603.21525.

- Gaussian-process strength model. It predicts the full strength-vs-age curve with uncertainty.
- Linear GWP model, plus Bayesian multi-objective optimisation (strength vs GWP), plus a slump GP.
- Inputs: cement, fly ash, slag, water, **HRWR**, fine aggregate, coarse aggregate, temperature, age.
- The dataset is small: 123 mixes (69 mortar, 54 concrete), about 500 strength measurements, and US materials.
- Installs with `pip install git+https://github.com/facebookresearch/SustainableConcrete.git` (Python/PyTorch).

Caveat: a GP trained on someone else's cement, fly ash and aggregates won't transfer to local materials. It
is a *framework* that you would re-fit on our own trial-batch data, not a ready-made oracle.

## 4. Why this matters for *this* factory (admixture maker, not a concrete producer)

FactoryOS serves a **concrete admixture manufacturer**. We don't batch concrete. So "concrete mix
design" only makes sense in one of these roles:

- **(a) Lab R&D / trial mixes.** The lab already casts trial concrete to test admixtures. A mix-design record +
  strength-curve log in FactoryOS gives us the proprietary dataset that layer 2 needs.
- **(b) Technical sales tool.** Show a ready-mix customer: "with our PCE at X% dosage you can cut cement
  by Y kg/m³, saving Z kg CO₂e/m³ and $W." This is where Climate Earth's pitch overlaps with ours.
- **(c) Competing with Climate Earth.** Not realistic. It's a different business, with a data and verification moat.

A useful detail from BOxCrete's fitted emission factors: HRWR is about **3.1–3.2 kg CO₂e per kg**. Cement is about
0.76. Our product *adds* carbon per kg but *removes* much more by cutting cement. Proving that net saving needs
**our own product EPDs** (industry-average admixture EPDs exist, e.g. from EFCA). Our customers' EPD tools
(Climate Earth included) need that factor as an input. That may be worth more than any mix-design screen.

## 5. Proposed local build (only if (a) or (b) is confirmed)

Phase 1 (fits the current React/Vite + local db architecture, no ML):
- `MixDesign` entity: materials (kg/m³), admixture product + dosage (linked to existing `Product`), target
  strength, slump, air, w/cm.
- ACI 211.1 absolute-volume calculator + yield check (volumes sum to 1 m³).
- Combined gradation + Tarantula chart (recharts, already a dependency).
- GWP estimate from a user-maintained emission-factor table, clearly labelled "estimate, not an EPD".
- Trial batch results: slump, air, 1/3/7/28-day breaks linked to the mix. **This is the dataset.**

Phase 2 (after roughly 50+ trial mixes exist): export to CSV in BOxCrete's column format, and fit the GP offline
in Python. Don't put PyTorch in the iPad app.

## 6. Decision needed

Which of (a), (b) or (c) is this for? If the answer is "we want Climate Earth's AI", that's the wrong
target: without our own break data, a local model gives confident-looking guesses.

## Sources
- Climate Earth AI Mix Design Suite: https://climateearth.com/solutions/ai-mix-design-suite
- Tarantula Curve / ACI 323 in Climate Earth: https://concreteproducts.com/index.php/2024/10/21/climate-earth-epd-platform-contours-tarantula-curve-aci-323-parameters/
- Climate Earth + Command Alkon: https://climateearth.com/partner/command-alkon/
- ASTM-verified CEE EPD Generator: https://www.astm.org/standards-and-solutions/certification/environmental-product-declarations/epd-pcr/climate-earth-enterprise-cee-epd-generator-for-ready-mix-concrete
- BOxCrete: https://github.com/facebookresearch/SustainableConcrete , https://arxiv.org/abs/2603.21525
- Tarantula Curve limits: https://precast.org/precasttoday/q1-2023/combined-aggregate-gradation/ , https://ia.iowadot.gov/erl/current/im/content/532.htm , https://www.fhwa.dot.gov/pavement/concrete/pubs/hif15019.pdf
