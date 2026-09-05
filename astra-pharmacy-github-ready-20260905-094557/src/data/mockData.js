// =====================================================================
// Astra Pharmacy — seed mock data
// Rich, complete, realistic data so the system feels alive on first load.
// =====================================================================

export const DEFAULT_PHRASES = [
  'الشفاء العاجل لكل مريض بإذن الله',
  'صحة أهلنا أمانة في أعناقنا',
  'نعتني بكم كما نعتني بعائلاتنا',
  'دواؤك أمانتك بين أيدينا',
  'صيدلية أسترا — شريكك الدائم في الصحة',
  'نسأل الله لكم العافية والسلامة',
];

// ---------------------------------------------------------------------
// Distributors / warehouses
// ---------------------------------------------------------------------
export const DEFAULT_DISTRIBUTORS = [
  {
    id: 'dst-1',
    name: 'شركة الشفاء للتوزيع',
    country: 'الأردن',
    currency: 'JOD',
    contact: '0795000111',
    email: 'sales@shifa-dist.jo',
    warehouses: ['مستودع الشفاء - عمّان', 'مستودع الشفاء - إربد'],
  },
  {
    id: 'dst-2',
    name: 'مؤسسة الدواء الذهبي',
    country: 'مصر',
    currency: 'EGP',
    contact: '01002223344',
    email: 'orders@golden-pharma.eg',
    warehouses: ['مستودع القاهرة المركزي'],
  },
  {
    id: 'dst-3',
    name: 'Alma Pharma International',
    country: 'فرنسا',
    currency: 'EUR',
    contact: '+33 1 4455 6677',
    email: 'export@alma-pharma.fr',
    warehouses: ['Lyon Central Warehouse'],
  },
  {
    id: 'dst-4',
    name: 'دار الدواء للأدوية',
    country: 'السعودية',
    currency: 'SAR',
    contact: '0501234567',
    email: 'sales@dardawaa.sa',
    warehouses: ['مستودع الرياض', 'مستودع جدة'],
  },
  {
    id: 'dst-5',
    name: 'Pharma Global Trading',
    country: 'ألمانيا',
    currency: 'EUR',
    contact: '+49 30 1234 5678',
    email: 'orders@pharma-global.de',
    warehouses: ['Berlin Distribution Center'],
  },
  {
    id: 'dst-6',
    name: 'بيت الحكمة للأدوية',
    country: 'الإمارات',
    currency: 'AED',
    contact: '0509876543',
    email: 'sales@bayt-alhikma.ae',
    warehouses: ['مستودع دبي'],
  },
];

// ---------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------
export const DEFAULT_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'د. أحمد الخالدي',
    role: 'صيدلي',
    salary: 1200,
    hireDate: '2021-03-15',
    phone: '0791112233',
  },
  {
    id: 'emp-2',
    name: 'سارة المحمود',
    role: 'صيدلي مساعد',
    salary: 800,
    hireDate: '2022-07-01',
    phone: '0792223344',
  },
  {
    id: 'emp-3',
    name: 'محمد العتيبي',
    role: 'كاشير',
    salary: 600,
    hireDate: '2023-01-20',
    phone: '0793334455',
  },
  {
    id: 'emp-4',
    name: 'ليلى حسن',
    role: 'كاشير',
    salary: 600,
    hireDate: '2023-09-10',
    phone: '0794445566',
  },
  {
    id: 'emp-5',
    name: 'يوسف الناصر',
    role: 'مدير',
    salary: 1800,
    hireDate: '2020-05-05',
    phone: '0795556677',
  },
  {
    id: 'emp-6',
    name: 'فاطمة الزهراء',
    role: 'عاملة نظافة',
    salary: 400,
    hireDate: '2024-02-12',
    phone: '0796667788',
  },
  {
    id: 'emp-7',
    name: 'كريم السيد',
    role: 'صيدلي مساعد',
    salary: 750,
    hireDate: '2024-06-18',
    phone: '0797778899',
  },
];

