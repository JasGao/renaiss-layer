import type {
  DepositRequest,
  LayerCard,
  OnChainActivityEvent,
  PortfolioStats,
  RedemptionRequest,
} from "@/lib/types";
import {
  getCardById,
  getCardByTokenId,
  getEligibleRedemptionCards,
  getPortfolioCards,
  MOCK_DEPOSITS,
  MOCK_ONCHAIN_ACTIVITY,
  MOCK_REDEMPTIONS,
} from "@/lib/mock/data";
import { computePortfolioStats } from "@/lib/utils/badges";

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function fetchPortfolioCards(): Promise<LayerCard[]> {
  return delay(getPortfolioCards());
}

export async function fetchPortfolioStats(): Promise<PortfolioStats> {
  return delay(computePortfolioStats(getPortfolioCards()));
}

export async function fetchCardById(id: string): Promise<LayerCard | null> {
  return delay(getCardById(id) ?? null);
}

export async function lookupToken(tokenId: string): Promise<LayerCard | null> {
  return delay(getCardByTokenId(tokenId) ?? null);
}

export async function searchCards(query: string): Promise<LayerCard[]> {
  const q = query.toLowerCase().trim();
  if (!q) return delay(getPortfolioCards());

  const all = [...getPortfolioCards(), ...getEligibleRedemptionCards()];
  const unique = Array.from(new Map(all.map((c) => [c.id, c])).values());

  const results = unique.filter(
    (c) =>
      c.tokenId?.includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.certificationNumber?.includes(q),
  );

  // Also check external lookup cards
  const tokenMatch = getCardByTokenId(q);
  if (tokenMatch && !results.find((r) => r.id === tokenMatch.id)) {
    results.push(tokenMatch);
  }

  return delay(results);
}

export async function fetchOnChainActivity(
  cardId: string,
): Promise<OnChainActivityEvent[]> {
  return delay(MOCK_ONCHAIN_ACTIVITY[cardId] ?? []);
}

export async function fetchDeposits(): Promise<DepositRequest[]> {
  return delay(MOCK_DEPOSITS);
}

export async function fetchDepositById(
  id: string,
): Promise<DepositRequest | null> {
  return delay(MOCK_DEPOSITS.find((d) => d.id === id) ?? null);
}

export async function fetchRedemptions(): Promise<RedemptionRequest[]> {
  return delay(MOCK_REDEMPTIONS);
}

export async function fetchRedemptionById(
  id: string,
): Promise<RedemptionRequest | null> {
  return delay(MOCK_REDEMPTIONS.find((r) => r.id === id) ?? null);
}

export async function fetchEligibleRedemptionCards(): Promise<LayerCard[]> {
  return delay(getEligibleRedemptionCards());
}

export async function fetchRedemptionCard(cardId: string): Promise<LayerCard | null> {
  const card = getCardById(cardId);
  if (!card) return delay(null);
  // Include redemption-scoped cards even if hidden from portfolio
  return delay(card);
}
