export const kpiData = [
  { month: 'Jan', oee: 78, quality: 95, delivery: 92 },
  { month: 'Feb', oee: 82, quality: 96, delivery: 94 },
  { month: 'Mar', oee: 79, quality: 94, delivery: 91 },
  { month: 'Apr', oee: 85, quality: 97, delivery: 95 },
  { month: 'May', oee: 83, quality: 96, delivery: 93 },
  { month: 'Jun', oee: 87, quality: 98, delivery: 96 },
];

export const complianceData = [
  { name: 'Compliant', value: 74, color: '#22c55e' },
  { name: 'Minor NC', value: 18, color: '#f59e0b' },
  { name: 'Major NC', value: 8, color: '#ef4444' },
];

export const documents = [
  { id: 'DOC-001', title: 'Quality Manual', type: 'Manual', revision: 'Rev 5', status: 'Active', owner: 'Q. Director', lastReview: '2024-01-15', nextReview: '2025-01-15' },
  { id: 'DOC-002', title: 'SOP-Incoming Inspection', type: 'Procedure', revision: 'Rev 3', status: 'Active', owner: 'QA Manager', lastReview: '2024-03-10', nextReview: '2025-03-10' },
  { id: 'DOC-003', title: 'SOP-Calibration Control', type: 'Procedure', revision: 'Rev 7', status: 'Under Review', owner: 'Metrology', lastReview: '2023-11-20', nextReview: '2024-11-20' },
  { id: 'DOC-004', title: 'WI-Welding Process', type: 'Work Instruction', revision: 'Rev 2', status: 'Active', owner: 'Production', lastReview: '2024-02-28', nextReview: '2025-02-28' },
  { id: 'DOC-005', title: 'SOP-Customer Complaints', type: 'Procedure', revision: 'Rev 4', status: 'Active', owner: 'QA Manager', lastReview: '2024-04-05', nextReview: '2025-04-05' },
  { id: 'DOC-006', title: 'Risk Management Plan', type: 'Plan', revision: 'Rev 1', status: 'Overdue Review', owner: 'Q. Director', lastReview: '2023-06-01', nextReview: '2024-06-01' },
  { id: 'DOC-007', title: 'WI-Paint Application', type: 'Work Instruction', revision: 'Rev 5', status: 'Active', owner: 'Production', lastReview: '2024-05-12', nextReview: '2025-05-12' },
  { id: 'DOC-008', title: 'Supplier Quality Manual', type: 'Manual', revision: 'Rev 2', status: 'Active', owner: 'Procurement', lastReview: '2024-01-30', nextReview: '2025-01-30' },
];

export const nonConformances = [
  { id: 'NCR-2024-045', date: '2024-06-18', area: 'Assembly', description: 'Dimensional out-of-spec on Part #A-2291', severity: 'Minor', status: 'Open', assignedTo: 'J. Smith', dueDate: '2024-07-02' },
  { id: 'NCR-2024-044', date: '2024-06-15', area: 'Welding', description: 'Porosity detected in weld seam batch W-2240', severity: 'Major', status: 'In Progress', assignedTo: 'M. Chen', dueDate: '2024-06-29' },
  { id: 'NCR-2024-043', date: '2024-06-10', area: 'Incoming', description: 'Supplier material cert missing for steel batch', severity: 'Minor', status: 'Closed', assignedTo: 'L. Patel', dueDate: '2024-06-20' },
  { id: 'NCR-2024-042', date: '2024-06-08', area: 'Paint', description: 'Surface adhesion failure on Type-B panels', severity: 'Major', status: 'In Progress', assignedTo: 'R. Garcia', dueDate: '2024-06-25' },
  { id: 'NCR-2024-041', date: '2024-06-03', area: 'Machining', description: 'Tool wear causing surface roughness out of spec', severity: 'Minor', status: 'Closed', assignedTo: 'J. Smith', dueDate: '2024-06-15' },
  { id: 'NCR-2024-040', date: '2024-05-28', area: 'QC Final', description: 'Calibration record gap for CMM #3', severity: 'Critical', status: 'Closed', assignedTo: 'Metrology', dueDate: '2024-06-05' },
];

