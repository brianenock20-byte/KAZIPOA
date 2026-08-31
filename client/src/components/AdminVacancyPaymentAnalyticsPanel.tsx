import { BarChart3, CircleAlert, Clock3 } from "lucide-react";
import { trpc } from "@/lib/trpc";

const amountFormatter = new Intl.NumberFormat("sw-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });

export default function AdminVacancyPaymentAnalyticsPanel() {
  const analyticsQuery = trpc.admin.vacancyPaymentAnalytics.useQuery();
  const data = analyticsQuery.data;
  const monthly = data?.monthly ?? [];
  const maxMonthlyValue = Math.max(1, ...monthly.flatMap(item => [item.vacancies, item.payments]));

  return (
    <section className="dash-panel admin-analytics-panel" aria-labelledby="admin-analytics-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PLATFORM ANALYTICS</p>
          <h2 id="admin-analytics-title">Vacancies and payments</h2>
        </div>
        <span className="analytics-source">{data?.source ?? "Persisted database"}</span>
      </div>
      {analyticsQuery.isLoading ? (
        <div className="admin-loading-state" role="status"><Clock3 size={17} /> Loading platform analytics…</div>
      ) : analyticsQuery.isError ? (
        <div className="empty-state" role="alert"><CircleAlert size={18} /><strong>Analytics unavailable</strong><span>{analyticsQuery.error.message}</span></div>
      ) : data ? (
        <>
          <div className="admin-analytics-kpis">
            <div><span>Total vacancies</span><strong>{data.vacancies.total.toLocaleString()}</strong><small>{data.vacancies.live} live · {data.vacancies.pending} pending</small></div>
            <div><span>Urgent vacancies</span><strong>{data.vacancies.urgent.toLocaleString()}</strong><small>{data.vacancies.rejected} rejected or changes requested</small></div>
            <div><span>Payment records</span><strong>{data.payments.total.toLocaleString()}</strong><small>{data.payments.successful} successful · {data.payments.pending} pending</small></div>
            <div><span>Successful value</span><strong>{amountFormatter.format(data.payments.successfulAmountTzs)}</strong><small>{amountFormatter.format(data.payments.totalAmountTzs)} recorded overall</small></div>
          </div>
          <div className="admin-analytics-trend" aria-label="Monthly vacancy and payment records">
            <div className="trend-heading"><div><strong>Last 12 months</strong><span>Records created in the persisted database</span></div><BarChart3 size={18} /></div>
            {monthly.length ? monthly.map(item => (
              <div className="analytics-month" key={item.month}>
                <span>{item.label}</span>
                <div className="analytics-bars" aria-label={`${item.label}: ${item.vacancies} vacancies and ${item.payments} payments`}>
                  <i className="analytics-bar vacancies" style={{ width: `${(item.vacancies / maxMonthlyValue) * 100}%` }} title={`${item.vacancies} vacancies`} />
                  <i className="analytics-bar payments" style={{ width: `${(item.payments / maxMonthlyValue) * 100}%` }} title={`${item.payments} payments`} />
                </div>
                <small>{item.vacancies} / {item.payments}</small>
              </div>
            )) : <div className="empty-state"><strong>No monthly records yet</strong><span>New vacancy and payment records will appear here.</span></div>}
            <div className="analytics-legend"><span><i className="analytics-legend-dot vacancies" /> Vacancies</span><span><i className="analytics-legend-dot payments" /> Payments</span></div>
          </div>
        </>
      ) : null}
    </section>
  );
}