// ---------------------------------------------------------------------
// Medicine catalog (~55 medicines, 3-5 options per condition)
// Each item includes a stable `id`, condition for the disease search,
// shelf location, and classification flags for the POS patient field.
// ---------------------------------------------------------------------

// Generate a deterministic 12-digit barcode (looks like a real EAN-13
// prefix) from the medicine id. First 3 digits = "country" prefix
// (e.g. 629 for Jordan, 622 for Egypt, 376 for France, ...), then a
// stable 8-digit hash, then a single check digit. This keeps the demo
// realistic and unique.
function makeBarcode(id) {
  // Hash the id to a stable 8-digit number
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  const body = ('00000000' + (h % 100000000)).slice(-8);
  // Check digit (simple Luhn-like sum mod 10, good enough for a demo)
  const digits = body.split('').map(Number);
  const sum = digits.reduce((s, d, i) => s + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return `629${body}${check}`; // 629 = Jordan pharma prefix
}

const med = (
  id,
  tradeName,
  scientificName,
  company,
  country,
  form,
  dose,
  packSize,
  qty,
  buyPrice,
  sellPrice,
  condition,
  shelf,
  prescription = false,
  expiryDate
) => ({
  id,
  barcode: makeBarcode(id),
  tradeName,
  scientificName,
  company,
  country,
  form,
  dose,
  packSize,
  qty,
  buyPrice,
  sellPrice,
  condition,
  shelf,
  prescription,
  expiryDate,
});

export const DEFAULT_MEDICINES = [
  // -------- Head pain & fever --------
  med('m-001', 'بنادول إكسترا', 'Paracetamol + Caffeine', 'GSK', 'بريطانيا', 'أقراص', '500mg', '24 قرص', 84, 1.2, 2.0, 'صداع وحمى', 'A-1-1', false, '2027-06-30'),
  med('m-002', 'بنادول أدفانس', 'Paracetamol 500mg', 'GSK', 'بريطانيا', 'أقراص', '500mg', '24 قرص', 8, 1.3, 2.2, 'صداع وحمى', 'A-1-2', false, '2026-12-15'),
  med('m-003', 'ريفانين 400', 'Ibuprofen 400mg', 'الأردن', 'الأردن', 'أقراص', '400mg', '20 قرص', 45, 1.0, 1.8, 'صداع وحمى', 'A-1-3', false, '2027-03-20'),
  med('m-004', 'بروفين شراب', 'Ibuprofen 100mg/5ml', 'الأردن', 'الأردن', 'شراب', '100mg/5ml', '100ml', 30, 1.5, 2.5, 'صداع وحمى', 'A-1-4', false, '2026-10-10'),
  med('m-005', 'أبيمول', 'Paracetamol 500mg', 'الحكمة', 'الأردن', 'أقراص', '500mg', '20 قرص', 60, 0.8, 1.5, 'صداع وحمى', 'A-1-5', false, '2027-08-25'),

  // -------- Bacterial infections (antibiotics) --------
  med('m-006', 'أوغمنتين 1غ', 'Amoxicillin + Clavulanate', 'GSK', 'بريطانيا', 'أقراص', '1g', '14 قرص', 6, 4.5, 7.0, 'التهابات بكتيرية', 'A-2-1', true, '2026-09-30'),
  med('m-007', 'أموكسيل 500', 'Amoxicillin 500mg', 'الحكمة', 'الأردن', 'كبسولات', '500mg', '20 كبسولة', 12, 2.0, 3.5, 'التهابات بكتيرية', 'A-2-2', true, '2026-11-15'),
  med('m-008', 'سيبروكس 500', 'Ciprofloxacin 500mg', 'الحكمة', 'الأردن', 'أقراص', '500mg', '10 أقراص', 18, 2.5, 4.2, 'التهابات بكتيرية', 'A-2-3', true, '2027-02-28'),
  med('m-009', 'زيثروماكس 500', 'Azithromycin 500mg', 'Pfizer', 'الولايات المتحدة', 'أقراص', '500mg', '3 أقراص', 9, 5.0, 8.5, 'التهابات بكتيرية', 'A-2-4', true, '2027-05-10'),
  med('m-010', 'أوغمنتين شراب', 'Amoxicillin + Clavulanate', 'GSK', 'بريطانيا', 'شراب', '457mg/5ml', '70ml', 14, 3.8, 6.0, 'التهابات بكتيرية', 'A-2-5', true, '2026-12-30'),

  // -------- Hypertension --------
  med('m-011', 'كونكور 5', 'Bisoprolol 5mg', 'Merck', 'ألمانيا', 'أقراص', '5mg', '30 قرص', 50, 2.5, 4.0, 'ضغط الدم', 'B-1-1', true, '2027-04-20'),
  med('m-012', 'لوزاك 50', 'Losartan 50mg', 'MSD', 'الولايات المتحدة', 'أقراص', '50mg', '28 قرص', 7, 3.0, 5.0, 'ضغط الدم', 'B-1-2', true, '2026-11-25'),
  med('m-013', 'أملور 5', 'Amlodipine 5mg', 'الحكمة', 'الأردن', 'أقراص', '5mg', '30 قرص', 40, 1.5, 2.8, 'ضغط الدم', 'B-1-3', true, '2027-07-15'),
  med('m-014', 'إزوكور 10', 'Enalapril 10mg', 'الحكمة', 'الأردن', 'أقراص', '10mg', '20 قرص', 25, 1.8, 3.0, 'ضغط الدم', 'B-1-4', true, '2026-10-05'),
  med('m-015', 'هايبريكس 12.5', 'Hydrochlorothiazide 12.5mg', 'Sanofi', 'فرنسا', 'أقراص', '12.5mg', '30 قرص', 18, 2.0, 3.4, 'ضغط الدم', 'B-1-5', true, '2027-01-30'),

  // -------- Diabetes --------
  med('m-016', 'جلوكوفاج 500', 'Metformin 500mg', 'Merck', 'ألمانيا', 'أقراص', '500mg', '50 قرص', 55, 2.0, 3.5, 'السكري', 'B-2-1', true, '2027-06-20'),
  med('m-017', 'جلوكوفاج 850', 'Metformin 850mg', 'Merck', 'ألمانيا', 'أقراص', '850mg', '50 قرص', 10, 2.8, 4.5, 'السكري', 'B-2-2', true, '2026-12-12'),
  med('m-018', 'ديامكرون MR 60', 'Gliclazide 60mg', 'Servier', 'فرنسا', 'أقراص', '60mg', '30 قرص', 22, 4.0, 6.5, 'السكري', 'B-2-3', true, '2027-03-15'),
  med('m-019', 'أماريل 2', 'Glimepiride 2mg', 'Sanofi', 'فرنسا', 'أقراص', '2mg', '30 قرص', 5, 3.2, 5.2, 'السكري', 'B-2-4', true, '2026-11-20'),
  med('m-020', 'جانوفيا 100', 'Sitagliptin 100mg', 'MSD', 'الولايات المتحدة', 'أقراص', '100mg', '28 قرص', 8, 12.0, 18.0, 'السكري', 'B-2-5', true, '2027-08-30'),

  // -------- Cholesterol --------
  med('m-021', 'ليبيتور 20', 'Atorvastatin 20mg', 'Pfizer', 'الولايات المتحدة', 'أقراص', '20mg', '30 قرص', 35, 5.5, 8.5, 'الكوليسترول', 'B-3-1', true, '2027-05-25'),
  med('m-022', 'ليبيتور 40', 'Atorvastatin 40mg', 'Pfizer', 'الولايات المتحدة', 'أقراص', '40mg', '30 قرص', 6, 8.0, 12.0, 'الكوليسترول', 'B-3-2', true, '2027-07-30'),
  med('m-023', 'كريستور 10', 'Rosuvastatin 10mg', 'AstraZeneca', 'بريطانيا', 'أقراص', '10mg', '28 قرص', 20, 6.5, 10.0, 'الكوليسترول', 'B-3-3', true, '2027-04-10'),
  med('m-024', 'سيموفال 20', 'Simvastatin 20mg', 'الحكمة', 'الأردن', 'أقراص', '20mg', '30 قرص', 28, 2.0, 3.5, 'الكوليسترول', 'B-3-4', true, '2027-02-15'),
  med('m-025', 'إيزيتيميب 10', 'Ezetimibe 10mg', 'MSD', 'الولايات المتحدة', 'أقراص', '10mg', '28 قرص', 12, 7.0, 11.0, 'الكوليسترول', 'B-3-5', true, '2027-06-05'),

  // -------- Allergies & cold --------
  med('m-026', 'سيتريزين 10', 'Cetirizine 10mg', 'الحكمة', 'الأردن', 'أقراص', '10mg', '20 قرص', 65, 1.0, 1.8, 'حساسية وزكام', 'C-1-1', false, '2027-09-15'),
  med('m-027', 'لوراتادين 10', 'Loratadine 10mg', 'الحكمة', 'الأردن', 'أقراص', '10mg', '20 قرص', 50, 1.2, 2.0, 'حساسية وزكام', 'C-1-2', false, '2027-08-10'),
  med('m-028', 'كلاريتين شراب', 'Loratadine 5mg/5ml', 'Bayer', 'ألمانيا', 'شراب', '5mg/5ml', '100ml', 22, 2.5, 4.0, 'حساسية وزكام', 'C-1-3', false, '2027-04-20'),
  med('m-029', 'بنادول كولد + فلو', 'Paracetamol + Phenylephrine', 'GSK', 'بريطانيا', 'أقراص', '500/5mg', '24 قرص', 30, 1.8, 3.0, 'حساسية وزكام', 'C-1-4', false, '2026-12-30'),
  med('m-030', 'أوتريفين بخاخ', 'Oxymetazoline 0.05%', 'Novartis', 'سويسرا', 'بخاخ أنف', '0.05%', '10ml', 14, 2.0, 3.2, 'حساسية وزكام', 'C-1-5', false, '2027-01-20'),

  // -------- Stomach acidity & ulcers --------
  med('m-031', 'نيكسيوم 40', 'Esomeprazole 40mg', 'AstraZeneca', 'بريطانيا', 'كبسولات', '40mg', '14 كبسولة', 8, 5.5, 9.0, 'حموضة وقرحة', 'C-2-1', true, '2026-11-30'),
  med('m-032', 'كونترولوك 40', 'Pantoprazole 40mg', 'Takeda', 'اليابان', 'أقراص', '40mg', '14 قرص', 25, 4.5, 7.5, 'حموضة وقرحة', 'C-2-2', true, '2027-03-10'),
  med('m-033', 'أوميز 20', 'Omeprazole 20mg', 'الحكمة', 'الأردن', 'كبسولات', '20mg', '14 كبسولة', 50, 2.0, 3.5, 'حموضة وقرحة', 'C-2-3', false, '2027-06-15'),
  med('m-034', 'مالوكس شراب', 'Al(OH)3 + Mg(OH)2', 'Sanofi', 'فرنسا', 'شراب', 'معلق', '200ml', 18, 1.5, 2.8, 'حموضة وقرحة', 'C-2-4', false, '2027-05-05'),
  med('m-035', 'جافيسكون شراب', 'Sodium Alginate', 'Reckitt', 'بريطانيا', 'شراب', 'معلق', '150ml', 20, 2.2, 3.6, 'حموضة وقرحة', 'C-2-5', false, '2027-07-25'),

  // -------- Joint & muscle pain --------
  med('m-036', 'فولتارين جل', 'Diclofenac 1%', 'Novartis', 'سويسرا', 'جل', '1%', '50g', 35, 2.5, 4.2, 'آلام المفاصل', 'D-1-1', false, '2026-12-05'),
  med('m-037', 'فولتارين 50', 'Diclofenac 50mg', 'Novartis', 'سويسرا', 'أقراص', '50mg', '20 قرص', 22, 2.0, 3.4, 'آلام المفاصل', 'D-1-2', true, '2027-01-15'),
  med('m-038', 'موبيك 15', 'Meloxicam 15mg', 'Boehringer', 'ألمانيا', 'أقراص', '15mg', '10 أقراص', 18, 3.0, 5.0, 'آلام المفاصل', 'D-1-3', true, '2027-04-25'),
  med('m-039', 'بنادول جوينت', 'Paracetamol 665mg', 'GSK', 'بريطانيا', 'أقراص', '665mg', '18 قرص', 7, 2.8, 4.5, 'آلام المفاصل', 'D-1-4', false, '2027-08-20'),
  med('m-040', 'أرثروفاست 50', 'Diclofenac 50mg', 'الحكمة', 'الأردن', 'كبسولات', '50mg', '20 كبسولة', 15, 1.5, 2.6, 'آلام المفاصل', 'D-1-5', true, '2027-02-10'),

  // -------- Vitamins & supplements --------
  med('m-041', 'فيتامين د3 1000', 'Cholecalciferol 1000IU', 'Now', 'الولايات المتحدة', 'كبسولات', '1000IU', '60 كبسولة', 70, 3.0, 5.0, 'فيتامينات ومكملات', 'D-2-1', false, '2027-12-30'),
  med('m-042', 'سنتروم Adults', 'Multivitamins + Minerals', 'Pfizer', 'الولايات المتحدة', 'أقراص', 'مركب', '30 قرص', 40, 5.0, 8.0, 'فيتامينات ومكملات', 'D-2-2', false, '2027-10-20'),
  med('m-043', 'أوميجا 3', 'Fish Oil 1000mg', 'Now', 'الولايات المتحدة', 'كبسولات', '1000mg', '100 كبسولة', 28, 6.0, 9.5, 'فيتامينات ومكملات', 'D-2-3', false, '2027-11-15'),
  med('m-044', 'حديد فيروجلوبین', 'Iron + B12 + Folic', 'Vitabiotics', 'بريطانيا', 'كبسولات', 'مركب', '30 كبسولة', 6, 4.5, 7.0, 'فيتامينات ومكملات', 'D-2-4', false, '2027-09-05'),
  med('m-045', 'كالسيوم D3', 'Calcium + Vitamin D3', 'Now', 'الولايات المتحدة', 'أقراص', '600mg/400IU', '100 قرص', 25, 4.0, 6.5, 'فيتامينات ومكملات', 'D-2-5', false, '2027-07-30'),

  // -------- Pediatric syrups --------
  med('m-046', 'بنادول للأطفال', 'Paracetamol 120mg/5ml', 'GSK', 'بريطانيا', 'شراب', '120mg/5ml', '100ml', 40, 1.8, 3.0, 'أدوية الأطفال', 'E-1-1', false, '2027-05-30'),
  med('m-047', 'بروفين للأطفال', 'Ibuprofen 100mg/5ml', 'الأردن', 'الأردن', 'شراب', '100mg/5ml', '100ml', 32, 2.0, 3.4, 'أدوية الأطفال', 'E-1-2', false, '2027-06-10'),
  med('m-048', 'كلاريتين للأطفال', 'Loratadine 5mg/5ml', 'Bayer', 'ألمانيا', 'شراب', '5mg/5ml', '60ml', 18, 2.2, 3.6, 'أدوية الأطفال', 'E-1-3', false, '2027-03-15'),
  med('m-049', 'أوغمنتين شراب أطفال', 'Amoxicillin 457mg/5ml', 'GSK', 'بريطانيا', 'شراب', '457mg/5ml', '70ml', 9, 3.5, 5.8, 'أدوية الأطفال', 'E-1-4', true, '2026-12-25'),
  med('m-050', 'فيتامين د3 قطرات', 'Cholecalciferol 400IU', 'Now', 'الولايات المتحدة', 'قطرات', '400IU/0.03ml', '10ml', 22, 3.0, 4.8, 'أدوية الأطفال', 'E-1-5', false, '2027-08-15'),

  // -------- Skin conditions --------
  med('m-051', 'هيدروكورتيزون كريم', 'Hydrocortisone 1%', 'GSK', 'بريطانيا', 'كريم', '1%', '30g', 20, 1.5, 2.8, 'حالات جلدية', 'E-2-1', false, '2026-12-15'),
  med('m-052', 'فوسيدين كريم', 'Fusidic Acid 2%', 'Leo', 'الدنمارك', 'كريم', '2%', '15g', 14, 2.5, 4.0, 'حالات جلدية', 'E-2-2', true, '2027-02-20'),
  med('m-053', 'بانثينول كريم', 'Dexpanthenol 5%', 'Bayer', 'ألمانيا', 'كريم', '5%', '30g', 25, 1.8, 3.2, 'حالات جلدية', 'E-2-3', false, '2027-04-10'),
  med('m-054', 'كلوتريمازول كريم', 'Clotrimazole 1%', 'الحكمة', 'الأردن', 'كريم', '1%', '20g', 16, 1.2, 2.0, 'حالات جلدية', 'E-2-4', false, '2027-06-25'),
  med('m-055', 'ديرموفيت كريم', 'Clobetasol 0.05%', 'GSK', 'بريطانيا', 'كريم', '0.05%', '25g', 6, 3.0, 4.8, 'حالات جلدية', 'E-2-5', true, '2027-01-30'),

  // -------- Respiratory / asthma --------
  med('m-056', 'فنتولين بخاخ', 'Salbutamol 100mcg', 'GSK', 'بريطانيا', 'بخاخ', '100mcg', '200 جرعة', 5, 4.0, 6.5, 'ربو وأمراض تنفسية', 'A-3-1', true, '2027-03-25'),
  med('m-057', 'سيريتيد بخاخ', 'Salmeterol + Fluticasone', 'GSK', 'بريطانيا', 'بخاخ', '50/250mcg', '120 جرعة', 8, 18.0, 26.0, 'ربو وأمراض تنفسية', 'A-3-2', true, '2027-05-15'),
  med('m-058', 'سينجولير 10', 'Montelukast 10mg', 'MSD', 'الولايات المتحدة', 'أقراص', '10mg', '28 قرص', 12, 11.0, 16.5, 'ربو وأمراض تنفسية', 'A-3-3', true, '2027-07-20'),
  med('m-059', 'ميوكوسول شراب', 'Carbocisteine 250mg/5ml', 'الحكمة', 'الأردن', 'شراب', '250mg/5ml', '200ml', 18, 1.5, 2.6, 'ربو وأمراض تنفسية', 'A-3-4', false, '2027-04-30'),
  med('m-060', 'بلميكورت بودرة', 'Budesonide 200mcg', 'AstraZeneca', 'بريطانيا', 'بخاخ بودرة', '200mcg', '100 جرعة', 7, 9.0, 13.5, 'ربو وأمراض تنفسية', 'A-3-5', true, '2027-08-05'),
];

// ---------------------------------------------------------------------
// Reorder threshold: any medicine with qty <= this is "low stock"
// ---------------------------------------------------------------------
export const REORDER_THRESHOLD = 10;

// ---------------------------------------------------------------------
// Helpers used by both seed and store
// ---------------------------------------------------------------------
const MED_CONDITIONS = Array.from(
  new Set(DEFAULT_MEDICINES.map((m) => m.condition))
).sort();

export const CONDITIONS = MED_CONDITIONS;

const COUNTRIES = Array.from(
  new Set(DEFAULT_MEDICINES.map((m) => m.country))
).sort();

export const COUNTRIES_LIST = COUNTRIES;

const COMPANIES = Array.from(
  new Set(DEFAULT_MEDICINES.map((m) => m.company))
).sort();

export const COMPANIES_LIST = COMPANIES;

const FORMS = Array.from(
  new Set(DEFAULT_MEDICINES.map((m) => m.form))
).sort();

export const FORMS_LIST = FORMS;

// Distinct warehouse list (derived from distributors)
export const WAREHOUSES_LIST = DEFAULT_DISTRIBUTORS.flatMap((d) =>
  d.warehouses.map((w) => w)
);

// Distinct sales reps (we model them as simple names; in a real system
// these would link to employees. Here we generate plausible Arabic names.)
export const SALES_REPS_LIST = [
  'أ. خالد العزب',
  'أ. منى الرفاعي',
  'أ. سامي حداد',
  'أ. ريم الزعبي',
  'أ. حسام قاسم',
  'أ. دينا كنعان',
];

// ---------------------------------------------------------------------
// Sales reps mapping per distributor
// ---------------------------------------------------------------------
export const DISTRIBUTOR_REPS = DEFAULT_DISTRIBUTORS.reduce((acc, d) => {
  acc[d.id] = SALES_REPS_LIST.slice(0, 3);
  return acc;
}, {});

// ---------------------------------------------------------------------
// Generate a set of pre-existing receipts spread over the past 30 days,
// so the dashboard, finance and master-data archive have real numbers.
// ---------------------------------------------------------------------
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeReceipt(idSuffix, daysBack, patient, lines) {
  const total = lines.reduce(
    (s, l) => s + l.qty * l.unitPrice,
    0
  );
  return {
    id: `rcp-${idSuffix}`,
    timestamp: daysAgo(daysBack),
    patient,
    lines: lines.map((l) => ({
      medicineId: l.medicineId,
      name: DEFAULT_MEDICINES.find((m) => m.id === l.medicineId).tradeName,
      qty: l.qty,
      unitPrice: l.unitPrice,
    })),
    total: Number(total.toFixed(2)),
  };
}

export const DEFAULT_RECEIPTS = [
  makeReceipt('0001', 0, 'محمد العلي', [
    { medicineId: 'm-001', qty: 2, unitPrice: 2.0 },
    { medicineId: 'm-026', qty: 1, unitPrice: 1.8 },
  ]),
  makeReceipt('0002', 0, 'سارة الخالد', [
    { medicineId: 'm-006', qty: 1, unitPrice: 7.0 },
    { medicineId: 'm-046', qty: 1, unitPrice: 3.0 },
  ]),
  makeReceipt('0003', 1, 'أحمد الرشيد', [
    { medicineId: 'm-011', qty: 1, unitPrice: 4.0 },
    { medicineId: 'm-016', qty: 1, unitPrice: 3.5 },
  ]),
  makeReceipt('0004', 2, 'نور الدين', [
    { medicineId: 'm-021', qty: 1, unitPrice: 8.5 },
    { medicineId: 'm-041', qty: 1, unitPrice: 5.0 },
  ]),
  makeReceipt('0005', 3, 'هند الزهراني', [
    { medicineId: 'm-056', qty: 1, unitPrice: 6.5 },
    { medicineId: 'm-031', qty: 1, unitPrice: 9.0 },
  ]),
  makeReceipt('0006', 5, 'عمر الفهد', [
    { medicineId: 'm-003', qty: 2, unitPrice: 1.8 },
    { medicineId: 'm-029', qty: 1, unitPrice: 3.0 },
  ]),
  makeReceipt('0007', 7, 'مريم السيد', [
    { medicineId: 'm-013', qty: 1, unitPrice: 2.8 },
    { medicineId: 'm-018', qty: 1, unitPrice: 6.5 },
  ]),
  makeReceipt('0008', 9, 'يوسف العامري', [
    { medicineId: 'm-036', qty: 1, unitPrice: 4.2 },
    { medicineId: 'm-053', qty: 1, unitPrice: 3.2 },
  ]),
  makeReceipt('0009', 12, 'لميا الحلبي', [
    { medicineId: 'm-009', qty: 1, unitPrice: 8.5 },
    { medicineId: 'm-027', qty: 1, unitPrice: 2.0 },
  ]),
  makeReceipt('0010', 15, 'خالد الحمد', [
    { medicineId: 'm-046', qty: 1, unitPrice: 3.0 },
    { medicineId: 'm-050', qty: 1, unitPrice: 4.8 },
    { medicineId: 'm-031', qty: 1, unitPrice: 9.0 },
  ]),
  makeReceipt('0011', 18, 'دينا الشامي', [
    { medicineId: 'm-012', qty: 1, unitPrice: 5.0 },
    { medicineId: 'm-024', qty: 1, unitPrice: 3.5 },
  ]),
  makeReceipt('0012', 22, 'حسن النجار', [
    { medicineId: 'm-002', qty: 2, unitPrice: 2.2 },
    { medicineId: 'm-033', qty: 1, unitPrice: 3.5 },
  ]),
  makeReceipt('0013', 25, 'رهام العبدالله', [
    { medicineId: 'm-043', qty: 1, unitPrice: 9.5 },
    { medicineId: 'm-042', qty: 1, unitPrice: 8.0 },
  ]),
  makeReceipt('0014', 28, 'سامي الكيلاني', [
    { medicineId: 'm-038', qty: 1, unitPrice: 5.0 },
    { medicineId: 'm-007', qty: 1, unitPrice: 3.5 },
  ]),
];

// ---------------------------------------------------------------------
// Expenses (so the finance engine has cost data to work against)
// ---------------------------------------------------------------------
export const DEFAULT_EXPENSES = [
  { id: 'exp-1', label: 'فاتورة كهرباء شهرية', amount: 250, date: daysAgo(3), category: 'مرافق' },
  { id: 'exp-2', label: 'إيجار الصيدلية', amount: 1200, date: daysAgo(5), category: 'إيجار' },
  { id: 'exp-3', label: 'مستلزمات تنظيف', amount: 80, date: daysAgo(8), category: 'مستلزمات' },
  { id: 'exp-4', label: 'هالك وتالف', amount: 120, date: daysAgo(11), category: 'هالك' },
  { id: 'exp-5', label: 'صيانة ثلاجة العرض', amount: 150, date: daysAgo(15), category: 'صيانة' },
];

// ---------------------------------------------------------------------
// Distributor debts
// ---------------------------------------------------------------------
export const DEFAULT_DEBTS = [
  { id: 'dbt-1', distributorId: 'dst-1', label: 'فاتورة شهرية 08/2026', amount: 3400, date: daysAgo(6) },
  { id: 'dbt-2', distributorId: 'dst-4', label: 'طلب أدوية 08/2026', amount: 2100, date: daysAgo(12) },
];

// ---------------------------------------------------------------------
// Sales log (every line of every receipt, so the home dashboard can
// report "today's sales", and the finance engine can compute profit)
// ---------------------------------------------------------------------
export const DEFAULT_SALES_LOG = DEFAULT_RECEIPTS.flatMap((r) =>
  r.lines.map((l, i) => ({
    id: `${r.id}-${i}`,
    receiptId: r.id,
    medicineId: l.medicineId,
    qty: l.qty,
    unitPrice: l.unitPrice,
    unitCost:
      DEFAULT_MEDICINES.find((m) => m.id === l.medicineId)?.buyPrice ?? 0,
    timestamp: r.timestamp,
  }))
);

// ---------------------------------------------------------------------
// Default settings
// ---------------------------------------------------------------------
export const DEFAULT_SETTINGS = {
  theme: 'light', // 'light' | 'dark'
  language: 'ar', // 'ar' | 'en'
  shelfColumns: 5, // A..E
  shelfRows: 5, // shelves per column
  pin: '1234', // default 4-digit PIN, changeable in Settings
  reducedMotion: false, // respect prefers-reduced-motion automatically
};

export const STORAGE_KEY = 'astra-pharmacy-state-v1';