export const capas = [
  { id: 'CAPA-2024-018', type: 'Corrective', source: 'NCR-2024-044', title: 'Weld process parameter review', status: 'In Progress', dueDate: '2024-07-15', owner: 'M. Chen', effectiveness: null },
  { id: 'CAPA-2024-017', type: 'Preventive', source: 'Internal Audit', title: 'Supplier evaluation checklist enhancement', status: 'Open', dueDate: '2024-07-30', owner: 'Procurement', effectiveness: null },
  { id: 'CAPA-2024-016', type: 'Corrective', source: 'NCR-2024-040', title: 'Calibration scheduling system upgrade', status: 'Completed', dueDate: '2024-06-30', owner: 'Metrology', effectiveness: 'Effective' },
  { id: 'CAPA-2024-015', type: 'Corrective', source: 'Customer Complaint', title: 'Packaging SOP revision', status: 'Completed', dueDate: '2024-06-15', owner: 'Production', effectiveness: 'Effective' },
  { id: 'CAPA-2024-014', type: 'Preventive', source: 'Management Review', title: 'Training matrix update for new ISO 9001 rev', status: 'Completed', dueDate: '2024-06-01', owner: 'HR', effectiveness: 'Partially Effective' },
];

export const audits = [
  { id: 'AUD-2024-003', type: 'Internal', area: 'Production & Assembly', auditor: 'Quality Team', scheduledDate: '2024-07-10', status: 'Scheduled', findings: null },
  { id: 'AUD-2024-002', type: 'Internal', area: 'Document Control', auditor: 'Quality Team', scheduledDate: '2024-06-20', status: 'Completed', findings: '2 Minor' },
  { id: 'AUD-2024-001', type: 'External', area: 'Full ISO 9001:2015', auditor: 'Bureau Veritas', scheduledDate: '2024-05-14', status: 'Completed', findings: '1 OFI' },
  { id: 'AUD-2023-008', type: 'Internal', area: 'Calibration & Metrology', auditor: 'Quality Team', scheduledDate: '2023-12-15', status: 'Completed', findings: '1 Minor, 1 OFI' },
  { id: 'AUD-2023-007', type: 'Supplier', area: 'ABC Steel Corp', auditor: 'Procurement/QA', scheduledDate: '2023-11-08', status: 'Completed', findings: '3 Minor' },
];

export const workOrders = [
  { id: 'WO-2024-1892', product: 'Frame Assembly FA-400', quantity: 50, planned: '2024-06-20', due: '2024-06-28', status: 'In Progress', progress: 68, line: 'Line A' },
  { id: 'WO-2024-1891', product: 'Bracket Set BS-210', quantity: 200, planned: '2024-06-19', due: '2024-06-26', status: 'In Progress', progress: 85, line: 'Line B' },
  { id: 'WO-2024-1890', product: 'Shaft Component SC-105', quantity: 100, planned: '2024-06-18', due: '2024-06-25', status: 'Quality Hold', progress: 90, line: 'Line C' },
  { id: 'WO-2024-1889', product: 'Housing Unit HU-330', quantity: 30, planned: '2024-06-15', due: '2024-06-22', status: 'Completed', progress: 100, line: 'Line A' },
  { id: 'WO-2024-1888', product: 'Gear Assembly GA-780', quantity: 75, planned: '2024-06-14', due: '2024-06-21', status: 'Completed', progress: 100, line: 'Line B' },
  { id: 'WO-2024-1887', product: 'Base Plate BP-120', quantity: 150, planned: '2024-06-25', due: '2024-07-05', status: 'Planned', progress: 0, line: 'Line A' },
];

