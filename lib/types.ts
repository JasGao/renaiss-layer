export type CardCategory = "pokemon" | "one_piece" | "sports" | "other";

export type GradingCompany = "PSA" | "BGS" | "CGC" | "SGC" | "raw";

export type NftStatus = "in_vault" | "in_transit" | "redeemed" | "burned";

export type TokenizationRequestStatus =
  | "created"
  | "tracking"
  | "received"
  | "minted"
  | "cancelled";

export type RedemptionOrderTxStatus =
  | "created"
  | "redeem_request_created"
  | "redeem_request_failed";

export type RedemptionDerivedStatus =
  | "Processing"
  | "Initiated"
  | "Canceled"
  | "Shipped"
  | "Failed";

export type CollectibleRequestTokenStatus =
  | "DEPOSIT_OWNER_REQUESTED"
  | "DEPOSIT_OWNER_INITIATED"
  | "DEPOSIT_VAULT_RECEIVED"
  | "REDEMPTION_OWNER_REQUESTED"
  | "REDEMPTION_OWNER_CANCELED"
  | "REDEMPTION_VAULT_DISPATCHED"
  | "RELOCATION_VAULT_DISPATCHED"
  | "RELOCATION_VAULT_RECEIVED"
  | "RELOCATION_PLATFORM_CANCELED";

export type VerificationStatus =
  | "submitted"
  | "in_review"
  | "needs_more_photos"
  | "approved"
  | "rejected"
  | "cancelled";

export type VaultSummary = {
  id: string;
  name: string;
  countryCode?: string;
  address?: string;
  safeAddress?: string;
};

export type NftState = {
  status: NftStatus;
  ownerAddress?: string;
  ownerLabel?: string;
};

export type CustodyState = {
  currentVault?: VaultSummary;
  fromVault?: VaultSummary;
  toVault?: VaultSummary;
  protocolStatus?: CollectibleRequestTokenStatus;
};

export type CardWorkflow =
  | {
      type: "deposit";
      id: string;
      status: TokenizationRequestStatus;
    }
  | {
      type: "redemption";
      requestId: string;
      txStatus: RedemptionOrderTxStatus;
      displayStatus: RedemptionDerivedStatus;
      tokenStatuses?: Record<string, CollectibleRequestTokenStatus>;
      shipmentStatus?: string | null;
    };

export type LayerCard = {
  id: string;
  tokenId?: string;
  cardIdentifier?: string;
  /** FMV in USD */
  fmv?: number;
  name: string;
  imageUrl: string;
  year?: number;
  language?: string;
  setName: string;
  cardNumber?: string;
  category: CardCategory;
  gradingCompany?: GradingCompany;
  grade?: string;
  certificationNumber?: string;
  chainId?: number;
  nftContractAddress?: string;
  nft: NftState;
  custody: CustodyState;
  activeWorkflow?: CardWorkflow;
  redeemable: boolean;
  latestActivityAt: string;
  /** When true, card is held by protocol during redemption and hidden from My Cards */
  hiddenFromPortfolio?: boolean;
};

export type OnChainActivityEvent = {
  id: string;
  type:
    | "deposit_initiated"
    | "vault_received_deposit"
    | "verification_recorded"
    | "nft_minted"
    | "relocation_started"
    | "relocation_received"
    | "redemption_requested"
    | "redemption_cancelled"
    | "vault_released_for_redemption"
    | "nft_removed";
  timestamp: string;
  actorAddress?: string;
  actorRole?: string;
  requestId?: string;
  tokenId?: string;
  txHash?: string;
  sourceEvent?: string;
  verifierAddress?: string;
  verifyStatus?: number;
  verifierSignature?: string;
  proofUrl?: string;
  vaultFrom?: string;
  vaultTo?: string;
  description: string;
};

export type TrackingActivityEvent = {
  id: string;
  type: string;
  title: string;
  state: "completed" | "active" | "pending" | "failed";
  timestamp?: string;
  eta?: string;
  responsibleParty?: string;
  nextStep?: string;
  link?: string;
};

export type DepositRequest = {
  id: string;
  cardId?: string;
  cardName: string;
  setName: string;
  cardNumber?: string;
  category: CardCategory;
  gradingCompany?: GradingCompany;
  grade?: string;
  certificationNumber?: string;
  year?: number;
  declaredValue?: number;
  notes?: string;
  verificationStatus: VerificationStatus;
  verificationProvider?: string;
  rejectionReason?: string;
  submittedAt?: string;
  estimatedReviewDays?: number;
  destinationVault?: VaultSummary;
  trackingNumber?: string;
  tokenizationStatus?: TokenizationRequestStatus;
  imageUrl?: string;
};

export type RedemptionRequest = {
  id: string;
  cardIds: string[];
  displayStatus: RedemptionDerivedStatus;
  txStatus: RedemptionOrderTxStatus;
  createdAt: string;
  shippingAddress?: string;
  carrier?: string;
  carrierTracking?: string;
  totalFees?: number;
  cards: LayerCard[];
};

export type PortfolioStats = {
  inVault: number;
  inTransit: number;
  redeemed: number;
};

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
};
