// Seed data for first run. Replaced by real records as the factory uses the app;
// wiped only if the user clears site data or the DB version changes.

const daysFromNow = n => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const seedUsers = [
  { id: 'u-owner', name: 'Peter', role: 'owner' },
  { id: 'u-ops', name: 'Amy', role: 'operations' },
  { id: 'u-prod', name: 'Chen Wei', role: 'production' },
  { id: 'u-lab', name: 'Li Na', role: 'lab' },
  { id: 'u-eng', name: 'Marco', role: 'engineering' },
  { id: 'u-driver', name: 'Xiao Zhang', role: 'driver' },
  { id: 'u-acct', name: 'Grace', role: 'accountant' },
]

// A representative sample of the 50+ product catalog. Formulations are
// placeholders — production/lab replace them with the real recipes.
// Formulation contents are only shown to owner/production/lab (see db.canSeeFormulation).
// Specs are QC ranges the lab tests against (owned by lab). Formulations are
// versioned; v1 timestamps are seed placeholders.
const SPEC_WR = [
  { param: 'Density', unit: 'g/cm³', min: 1.06, max: 1.10 },
  { param: 'Solids content', unit: '%', min: 38, max: 42 },
  { param: 'pH', unit: '', min: 5.5, max: 7.5 },
  { param: 'Flowability', unit: 'mm', min: 220, max: 280 },
]
const SPEC_FA = [
  { param: 'Density', unit: 'g/cm³', min: 1.02, max: 1.06 },
  { param: 'Foam density', unit: 'kg/m³', min: 40, max: 60 },
  { param: 'pH', unit: '', min: 6.0, max: 8.0 },
]

export const seedProducts = [
  {
    id: 'p-wr360', code: 'WR-360', name: 'Polycarboxylate Superplasticizer PC-360', family: 'water_reducer', active: true,
    formulation: {
      version: 1,
      ingredients: [
        { name: 'Polycarboxylic ether (50%)', pct: 40 },
        { name: 'Water', pct: 58.5 },
        { name: 'Defoamer', pct: 0.5 },
        { name: 'Preservative', pct: 1 },
      ],
      notes: 'Placeholder recipe — replace with the controlled formulation.',
      updatedAt: null, updatedBy: null,
    },
    formulationHistory: [],
    specs: SPEC_WR,
  },
  {
    id: 'p-wr210', code: 'WR-210', name: 'Naphthalene Water Reducer N-210', family: 'water_reducer', active: true,
    formulation: {
      version: 1,
      ingredients: [
        { name: 'Sodium naphthalene sulfonate', pct: 32 },
        { name: 'Water', pct: 66 },
        { name: 'Sodium gluconate', pct: 2 },
      ],
      notes: '',
      updatedAt: null, updatedBy: null,
    },
    formulationHistory: [],
    specs: SPEC_WR,
  },
  { id: 'p-wr115', code: 'WR-115', name: 'Lignosulfonate Plasticizer L-115', family: 'water_reducer', active: true, formulation: null, formulationHistory: [], specs: SPEC_WR },
  {
    id: 'p-fa102', code: 'FA-102', name: 'Protein Foaming Agent FA-102', family: 'foaming_agent', active: true,
    formulation: {
      version: 1,
      ingredients: [
        { name: 'Hydrolyzed protein concentrate', pct: 28 },
        { name: 'Water', pct: 70 },
        { name: 'Stabilizer', pct: 2 },
      ],
      notes: 'Placeholder recipe.',
      updatedAt: null, updatedBy: null,
    },
    formulationHistory: [],
    specs: SPEC_FA,
  },
  { id: 'p-fa205', code: 'FA-205', name: 'Synthetic Foaming Agent FA-205', family: 'foaming_agent', active: true, formulation: null, formulationHistory: [], specs: SPEC_FA },
  { id: 'p-rt450', code: 'RT-450', name: 'Sugar-based Retarder RT-450', family: 'retarder', active: true, formulation: null, formulationHistory: [], specs: [] },
  { id: 'p-rt460', code: 'RT-460', name: 'Phosphate Retarder RT-460', family: 'retarder', active: true, formulation: null, formulationHistory: [], specs: [] },
  { id: 'p-ac710', code: 'AC-710', name: 'Alkali-free Accelerator AC-710', family: 'accelerator', active: true, formulation: null, formulationHistory: [], specs: [] },
  { id: 'p-ac720', code: 'AC-720', name: 'Sodium Silicate Accelerator AC-720', family: 'accelerator', active: true, formulation: null, formulationHistory: [], specs: [] },
  { id: 'p-ae330', code: 'AE-330', name: 'Air Entrainer AE-330', family: 'air_entrainer', active: true, formulation: null, formulationHistory: [], specs: [] },
  { id: 'p-wp510', code: 'WP-510', name: 'Crystalline Waterproofing WP-510', family: 'waterproofing', active: true, formulation: null, formulationHistory: [], specs: [] },
  { id: 'p-ci610', code: 'CI-610', name: 'Corrosion Inhibitor CI-610', family: 'corrosion_inhibitor', active: true, formulation: null, formulationHistory: [], specs: [] },
  { id: 'p-vm810', code: 'VM-810', name: 'Viscosity Modifier VM-810', family: 'viscosity_modifier', active: true, formulation: null, formulationHistory: [], specs: [] },
]

