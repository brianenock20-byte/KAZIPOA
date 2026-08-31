import { useState } from "react";
import { CircleAlert, ExternalLink, FlaskConical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { TEST_VACANCY_BATCH_ID, TEST_VACANCY_LABEL } from "@shared/testVacancy";

export default function TestVacancyAdminPanel() {
  const [confirmation, setConfirmation] = useState("");
  const testBatchQuery = trpc.vacancies.testBatch.useQuery({ batchId: TEST_VACANCY_BATCH_ID });
  const deleteBatchMutation = trpc.vacancies.deleteTestBatch.useMutation({
    onSuccess: result => {
      setConfirmation("");
      toast(`${result.deletedVacancies} test vacancies deleted`);
      void testBatchQuery.refetch();
    },
    onError: error => toast(error.message),
  });

  const deleteBatch = async () => {
    if (confirmation !== "DELETE_TEST_BATCH") {
      toast("Type DELETE_TEST_BATCH to confirm this cleanup");
      return;
    }
    await deleteBatchMutation.mutateAsync({ batchId: TEST_VACANCY_BATCH_ID, confirmation: "DELETE_TEST_BATCH" });
  };

  return (
    <section className="dash-panel test-vacancy-admin-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PRE-LAUNCH TEST DATA</p>
          <h2>Test vacancy controls</h2>
        </div>
        <span className="chip amber"><FlaskConical size={13} /> {TEST_VACANCY_LABEL}</span>
      </div>
      <p className="panel-copy">These records are source-attributed QA fixtures only. They are not Kazipoa-authorized employer postings, do not count in marketplace metrics, and are excluded from the sitemap.</p>
      {testBatchQuery.isLoading ? <p className="form-note">Loading test batch…</p> : testBatchQuery.isError ? <div className="empty-state"><CircleAlert size={20} /><strong>Test batch unavailable</strong><span>{testBatchQuery.error.message}</span></div> : <>
        <div className="test-batch-summary"><strong>{testBatchQuery.data?.length ?? 0}</strong><span>records in {TEST_VACANCY_BATCH_ID}</span></div>
        <div className="test-vacancy-admin-list">{testBatchQuery.data?.map(vacancy => <div className="test-vacancy-admin-row" key={vacancy.id}><div><strong>{vacancy.title}</strong><span>{vacancy.company} · {vacancy.location}</span><small>Deadline {new Date(vacancy.deadline).toLocaleDateString("en-TZ")} · Status {vacancy.status}</small></div><div className="test-vacancy-admin-links">{vacancy.sourceUrl && <a href={vacancy.sourceUrl} target="_blank" rel="noreferrer">Source <ExternalLink size={13} /></a>}{vacancy.externalApplicationUrl && <a href={vacancy.externalApplicationUrl} target="_blank" rel="noreferrer">Application <ExternalLink size={13} /></a>}</div></div>)}</div>
        {Boolean(testBatchQuery.data?.length) && <div className="test-batch-cleanup"><label>Type <strong>DELETE_TEST_BATCH</strong> to remove only these test records<input value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="DELETE_TEST_BATCH" aria-label="Test batch deletion confirmation" /></label><button className="danger-button" disabled={deleteBatchMutation.isPending || confirmation !== "DELETE_TEST_BATCH"} onClick={() => void deleteBatch()}><Trash2 size={16} />{deleteBatchMutation.isPending ? "Deleting…" : "Delete test batch"}</button></div>}
      </>}
    </section>
  );
}
