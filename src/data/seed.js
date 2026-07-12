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

// A representative sample of the 50+ product catalog. Owner/operations
// extend this from the Products screen — codes follow the factory's scheme.
export const seedProducts = [
  { id: 'p-wr360', code: 'WR-360', name: 'Polycarboxylate Superplasticizer PC-360', family: 'water_reducer', active: true },
  { id: 'p-wr210', code: 'WR-210', name: 'Naphthalene Water Reducer N-210', family: 'water_reducer', active: true },
  { id: 'p-wr115', code: 'WR-115', name: 'Lignosulfonate Plasticizer L-115', family: 'water_reducer', active: true },
  { id: 'p-fa102', code: 'FA-102', name: 'Protein Foaming Agent FA-102', family: 'foaming_agent', active: true },
  { id: 'p-fa205', code: 'FA-205', name: 'Synthetic Foaming Agent FA-205', family: 'foaming_agent', active: true },
  { id: 'p-rt450', code: 'RT-450', name: 'Sugar-based Retarder RT-450', family: 'retarder', active: true },
  { id: 'p-rt460', code: 'RT-460', name: 'Phosphate Retarder RT-460', family: 'retarder', active: true },
  { id: 'p-ac710', code: 'AC-710', name: 'Alkali-free Accelerator AC-710', family: 'accelerator', active: true },
  { id: 'p-ac720', code: 'AC-720', name: 'Sodium Silicate Accelerator AC-720', family: 'accelerator', active: true },
  { id: 'p-ae330', code: 'AE-330', name: 'Air Entrainer AE-330', family: 'air_entrainer', active: true },
  { id: 'p-wp510', code: 'WP-510', name: 'Crystalline Waterproofing WP-510', family: 'waterproofing', active: true },
  { id: 'p-ci610', code: 'CI-610', name: 'Corrosion Inhibitor CI-610', family: 'corrosion_inhibitor', active: true },
  { id: 'p-vm810', code: 'VM-810', name: 'Viscosity Modifier VM-810', family: 'viscosity_modifier', active: true },
]

export const seedCustomers = [
  { id: 'c-hengda', name: 'Hengda Ready-Mix' },
  { id: 'c-city', name: 'City Concrete Co.' },
  { id: 'c-pacific', name: 'Pacific Precast' },
  { id: 'c-green', name: 'GreenBuild Materials' },
  { id: 'c-tunnel', name: 'Tunnel Segment Works' },
]

export const seedOrders = [
  {
    id: 'o-1001', number: 'ORD-1001', customerId: 'c-hengda',
    status: 'delivered', requestedDate: daysFromNow(-6), notes: '',
    lines: [{ productId: 'p-wr360', qty: 12, unit: 't' }],
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
    lines: [{ productId: 'p-wr210', qty: 8, unit: 't' }, { productId: 'p-rt450', qty: 2, unit: 't' }],
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
    lines: [{ productId: 'p-ac710', qty: 6, unit: 't' }],
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
    lines: [{ productId: 'p-fa102', qty: 4, unit: 't' }, { productId: 'p-fa205', qty: 2, unit: 't' }],
    history: [
      { status: 'draft', at: daysFromNow(-2), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(-2), byName: 'Amy' },
      { status: 'in_production', at: daysFromNow(-1), byName: 'Chen Wei' },
    ],
  },
  {
    id: 'o-1005', number: 'ORD-1005', customerId: 'c-tunnel',
    status: 'in_production', requestedDate: daysFromNow(-1), notes: 'URGENT — segment pour Thursday',
    lines: [{ productId: 'p-wr360', qty: 15, unit: 't' }, { productId: 'p-vm810', qty: 1, unit: 't' }],
    history: [
      { status: 'draft', at: daysFromNow(-5), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(-5), byName: 'Amy' },
      { status: 'in_production', at: daysFromNow(-4), byName: 'Chen Wei' },
    ],
  },
  {
    id: 'o-1006', number: 'ORD-1006', customerId: 'c-hengda',
    status: 'confirmed', requestedDate: daysFromNow(3), notes: '',
    lines: [{ productId: 'p-ae330', qty: 3, unit: 't' }],
    history: [
      { status: 'draft', at: daysFromNow(-1), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(-1), byName: 'Amy' },
    ],
  },
  {
    id: 'o-1007', number: 'ORD-1007', customerId: 'c-city',
    status: 'confirmed', requestedDate: daysFromNow(5), notes: '',
    lines: [{ productId: 'p-wp510', qty: 5, unit: 't' }, { productId: 'p-ci610', qty: 2, unit: 't' }],
    history: [
      { status: 'draft', at: daysFromNow(0), byName: 'Amy' },
      { status: 'confirmed', at: daysFromNow(0), byName: 'Amy' },
    ],
  },
  {
    id: 'o-1008', number: 'ORD-1008', customerId: 'c-pacific',
    status: 'draft', requestedDate: daysFromNow(7), notes: 'Waiting on final quantity from customer',
    lines: [{ productId: 'p-rt460', qty: 4, unit: 't' }],
    history: [
      { status: 'draft', at: daysFromNow(0), byName: 'Amy' },
    ],
  },
]
