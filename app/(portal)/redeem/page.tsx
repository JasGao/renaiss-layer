import Image from "next/image";
import Link from "next/link";
import { fetchEligibleRedemptionCards, fetchRedemptions } from "@/lib/api";
import { RedeemSelectionSection } from "@/components/redeem/redeem-selection-section";

export default async function RedeemPage() {
  const [redemptions, availableCards] = await Promise.all([
    fetchRedemptions(),
    fetchEligibleRedemptionCards(),
  ]);

  const redemptionTabCounts = {
    hongKong: availableCards.filter((card) => card.custody.currentVault?.countryCode === "HK").length,
    malaysia: 0,
    omnivault: availableCards.filter((card) => card.custody.currentVault?.countryCode === "SG").length,
  };

  return (
    <div className="mx-auto max-w-7xl py-6 md:py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Redeem</h1>
          <p className="mt-1 text-sm text-white/50">Redeem your on-chain collectibles in physical.</p>
        </div>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Record</h2>
          <Link href="/redeem" className="text-sm text-white/60 hover:text-white">
            View all
          </Link>
        </div>

        {redemptions.length === 0 ? (
          <div className="rounded-xl border border-white/20 bg-brand-1000/30 p-6">
            <p className="text-sm text-white/60">No redemption orders yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {redemptions.map((red) => {
              const totalFmv = red.cardIds.reduce((sum, cardId) => sum + getCardFmv(cardId), 0);
              return (
                <Link
                  key={red.id}
                  href={`/redeem/${red.id}`}
                  className="rounded-2xl border border-white/20 bg-brand-1000/40 p-3 transition-colors hover:border-white/40"
                >
                  <div className="mb-2 text-xs">
                    <p className="text-white/60">Status {red.displayStatus}</p>
                    <p className="mt-0.5 text-white/75">Order {formatOrderCode(red.id)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {red.cards.slice(0, 4).map((card) => (
                      <div key={card.id} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-brand">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 40vw, 20vw"
                        />
                      </div>
                    ))}
                    {red.cards.length > 4 ? (
                      <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-white/15 bg-white/5 text-sm font-medium text-white/70">
                        +{red.cards.length - 4}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-white/70">Items {red.cards.length}</p>
                    <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
                      FMV {formatUsd(totalFmv)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <RedeemSelectionSection
        availableCards={availableCards}
        redemptionTabCounts={redemptionTabCounts}
      />
    </div>
  );
}

function formatOrderCode(id: string): string {
  const compact = id.replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (compact.length <= 8) return `0x${compact}`;
  return `0x${compact.slice(0, 4)}...${compact.slice(-4)}`;
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
