import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchRedemptionById } from "@/lib/api";

export default async function RedemptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const redemption = await fetchRedemptionById(id);
  if (!redemption) notFound();
  const orderCode = formatOrderCode(redemption.id);
  const confirmedOn = formatDate(redemption.createdAt);
  const totalFmv = redemption.cards.reduce((sum, card) => sum + getCardFmv(card.id), 0);
  const feeBreakdown = splitFees(redemption.totalFees ?? 0);
  const trackingSteps = buildTrackingSteps(redemption.displayStatus, redemption.createdAt);

  return (
    <div className="mx-auto max-w-7xl py-6 md:py-8">
      <Link href="/redeem" className="text-sm text-white/50 hover:text-white/80">
        ← Back
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
        <section>
          <h1 className="text-4xl font-semibold leading-tight">Order</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-white/60">
            <p>
              Order no. <span className="ml-2 font-semibold text-white/85">{orderCode}</span>
            </p>
            <p>
              Confirmed on <span className="ml-2 font-semibold text-white/85">{confirmedOn}</span>
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-white/15 bg-brand-1000/35 p-6">
            <p className="text-lg font-semibold">Tracking</p>
            <div className="mt-5 grid grid-cols-4 gap-1">
              {trackingSteps.map((step, index) => (
                <div key={step.label} className="relative">
                  {index < trackingSteps.length - 1 ? (
                    <span
                      className={`absolute left-[calc(50%+10px)] top-[6px] h-[2px] w-[calc(100%-20px)] border-t border-dashed ${
                        step.completed ? "border-white/80" : "border-white/30"
                      }`}
                      aria-hidden
                    />
                  ) : null}
                  <div className="flex flex-col items-center text-center">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        step.completed ? "bg-white" : step.active ? "bg-primary" : "bg-white/35"
                      }`}
                    />
                    <p className="mt-3 text-xs font-medium text-white/90">{step.label}</p>
                    <p className="mt-1 text-[11px] text-white/50">{step.date ?? ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-3xl font-semibold leading-tight">Redemption summary</h2>
            <p className="mt-2 text-base text-white/70">
              Total redeemed:{" "}
              <span className="font-semibold text-primary">{redemption.cards.length} items</span>
            </p>

            <div className="mt-5 space-y-4">
              {redemption.cards.map((card) => (
                <Link
                  key={card.id}
                  href={`/cards/${card.id}`}
                  className="group flex items-start gap-3 rounded-lg p-1 -m-1 transition-colors hover:bg-white/5"
                >
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border border-white/15 bg-brand">
                    <Image src={card.imageUrl} alt={card.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white/90 transition-colors group-hover:text-white">
                      {card.gradingCompany} {card.grade} {card.year} {card.setName} #{card.cardNumber}{" "}
                      {card.name}
                    </p>
                    <span className="mt-2 inline-flex items-center rounded-full bg-[#F0B90B]/20 px-2 py-0.5 text-[10px] font-semibold text-[#F0B90B]">
                      FMV {formatUsd(getCardFmv(card.id))}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/15 bg-brand-1000/35 p-5">
            <h3 className="text-xl font-semibold">Shipping address</h3>
            <div className="mt-4 space-y-1 text-sm text-white/70">
              <p className="font-medium text-white/90">Jasmine Gao</p>
              <p>{redemption.shippingAddress ?? "Address unavailable"}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/15 bg-brand-1000/35 p-5">
            <h3 className="text-xl font-semibold">Contact information</h3>
            <div className="mt-4 space-y-1 text-sm text-white/70">
              <p className="font-medium text-white/90">Jasmine Gao</p>
              <p>jasmine.gao@renaiss.xyz</p>
              <p>+85251741121</p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/15 bg-brand-1000/35 p-5">
            <div className="rounded-md bg-[#6A5412]/70 px-3 py-3 text-sm text-white/90">
              <div className="flex items-center justify-between gap-2">
                <p>
                  Total FMV · {redemption.cards.length} {redemption.cards.length === 1 ? "item" : "items"}
                </p>
                <p className="font-semibold">{formatUsd(totalFmv)}</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-white/70">Handling fee</p>
                <p className="font-medium text-white/90">{formatCurrency(feeBreakdown.handling)}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-white/70">Shipping cost</p>
                  <p className="text-xs text-white/45">
                    This shipment is protected under basic insurance.
                  </p>
                </div>
                <p className="font-medium text-white/90">{formatCurrency(feeBreakdown.shipping)}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <p className="text-3xl font-semibold leading-none">Total</p>
              <p className="text-3xl font-semibold leading-none">
                {formatCurrency(redemption.totalFees ?? 0)}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

const cardFmvById: Record<string, number> = {
  "card-pikachu": 384,
  "card-blastoise": 42,
  "card-hooh": 27,
  "card-mew": 55,
  "card-rayquaza": 55,
  "card-external": 46,
};

function getCardFmv(cardId: string): number {
  return cardFmvById[cardId] ?? 40;
}

function formatOrderCode(id: string): string {
  const compact = id.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (compact.length <= 10) return `0x${compact}`;
  return `0x${compact.slice(0, 4)}...${compact.slice(-4)}`;
}

function formatDate(value: string): string {
  const [month, day, year] = new Date(value).toLocaleDateString("en-US").split("/");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

function formatUsd(value: number): string {
  return `$ ${new Intl.NumberFormat("en-US").format(value)}`;
}

function formatCurrency(value: number): string {
  return `$ ${value.toFixed(2)}`;
}

function splitFees(totalFees: number): { handling: number; shipping: number } {
  if (totalFees <= 0) {
    return { handling: 0, shipping: 0 };
  }
  const handling = Number((totalFees * 0.51).toFixed(2));
  const shipping = Number((totalFees - handling).toFixed(2));
  return { handling, shipping };
}

function buildTrackingSteps(displayStatus: string, createdAt: string) {
  const status = displayStatus.toLowerCase();
  const activeIndex = status.includes("shipped")
    ? 2
    : status.includes("initiated")
      ? 1
      : status.includes("processing")
        ? 1
        : status.includes("delivered")
          ? 3
          : 0;

  const baseDate = formatDate(createdAt);
  return [
    { label: "Initiated", date: baseDate, completed: activeIndex >= 0, active: activeIndex === 0 },
    {
      label: "Released from vault",
      date: baseDate,
      completed: activeIndex >= 1,
      active: activeIndex === 1,
    },
    { label: "In transit", date: "", completed: activeIndex >= 2, active: activeIndex === 2 },
    { label: "Delivered", date: "", completed: activeIndex >= 3, active: activeIndex === 3 },
  ];
}
