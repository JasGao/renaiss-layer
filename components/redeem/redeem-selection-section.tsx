"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LayerCard } from "@/lib/types";

type RedeemSelectionSectionProps = {
  availableCards: LayerCard[];
  redemptionTabCounts: {
    hongKong: number;
    malaysia: number;
    omnivault: number;
  };
};

const REDEMPTION_TABS = [
  { key: "hongKong", label: "Hong Kong" },
  { key: "malaysia", label: "Malaysia" },
  { key: "omnivault", label: "CollectorCrypt - Omnivault" },
] as const;

export function RedeemSelectionSection({
  availableCards,
  redemptionTabCounts,
}: RedeemSelectionSectionProps) {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const router = useRouter();

  const selectedCount = selectedCardIds.length;
  const selectedCardQuery = useMemo(() => selectedCardIds.join(","), [selectedCardIds]);

  const toggleCardSelection = (cardId: string) => {
    setSelectedCardIds((current) =>
      current.includes(cardId)
        ? current.filter((selectedCardId) => selectedCardId !== cardId)
        : [...current, cardId],
    );
  };

  const handleProceedToRedeem = () => {
    if (selectedCount === 0) return;
    router.push(
      `/redeem/new?cardIds=${encodeURIComponent(selectedCardQuery)}&cardId=${encodeURIComponent(selectedCardIds[0])}`,
    );
  };

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Available for redemption</h2>
          <p className="mt-1 text-sm text-white/50">Redeem separately for different regions.</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-white/50">
            Showing {availableCards.length} {availableCards.length === 1 ? "card" : "cards"}
          </p>
          <button
            type="button"
            onClick={handleProceedToRedeem}
            disabled={selectedCount === 0}
            className="inline-flex h-10 items-center rounded-full border border-primary/55 bg-brand px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(130,96,255,0.25)] transition disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-brand-1000/40 disabled:text-white/40 disabled:shadow-none"
          >
            Redeem{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {REDEMPTION_TABS.map((tab, index) => (
            <div key={tab.key} className="flex items-center gap-2">
              {index > 0 ? <span className="h-5 w-px bg-white/15" aria-hidden /> : null}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-brand-1000/40 px-3 py-1.5 text-xs text-white/85"
              >
                {tab.label}
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                  {redemptionTabCounts[tab.key]}
                </span>
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="List view"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-brand-1000/40 text-white/70"
          >
            <span className="grid h-4 w-4 grid-cols-2 gap-[2px]">
              <span className="rounded-[1px] bg-white/65" />
              <span className="rounded-[1px] bg-white/25" />
              <span className="rounded-[1px] bg-white/25" />
              <span className="rounded-[1px] bg-white/25" />
            </span>
          </button>
          <button
            type="button"
            aria-label="Grid view"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-brand-1000/40 text-white/70"
          >
            <span className="grid h-4 w-4 grid-cols-2 gap-[2px]">
              <span className="rounded-[1px] bg-white/25" />
              <span className="rounded-[1px] bg-white/25" />
              <span className="rounded-[1px] bg-white/65" />
              <span className="rounded-[1px] bg-white/25" />
            </span>
          </button>
          <input
            type="search"
            readOnly
            placeholder="Search cards by name, set, etc."
            className="h-10 min-w-[260px] flex-1 rounded-xl border border-white/20 bg-brand-1000/40 px-3 text-sm text-white placeholder:text-white/35"
          />
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-xl border border-white/20 bg-brand-1000/40 px-3 text-sm text-white/85"
          >
            Highest FMV
          </button>
        </div>
      </div>

      {availableCards.length === 0 ? (
        <div className="rounded-xl border border-white/20 bg-brand-1000/30 p-8 text-sm text-white/60">
          No cards are currently available for redemption.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {availableCards.map((card) => {
            const isSelected = selectedCardIds.includes(card.id);
            return (
              <article key={card.id} className="group">
                <div
                  className={`relative rounded-xl p-px transition ${
                    isSelected ? "bg-rainbow shadow-[0_0_24px_rgba(130,96,255,0.35)]" : "bg-white/20"
                  }`}
                >
                  <div className="relative overflow-hidden rounded-xl bg-brand">
                    <div className="relative aspect-square overflow-hidden bg-brand-1000">
                      <Link href={`/cards/${card.id}`}>
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.08]"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </Link>
                      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => toggleCardSelection(card.id)}
                          className={`pointer-events-auto inline-flex h-11 items-center rounded-full border px-5 text-sm font-semibold text-white ${
                            isSelected
                              ? "border-white/40 bg-white/15"
                              : "border-primary/60 bg-brand shadow-[0_0_24px_rgba(130,96,255,0.35)]"
                          }`}
                        >
                          {isSelected ? "Selected" : "Add to redeem"}
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-white/20 p-3">
                      <p className="truncate text-xs text-white/60">
                        {card.custody.currentVault?.name ?? "Unassigned vault"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-white/90">
                        {card.gradingCompany} {card.grade} {card.name}
                      </p>
                      <p className="truncate text-xs text-white/50">{card.setName}</p>
                      <div className="mt-2">
                        <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
                          FMV {formatUsd(getCardFmv(card.id))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
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

function formatUsd(value: number): string {
  return `$ ${new Intl.NumberFormat("en-US").format(value)}`;
}
