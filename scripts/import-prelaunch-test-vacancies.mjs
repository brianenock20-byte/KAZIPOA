import mysql from "mysql2/promise";

const BATCH_ID = "KAZIPOA_PRELAUNCH_TEST_001";
const SOURCE_NAME = "Great Tanzania Jobs — direct source listing";
const SOURCE_TYPE = "external_test";

const vacancies = [
  {
    title: "Sales Executive",
    company: "360HR Solutions",
    category: "Sales & Retail",
    location: "Mwanza, Mbeya, Geita, Tanzania",
    salary: "Not disclosed",
    description: "Full-time sales role for heavy construction machinery and related products and services. The source listing describes sales responsibilities, territory coverage, customer engagement, and role-specific requirements. Review the original source listing for the complete requirements before applying.",
    deadline: "2026-09-05 23:59:59",
    urgent: 0,
    sourceUrl: "https://www.greattanzaniajobs.com/jobs/job-detail/job-Sales-Executive-job-at-360HR-Solutions-85568/nav-15?Itemid=231",
    externalApplicationUrl: "https://www.greattanzaniajobs.com/company-application-form?form%5Bcompany%5D=360HR%20Solutions&form%5Bjob-title%5D=Sales%20Executive&form%5Bapplication-email%5D=recruitment%40360hrsolution.co.tz&form%5Bvalid-to%5D=Saturday%2C%20September%205%202026",
  },
  {
    title: "Deputy Sales Manager",
    company: "360HR Solutions",
    category: "Sales & Retail; Management; Business Operations",
    location: "Dar es Salaam and Geita, Tanzania",
    salary: "Not disclosed",
    description: "Full-time deputy sales management role focused on leading sales teams and driving business growth in heavy construction machinery. The source listing describes sales leadership, territory responsibilities, and role-specific requirements. Review the original source listing for the complete requirements before applying.",
    deadline: "2026-09-05 23:59:59",
    urgent: 0,
    sourceUrl: "https://www.greattanzaniajobs.com/jobs/job-detail/job-Deputy-Sales-Manager-job-at-360HR-Solutions-85569/nav-15?Itemid=231",
    externalApplicationUrl: "https://www.greattanzaniajobs.com/company-application-form?form%5Bcompany%5D=360HR%20Solutions&form%5Bjob-title%5D=Deputy%20Sales%20Manager&form%5Bapplication-email%5D=recruitment%40360hrsolution.co.tz&form%5Bvalid-to%5D=Saturday%2C%20September%205%202026",
  },
  {
    title: "Health Safety and Environment Officer",
    company: "Epic",
    category: "Environmental/Safety",
    location: "Dar es Salaam, Tanzania",
    salary: "Not disclosed",
    description: "Full-time hospitality-context HSE role. Source responsibilities include regulatory compliance, HSE programmes, reporting and records, inspections and audits, training and awareness, and guidance on HSE practices. Source requirements include a bachelor’s degree or diploma in HSE or a related field, two to three years of relevant experience, hospitality experience preferred, knowledge of HSE standards, and strong communication skills.",
    deadline: "2026-08-25 23:59:59",
    urgent: 1,
    sourceUrl: "https://www.greattanzaniajobs.com/jobs/job-detail/job-Health-Safety-and-Environment-Officer-job-at-Epic-85571/nav-15?Itemid=231",
    externalApplicationUrl: "https://www.greattanzaniajobs.com/company-application-form?form%5Bcompany%5D=Epic&form%5Bjob-title%5D=Health%20Safety%20and%20Environment%20Officer&form%5Bapplication-email%5D=hse%40epicbr.co.tz&form%5Bvalid-to%5D=Tuesday%2C%20August%2025%202026",
  },
  {
    title: "Accountant — Airline Catering/Aviation",
    company: "Top Talented Recruits",
    category: "Accounting & Finance",
    location: "Dar es Salaam, Tanzania",
    salary: "Not disclosed",
    description: "Full-time female Accountant role in airline catering and aviation. Source qualifications include a bachelor’s degree in accounting, finance, business management, or a related field; at least two years of relevant accounting, taxation, or finance experience; knowledge of IAS, local accounting principles, and financial reporting; CPA or equivalent as an advantage; and proficiency in Microsoft Office and accounting software.",
    deadline: "2026-09-05 23:59:59",
    urgent: 0,
    sourceUrl: "https://www.greattanzaniajobs.com/jobs/job-detail/job-Accountant-Airline-CateringAviation-job-at-Top-Talented-Recruits-85576",
    externalApplicationUrl: "https://www.greattanzaniajobs.com/company-application-form?form%5Bcompany%5D=Top%20Talented%20Recruits&form%5Bjob-title%5D=Accountant%20-%20Airline%20Catering%2FAviation&form%5Bapplication-email%5D=recruitment%40toptalentedrecruits.co.tz&form%5Bvalid-to%5D=Saturday%2C%20September%205%202026",
  },
  {
    title: "Social Studies Teacher",
    company: "Rahman Pre & Primary School",
    category: "Education / Academic / Teaching",
    location: "Kigamboni, Kibada, Uvumba Street, Dar es Salaam",
    salary: "Not disclosed",
    description: "Full-time primary-level Social Studies teaching role. Source responsibilities include History, Geography, and Community Life instruction, Tanzanian local context, student engagement, differentiation, assessment, and classroom resource management. Source qualifications include a bachelor’s degree in Education, History, Geography, or a related field, primary-level Social Studies teaching experience, familiarity with the Tanzanian primary curriculum, and strong presentation and communication skills.",
    deadline: "2026-08-26 23:59:59",
    urgent: 1,
    sourceUrl: "https://www.greattanzaniajobs.com/jobs/job-detail/job-Social-Studies-Teacher-job-at-Rahman-Pre-Primary-School-85565/nav-15?Itemid=231",
    externalApplicationUrl: "https://www.greattanzaniajobs.com/company-application-form?form%5Bcompany%5D=Rahman%20Pre%20%26%20Primary%20School&form%5Bjob-title%5D=Social%20Studies%20Teacher&form%5Bapplication-email%5D=zuhurakhalfan97%40gmail.com&form%5Bvalid-to%5D=Wednesday%2C%20August%2026%202026",
  },
];

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await connection.beginTransaction();
  const [batchRows] = await connection.query("SELECT id, sourceUrl FROM vacancies WHERE isTest = 1 AND testBatchId = ? FOR UPDATE", [BATCH_ID]);
  if (batchRows.length) {
    const existingUrls = new Set(batchRows.map(row => row.sourceUrl));
    if (batchRows.length === vacancies.length && vacancies.every(vacancy => existingUrls.has(vacancy.sourceUrl))) {
      await connection.rollback();
      console.log(JSON.stringify({ ok: true, alreadyImported: true, batchId: BATCH_ID, count: batchRows.length }));
      process.exit(0);
    }
    throw new Error(`Refusing duplicate or partial import: ${batchRows.length} rows already exist for ${BATCH_ID}`);
  }

  const [sourceRows] = await connection.query("SELECT id, sourceUrl, isTest, testBatchId FROM vacancies WHERE sourceUrl IN (?) FOR UPDATE", [vacancies.map(vacancy => vacancy.sourceUrl)]);
  if (sourceRows.length) throw new Error(`Refusing to overwrite existing vacancy source rows: ${sourceRows.map(row => row.id).join(", ")}`);

  const importedAt = new Date();
  const createdAt = new Date("2026-08-22T00:00:00.000Z");
  for (const vacancy of vacancies) {
    await connection.query(
      `INSERT INTO vacancies (employerUserId, title, company, category, location, salary, description, deadline, status, employerVerified, urgent, isTest, sourceName, sourceType, sourceUrl, externalApplicationUrl, employerAuthorized, publicationStatus, testBatchId, importedAt, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'live', 0, ?, 1, ?, ?, ?, ?, 0, 'test_only', ?, ?, ?, ?)`,
      [0, vacancy.title, vacancy.company, vacancy.category, vacancy.location, vacancy.salary, vacancy.description, vacancy.deadline, vacancy.urgent, SOURCE_NAME, SOURCE_TYPE, vacancy.sourceUrl, vacancy.externalApplicationUrl, BATCH_ID, importedAt, createdAt, importedAt],
    );
  }
  await connection.commit();
  console.log(JSON.stringify({ ok: true, alreadyImported: false, batchId: BATCH_ID, count: vacancies.length, sourceName: SOURCE_NAME }));
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
