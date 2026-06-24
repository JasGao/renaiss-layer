import Image from "next/image";
import Link from "next/link";
import { fetchPortfolioCards, fetchPortfolioStats } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { deriveCardBadges, derivePrimaryAction } from "@/lib/utils/badges";

type SortOption = "latest" | "oldest" | "name_asc" | "name_desc";

function sortCards(cards: Awaited<ReturnType<typeof fetchPortfolioCards>>, sort: SortOption) {
  const sorted = [...cards];
  if (sort === "latest") {
    sorted.sort(
      (a, b) => new Date(b.latestActivityAt).getTime() - new Date(a.latestActivityAt).getTime(),
    );
  } else if (sort === "oldest") {
    sorted.sort(
      (a, b) => new Date(a.latestActivityAt).getTime() - new Date(b.latestActivityAt).getTime(),
    );
  } else if (sort === "name_asc") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "name_desc") {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  }
  return sorted;
}

function normalizeSort(value: string | undefined): SortOption {
  if (value === "oldest" || value === "name_asc" || value === "name_desc") {
    return value;
  }
  return "latest";
}

function formatFmv(value: number | undefined): string {
  if (value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function CardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ sort?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const sort = normalizeSort(resolvedSearchParams?.sort);
  const [cards, stats] = await Promise.all([
    fetchPortfolioCards(),
    fetchPortfolioStats(),
  ]);
  const sortedCards = sortCards(cards, sort);

  return (
    <div className="mx-auto max-w-7xl py-6 md:py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold md:text-3xl">My Cards</h1>
        <p className="mt-1 text-sm text-white/50">
          Track owned cards, vault custody, and on-chain status.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="In vault" value={stats.inVault} accent="success" />
        <StatCard label="In transit" value={stats.inTransit} accent="warning" />
        <StatCard label="Redeemed" value={stats.redeemed} />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="search"
            placeholder="Search by token ID, card name, cert number"
            className="h-11 w-full rounded-xl border border-white/20 bg-transparent px-4 text-base text-white placeholder:text-white/50 md:text-sm"
            readOnly
          />
          <p className="mt-1.5 text-xs text-white/30">
            Search coming in next step — try token ID 9999 on Token Lookup later.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-white/60">Sort:</span>
            <Link
              href="/cards?sort=latest"
              className={`rounded-full border px-3 py-1.5 ${
                sort === "latest"
                  ? "border-primary/60 bg-primary/15 text-white"
                  : "border-white/20 text-white/70 hover:text-white"
              }`}
            >
              Latest
            </Link>
            <Link
              href="/cards?sort=oldest"
              className={`rounded-full border px-3 py-1.5 ${
                sort === "oldest"
                  ? "border-primary/60 bg-primary/15 text-white"
                  : "border-white/20 text-white/70 hover:text-white"
              }`}
            >
              Oldest
            </Link>
            <Link
              href="/cards?sort=name_asc"
              className={`rounded-full border px-3 py-1.5 ${
                sort === "name_asc"
                  ? "border-primary/60 bg-primary/15 text-white"
                  : "border-white/20 text-white/70 hover:text-white"
              }`}
            >
              Name A-Z
            </Link>
            <Link
              href="/cards?sort=name_desc"
              className={`rounded-full border px-3 py-1.5 ${
                sort === "name_desc"
                  ? "border-primary/60 bg-primary/15 text-white"
                  : "border-white/20 text-white/70 hover:text-white"
              }`}
            >
              Name Z-A
            </Link>
          </div>
        </div>
      </div>

      {sortedCards.length === 0 ? (
        <div className="rounded-xl border border-white/20 p-12 text-center">
          <p className="text-white/60">No cards in your portfolio yet.</p>
          <Link
            href="/deposit"
            className="mt-4 inline-block text-sm font-medium text-primary"
          >
            Start a deposit →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sortedCards.map((card, i) => {
            const badges = deriveCardBadges(card);
            const action = derivePrimaryAction(card);
            return (
              <div
                key={card.id}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="relative rounded-xl bg-white/20 p-px">
                  <div className="pointer-events-none absolute inset-0 rounded-xl bg-rainbow opacity-0 blur-sm transition-opacity md:group-hover:opacity-100" />
                  <div className="relative overflow-hidden rounded-xl bg-brand">
                    <Link href={`/cards/${card.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-brand-1000">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          className="object-cover transition-transform duration-300 md:group-hover:scale-[1.2]"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      </div>
                    </Link>
                    <div className="border-t border-white/20 p-3">
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                          <Badge key={b.label} {...b} />
                        ))}
                      </div>
                      <p className="truncate text-sm font-medium">{card.name}</p>
                      <p className="truncate text-xs text-white/50">
                        {card.setName}
                        {card.grade && ` · ${card.gradingCompany} ${card.grade}`}
                      </p>
                      {card.nft.status === "in_vault" || card.nft.status === "in_transit" ? (
                        <p className="mt-1 truncate text-xs text-white/40">
                          Vault:{" "}
                          {card.nft.status === "in_transit"
                            ? "Shipping"
                            : card.custody.currentVault?.name ?? "Unknown"}
                        </p>
                      ) : null}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center rounded-full bg-[#F0B90B]/20 px-2.5 py-1 text-xs font-semibold leading-none text-[#F0B90B]">
                          FMV {formatFmv(card.fmv)}
                        </span>
                        <Link
                          href={action.href}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {action.label}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
