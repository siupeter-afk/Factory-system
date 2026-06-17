# Graph Report - .  (2026-06-17)

## Corpus Check
- Corpus is ~38,444 words - fits in a single context window. You may not need a graph.

## Summary
- 1055 nodes · 3125 edges · 78 communities (73 shown, 5 thin omitted)
- Extraction: 65% EXTRACTED · 35% INFERRED · 0% AMBIGUOUS · INFERRED: 1088 edges (avg confidence: 0.8)
- Token cost: 9,050 input · 2,980 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Chart Rendering Core|Chart Rendering Core]]
- [[_COMMUNITY_Layout Engine|Layout Engine]]
- [[_COMMUNITY_Animation System|Animation System]]
- [[_COMMUNITY_Event Handling|Event Handling]]
- [[_COMMUNITY_DOM Utilities|DOM Utilities]]
- [[_COMMUNITY_State Management|State Management]]
- [[_COMMUNITY_Component Lifecycle|Component Lifecycle]]
- [[_COMMUNITY_Data Transforms|Data Transforms]]
- [[_COMMUNITY_Math Utilities|Math Utilities]]
- [[_COMMUNITY_React Hooks|React Hooks]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Axis System|Axis System]]
- [[_COMMUNITY_Canvas Path API|Canvas Path API]]
- [[_COMMUNITY_Tooltip Layer|Tooltip Layer]]
- [[_COMMUNITY_iOS App Delegate|iOS App Delegate]]
- [[_COMMUNITY_Legend System|Legend System]]
- [[_COMMUNITY_Grid Lines|Grid Lines]]
- [[_COMMUNITY_Capacitor + PWA Architecture|Capacitor + PWA Architecture]]
- [[_COMMUNITY_MapSet Collections|Map/Set Collections]]
- [[_COMMUNITY_Scale Functions|Scale Functions]]
- [[_COMMUNITY_Responsive Container|Responsive Container]]
- [[_COMMUNITY_Color Utilities|Color Utilities]]
- [[_COMMUNITY_SVG Helpers|SVG Helpers]]
- [[_COMMUNITY_Brush and Zoom|Brush and Zoom]]
- [[_COMMUNITY_Scatter Points|Scatter Points]]
- [[_COMMUNITY_Arc Drawing|Arc Drawing]]
- [[_COMMUNITY_Area and Line Charts|Area and Line Charts]]
- [[_COMMUNITY_Header + Data Collection UI|Header + Data Collection UI]]
- [[_COMMUNITY_Mock Data + KPI Data|Mock Data + KPI Data]]
- [[_COMMUNITY_Tick Rendering|Tick Rendering]]
- [[_COMMUNITY_Path Parsing|Path Parsing]]
- [[_COMMUNITY_Text Wrapping|Text Wrapping]]
- [[_COMMUNITY_Overflow Handling|Overflow Handling]]
- [[_COMMUNITY_Bar Charts|Bar Charts]]
- [[_COMMUNITY_Pie Segments|Pie Segments]]
- [[_COMMUNITY_Format Functions|Format Functions]]
- [[_COMMUNITY_Bundle Utilities|Bundle Utilities]]
- [[_COMMUNITY_Cache Map|Cache Map]]
- [[_COMMUNITY_Clip Path|Clip Path]]
- [[_COMMUNITY_Reference Lines|Reference Lines]]
- [[_COMMUNITY_Production + Work Orders|Production + Work Orders]]
- [[_COMMUNITY_Cartesian Grid|Cartesian Grid]]
- [[_COMMUNITY_CAPA Module|CAPA Module]]
- [[_COMMUNITY_Icon Visual Design System|Icon Visual Design System]]
- [[_COMMUNITY_Sector Drawing|Sector Drawing]]
- [[_COMMUNITY_Constructor Pattern|Constructor Pattern]]
- [[_COMMUNITY_Audits Module|Audits Module]]
- [[_COMMUNITY_Document Control|Document Control]]
- [[_COMMUNITY_Non-Conformances|Non-Conformances]]
- [[_COMMUNITY_iOS App Icon Assets|iOS App Icon Assets]]
- [[_COMMUNITY_Bundle Utils|Bundle Utils]]
- [[_COMMUNITY_Symbol Registry|Symbol Registry]]
- [[_COMMUNITY_Interval Functions|Interval Functions]]
- [[_COMMUNITY_Sidebar Navigation|Sidebar Navigation]]
- [[_COMMUNITY_Equipment Module|Equipment Module]]
- [[_COMMUNITY_PWA Brand Assets|PWA Brand Assets]]
- [[_COMMUNITY_iOS Splash Screen|iOS Splash Screen]]
- [[_COMMUNITY_iOS App Icon|iOS App Icon]]
- [[_COMMUNITY_Fragment Helpers|Fragment Helpers]]
- [[_COMMUNITY_Ref Utilities|Ref Utilities]]
- [[_COMMUNITY_Apple Touch Icon (Web)|Apple Touch Icon (Web)]]
- [[_COMMUNITY_Apple Touch Icon (iOS)|Apple Touch Icon (iOS)]]
- [[_COMMUNITY_PWA Icon 512|PWA Icon 512]]
- [[_COMMUNITY_PWA Icon 1024|PWA Icon 1024]]
- [[_COMMUNITY_Splash Branding v1|Splash Branding v1]]
- [[_COMMUNITY_Splash Branding v2|Splash Branding v2]]
- [[_COMMUNITY_Re-export Shims|Re-export Shims]]
- [[_COMMUNITY_Symbol Tokens|Symbol Tokens]]
- [[_COMMUNITY_Editor Utils|Editor Utils]]
- [[_COMMUNITY_Factory Building Symbol|Factory Building Symbol]]

