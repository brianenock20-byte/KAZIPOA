# Kazipoa: Vacancy na Taarifa za Malipo kwa Pamoja

Mwongozo huu unaonyesha mfumo wa **manual payment verification** ambao Employer analipa kwenye Lipa Namba/M-Pesa/Airtel Money, kisha anatuma taarifa za vacancy pamoja na transaction ID. Mfumo unaweka taarifa katika hali ya `pending`; Admin ndiye anayethibitisha malipo na kuamua kama vacancy itachapishwa.

> Mfumo haupaswi kuomba wala kuhifadhi PIN, CVV, card number, au password. Unahifadhi tu payment method, kiasi, transaction ID, tarehe, na maelezo ya uthibitisho.

## 1. Mtiririko wa biashara

Employer anajaza vacancy, anaona payment number na kiasi cha posting fee, analipa nje ya website, anaingiza transaction ID, na anatuma form mara moja. Backend inahifadhi vacancy na payment record kwa transaction moja ya biashara, lakini status inabaki `pending_review`. Job Seeker haoni vacancy hilo wakati huo.

Admin anaingia kwenye Payment Review, anatafuta transaction ID au vacancy ID, analinganisha kiasi na taarifa iliyo kwenye merchant statement, kisha anachagua **Confirm payment**, **Reject payment**, au **Request correction**. Baada ya payment kuthibitishwa, Admin anakagua vacancy na ana-approve. Ni vacancy yenye `paymentStatus = confirmed`, `moderationStatus = approved`, `employerVerified = true`, na deadline ambayo haijapita pekee ndiyo inakuwa `live`.

## 2. Database schema ya mfano

### Drizzle schema

```ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const vacancies = mysqlTable("vacancies", {
  id: int("id").autoincrement().primaryKey(),
  employerUserId: int("employerUserId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  company: varchar("company", { length: 180 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  salary: varchar("salary", { length: 120 }).notNull(),
  description: text("description").notNull(),
  deadline: timestamp("deadline").notNull(),
  employerVerified: int("employerVerified").default(0).notNull(),
  moderationStatus: mysqlEnum("moderationStatus", [
    "draft", "submitted", "approved", "changes_requested", "rejected", "live", "expired",
  ]).default("submitted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const vacancyPayments = mysqlTable("vacancyPayments", {
  id: int("id").autoincrement().primaryKey(),
  vacancyId: int("vacancyId").notNull(),
  employerUserId: int("employerUserId").notNull(),
  method: mysqlEnum("method", ["mpesa", "airtel_money", "crdb_lipa_namba", "visa", "mastercard"]).notNull(),
  paymentNumber: varchar("paymentNumber", { length: 40 }).notNull(),
  amountTzs: int("amountTzs").notNull(),
  transactionId: varchar("transactionId", { length: 160 }).notNull().unique(),
  paidAt: timestamp("paidAt"),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "confirmed", "rejected", "refunded"]).default("pending").notNull(),
  evidenceNote: text("evidenceNote"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const moderationLogs = mysqlTable("moderationLogs", {
  id: int("id").autoincrement().primaryKey(),
  vacancyId: int("vacancyId").notNull(),
  adminUserId: int("adminUserId").notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  reason: text("reason"),
  previousStatus: varchar("previousStatus", { length: 64 }).notNull(),
  nextStatus: varchar("nextStatus", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

### SQL ya mfano

```sql
CREATE TABLE vacancyPayments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vacancyId INT NOT NULL,
  employerUserId INT NOT NULL,
  method ENUM('mpesa','airtel_money','crdb_lipa_namba','visa','mastercard') NOT NULL,
  paymentNumber VARCHAR(40) NOT NULL,
  amountTzs INT NOT NULL,
  transactionId VARCHAR(160) NOT NULL UNIQUE,
  paidAt TIMESTAMP NULL,
  paymentStatus ENUM('pending','confirmed','rejected','refunded') NOT NULL DEFAULT 'pending',
  evidenceNote TEXT NULL,
  reviewedBy INT NULL,
  reviewedAt TIMESTAMP NULL,
  rejectionReason TEXT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

`transactionId` iwe unique ili Employer asiweze kutuma transaction moja mara mbili kwa vacancies tofauti. Kwa production, ongeza foreign keys baada ya kuthibitisha majina ya tables na migration order.

## 3. Employer form ya kutuma vacancy na payment pamoja

