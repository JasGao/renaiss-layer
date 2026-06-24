import Link from "next/link";
import { fetchDeposits } from "@/lib/api";

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  in_review: "In review",
  needs_more_photos: "Needs more photos",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const statusToneClass: Record<string, string> = {
  submitted: "bg-white/10 text-white/80",
  in_review: "bg-[#FDC60033] text-[#FDC600]",
  needs_more_photos: "bg-[#FDC60033] text-[#FDC600]",
  approved: "bg-[#78FF6C23] text-[#78FF6C]",
  rejected: "bg-[#FF326833] text-[#FF7D9F]",
  cancelled: "bg-white/10 text-white/70",
};

function formatSubmittedAt(value?: string): string {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function DepositPage() {
  const deposits = (await fetchDeposits()).sort((a, b) => {
    const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className="mx-auto max-w-7xl py-6 md:py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Deposit</h1>
          <p className="mt-1 text-sm text-white/50">
            Submit cards for verification and ship to vault custody.
          </p>
        </div>
        <Link
          href="/deposit/new"
          className="inline-flex h-11 shrink-0 items-center rounded-full bg-primary px-5 text-sm font-semibold"
        >
          New deposit
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Deposit Card</h2>
            <p className="mt-1 text-sm text-white/50">
              Start a new deposit request.
            </p>
          </div>

          <div className="rounded-xl bg-brand p-4">
            <Link
              href="/deposit/new"
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
            >
              Deposit Card
            </Link>

            <div className="mt-4 rounded-lg border border-white/10 bg-brand-1000/60 p-3">
              <p className="text-xs uppercase tracking-wide text-white/50">Deposit steps</p>
              <ol className="mt-2 space-y-1.5 text-sm text-white/70">
                <li>1. Fill card details</li>
                <li>2. Upload front/back photos</li>
                <li>3. Submit for verification</li>
                <li>4. Ship approved cards to vault</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Deposit Record</h2>
            <p className="mt-1 text-sm text-white/50">
              Track active and historical deposit requests from one timeline.
            </p>
          </div>

          {deposits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-brand p-8 text-center">
              <p className="text-sm text-white/60">No deposit records yet.</p>
              <Link
                href="/deposit/new"
                className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
              >
                Start a deposit →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map((dep) => (
                <Link
                  key={dep.id}
                  href={`/deposit/${dep.id}`}
                  className="block rounded-xl border border-white/20 bg-brand p-4 transition-colors hover:border-white/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{dep.cardName}</p>
                      <p className="truncate text-sm text-white/50">
                        {dep.setName}
                        {dep.gradingCompany && dep.grade
                          ? ` · ${dep.gradingCompany} ${dep.grade}`
                          : ""}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Submitted {formatSubmittedAt(dep.submittedAt)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        statusToneClass[dep.verificationStatus] ?? "bg-white/10 text-white/80"
                      }`}
                    >
                      {statusLabels[dep.verificationStatus] ?? dep.verificationStatus}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
