import type { LayerCard, PortfolioStats } from "@/lib/types";
import { getPortfolioCards } from "@/lib/mock/data";

export type CardBadge = {
  label: string;
  variant: "default" | "success" | "warning" | "error" | "primary" | "muted";
};

export function deriveCardBadges(card: LayerCard): CardBadge[] {
  if (card.nft.status === "in_vault") {
    return [{ label: "In vault", variant: "success" }];
  } else if (card.nft.status === "in_transit") {
    return [{ label: "In transit", variant: "warning" }];
  } else if (card.nft.status === "redeemed") {
    return [{ label: "Redeemed", variant: "muted" }];
  } else if (card.nft.status === "burned") {
    return [{ label: "Burned", variant: "muted" }];
  }
  return [];
}

export function derivePrimaryAction(card: LayerCard): {
  label: string;
  href: string;
} {
  if (card.redeemable) {
    return { label: "Redeem", href: "/redeem" };
  }
  if (card.activeWorkflow?.type === "deposit") {
    return {
      label: "Continue deposit",
      href: `/deposit/${card.activeWorkflow.id}`,
    };
  }
  if (card.activeWorkflow?.type === "redemption") {
    return {
      label: "Track shipment",
      href: `/redeem/${card.activeWorkflow.requestId}`,
    };
  }
  if (card.custody.fromVault && card.custody.toVault) {
    return { label: "View details", href: `/cards/${card.id}` };
  }
  return { label: "View details", href: `/cards/${card.id}` };
}

export function computePortfolioStats(cards: LayerCard[]): PortfolioStats {
  return {
    inVault: cards.filter((c) => c.nft.status === "in_vault").length,
    inTransit: cards.filter((c) => c.nft.status === "in_transit").length,
    redeemed: cards.filter((c) => c.nft.status === "redeemed").length,
  };
}

export function getPortfolioStats(): PortfolioStats {
  return computePortfolioStats(getPortfolioCards());
}

export function formatNftStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date("2026-06-23T00:00:00Z");
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}