// Raw materials — names must match formulation ingredient names for
// automatic stock draw-down. Levels in kg.
export const seedRawMaterials = [
  { id: 'm-pce', name: 'Polycarboxylic ether (50%)', minLevelKg: 5000 },
  { id: 'm-sns', name: 'Sodium naphthalene sulfonate', minLevelKg: 3000 },
  { id: 'm-glu', name: 'Sodium gluconate', minLevelKg: 500 },
  { id: 'm-protein', name: 'Hydrolyzed protein concentrate', minLevelKg: 1000 },
  { id: 'm-stab', name: 'Stabilizer', minLevelKg: 200 },
  { id: 'm-defoam', name: 'Defoamer', minLevelKg: 100 },
  { id: 'm-preserv', name: 'Preservative', minLevelKg: 100 },
  { id: 'm-water', name: 'Water', minLevelKg: 0 },
]

export const seedReceipts = [
  { id: 'r-101', number: 'RCV-101', materialId: 'm-pce', supplier: 'ChemSource Ltd.', lotNo: 'PCE-2606-18', qtyKg: 12000, note: '', qcStatus: 'passed', at: daysFromNow(-10), byName: 'Amy' },
  { id: 'r-102', number: 'RCV-102', materialId: 'm-sns', supplier: 'Northern Chemical', lotNo: 'SNS-0611', qtyKg: 8000, note: '', qcStatus: 'passed', at: daysFromNow(-6), byName: 'Amy' },
  { id: 'r-103', number: 'RCV-103', materialId: 'm-protein', supplier: 'BioPro Materials', lotNo: 'HP-2288', qtyKg: 2000, note: '', qcStatus: 'pending', at: daysFromNow(0), byName: 'Amy' },
]

// One ready-made form so the Forms page isn't empty on first run.
export const seedFormTemplates = [
  {
    id: 'f-tankclean',
    title: 'Tank Cleaning Checklist',
    department: 'production',
    version: 1,
    fields: [
      { id: 'fld-tank', label: 'Tank number', type: 'text', required: true },
      { id: 'fld-date', label: 'Cleaning date', type: 'date', required: true },
      { id: 'fld-method', label: 'Method', type: 'select', options: ['Water rinse', 'Caustic wash', 'Full CIP'], required: true },
      { id: 'fld-residue', label: 'Residue check passed', type: 'checkbox', required: false },
      { id: 'fld-ph', label: 'Rinse water pH', type: 'number', unit: '', min: 6, max: 8, required: false },
      { id: 'fld-notes', label: 'Notes', type: 'text', required: false },
    ],
    active: true,
    history: [],
    at: daysFromNow(-3),
    byName: 'Peter',
  },
]

export const seedCustomers = [
  { id: 'c-hengda', name: 'Hengda Ready-Mix' },
  { id: 'c-city', name: 'City Concrete Co.' },
  { id: 'c-pacific', name: 'Pacific Precast' },
  { id: 'c-green', name: 'GreenBuild Materials' },
  { id: 'c-tunnel', name: 'Tunnel Segment Works' },
]

// Production batches — the source of shippable stock. Volumes in liters.
export const seedBatches = [
  { id: 'b-1001', number: 'B-1001', productId: 'p-wr360', volumeL: 5000, note: '', at: daysFromNow(-8), byName: 'Chen Wei' },
  { id: 'b-1002', number: 'B-1002', productId: 'p-wr360', volumeL: 5000, note: '', at: daysFromNow(-7), byName: 'Chen Wei' },
  { id: 'b-1003', number: 'B-1003', productId: 'p-wr210', volumeL: 10000, note: '', at: daysFromNow(-4), byName: 'Chen Wei' },
  { id: 'b-1004', number: 'B-1004', productId: 'p-fa102', volumeL: 3000, note: '', at: daysFromNow(-2), byName: 'Chen Wei' },
  { id: 'b-1005', number: 'B-1005', productId: 'p-ac710', volumeL: 6000, note: '', at: daysFromNow(-2), byName: 'Chen Wei' },
  { id: 'b-1006', number: 'B-1006', productId: 'p-rt450', volumeL: 4000, note: '', at: daysFromNow(-1), byName: 'Chen Wei' },
]