```tsx
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const paymentNumber = "0754 XXX XXX"; // Badilisha kwa Lipa Namba/merchant number ya biashara
const postingFeeTzs = 25000;

export function EmployerVacancyPaymentForm() {
  const submit = trpc.vacancies.submitWithPayment.useMutation();
  const [form, setForm] = useState({
    title: "",
    category: "Law & Legal Services",
    location: "Dar es Salaam",
    salary: "",
    deadline: "",
    description: "",
    method: "mpesa",
    transactionId: "",
    evidenceNote: "",
  });

  const update = (key: string, value: string) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit.mutate({
      vacancy: {
        title: form.title,
        category: form.category,
        location: form.location,
        salary: form.salary,
        deadline: form.deadline,
        description: form.description,
      },
      payment: {
        method: form.method as "mpesa" | "airtel_money" | "crdb_lipa_namba" | "visa" | "mastercard",
        paymentNumber,
        amountTzs: postingFeeTzs,
        transactionId: form.transactionId.trim(),
        evidenceNote: form.evidenceNote.trim() || undefined,
      },
    });
  };

  return (
    <form onSubmit={onSubmit} className="vacancy-payment-form">
      <h2>Post vacancy and submit payment</h2>
      <p>Pay TZS {postingFeeTzs.toLocaleString()} to {paymentNumber}, then enter the transaction ID below.</p>

      <label>Job title<input required value={form.title} onChange={e => update("title", e.target.value)} /></label>
      <label>Category<select value={form.category} onChange={e => update("category", e.target.value)}><option>Law & Legal Services</option><option>Technology</option><option>Sales & Marketing</option></select></label>
      <label>Location<input required value={form.location} onChange={e => update("location", e.target.value)} /></label>
      <label>Salary range<input required value={form.salary} onChange={e => update("salary", e.target.value)} /></label>
      <label>Application deadline<input required type="date" value={form.deadline} onChange={e => update("deadline", e.target.value)} /></label>
      <label>Job description<textarea required rows={6} value={form.description} onChange={e => update("description", e.target.value)} /></label>

      <fieldset>
        <legend>Payment information</legend>
        <label>Payment method<select value={form.method} onChange={e => update("method", e.target.value)}><option value="mpesa">M-Pesa</option><option value="airtel_money">Airtel Money</option><option value="crdb_lipa_namba">CRDB / Lipa Namba</option><option value="visa">Visa</option><option value="mastercard">Mastercard</option></select></label>
        <label>Transaction ID / reference<input required value={form.transactionId} onChange={e => update("transactionId", e.target.value)} placeholder="Mfano: MPESA123456789" /></label>
        <label>Payment note, optional<textarea rows={3} value={form.evidenceNote} onChange={e => update("evidenceNote", e.target.value)} placeholder="Jina la aliyelipa au maelezo ya receipt" /></label>
      </fieldset>

      <p className="form-note">Status ya kwanza itakuwa <strong>Pending Admin Review</strong>. Usitume PIN, CVV, au card number.</p>
      <button disabled={submit.isPending} type="submit">{submit.isPending ? "Inatuma…" : "Submit vacancy for review"}</button>
      {submit.error && <p role="alert">{submit.error.message}</p>}
      {submit.isSuccess && <p role="status">Tumepokea vacancy na taarifa ya malipo. Admin atahakiki transaction ID.</p>}
    </form>
  );
}
```

## 4. Backend procedure ya kupokea taarifa

```ts
import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { recordVacancyAndPayment, listPaymentReviews, reviewPayment } from "./db";

const paymentMethod = z.enum(["mpesa", "airtel_money", "crdb_lipa_namba", "visa", "mastercard"]);

export const vacancyPaymentRouter = router({
  submitWithPayment: protectedProcedure
    .input(z.object({
      vacancy: z.object({
        title: z.string().min(3).max(180),
        category: z.string().min(2),
        location: z.string().min(2),
        salary: z.string().min(1),
        deadline: z.string().date(),
        description: z.string().min(30),
      }),
      payment: z.object({
        method: paymentMethod,
        paymentNumber: z.string().min(5),
        amountTzs: z.number().int().positive(),
        transactionId: z.string().min(5).max(160),
        evidenceNote: z.string().max(1000).optional(),
      }),
    }))
    .mutation(({ ctx, input }) => recordVacancyAndPayment({ employerUserId: ctx.user.id, ...input })),

  paymentQueue: adminProcedure.query(() => listPaymentReviews()),

  confirmPayment: adminProcedure
    .input(z.object({ paymentId: z.number().int().positive() }))
    .mutation(({ ctx, input }) => reviewPayment({ ...input, adminUserId: ctx.user.id, decision: "confirmed" })),

  rejectPayment: adminProcedure
    .input(z.object({ paymentId: z.number().int().positive(), reason: z.string().min(5) }))
    .mutation(({ ctx, input }) => reviewPayment({ ...input, adminUserId: ctx.user.id, decision: "rejected" })),
});
```

