"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/**
 * A unit quiz (owner, 2026-11-21): multiple choice, graded by the API. Below the pass mark the learner
 * reviews and tries again; the correct options are never shown, only which questions were wrong.
 */
type Question = { id: string; text: string; options: { id: string; text: string }[] };
type Labels = { submit: string; answerAll: string; result: string; passed: string; failed: string; retry: string; wrong: string; nextUnit: string; error: string };
type Result = { score: number; total: number; percent: number; passed: boolean; passMark: number; wrong: string[] };

export function QuizForm({ moduleId, questions, locale, nextHref, t }: { moduleId: string; questions: Question[]; locale: string; nextHref: string | null; t: Labels }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [round, setRound] = useState(0);
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (questions.some((q) => !answers[q.id])) return setError(t.answerAll);
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/learn-api/modules/${moduleId}/quiz`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Result;
      setResult(data);
      if (data.passed) router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t.error);
    }
    setBusy(false);
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setRound((r) => r + 1);
  }

  return (
    <form key={round} onSubmit={onSubmit} className="flex flex-col gap-5">
      {result && (
        <div role="status" className={`flex flex-col gap-2 rounded-bov p-4 ${result.passed ? "bg-gold/20 text-ink" : "bg-danger/10 text-ink"}`}>
          <p className="m-0 font-semibold">
            {t.result.replace("{score}", nf.format(result.score)).replace("{total}", nf.format(result.total)).replace("{percent}", nf.format(result.percent))}
          </p>
          <p className="m-0">{result.passed ? t.passed : t.failed.replace("{mark}", nf.format(result.passMark))}</p>
          <div className="flex flex-wrap gap-2">
            {result.passed && nextHref && (
              <Link href={nextHref} className="rounded-bov bg-navy px-4 py-2.5 text-sm font-semibold text-on-dark hover:bg-navy-hover">
                {t.nextUnit}
              </Link>
            )}
            {!result.passed && (
              <button type="button" onClick={retry} className="rounded-bov bg-navy px-4 py-2.5 text-sm font-semibold text-on-dark hover:bg-navy-hover">
                {t.retry}
              </button>
            )}
          </div>
        </div>
      )}
      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {questions.map((q, i) => {
          const wrong = result?.wrong.includes(q.id);
          return (
            <li key={q.id}>
              <fieldset className={`flex flex-col gap-2.5 rounded-bov border p-4 ${wrong ? "border-danger" : "border-line"}`} disabled={!!result}>
                <legend className="px-1 font-semibold text-ink">
                  {nf.format(i + 1)}. {q.text}
                </legend>
                {q.options.map((o) => (
                  <label key={o.id} className="flex cursor-pointer items-start gap-2.5 rounded-bov px-2 py-1.5 text-[15px] text-ink hover:bg-sand has-[:checked]:bg-sand">
                    <input
                      type="radio"
                      name={q.id}
                      value={o.id}
                      checked={answers[q.id] === o.id}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                      className="mt-1 size-4 flex-none accent-navy"
                    />
                    <span>{o.text}</span>
                  </label>
                ))}
                {wrong && <p className="m-0 text-sm font-semibold text-danger">✕ {t.wrong}</p>}
              </fieldset>
            </li>
          );
        })}
      </ol>
      {!result && (
        <div className="flex flex-col items-start gap-2">
          <button type="submit" disabled={busy} className="rounded-bov bg-gold px-6 py-3 text-sm font-semibold text-navy hover:bg-gold-hover disabled:opacity-60">
            {t.submit}
          </button>
          <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
        </div>
      )}
    </form>
  );
}