## God Nodes (most connected - your core abstractions)
1. `__()` - 848 edges
2. `t()` - 88 edges
3. `w()` - 55 edges
4. `iE()` - 50 edges
5. `r()` - 37 edges
6. `tE()` - 31 edges
7. `sE()` - 30 edges
8. `gd()` - 25 edges
9. `n()` - 24 edges
10. `_v()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `FactoryOS PWA` --semantically_similar_to--> `Factory Management Application`  [INFERRED] [semantically similar]
  index.html → README.md
- `Root index.html (Web)` --semantically_similar_to--> `iOS Public index.html (Capacitor)`  [INFERRED] [semantically similar]
  index.html → ios/App/App/public/index.html
- `Build Job` --conceptually_related_to--> `Factory Management Application`  [INFERRED]
  .github/workflows/deploy.yml → README.md
- `Capacitor iOS Framework` --rationale_for--> `PWA / iOS Hybrid Deployment Strategy`  [INFERRED]
  ios/App/CapApp-SPM/README.md → index.html
- `PWA App Icon 192x192` --REPRESENTS--> `Factory System Brand Identity`  [EXTRACTED]
  ios/App/App/public/pwa-192.png → public/pwa-192.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Factory System CI/CD and Deployment Pipeline** — workflows_deploy_github_pages_deploy, workflows_deploy_build_job, workflows_deploy_deploy_job [EXTRACTED 1.00]
- **FactoryOS Cross-Platform (Web + iOS) Delivery** — index_html_root, public_index_html_ios, capapp_spm_capacitor, concept_pwa_ios_hybrid [INFERRED 0.85]
- **Factory App Core Domain Concepts** — readme_factory_management_app, readme_iso_compliance, readme_data_collection [EXTRACTED 1.00]

## Communities (78 total, 5 thin omitted)

### Community 0 - "Chart Rendering Core"
Cohesion: 0.06
Nodes (83): aE(), an(), aO(), av(), ay(), bE(), bh(), Bp() (+75 more)

### Community 1 - "Layout Engine"
Cohesion: 0.03
Nodes (15): __(), _2, cj, e0, jF, jz, [kF,TF], m$ (+7 more)

### Community 2 - "Animation System"
Cohesion: 0.06
Nodes (61): A0(), Ad(), Aw(), ba(), BM(), cv(), de(), E1() (+53 more)

### Community 3 - "Event Handling"
Cohesion: 0.08
Nodes (52): _7(), ai(), bg(), CP(), ct(), cu(), da(), dF() (+44 more)

### Community 4 - "DOM Utilities"
Cohesion: 0.06
Nodes (49): Ak(), bu(), BW(), cl(), Dh, Dl(), dO(), Dw() (+41 more)

### Community 5 - "State Management"
Cohesion: 0.06
Nodes (42): Al(), az(), b8(), ch(), D9(), DN, dp(), eP() (+34 more)

### Community 6 - "Component Lifecycle"
Cohesion: 0.08
Nodes (35): b9(), bq(), cx(), e7(), gF(), gl(), gq(), IA() (+27 more)

### Community 7 - "Data Transforms"
Cohesion: 0.09
Nodes (30): BT(), Eu(), fU(), gm(), GR(), gU(), Hu(), iF() (+22 more)

### Community 8 - "Math Utilities"
Cohesion: 0.09
Nodes (29): A6(), clamp(), D6(), e6(), eI(), ga(), gO(), Hx() (+21 more)

### Community 9 - "React Hooks"
Cohesion: 0.08
Nodes (28): AB(), aU(), bd(), bz, cz(), D8(), DB(), displayable() (+20 more)

### Community 10 - "Package Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @capacitor/cli, @capacitor/core, @capacitor/ios, lucide-react, react, react-dom, react-router-dom (+17 more)

### Community 11 - "Axis System"
Cohesion: 0.16
Nodes (22): As(), dC(), Ip(), jd(), Js(), mp(), Nw(), oc() (+14 more)

### Community 12 - "Canvas Path API"
Cohesion: 0.10
Nodes (7): gI, Md(), mN(), uj, UN(), wF(), Zn()

### Community 13 - "Tooltip Layer"
Cohesion: 0.16
Nodes (21): C(), cy(), dy(), Ec(), fT, hp(), iC(), lf (+13 more)

### Community 14 - "iOS App Delegate"
Cohesion: 0.13
Nodes (13): Any, AppDelegate, Bool, Capacitor, NSUserActivity, UIApplication, UIApplicationDelegate, UIKit (+5 more)

### Community 15 - "Legend System"
Cohesion: 0.11
Nodes (19): ah, b7(), dD(), Ex(), g7(), H5(), K5(), Kc() (+11 more)

### Community 16 - "Grid Lines"
Cohesion: 0.15
Nodes (19): Bc(), cq(), d2(), dm(), dq(), fq(), h2(), ix() (+11 more)

### Community 17 - "Capacitor + PWA Architecture"
Cohesion: 0.11
Nodes (18): Capacitor iOS Framework, CapApp-SPM README, PWA / iOS Hybrid Deployment Strategy, FactoryOS PWA, src/main.jsx Entry Point, Web App Manifest, Root index.html (Web), PackageDescription (+10 more)

### Community 18 - "Map/Set Collections"
Cohesion: 0.15
Nodes (14): b$, eB(), f6(), g_(), HD(), Hz(), nb(), ou() (+6 more)

### Community 19 - "Scale Functions"
Cohesion: 0.14
Nodes (18): bK(), c1(), cm(), ek(), Fk(), Gk(), Kk(), Na() (+10 more)

### Community 20 - "Responsive Container"
Cohesion: 0.13
Nodes (17): Ez(), f_(), FC(), Fj(), g5(), jq(), q5(), S0() (+9 more)

### Community 21 - "Color Utilities"
Cohesion: 0.14
Nodes (16): a5(), at(), eW(), F5(), fx, G3(), hk(), ih (+8 more)

### Community 22 - "SVG Helpers"
Cohesion: 0.14
Nodes (16): aC(), aq(), ar(), ca(), gx(), ij(), jM(), KE() (+8 more)

### Community 23 - "Brush and Zoom"
Cohesion: 0.18
Nodes (15): a2(), A7(), bl(), C8(), Gz(), jl(), k8(), O7() (+7 more)

### Community 24 - "Scatter Points"
Cohesion: 0.15
Nodes (15): aP(), b1(), c2(), eq(), fD(), LC(), nd(), Nq() (+7 more)

### Community 25 - "Arc Drawing"
Cohesion: 0.15
Nodes (15): D7(), Fl(), G9(), hL(), I7(), j9(), M7(), mx() (+7 more)

### Community 26 - "Area and Line Charts"
Cohesion: 0.15
Nodes (14): AM(), ax(), bV(), Bx(), DI(), Ea(), hq(), HY() (+6 more)

### Community 27 - "Header + Data Collection UI"
Cohesion: 0.19
Nodes (7): Header(), DataCollection(), forms, submittedForms, Settings(), App(), pageMeta

### Community 28 - "Mock Data + KPI Data"
Cohesion: 0.21
Nodes (9): complianceData, kpiData, productionTrend, recentActivity, COLORS, Dashboard(), ncrTrend, Reports() (+1 more)

### Community 29 - "Tick Rendering"
Cohesion: 0.15
Nodes (13): Aa, by, d1(), f1(), i1(), i2(), jK(), Ok() (+5 more)

### Community 30 - "Path Parsing"
Cohesion: 0.32
Nodes (12): dS(), i(), i6(), j7(), jH(), n(), O(), q7() (+4 more)

### Community 31 - "Text Wrapping"
Cohesion: 0.22
Nodes (11): Cs(), hv(), iV(), KV(), mv(), n1(), qV(), vl() (+3 more)

### Community 32 - "Overflow Handling"
Cohesion: 0.29
Nodes (10): b2(), dv(), eS(), Hi(), iQ(), iS(), lE(), PR() (+2 more)

### Community 33 - "Bar Charts"
Cohesion: 0.24
Nodes (10): BB(), FB(), gj(), HB(), lb(), OB(), sa(), uB() (+2 more)

### Community 34 - "Pie Segments"
Cohesion: 0.22
Nodes (10): cD(), fy(), qB(), qj(), Qu(), uD(), xj(), YB() (+2 more)

### Community 35 - "Format Functions"
Cohesion: 0.25
Nodes (9): F2(), fa(), G1(), h1(), lq(), pc(), rQ(), wi() (+1 more)

### Community 36 - "Bundle Utilities"
Cohesion: 0.29
Nodes (8): A, dx(), FE(), nx(), rx(), sx(), Tx(), w7()

### Community 37 - "Cache Map"
Cohesion: 0.25
Nodes (7): Jy(), PH(), qd(), qS(), v1(), VE(), vt()

### Community 38 - "Clip Path"
Cohesion: 0.29
Nodes (7): af(), bN(), cF(), fF(), gN(), of, XN()

### Community 39 - "Reference Lines"
Cohesion: 0.29
Nodes (7): Ag(), eg(), lg(), Ng(), Og(), Pg(), yr()

### Community 40 - "Production + Work Orders"
Cohesion: 0.29
Nodes (5): qualityInspections, workOrders, Production(), statusColors, statusIcon

### Community 41 - "Cartesian Grid"
Cohesion: 0.33
Nodes (6): eh(), gg(), l$(), yc(), Yn(), Z7()

### Community 42 - "CAPA Module"
Cohesion: 0.33
Nodes (5): capas, CAPA(), effectColors, statusColors, typeColors

### Community 43 - "Icon Visual Design System"
Cohesion: 0.47
Nodes (6): Blue Background Color #2563eb, Factory Building Shape, Rounded Rectangle Background, Factory Icon SVG, Factory Icon Visual Design, White Stroke Icon

### Community 44 - "Sector Drawing"
Cohesion: 0.40
Nodes (5): B4(), c4(), i5(), j4(), s4()

### Community 45 - "Constructor Pattern"
Cohesion: 0.40
Nodes (4): j0(), O6(), P0(), yI()

### Community 46 - "Audits Module"
Cohesion: 0.40
Nodes (4): audits, Audits(), statusColors, typeColors

### Community 47 - "Document Control"
Cohesion: 0.40
Nodes (4): documents, DocumentControl(), statusColors, typeOptions

### Community 48 - "Non-Conformances"
Cohesion: 0.40
Nodes (4): nonConformances, NonConformances(), severityColors, statusColors

### Community 49 - "iOS App Icon Assets"
Cohesion: 0.60
Nodes (5): Rounded Square Blue Background, Factory Building Outline, Lucide Factory Icon (Design Source), Factory App Icon SVG, Factory Windows / Detail Lines

### Community 50 - "Bundle Utils"
Cohesion: 0.50
Nodes (4): a1(), dk(), h0(), hM()

### Community 51 - "Symbol Registry"
Cohesion: 0.50
Nodes (4): CI, fI(), LI(), UI()

### Community 52 - "Interval Functions"
Cohesion: 0.67
Nodes (4): cw(), ml(), sW(), Uw()

### Community 54 - "Equipment Module"
Cohesion: 0.50
Nodes (3): equipment, Equipment(), statusColors

### Community 55 - "PWA Brand Assets"
Cohesion: 1.00
Nodes (4): Blue Rounded Rectangle Background, Factory System Brand Identity, Factory Building Graphic, PWA App Icon 192x192

### Community 56 - "iOS Splash Screen"
Cohesion: 0.67
Nodes (4): Splash Imageset Asset, App Splash Screen Branding, Splash Screen Image (2732x2732), App Logo Mark (Blue Cross/X Shape)

### Community 57 - "iOS App Icon"
Cohesion: 0.67
Nodes (3): Blue Brand Color (#2D5BE3 Cobalt Blue), Factory Building Symbol, Factory System App Icon (512@2x)

### Community 58 - "Fragment Helpers"
Cohesion: 0.67
Nodes (3): F4(), h4(), v4()

### Community 59 - "Ref Utilities"
Cohesion: 0.67
Nodes (3): gV(), Im(), xV()

### Community 60 - "Apple Touch Icon (Web)"
Cohesion: 0.67
Nodes (3): Apple Touch Icon (Factory App), Progressive Web App (PWA), Factory Icon Visual Design

### Community 61 - "Apple Touch Icon (iOS)"
Cohesion: 1.00
Nodes (3): Factory System Brand Identity, Factory App Icon Design, Apple Touch Icon (Factory App)

### Community 62 - "PWA Icon 512"
Cohesion: 1.00
Nodes (3): Factory System Brand Identity, Factory Building Symbol, PWA 512x512 App Icon

### Community 63 - "PWA Icon 1024"
Cohesion: 1.00
Nodes (3): Factory System Brand Identity, PWA App Icon 1024px, Factory Icon Visual Design

### Community 64 - "Splash Branding v1"
Cohesion: 1.00
Nodes (3): Factory App Branding, App Logo - Blue Cross/X Mark Icon, iOS Splash Screen (2732x2732)

### Community 65 - "Splash Branding v2"
Cohesion: 1.00
Nodes (3): Splash Screen Branding, iOS Splash Screen (2732x2732 @2x), App Logo Mark (Blue Cross/Plus Icon)

## Knowledge Gaps
- **82 isolated node(s):** `UIKit`, `Capacitor`, `UIWindow`, `Any`, `Bool` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `__()` connect `Layout Engine` to `Chart Rendering Core`, `Animation System`, `Event Handling`, `DOM Utilities`, `State Management`, `Component Lifecycle`, `Data Transforms`, `Math Utilities`, `React Hooks`, `Axis System`, `Canvas Path API`, `Tooltip Layer`, `Legend System`, `Grid Lines`, `Map/Set Collections`, `Scale Functions`, `Responsive Container`, `Color Utilities`, `SVG Helpers`, `Brush and Zoom`, `Scatter Points`, `Arc Drawing`, `Area and Line Charts`, `Tick Rendering`, `Path Parsing`, `Text Wrapping`, `Overflow Handling`, `Bar Charts`, `Pie Segments`, `Format Functions`, `Bundle Utilities`, `Cache Map`, `Clip Path`, `Reference Lines`, `Cartesian Grid`, `Sector Drawing`, `Constructor Pattern`, `Bundle Utils`, `Symbol Registry`, `Interval Functions`, `Fragment Helpers`, `Ref Utilities`, `Re-export Shims`, `Symbol Tokens`, `Editor Utils`?**
  _High betweenness centrality (0.716) - this node is a cross-community bridge._
- **Why does `DN` connect `State Management` to `Chart Rendering Core`, `Layout Engine`, `Pie Segments`, `Event Handling`, `Data Transforms`, `Axis System`, `Tooltip Layer`, `Color Utilities`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `gI` connect `Canvas Path API` to `Chart Rendering Core`, `Layout Engine`, `Animation System`, `Constructor Pattern`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 32 inferred relationships involving `t()` (e.g. with `at()` and `DI()`) actually correct?**
  _`t()` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 45 inferred relationships involving `w()` (e.g. with `aO()` and `bg()`) actually correct?**
  _`w()` has 45 INFERRED edges - model-reasoned connections that need verification._
- **Are the 20 inferred relationships involving `iE()` (e.g. with `aO()` and `cr()`) actually correct?**
  _`iE()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `r()` (e.g. with `AM()` and `dO()`) actually correct?**
  _`r()` has 4 INFERRED edges - model-reasoned connections that need verification._