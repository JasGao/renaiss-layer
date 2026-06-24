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

export default async function DepositPage() {
  const deposits = await fetchDeposits();

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

      <div className="space-y-3">
        {deposits.map((dep) => (
          <Link
            key={dep.id}
            href={`/deposit/${dep.id}`}
            className="block rounded-xl border border-white/20 bg-brand-1000/30 p-4 transition-colors hover:border-white/40"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{dep.cardName}</p>
                <p className="text-sm text-white/50">
                  {dep.setName} · {dep.gradingCompany} {dep.grade}
                </p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                {statusLabels[dep.verificationStatus] ?? dep.verificationStatus}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
