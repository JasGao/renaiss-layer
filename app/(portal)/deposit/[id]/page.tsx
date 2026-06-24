import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchDepositById } from "@/lib/api";

export default async function DepositDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deposit = await fetchDepositById(id);
  if (!deposit) notFound();

  return (
    <div className="mx-auto max-w-3xl py-6 md:py-8">
      <Link href="/deposit" className="text-sm text-white/50 hover:text-white/80">
        ← Back to deposits
      </Link>
      <h1 className="mt-6 text-2xl font-semibold">{deposit.cardName}</h1>
      <p className="mt-2 text-white/50">
        Deposit flow UI coming in the next step — verification, photos, and
        shipping.
      </p>
    </div>
  );
}
