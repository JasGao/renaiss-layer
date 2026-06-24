import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchCardById, fetchOnChainActivity } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { CopyInlineButton } from "@/components/common/copy-inline-button";
import { deriveCardBadges, formatNftStatus, truncateAddress } from "@/lib/utils/badges";
import type { CollectibleRequestTokenStatus, OnChainActivityEvent } from "@/lib/types";

const EVENT_LABELS: Record<OnChainActivityEvent["type"], string> = {
  deposit_initiated: "Deposit initiated",
  vault_received_deposit: "Deposit vault received",
  verification_recorded: "Verification recorded",
  nft_minted: "NFT minted",
  relocation_started: "Relocation vault dispatched",
  relocation_received: "Relocation vault received",
  relocation_cancelled: "Relocation cancelled",
  redemption_requested: "Redemption requested",
  redemption_cancelled: "Redemption cancelled",
  vault_released_for_redemption: "Vault released for redemption",
  nft_removed: "NFT removed",
};

type ActivitySummaryItem = {
  status: CollectibleRequestTokenStatus;
  label: string;
  eventType: OnChainActivityEvent["type"];
  eventId?: string;
};

const POST_VERIFICATION_ACTIVITY_TYPES: OnChainActivityEvent["type"][] = [
  "vault_received_deposit",
  "relocation_started",
  "relocation_received",
  "relocation_cancelled",
];

const PIKACHU_ACTIVITY_CONFIG: ActivitySummaryItem[] = [
  {
    status: "DEPOSIT_OWNER_INITIATED",
    label: "Deposit Requested",
    eventType: "deposit_initiated",
  },
  {
    status: "DEPOSIT_VAULT_RECEIVED",
    label: "Deposit Received by Vault",
    eventType: "vault_received_deposit",
  },
  {
    status: "RELOCATION_VAULT_DISPATCHED",
    label: "Relocation Shipped",
    eventType: "relocation_started",
    eventId: "evt-5",
  },
  {
    status: "RELOCATION_VAULT_RECEIVED",
    label: "Relocation Received",
    eventType: "relocation_received",
  },
  {
    status: "RELOCATION_VAULT_DISPATCHED",
    label: "Relocation Shipped",
    eventType: "relocation_started",
    eventId: "evt-7",
  },
  {
    status: "RELOCATION_PLATFORM_CANCELED",
    label: "Relocation Cancelled",
    eventType: "relocation_cancelled",
  },
];

const BLASTOISE_ACTIVITY_CONFIG: ActivitySummaryItem[] = [
  {
    status: "DEPOSIT_OWNER_INITIATED",
    label: "Deposit Requested",
    eventType: "deposit_initiated",
  },
  {
    status: "DEPOSIT_VAULT_RECEIVED",
    label: "Deposit Received by Vault",
    eventType: "vault_received_deposit",
  },
  {
    status: "RELOCATION_VAULT_DISPATCHED",
    label: "Relocation Shipped",
    eventType: "relocation_started",
  },
];

const RAYQUAZA_ACTIVITY_CONFIG: ActivitySummaryItem[] = [
  {
    status: "DEPOSIT_OWNER_INITIATED",
    label: "Deposit Requested",
    eventType: "deposit_initiated",
  },
  {
    status: "DEPOSIT_VAULT_RECEIVED",
    label: "Deposit Received by Vault",
    eventType: "vault_received_deposit",
  },
  {
    status: "REDEMPTION_OWNER_REQUESTED",
    label: "Redemption Requested",
    eventType: "redemption_requested",
  },
  {
    status: "RELOCATION_VAULT_DISPATCHED",
    label: "Redemption Relocation shipped",
    eventType: "relocation_started",
  },
  {
    status: "RELOCATION_VAULT_RECEIVED",
    label: "Redemption Relocation received",
    eventType: "relocation_received",
  },
  {
    status: "REDEMPTION_VAULT_DISPATCHED",
    label: "Redemption Vault Dispatched",
    eventType: "vault_released_for_redemption",
  },
];

const ACTIVITY_SUMMARY_CONFIG_BY_CARD: Record<
  string,
  ActivitySummaryItem[]
> = {
  "card-pikachu": PIKACHU_ACTIVITY_CONFIG,
  "card-blastoise": BLASTOISE_ACTIVITY_CONFIG,
  "card-hooh": PIKACHU_ACTIVITY_CONFIG,
  "card-rayquaza": RAYQUAZA_ACTIVITY_CONFIG,
};