export const seedOrders = [
  {
    id: 'o-1001', number: 'ORD-1001', customerId: 'c-hengda',
    status: 'delivered', requestedDate: daysFromNow(-6), notes: '',
    lines: [{ productId: 'p-wr360', qty: 2000, unit: 'l' }],
    history: [
      { status: 'draft', at: daysFromNow(-9), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(-9), byName: 'Amy' },
      { status: 'in_production', at: daysFromNow(-8), byName: 'Chen Wei' },
      { status: 'qc_released', at: daysFromNow(-7), byName: 'Li Na' },
      { status: 'scheduled', at: daysFromNow(-7), byName: 'Amy' },
      { status: 'out_for_delivery', at: daysFromNow(-6), byName: 'Xiao Zhang' },
      { status: 'delivered', at: daysFromNow(-6), byName: 'Xiao Zhang' },
    ],
  },
  {
    id: 'o-1002', number: 'ORD-1002', customerId: 'c-city',
    status: 'out_for_delivery', requestedDate: daysFromNow(0), notes: 'Site B gate, call ahead',
    lines: [{ productId: 'p-wr210', qty: 6000, unit: 'l' }, { productId: 'p-rt450', qty: 1000, unit: 'l' }],
    history: [
      { status: 'draft', at: daysFromNow(-4), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(-4), byName: 'Amy' },
      { status: 'in_production', at: daysFromNow(-3), byName: 'Chen Wei' },
      { status: 'qc_released', at: daysFromNow(-1), byName: 'Li Na' },
      { status: 'scheduled', at: daysFromNow(-1), byName: 'Amy' },
      { status: 'out_for_delivery', at: daysFromNow(0), byName: 'Xiao Zhang' },
    ],
  },
  {
    id: 'o-1003', number: 'ORD-1003', customerId: 'c-pacific',
    status: 'qc_released', requestedDate: daysFromNow(1), notes: '',
    lines: [{ productId: 'p-ac710', qty: 4000, unit: 'l' }],
    history: [
      { status: 'draft', at: daysFromNow(-3), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(-3), byName: 'Amy' },
      { status: 'in_production', at: daysFromNow(-2), byName: 'Chen Wei' },
      { status: 'qc_released', at: daysFromNow(0), byName: 'Li Na' },
    ],
  },
  {
    id: 'o-1004', number: 'ORD-1004', customerId: 'c-green',
    status: 'in_production', requestedDate: daysFromNow(2), notes: 'Foam density spec attached to contract',
    lines: [{ productId: 'p-fa102', qty: 2500, unit: 'l' }],
    history: [
      { status: 'draft', at: daysFromNow(-2), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(-2), byName: 'Amy' },
      { status: 'in_production', at: daysFromNow(-1), byName: 'Chen Wei' },
    ],
  },
  {
    id: 'o-1005', number: 'ORD-1005', customerId: 'c-tunnel',
    status: 'in_production', requestedDate: daysFromNow(-1), notes: 'URGENT — segment pour Thursday',
    lines: [{ productId: 'p-wr360', qty: 8000, unit: 'l' }],
    history: [
      { status: 'draft', at: daysFromNow(-5), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(-5), byName: 'Amy' },
      { status: 'in_production', at: daysFromNow(-4), byName: 'Chen Wei' },
    ],
  },
  {
    id: 'o-1006', number: 'ORD-1006', customerId: 'c-hengda',
    status: 'confirmed', requestedDate: daysFromNow(3), notes: '',
    lines: [{ productId: 'p-ae330', qty: 1500, unit: 'l' }],
    history: [
      { status: 'draft', at: daysFromNow(-1), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(-1), byName: 'Amy' },
    ],
  },
  {
    id: 'o-1007', number: 'ORD-1007', customerId: 'c-city',
    status: 'confirmed', requestedDate: daysFromNow(5), notes: '',
    lines: [{ productId: 'p-wp510', qty: 3000, unit: 'l' }, { productId: 'p-ci610', qty: 1000, unit: 'l' }],
    history: [
      { status: 'draft', at: daysFromNow(0), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(0), byName: 'Amy' },
    ],
  },
  {
    id: 'o-1008', number: 'ORD-1008', customerId: 'c-pacific',
    status: 'draft', requestedDate: daysFromNow(7), notes: 'Waiting on final quantity from customer',
    lines: [{ productId: 'p-rt460', qty: 2000, unit: 'l' }],
    history: [
      { status: 'draft', at: daysFromNow(0), byName: 'Amy' },
    ],
  },
]
