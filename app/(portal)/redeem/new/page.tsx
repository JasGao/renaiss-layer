import Image from "next/image";
import Link from "next/link";
import { fetchEligibleRedemptionCards } from "@/lib/api";

type RedeemCheckoutPageProps = {
  searchParams?: Promise<{
    cardIds?: string;
    cardId?: string;
  }>;
};

export default async function RedeemCheckoutPage({ searchParams }: RedeemCheckoutPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const allEligibleCards = await fetchEligibleRedemptionCards();

  const selectedIds = parseSelectedCardIds(resolvedSearchParams);
  const selectedCards = allEligibleCards.filter((card) => selectedIds.includes(card.id));
  const totalFmv = selectedCards.reduce((sum, card) => sum + getCardFmv(card.id), 0);
  const handlingFee = Number((totalFmv * 0.02).toFixed(2));
  const shippingCost = selectedCards.length > 0 ? 5.61 : 0;
  const insuranceCost = Number((totalFmv * 0.0107).toFixed(2));
  const totalFees = Number((handlingFee + shippingCost).toFixed(2));
  const vaultDisplay =
    selectedCards[0]?.custody.currentVault?.name ??
    selectedCards[0]?.custody.toVault?.name ??
    "Yamacardo";

  return (
    <div className="mx-auto max-w-7xl py-6 md:py-8">
      <Link href="/redeem" className="text-sm text-white/60 hover:text-white/85">
        ← Back
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        <section>
          <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55">
            Redeeming these cards will permanently burn the NFTs and cannot be undone.
          </div>

          {selectedCards.length === 0 ? (
            <div className="mt-6 rounded-xl border border-white/20 bg-brand-1000/35 p-5">
              <p className="text-sm text-white/65">
                No cards selected yet. Go back and click{" "}
                <span className="font-medium text-white/85">Add to redeem</span> on a card first.
              </p>
              <Link
                href="/redeem"
                className="mt-4 inline-flex h-10 items-center rounded-full border border-white/20 px-4 text-sm font-medium text-white/85 hover:border-white/40"
              >
                Select cards
              </Link>
            </div>
          ) : (
            <div className="mt-5">
              <p className="text-sm text-white/80">
                Total redeem:{" "}
                <span className="font-medium text-primary">
                  {selectedCards.length} {selectedCards.length === 1 ? "item" : "items"}
                </span>
              </p>
              <p className="mt-1 text-sm text-white/60">Vault: {vaultDisplay}</p>

              <div className="mt-4 space-y-3">
                {selectedCards.map((card) => (
                  <article key={card.id} className="flex gap-3">
                    <Link
                      href={`/cards/${card.id}`}
                      className="group flex min-w-0 flex-1 gap-3 rounded-lg p-1 -m-1 transition-colors hover:bg-white/5"
                    >
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border border-white/15 bg-brand">
                        <Image src={card.imageUrl} alt={card.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white/90 transition-colors group-hover:text-white">
                          {card.gradingCompany} {card.grade} {card.year} {card.setName} #{card.cardNumber}{" "}
                          {card.name}
                        </p>
                        <span className="mt-1 inline-flex rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                          FMV {formatUsd(getCardFmv(card.id))}
                        </span>
                      </div>
                    </Link>
                    <button
                      type="button"
                      className="shrink-0 self-start text-xs text-white/70 underline underline-offset-2 hover:text-white"
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-white/15 bg-brand-1000/30">
            <h2 className="border-b border-white/10 px-4 py-3 text-lg font-semibold">Shipping address</h2>
            <div className="px-4 py-3">
              <p className="text-xs text-white/55">Saved address</p>
              <div className="mt-2 space-y-2">
                <label className="flex cursor-pointer items-start gap-2 rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <input type="radio" name="address" className="mt-1" />
                  <span className="text-sm text-white/80">
                    No. 1, Lane 310, Sanho Rd., 345, Fengyuan, 0, Taiwan, Province of China
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-md border border-white/10 bg-white/[0.08] p-3">
                  <input type="radio" name="address" defaultChecked className="mt-1" />
                  <span className="text-sm text-white/85">
                    cosco tower, 183 queen&apos;s road, 2502, sheung wan, hong kong, 999077, Hong Kong
                  </span>
                </label>
              </div>
              <button type="button" className="mt-3 text-sm text-white/80 hover:text-white">
                + Add new address
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-white/15 bg-brand-1000/30">
            <h2 className="border-b border-white/10 px-4 py-3 text-lg font-semibold">Contact information</h2>
            <div className="space-y-3 px-4 py-3">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="First Name"
                  className="h-10 rounded-xl border border-white/20 bg-brand-1000/40 px-3 text-sm text-white placeholder:text-white/35"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="h-10 rounded-xl border border-white/20 bg-brand-1000/40 px-3 text-sm text-white placeholder:text-white/35"
                />
              </div>
              <label className="block text-sm text-white/70">
                Email Address
                <div className="mt-1 flex h-10 items-center justify-between rounded-xl border border-white/20 bg-brand-1000/40 px-3 text-sm text-white/90">
                  <span>jasmine.gao@renaiss.xyz</span>
                  <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
                    Verified
                  </span>
                </div>
              </label>
              <label className="block text-sm text-white/70">
                Phone Number
                <div className="mt-1 flex h-10 items-center justify-between rounded-xl border border-white/20 bg-brand-1000/40 px-3 text-sm text-white/90">
                  <span>+85251741121</span>
                  <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
                    Verified
                  </span>
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-white/15 bg-brand-1000/30">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="text-lg font-semibold">Delivery</h2>
              <button
                type="button"
                className="rounded-lg border border-white/20 px-2.5 py-1 text-xs text-white/80 hover:border-white/40"
              >
                Get Courier Options
              </button>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-white/65">Select courier</p>
              <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-white/25 bg-white/[0.04] p-3">
                <input type="radio" name="courier" defaultChecked />
                <div className="flex-1">
                  <p className="text-sm text-white/90">SF Express</p>
                  <p className="text-xs text-white/55">Estimated delivery time</p>
                  <p className="text-sm text-white/85">1-2 working days</p>
                  <p className="text-xs text-white/45">USDT {shippingCost.toFixed(2)} - SF Express - Domestic</p>
                </div>
              </label>
            </div>
          </section>

          <label className="flex items-start gap-2 text-sm text-white/80">
            <input type="checkbox" className="mt-1" />
            <span>I understand my NFTs will be permanently burned to complete this redemption.</span>
          </label>

          <div className="flex items-center justify-between bg-[#6A5412]/70 px-4 py-2.5 text-sm">
            <p className="font-medium text-warning">
              Total FMV · {selectedCards.length} {selectedCards.length === 1 ? "item" : "items"}
            </p>
            <p className="font-semibold text-white">{formatUsd(totalFmv)}</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" />
            <span>Insurance for ${insuranceCost.toFixed(2)}</span>
          </label>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-white/70">Handling fee</p>
              <p className="text-white/90">${handlingFee.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70">Shipping cost</p>
                <p className="text-xs text-white/45">
                  This shipment is protected under basic insurance.
                </p>
              </div>
              <p className="text-white/90">${shippingCost.toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold">Total</p>
              <p className="text-2xl font-semibold">${totalFees.toFixed(2)}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function parseSelectedCardIds(
  searchParams?: {
    cardIds?: string;
    cardId?: string;
  },
): string[] {
  const values = [
    ...(searchParams?.cardIds?.split(",") ?? []),
    ...(searchParams?.cardId ? [searchParams.cardId] : []),
  ]
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(values));
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

function formatUsd(value: number): string {
  return `$ ${new Intl.NumberFormat("en-US").format(value)}`;
}