`recordVacancyAndPayment` ifanye database transaction: create vacancy first, create payment with `pending`, kisha rudisha both IDs. Ikiwa insert moja inashindwa, rollback zote. Employer aone record zake tu; `paymentQueue`, `confirmPayment`, na `rejectPayment` zitumie `adminProcedure`.

## 5. Admin dashboard ya kuhakiki transaction IDs

Admin Payment Review iwe na search boxes za **Transaction ID**, **Vacancy ID**, **Employer**, na **Payment method**. Table ionyeshe:

| Column | Kazi yake |
|---|---|
| Transaction ID | Kulinganisha na SMS, statement, au merchant dashboard |
| Employer | Kujua nani ametuma malipo |
| Vacancy | Kujua malipo ni ya posting gani |
| Amount | Kuhakikisha TZS iliyolipwa ni sahihi |
| Method | M-Pesa, Airtel Money, CRDB, Visa, au Mastercard |
| Date/time | Kulinganisha muda wa transaction |
| Status | Pending, Confirmed, Rejected, au Refunded |
| Action | View evidence, Confirm, Reject |

### Hatua za Admin

1. Fungua **Admin Dashboard → Payment Review**.
2. Tafuta `transactionId` iliyotumwa na Employer.
3. Fungua record na linganisha amount, payment number, tarehe, na jina/maelezo ya merchant statement.
4. Usikubali screenshot pekee ikiwa statement au merchant dashboard inapatikana.
5. Bonyeza **Confirm payment** ikiwa transaction ipo na amount ni sahihi.
6. Ikiwa haipo, amount si sahihi, au imetumika tayari, bonyeza **Reject payment** na lazima uandike sababu.
7. Baada ya payment kuwa Confirmed, fungua vacancy review na uangalie kampuni, content, salary, deadline, na safety.
8. Bonyeza **Approve and publish** tu ikiwa employer verified na payment confirmed.
9. Mfumo uandike audit log ya Admin, action, reason, timestamp, old status, na new status.

## 6. Publication rule ya server

```ts
export function canPublish({ paymentStatus, moderationStatus, employerVerified, deadline }: {
  paymentStatus: "pending" | "confirmed" | "rejected" | "refunded";
  moderationStatus: string;
  employerVerified: boolean;
  deadline: Date;
}) {
  return paymentStatus === "confirmed"
    && moderationStatus === "approved"
    && employerVerified
    && deadline.getTime() > Date.now();
}
```

Frontend inaweza kuonyesha badge, lakini uamuzi wa mwisho lazima uwe server-side. Usikubali request ya client inayosema `status: live` bila server kuchunguza payment na verification.

## 7. Lipa Namba manual dhidi ya API

Kwa manual Lipa Namba, Employer analipa nje ya website na anatuma transaction ID. Admin anathibitisha kwenye merchant statement. Kwa API, provider anatuma callback kwenye server, server inathibitisha signature/provider reference, inazuia duplicate callbacks, na inabadilisha payment kuwa `confirmed` bila kuamini screenshot.

Credentials za API zikiwepo zihifadhiwe kwenye project secrets: merchant ID, API key, API secret, test base URL, live base URL, callback URL, na webhook signing secret. Usitumie PIN ya simu kama API credential.

## 8. Checklist ya testing

Test kwamba transaction ID tupu inakataliwa, transaction ID ileile haiwezi kutumika mara mbili, amount isiyo sahihi haiwezi ku-confirm, Employer hawezi kuona payment za Employer mwingine, non-admin hawezi kufungua payment queue, rejection bila reason inakataliwa, unpaid vacancy haionekani, confirmed-but-unapproved vacancy haionekani, na expired vacancy haionekani.