export const equipment = [
  { id: 'EQ-001', name: 'CNC Machining Center', model: 'Haas VF-4', location: 'Machining Bay 1', status: 'Operational', lastMaint: '2024-05-15', nextMaint: '2024-07-15', calibDue: '2025-01-01' },
  { id: 'EQ-002', name: 'CMM Coordinate Measuring Machine', model: 'Hexagon Global 9.12.8', location: 'QC Lab', status: 'Operational', lastMaint: '2024-06-01', nextMaint: '2024-09-01', calibDue: '2024-07-01' },
  { id: 'EQ-003', name: 'MIG Welding Station #1', model: 'Lincoln Electric Power MIG 350MP', location: 'Welding Bay', status: 'Under Maintenance', lastMaint: '2024-06-18', nextMaint: '2024-09-18', calibDue: '2024-12-01' },
  { id: 'EQ-004', name: 'Torque Wrench Set A', model: 'Snap-on ATECH3FR250B', location: 'Assembly Area', status: 'Operational', lastMaint: '2024-04-10', nextMaint: '2024-10-10', calibDue: '2024-06-30' },
  { id: 'EQ-005', name: 'Paint Spray Booth', model: 'Nordson Manual', location: 'Paint Shop', status: 'Operational', lastMaint: '2024-05-20', nextMaint: '2024-08-20', calibDue: null },
  { id: 'EQ-006', name: 'Overhead Crane 5T', model: 'Konecranes CXT', location: 'Assembly Hall', status: 'Operational', lastMaint: '2024-06-10', nextMaint: '2024-09-10', calibDue: null },
  { id: 'EQ-007', name: 'Digital Calipers Set B', model: 'Mitutoyo 500-197-30', location: 'QC Lab', status: 'Calibration Due', lastMaint: '2024-01-15', nextMaint: '2025-01-15', calibDue: '2024-06-15' },
  { id: 'EQ-008', name: 'Surface Roughness Tester', model: 'Mitutoyo SJ-410', location: 'QC Lab', status: 'Operational', lastMaint: '2024-05-05', nextMaint: '2024-11-05', calibDue: '2024-11-01' },
];

export const qualityInspections = [
  { id: 'QI-2024-0892', date: '2024-06-18', workOrder: 'WO-2024-1892', type: 'In-Process', inspector: 'J. Smith', result: 'Pass', defects: 0, sampleSize: 10 },
  { id: 'QI-2024-0891', date: '2024-06-18', workOrder: 'WO-2024-1891', type: 'In-Process', inspector: 'L. Patel', result: 'Pass', defects: 1, sampleSize: 20 },
  { id: 'QI-2024-0890', date: '2024-06-17', workOrder: 'WO-2024-1890', type: 'Final', inspector: 'M. Chen', result: 'Fail', defects: 4, sampleSize: 10 },
  { id: 'QI-2024-0889', date: '2024-06-17', workOrder: 'WO-2024-1889', type: 'Final', inspector: 'J. Smith', result: 'Pass', defects: 0, sampleSize: 30 },
  { id: 'QI-2024-0888', date: '2024-06-16', workOrder: 'WO-2024-1888', type: 'Final', inspector: 'L. Patel', result: 'Pass', defects: 2, sampleSize: 75 },
];

export const productionTrend = [
  { week: 'W20', target: 180, actual: 172, defects: 5 },
  { week: 'W21', target: 180, actual: 185, defects: 3 },
  { week: 'W22', target: 190, actual: 188, defects: 4 },
  { week: 'W23', target: 190, actual: 195, defects: 2 },
  { week: 'W24', target: 200, actual: 192, defects: 6 },
  { week: 'W25', target: 200, actual: 198, defects: 3 },
];

export const recentActivity = [
  { id: 1, type: 'ncr', message: 'NCR-2024-045 opened – Dimensional out-of-spec on Part #A-2291', time: '2 hours ago', severity: 'minor' },
  { id: 2, type: 'wo', message: 'WO-2024-1890 placed on Quality Hold pending inspection review', time: '4 hours ago', severity: 'major' },
  { id: 3, type: 'doc', message: 'SOP-Calibration Control submitted for review (Rev 7→8)', time: '1 day ago', severity: 'info' },
  { id: 4, type: 'capa', message: 'CAPA-2024-016 marked Effective after 30-day verification', time: '1 day ago', severity: 'success' },
  { id: 5, type: 'audit', message: 'Internal Audit AUD-2024-003 scheduled for 10 July 2024', time: '2 days ago', severity: 'info' },
  { id: 6, type: 'equip', message: 'EQ-007 Digital Calipers calibration overdue – action required', time: '2 days ago', severity: 'major' },
];
