import mysql from "mysql2/promise";

if (process.env.SEED_CONFIRM !== "YES") {
  throw new Error("Refusing to seed without SEED_CONFIRM=YES. This script is intentionally guarded.");
}

const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
const employers = [
  { userId: 91001, name: "Azania Digital Works", email: "careers@azaniadigital.example", company: "Azania Digital Works", reg: "TZ-SEED-001", industry: "Technology", location: "Dar es Salaam", phone: "+255 700 000 101" },
  { userId: 91002, name: "Kilimanjaro Fresh Foods", email: "jobs@kilimanjarofresh.example", company: "Kilimanjaro Fresh Foods", reg: "TZ-SEED-002", industry: "Agriculture & Food", location: "Moshi", phone: "+255 700 000 102" },
  { userId: 91003, name: "Mwangaza Advisory Partners", email: "talent@mwangazaadvisory.example", company: "Mwangaza Advisory Partners", reg: "TZ-SEED-003", industry: "Law & Legal Services", location: "Dodoma", phone: "+255 700 000 103" },
  { userId: 91004, name: "Lake Zone Logistics", email: "people@lakezonelogistics.example", company: "Lake Zone Logistics", reg: "TZ-SEED-004", industry: "Logistics & Transport", location: "Mwanza", phone: "+255 700 000 104" },
  { userId: 91005, name: "Pwani Hospitality Group", email: "careers@pwanihospitality.example", company: "Pwani Hospitality Group", reg: "TZ-SEED-005", industry: "Hospitality & Tourism", location: "Zanzibar West", phone: "+255 700 000 105" },
  { userId: 91006, name: "Mara Health Network", email: "jobs@marahealth.example", company: "Mara Health Network", reg: "TZ-SEED-006", industry: "Healthcare", location: "Mara", phone: "+255 700 000 106" },
  { userId: 91007, name: "Rukwa BuildWorks", email: "people@rukwabuildworks.example", company: "Rukwa BuildWorks", reg: "TZ-SEED-007", industry: "Construction", location: "Rukwa", phone: "+255 700 000 107" },
  { userId: 91008, name: "Tanga Trade House", email: "talent@tangatrade.example", company: "Tanga Trade House", reg: "TZ-SEED-008", industry: "Business & Administration", location: "Tanga", phone: "+255 700 000 108" },
];
const vacancies = [
  { employer: employers[0], title: "Frontend Engineer", category: "IT & Cybersecurity", location: "Dar es Salaam", salary: "TZS 2,400,000–3,500,000 / month", description: "Build accessible web products for Tanzanian businesses with a cross-functional product team.", days: 38 },
  { employer: employers[0], title: "Customer Success Associate", category: "Business & Admin", location: "Remote", salary: "TZS 1,400,000–2,100,000 / month", description: "Help customers adopt digital tools, resolve issues, and turn feedback into better service.", days: 31 },
  { employer: employers[0], title: "Product Support Specialist", category: "IT & Cybersecurity", location: "Arusha", salary: "TZS 1,200,000–1,800,000 / month", description: "Guide customers through product setup, document issues, and collaborate with engineering on fixes.", days: 42 },
  { employer: employers[1], title: "Agribusiness Operations Officer", category: "Agriculture", location: "Moshi", salary: "TZS 1,800,000–2,600,000 / month", description: "Coordinate farmer partnerships, quality checks, and supply planning for fresh produce.", days: 27 },
  { employer: employers[1], title: "Quality Assurance Coordinator", category: "Agriculture", location: "Manyara", salary: "TZS 1,300,000–2,000,000 / month", description: "Track produce quality, supplier standards, and field reporting across a regional agriculture network.", days: 35 },
  { employer: employers[1], title: "Procurement Assistant", category: "Procurement & Logistics", location: "Arusha", salary: "TZS 900,000–1,400,000 / month", description: "Support supplier sourcing, purchase orders, inventory records, and delivery coordination.", days: 29 },
  { employer: employers[2], title: "Legal Officer", category: "Law & Legal Services", location: "Dodoma", salary: "TZS 2,000,000–3,000,000 / month", description: "Support commercial advisory work, legal research, contract review, and client matter tracking.", days: 24 },
  { employer: employers[2], title: "Compliance Analyst", category: "Law & Legal Services", location: "Dar es Salaam", salary: "TZS 1,700,000–2,500,000 / month", description: "Review policies, prepare compliance registers, and support practical risk controls for growing companies.", days: 36 },
  { employer: employers[2], title: "Paralegal Assistant", category: "Law & Legal Services", location: "Mwanza", salary: "TZS 900,000–1,400,000 / month", description: "Organize case files, conduct legal research, and support client documentation workflows.", days: 40 },
  { employer: employers[3], title: "Transport Planner", category: "Logistics & Transport", location: "Mwanza", salary: "TZS 1,600,000–2,400,000 / month", description: "Plan reliable routes and coordinate regional deliveries across the Lake Zone.", days: 34 },
  { employer: employers[3], title: "Fleet Administration Officer", category: "Logistics & Transport", location: "Shinyanga", salary: "TZS 1,100,000–1,700,000 / month", description: "Maintain fleet records, service schedules, driver documentation, and dispatch reports.", days: 32 },
  { employer: employers[3], title: "Warehouse Supervisor", category: "Logistics & Transport", location: "Kagera", salary: "TZS 1,200,000–1,900,000 / month", description: "Lead stock control, receiving, dispatch accuracy, and warehouse team coordination.", days: 28 },
  { employer: employers[4], title: "Front Office Supervisor", category: "Hospitality & Tourism", location: "Zanzibar West", salary: "TZS 1,300,000–2,000,000 / month", description: "Lead guest experience, front desk operations, shift handovers, and service standards.", days: 30 },
  { employer: employers[4], title: "Restaurant Operations Lead", category: "Hospitality & Tourism", location: "Zanzibar North", salary: "TZS 1,500,000–2,300,000 / month", description: "Coordinate restaurant service, staff schedules, stock planning, and guest experience.", days: 37 },
  { employer: employers[5], title: "Clinical Records Officer", category: "Healthcare", location: "Mara", salary: "TZS 1,000,000–1,600,000 / month", description: "Maintain accurate patient records, reporting workflows, and confidential health documentation.", days: 26 },
  { employer: employers[5], title: "Community Health Coordinator", category: "Healthcare", location: "Simiyu", salary: "TZS 1,400,000–2,200,000 / month", description: "Coordinate community outreach, partner reporting, and health education activities.", days: 33 },
  { employer: employers[6], title: "Site Engineer", category: "Engineering & Construction", location: "Rukwa", salary: "TZS 2,000,000–3,200,000 / month", description: "Coordinate site activities, quality checks, contractor schedules, and construction reporting.", days: 41 },
  { employer: employers[6], title: "Quantity Survey Assistant", category: "Engineering & Construction", location: "Mbeya", salary: "TZS 1,100,000–1,800,000 / month", description: "Support cost estimates, material take-offs, site measurements, and project documentation.", days: 39 },
  { employer: employers[7], title: "Sales and Distribution Officer", category: "Marketing & Sales", location: "Tanga", salary: "TZS 1,000,000–1,700,000 / month", description: "Grow distributor relationships, track sales activity, and improve product availability across Tanga.", days: 31 },
  { employer: employers[7], title: "Accounts Assistant", category: "Accounting & Finance", location: "Pwani", salary: "TZS 900,000–1,400,000 / month", description: "Support invoicing, reconciliations, expense records, and monthly finance reporting.", days: 35 },
];

for (const employer of employers) {
  await connection.execute(`INSERT INTO employerProfiles (userId, companyName, registrationNumber, industry, location, email, phone, verified) VALUES (?, ?, ?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE companyName=VALUES(companyName), registrationNumber=VALUES(registrationNumber), industry=VALUES(industry), location=VALUES(location), email=VALUES(email), phone=VALUES(phone), verified=1`, [employer.userId, employer.company, employer.reg, employer.industry, employer.location, employer.email, employer.phone]);
}

for (const vacancy of vacancies) {
  const employerUserId = vacancy.employer.userId;
  const [existing] = await connection.execute("SELECT id FROM vacancies WHERE employerUserId = ? AND title = ? LIMIT 1", [employerUserId, vacancy.title]);
  if (existing.length === 0) {
    await connection.execute(`INSERT INTO vacancies (employerUserId, title, company, category, location, salary, description, deadline, status, employerVerified) VALUES (?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), 'live', 1)`, [employerUserId, vacancy.title, vacancy.employer.company, vacancy.category, vacancy.location, vacancy.salary, vacancy.description, vacancy.days]);
  }
}

console.log(JSON.stringify({ seededEmployers: employers.length, seededVacancies: vacancies.length, mode: "idempotent" }));
await connection.end();