const MOCK_DISPLAY_FALLBACKS = {
  tokenId: "79231076852774006958229876952072361912714928956049120690326948509881775336000",
  ownerAddress: "0xF00DBABE00000000000000000000000000C0FFEE",
  grader: "PSA",
  serial: "PSA00000000",
  grade: "10",
  year: 2026,
  setName: "Pokemon Mock Set",
  language: "Japanese",
  cardNumber: "000",
  verificationStatus: "Approved",
  requestId: "0x6f8a1183dd6d6cf851769fd34e11adf1a72ca8c4f6bd53de0f25d35123ab9d88",
  txHash: "0x0d68a2dc1498f6f9a7ad5f428b693d49684594d65bf6ec858f84bdf4fce8dd77",
  vaultName: "Collector Crypt-Omni",
  signerWalletAddress: "0xBEEF1EAF00000000000000000000000000C0DE42",
  signature:
    "7f31de62bcfd9947e0f8b3d216f4ac9be3da8964b02756cb5f8af5a0ca9a9a7d4ce81654a708b933de",
  timestamp: "2026-06-01T12:00:00Z",
} as const;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRequestId(value: string) {
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

function formatMaskedValue(value: string) {
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}…${value.slice(-6)}`;
}

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [card, activity] = await Promise.all([
    fetchCardById(id),
    fetchOnChainActivity(id),
  ]);
  if (!card) notFound();

  const badges = deriveCardBadges(card);
  const sortedEvents = [...activity].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const verificationEvent = sortedEvents.find((event) => event.type === "verification_recorded");
  const timelineEvents = verificationEvent
    ? sortedEvents.filter((event) => event.id !== verificationEvent.id)
    : sortedEvents;
  const postVerificationEvents = timelineEvents.filter((event) =>
    POST_VERIFICATION_ACTIVITY_TYPES.includes(event.type),
  );
  const verificationResultUrl = verificationEvent?.proofUrl
    ? verificationEvent.proofUrl
    : verificationEvent?.txHash
      ? `https://basescan.org/tx/${verificationEvent.txHash}`
      : null;
  const verificationStatusDisplay =
    verificationEvent?.verifyStatus === 1
      ? "Approved"
      : verificationEvent?.verifyStatus === 2
        ? "Rejected"
        : verificationEvent?.verifyStatus !== undefined
          ? `${verificationEvent.verifyStatus}`
          : MOCK_DISPLAY_FALLBACKS.verificationStatus;
  const configuredVaultDisplay = card.custody.currentVault?.name ?? "—";
  const isShipping =
    card.nft.status === "in_transit" ||
    card.custody.protocolStatus === "RELOCATION_VAULT_DISPATCHED";
  const vaultDisplay = isShipping ? "Shipping" : configuredVaultDisplay;
  const verifierDisplay =
    card.custody.protocolStatus === "RELOCATION_VAULT_RECEIVED" ? "YamaCardo" : "Legit App";
  const verificationVerifierDisplay = verificationEvent?.actorRole?.toLowerCase().includes("yama")
    ? "YamaCardo"
    : verificationEvent?.actorRole?.toLowerCase().includes("legit")
      ? "Legit App"
      : verifierDisplay;
  const verificationSignerWalletAddress =
    verificationEvent?.actorAddress ??
    verificationEvent?.verifierAddress ??
    MOCK_DISPLAY_FALLBACKS.signerWalletAddress;
  const verificationSignature =
    verificationEvent?.verifierSignature ?? MOCK_DISPLAY_FALLBACKS.signature;
  const verificationTxHash = verificationEvent?.txHash ?? MOCK_DISPLAY_FALLBACKS.txHash;
  const isRedeemed = card.nft.status === "redeemed";
  const physicalLocationDisplay = isRedeemed ? "-" : card.custody.currentVault?.countryCode ?? "US";
  const encryptedPhysicalAddressRaw =
    isRedeemed
      ? "-"
      : card.custody.currentVault?.safeAddress ??
        "EA121E405CFEA0783F93F4F97A2E2536ACBEF927949A6757EB100D11748521A44C64CB8602F05614633155D3BBB81C27301EB7548F75559C5FE73A76210A718AA46B74A987D7928B2B092FC053CE82950CBF80A65D44B9B69FDF177CE147A6";
  const encryptedPhysicalAddressDisplay = formatMaskedValue(encryptedPhysicalAddressRaw);
  const nftStatusDisplay = formatNftStatus(card.nft.status);
  const ownerAddressDisplay = card.nft.ownerAddress ?? MOCK_DISPLAY_FALLBACKS.ownerAddress;
  const tokenIdDisplay = truncateAddress(card.tokenId ?? MOCK_DISPLAY_FALLBACKS.tokenId, 6);
  const gradingCompanyDisplay = card.gradingCompany ?? MOCK_DISPLAY_FALLBACKS.grader;
  const certificationNumberDisplay = card.certificationNumber ?? MOCK_DISPLAY_FALLBACKS.serial;
  const gradeDisplay = card.grade ?? MOCK_DISPLAY_FALLBACKS.grade;
  const yearDisplay = card.year ?? MOCK_DISPLAY_FALLBACKS.year;
  const setNameDisplay = card.setName ?? MOCK_DISPLAY_FALLBACKS.setName;
  const languageDisplay = card.language ?? MOCK_DISPLAY_FALLBACKS.language;
  const cardNumberDisplay = card.cardNumber ?? MOCK_DISPLAY_FALLBACKS.cardNumber;
  const activitySummaryConfig = ACTIVITY_SUMMARY_CONFIG_BY_CARD[card.id];

  return (
    <div className="mx-auto max-w-6xl py-6 md:py-8">
      <Link href="/cards" className="text-sm text-white/50 hover:text-white/80">
        ← Back to My Cards
      </Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/20 bg-brand-1000 lg:sticky lg:top-24">
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 380px"
            priority
          />
        </div>
        <div className="space-y-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {badges.map((b) => (
              <Badge key={b.label} {...b} />
            ))}
          </div>
          <h1 className="text-2xl font-semibold">{card.name}</h1>
          <p className="text-white/60">
            {card.setName}
            {card.cardNumber ? ` #${card.cardNumber}` : ""}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-white/50">Token ID</p>
              <p className="mt-1 font-mono text-sm">{tokenIdDisplay}</p>
            </div>
            <div>
              <p className="text-xs text-white/50">Owner Address</p>
              <p className="mt-1 break-all font-mono text-sm">{ownerAddressDisplay}</p>
            </div>
          </div>

          <section className="rounded-xl border border-white/20 bg-brand-1000/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Basic Info</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-white/50">Grader</p>
                <p className="mt-1 text-sm">{gradingCompanyDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Serial</p>
                <p className="mt-1 font-mono text-sm">{certificationNumberDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Grade</p>
                <p className="mt-1 text-sm">{gradeDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Year</p>
                <p className="mt-1 text-sm">{yearDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Set</p>
                <p className="mt-1 text-sm">{setNameDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Language</p>
                <p className="mt-1 text-sm">{languageDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Card Number</p>
                <p className="mt-1 text-sm">{cardNumberDisplay}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/20 bg-brand-1000/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Custody Info</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-white/50">Current vault</p>
                <p className="mt-1 text-sm font-medium">{vaultDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">NFT status</p>
                <p className="mt-1 text-sm font-medium capitalize">{nftStatusDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Physical location</p>
                <p className="mt-1 text-sm font-medium">{physicalLocationDisplay}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Encrypted physical address</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-sm">{encryptedPhysicalAddressDisplay}</p>
                  {!isRedeemed ? (
                    <CopyInlineButton
                      value={encryptedPhysicalAddressRaw}
                      label="Copy encrypted physical address"
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/20 bg-brand-1000/40 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">On-Chain Activity</p>
            <div className="mt-4 rounded-xl bg-rainbow p-px shadow-[0_0_24px_rgba(130,96,255,0.35)]">
              <section className="rounded-xl bg-brand p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Verification</p>
                {verificationEvent ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-white/50">Source event</p>
                      <p className="mt-1 text-sm">{verificationEvent.sourceEvent ?? "verification_recorded"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Status</p>
                      <p className="mt-1 text-sm font-medium">{verificationStatusDisplay}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Verifier</p>
                      <p className="mt-1 text-sm font-medium">{verificationVerifierDisplay}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Verified at</p>
                      <p className="mt-1 text-sm font-medium">
                        {formatDateTime(verificationEvent.timestamp)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Tx Hash</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="font-mono text-sm">{truncateAddress(verificationTxHash, 6)}</p>
                        <CopyInlineButton value={verificationTxHash} label="Copy tx hash" />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-white/50">Verifier comments</p>
                      <p className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-white/80">
                        {verificationResultUrl ? (
                          <>
                            <span>Authentic </span>
                            <a
                              href={verificationResultUrl}
                              target="_blank"
                              rel="noreferrer"
                              title={verificationResultUrl}
                              className="underline decoration-white/40 underline-offset-2 hover:text-white"
                            >
                              {verificationResultUrl}
                            </a>
                          </>
                        ) : (
                          "Verifier comments link unavailable"
                        )}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <details className="mt-1 rounded-md border border-white/15 bg-brand/30 p-3">
                        <summary className="cursor-pointer text-[11px] uppercase tracking-wide text-white/70">
                          Details
                        </summary>
                        <div className="mt-3 grid gap-2 text-xs text-white/70">
                          <div>
                            <p className="text-white/50">Signer Wallet Address</p>
                            <div className="mt-1 flex items-center gap-2">
                              <p className="break-all font-mono">
                                verifier (legit app): {formatMaskedValue(verificationSignerWalletAddress)}
                              </p>
                              <CopyInlineButton
                                value={verificationSignerWalletAddress}
                                label="Copy signer wallet address"
                              />
                            </div>
                          </div>
                          <div>
                            <p className="text-white/50">Signature</p>
                            <div className="mt-1 flex items-center gap-2">
                              <p className="break-all font-mono">
                                verifier signature: {formatMaskedValue(verificationSignature)}
                              </p>
                              <CopyInlineButton value={verificationSignature} label="Copy signature" />
                            </div>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-white/50">No verification record available yet.</p>
                )}
              </section>
            </div>
            {activitySummaryConfig ? (
              <div className="mt-4 space-y-3">
                {activitySummaryConfig.map((activityItem, index) => {
                  const matchedEvent = activityItem.eventId
                    ? sortedEvents.find((event) => event.id === activityItem.eventId)
                    : sortedEvents.find((event) => event.type === activityItem.eventType);
                  const isRelocationShipped =
                    activityItem.status === "RELOCATION_VAULT_DISPATCHED";
                  const isRelocationCancelled =
                    activityItem.status === "RELOCATION_PLATFORM_CANCELED";
                  const signerWalletAddress =
                    matchedEvent?.actorAddress ??
                    matchedEvent?.verifierAddress ??
                    MOCK_DISPLAY_FALLBACKS.signerWalletAddress;
                  const signerSignature =
                    matchedEvent?.verifierSignature ?? MOCK_DISPLAY_FALLBACKS.signature;
                  const vaultDisplay =
                    matchedEvent?.vaultTo ?? matchedEvent?.vaultFrom ?? MOCK_DISPLAY_FALLBACKS.vaultName;
                  const activityVaultFrom =
                    matchedEvent?.vaultFrom ?? matchedEvent?.vaultTo ?? MOCK_DISPLAY_FALLBACKS.vaultName;
                  const activityVaultTo =
                    matchedEvent?.vaultTo ?? matchedEvent?.vaultFrom ?? MOCK_DISPLAY_FALLBACKS.vaultName;
                  const activityRequestId = matchedEvent?.requestId ?? MOCK_DISPLAY_FALLBACKS.requestId;
                  const activityTxHash = matchedEvent?.txHash ?? MOCK_DISPLAY_FALLBACKS.txHash;
                  const activityTimestamp = matchedEvent?.timestamp ?? MOCK_DISPLAY_FALLBACKS.timestamp;
                  const isRedemptionRequested =
                    activityItem.status === "REDEMPTION_OWNER_REQUESTED";
                  const ownerSignerWalletAddress =
                    matchedEvent?.actorAddress ??
                    matchedEvent?.verifierAddress ??
                    MOCK_DISPLAY_FALLBACKS.signerWalletAddress;
                  const platformSignerWalletAddress =
                    matchedEvent?.verifierAddress ??
                    matchedEvent?.actorAddress ??
                    MOCK_DISPLAY_FALLBACKS.signerWalletAddress;
                  const ownerSignerSignature =
                    matchedEvent?.verifierSignature ?? MOCK_DISPLAY_FALLBACKS.signature;
                  const platformSignerSignature =
                    matchedEvent?.verifierSignature ?? MOCK_DISPLAY_FALLBACKS.signature;
                  const signerLabelPrefix =
                    activityItem.status === "DEPOSIT_OWNER_INITIATED"
                      ? "user"
                      : isRelocationShipped || isRelocationCancelled
                        ? `vault (${activityVaultFrom})`
                        : "vault (yamacardo)";
                  const signatureLabelPrefix =
                    activityItem.status === "DEPOSIT_OWNER_INITIATED"
                      ? "user signature"
                      : "vault signature";

                  return (
                    <div
                      key={`${activityItem.status}-${activityItem.eventType}-${activityItem.eventId ?? index}`}
                      className="rounded-lg border border-white/10 bg-brand/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                          <p className="text-sm font-medium">{activityItem.label}</p>
                        </div>
                        <span className="shrink-0 text-xs text-white/50">
                          {formatDateTime(activityTimestamp)}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs text-white/70 sm:grid-cols-2">
                        <div>
                          <p className="text-white/50">Request ID</p>
                          <div className="mt-1 flex items-center gap-2">
                            <p className="font-mono">{formatRequestId(activityRequestId)}</p>
                            <CopyInlineButton
                              value={activityRequestId}
                              label="Copy request ID"
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-white/50">Status</p>
                          <p className="mt-1 font-mono">{activityItem.status}</p>
                        </div>
                        {isRelocationShipped ? (
                          <>
                            <div>
                              <p className="text-white/50">From Vault</p>
                              <p className="mt-1">{activityVaultFrom}</p>
                            </div>
                            <div>
                              <p className="text-white/50">To Vault</p>
                              <p className="mt-1">{activityVaultTo}</p>
                            </div>
                          </>
                        ) : activityItem.status !== "DEPOSIT_OWNER_INITIATED" ? (
                          <div>
                            <p className="text-white/50">Vault</p>
                            <p className="mt-1">{vaultDisplay}</p>
                          </div>
                        ) : null}
                        <div>
                          <p className="text-white/50">Tx Hash</p>
                          <div className="mt-1 flex items-center gap-2">
                            <p className="font-mono">{truncateAddress(activityTxHash, 6)}</p>
                            <CopyInlineButton value={activityTxHash} label="Copy tx hash" />
                          </div>
                        </div>
                      </div>
                      <details className="mt-3 rounded-md border border-white/15 bg-brand/30 p-3">
                        <summary className="cursor-pointer text-[11px] uppercase tracking-wide text-white/70">
                          Details
                        </summary>
                        <div className="mt-3 grid gap-2 text-xs text-white/70">
                          <div>
                            <p className="text-white/50">Signer Wallet Address</p>
                            {isRedemptionRequested ? (
                              <div className="mt-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <p className="break-all font-mono">
                                    owner: {formatMaskedValue(ownerSignerWalletAddress)}
                                  </p>
                                  <CopyInlineButton
                                    value={ownerSignerWalletAddress}
                                    label="Copy owner signer wallet address"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="break-all font-mono">
                                    platform: {formatMaskedValue(platformSignerWalletAddress)}
                                  </p>
                                  <CopyInlineButton
                                    value={platformSignerWalletAddress}
                                    label="Copy platform signer wallet address"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 flex items-center gap-2">
                                <p className="break-all font-mono">
                                  {signerLabelPrefix}: {formatMaskedValue(signerWalletAddress)}
                                </p>
                                <CopyInlineButton
                                  value={signerWalletAddress}
                                  label="Copy signer wallet address"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-white/50">Signature</p>
                            {isRedemptionRequested ? (
                              <div className="mt-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <p className="break-all font-mono">
                                    owner signature: {formatMaskedValue(ownerSignerSignature)}
                                  </p>
                                  <CopyInlineButton
                                    value={ownerSignerSignature}
                                    label="Copy owner signature"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="break-all font-mono">
                                    platform signature: {formatMaskedValue(platformSignerSignature)}
                                  </p>
                                  <CopyInlineButton
                                    value={platformSignerSignature}
                                    label="Copy platform signature"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1 flex items-center gap-2">
                                <p className="break-all font-mono">
                                  {signatureLabelPrefix}: {formatMaskedValue(signerSignature)}
                                </p>
                                <CopyInlineButton value={signerSignature} label="Copy signature" />
                              </div>
                            )}
                          </div>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            ) : (verificationEvent ? postVerificationEvents : timelineEvents).length === 0 ? (
              <p className="mt-3 text-sm text-white/50">
                {verificationEvent
                  ? "No additional post-verification on-chain activities available yet."
                  : "No indexed events available for this card yet."}
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {(verificationEvent ? postVerificationEvents : timelineEvents).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-white/10 bg-brand/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">
                            {EVENT_LABELS[event.type]}
                          </p>
                          <p className="text-xs text-white/60">{event.description}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-white/50">
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-1 text-xs text-white/50 sm:grid-cols-2">
                      {event.actorRole ? <p>Role: {event.actorRole}</p> : null}
                      {event.requestId ? <p>Request: {event.requestId}</p> : null}
                      {event.vaultFrom ? <p>From: {event.vaultFrom}</p> : null}
                      {event.vaultTo ? <p>To: {event.vaultTo}</p> : null}
                      {event.txHash ? (
                        <p className="font-mono">Tx: {truncateAddress(event.txHash, 6)}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
