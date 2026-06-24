# Renaiss Layer Requirements

> Working product brief for a new user-facing app, **Renaiss Layer**. The app helps users deposit graded cards into Renaiss custody, view owned on-chain collectibles, track custody/vault history, and redeem cards out of the vault.

## 1. Product Goal

Renaiss Layer should be the user's custody portal for physical-card-backed NFTs.

After login, a user should be able to:

- See every card they own or are depositing.
- Understand where each physical card is and what state its NFT is in.
- Review a clear history of deposit, verification, vault receipt, relocation, and redemption events.
- Start a redemption for eligible cards using a flow similar to the current redemption checkout.
- Start a new deposit by submitting card details and photos, then track verification and vault receipt.

The demo should make custody feel trustworthy: the user should always know **what card**, **who verified it**, **which vault has it**, **what happened on-chain**, and **what action is available next**.

## 2. Important Clarifications

Some original wording should be refined before implementation:

- "Owned cards" should include multiple lifecycle groups, not just NFTs in the user's wallet. A user may own a card that is still being verified, in transit to a vault, in vault custody, relocating between vaults, or pending redemption.
- "Vault status" and "NFT status" are related but not identical. For this app, the user-facing NFT status should stay small: `in_vault`, `in_transit`, `redeemed`, or `burned`. `redeemed` means the user redeemed the card; `burned` means the platform burned the NFT for inventory reuse/new packs.
- "Deposit calls legit app API and takes 3-4 days" should be represented as an async verification case, not a blocking step. The app should show a submitted request, expected SLA, status updates, and possible rejection/resubmission states.
- "Who authenticate" should be split by role:
  - **Verifier**: confirms the card identity/condition/authenticity.
  - **Vault signer**: confirms physical receipt, transfer out, or transfer in.
  - **Relocation signer**: authorizes and records movement between vaults.
  - **System signer**: backend/on-chain service that mints, transfers, burns, or syncs the NFT.
- Relocation is probably not a user-started action for v1. It should appear in card history when operations move inventory, but the user should only track it unless a future business flow lets users request relocation.

## 3. Target Users

- **Collector / owner**: logs in, deposits cards, tracks custody, redeems cards.
- **Vault operator**: receives, signs, relocates, and releases physical cards. This can remain in the existing vault portal for v1.
- **Verifier / authenticator**: reviews submitted card data/photos and signs the verification result. This can be an external Legit App workflow or internal admin screen.
- **Support / operations**: helps users understand delayed verification, failed delivery, rejected cards, or redemption problems.

## 4. App Structure

Recommended top-level navigation:

- **Cards**: overview of owned cards plus token ID lookup for public card status.
- **Deposit**: create deposits and track deposit requests/history.
- **Redeem**: select eligible cards and track redemption requests/history.
- **Settings**: wallet, addresses, contact info, notifications.

For a demo, this can be simplified to:

- **My Cards**
- **Deposit**
- **Redeem**
- **Settings**

## 5. Card Overview

**My Cards** should be a card overview/explorer. It defaults to cards the user currently owns or controls, and also lets the user search any token ID to inspect public card status.

Owned card tiles should show:

- Card image.
- Card name.
- Set name.
- Card number.
- Grading company, e.g. PSA.
- Grade.
- Certification number when available.
- Token ID when minted.
- Current owner wallet.
- Current vault or custody provider.
- Physical status.
- NFT status.
- Latest activity timestamp.
- Primary CTA, such as `View details`, `Redeem`, `Continue deposit`, or `Track shipment`.

Recommended layout:

- Header stats for owned cards: total owned, in vault, redeemable, relocating, pending action.
- Search input: `Search by token ID, card name, cert number`.
- Tabs or filters: `My Cards`, `Token Lookup`, `All Results`.
- Owned card grid/table with full card metadata and actions.
- Search result detail card or drawer for unowned token lookup.

### Ownership And Visibility Rules

- My Cards should not show protocol-held redeeming cards as if they are still wallet-owned.
- When redemption checkout succeeds, redirect to the redemption detail view and show copy like: "Your card moved to Redemption Tracking while the protocol processes release."
- The Redeem page is the canonical place for active, shipped, delivered, cancelled, and completed redemption records.
- The redemption detail view must show both on-chain activity and off-chain tracking, even when the NFT owner is `CollectibleManager`.
- When a card is fully redeemed and delivered, keep it in redemption history.

### Token ID Lookup

When a user searches a token ID they do not own, show a read-only public card status page or drawer.

It should include:

- Card image and basic metadata.
- Token ID and NFT contract.
- Current on-chain owner/address, with known protocol addresses labeled.
- Current NFT status: `in_vault`, `in_transit`, `redeemed`, or `burned`.
- Current vault/custody status when safely public.
- On-chain activity/proof timeline.
- A small disclaimer: "This is public on-chain status. Private order and shipping details are only visible to the account that created the order."

Actions for unowned cards should be limited:

- `Copy token ID`
- `View on explorer`
- `View on-chain activity`
- `Contact support` only if the user has a related order or verified claim

Do not show `Redeem`, `Track shipment`, or private order CTAs for unowned cards.

### Card Detail

The detail page should have:

- Hero area with image and card identity.
- Current status summary.
- Ownership and custody panel.
- On-chain activity/proof timeline.
- Active deposit or redemption tracking summary, when the card has an open order.
- Available actions.
- Documents/proofs panel.

Current status summary should answer:

- Where is the physical card now?
- Who owns the NFT now?
- If the NFT is held by `CollectibleManager`, which user/order is it being held for?
- Is the card redeemable?
- Is any operation pending?
- What is the next expected step?

When a card detail page is opened from a redemption request and the NFT owner is `CollectibleManager`, show a user-friendly status like:

> Redemption in progress. The NFT is held by the protocol while the vault prepares release.

The card may no longer appear in My Cards, but the user must still be able to access this detail view from redemption tracking.

## 6. Card Data Model For UI

The UI should be designed around this shape, even if the demo uses mock data:

```ts
// Keep this model derived from existing sources instead of creating one
// overloaded "card status" enum.
type LayerCard = {
  id: string;
  tokenId?: string;
  cardIdentifier?: string;
  name: string;
  imageUrl: string;
  setName: string;
  cardNumber?: string;
  category: "pokemon" | "one_piece" | "sports" | "other";
  gradingCompany?: "PSA" | "BGS" | "CGC" | "SGC" | "raw";
  grade?: string;
  certificationNumber?: string;
  chainId?: number;
  nftContractAddress?: string;

  nft: NftState;
  custody: CustodyState;
  activeWorkflow?: CardWorkflow;

  redeemable: boolean;
  latestActivityAt: string;
};

type NftState = {
  // User-facing NFT status. Contract/indexer "none" must be resolved to
  // redeemed vs platform-burned using redemption/order context.
  status: NftStatus;
  ownerAddress?: string;
  ownerLabel?: string; // Derived for display, e.g. "You", "CollectibleManager", "External wallet"
};

type NftStatus = "in_vault" | "in_transit" | "redeemed" | "burned";

type CustodyState = {
  // Vault context derived from CollectibleRequestToken.status/currentVault/fromVault/toVault.
  // The high-level user-facing state is NftState.status.
    // Verification gate from CollectibleManager.verifyResults[tokenId].
  verificationStatus?: VerifyStatus;
  currentVault?: VaultSummary;
  fromVault?: VaultSummary;
  toVault?: VaultSummary;
  protocolStatus?: CollectibleRequestTokenStatus;
};

type CardWorkflow =
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

type TokenizationRequestStatus =
  | "created"
  | "tracking"
  | "received"
  | "minted"
  | "cancelled";

type RedemptionOrderTxStatus =
  | "created"
  | "redeem_request_created"
  | "redeem_request_failed";

type RedemptionDerivedStatus =
  | "Processing"
  | "Initiated"
  | "Canceled"
  | "Shipped"
  | "Failed";

type CollectibleRequestTokenStatus =
  | "DEPOSIT_OWNER_REQUESTED"
  | "DEPOSIT_OWNER_INITIATED"
  | "DEPOSIT_VAULT_RECEIVED"
  | "REDEMPTION_OWNER_REQUESTED"
  | "REDEMPTION_OWNER_CANCELED"
  | "REDEMPTION_VAULT_DISPATCHED"
  | "RELOCATION_VAULT_DISPATCHED"
  | "RELOCATION_VAULT_RECEIVED"
  | "RELOCATION_PLATFORM_CANCELED";

type VaultSummary = {
  id: string;
  name: string;
  countryCode?: string;
  address?: string;
  safeAddress?: string;
};
```

Why this is simpler:

- `NftState` answers only the user-facing NFT status and owner display questions.
- `CustodyState` answers only vault detail questions, such as current vault and relocation source/destination.
- `CardWorkflow` answers deposit/redemption tracking questions.

Current codebase mappings:

- `NftState.status` should be derived from the collectible protocol subgraph plus burn/redemption context:
  - `in_vault`: latest protocol status indicates the card is received at a vault, e.g. `DEPOSIT_VAULT_RECEIVED` or `RELOCATION_VAULT_RECEIVED`.
  - `in_transit`: latest protocol status indicates relocation or redemption transfer is in progress, e.g. `RELOCATION_VAULT_DISPATCHED`, `REDEMPTION_OWNER_REQUESTED`, or pending protocol custody during redemption.
  - `redeemed`: contract/indexer has no active NFT because the user redemption flow completed or is in final fulfillment.
  - `burned`: contract/indexer has no active NFT because the platform burned the NFT for inventory reuse/new pack creation.
- Do not derive `redeemed` vs `burned` from `collectibles.burnedAt` alone. `burnedAt` tells us the NFT is gone, but not why. Use redemption request/order context, subgraph redemption statuses, burn activity source, or an explicit backend burn reason.
- `NftState.ownerLabel` should be derived from `ownerAddress`, the user's resolved wallets, and a known protocol address book. Avoid storing a separate `ownerKind` enum unless the UI truly needs filtering by owner category.
- `CustodyState.protocolStatus` comes from `CollectibleRequestToken.status` in the collectible protocol subgraph.
- Deposit workflow status can reuse `tokenization_requests.status`: `created`, `tracking`, `received`, `minted`, `cancelled`.
- Redemption workflow should follow the current approach:
  - `txStatus` comes from `redemption_orders.txStatus` and tracks only checkout/on-chain request creation: `created`, `redeem_request_created`, `redeem_request_failed`.
  - `displayStatus` is derived at read time by `deriveOrderStatus(txStatus, subgraphTokenStatuses)`: `Processing`, `Initiated`, `Canceled`, `Shipped`, `Failed`.
  - `tokenStatuses` come from the collectible protocol subgraph and explain the per-card on-chain redemption/custody state.
- Shipment progress should stay inside redemption/deposit workflow metadata, not inside card/NFT status.

Badge guidance:

- Do not include badges as API/model fields for MVP. Derive them in UI components from `nft`, `custody`, `activeWorkflow`, and `redeemable`.
- **My Cards card tiles** can show at most 2-3 derived chips, e.g. `Owned`, `In vault`, `Redeemable`.
- **Token lookup result** can show public derived chips, e.g. `Not owned`, `In vault`, `In transit`.
- **Redeem card picker** can show action/custody chips, e.g. `Eligible`, `In vault`, `In transit`.
- **Deposit/Redeem tracking detail** should not rely on card chips for progress. Use deposit `status`, redemption `displayStatus`, shipment metadata, and on-chain events instead.

## 7. Activity And Tracking Model

Keep activity split by source:

- **Card on-chain activity**: proof-focused history for the specific NFT/card. This should only show on-chain events and indexed contract-derived statuses.
- **Workflow tracking activity**: user journey for a deposit or redemption flow. This can combine on-chain milestones with off-chain provider, vault operations, carrier, and support updates.

### Card On-Chain Activity

Show this on card detail and token lookup under **On-Chain Activity** or **Custody Proofs**. Only include events from chain/indexed protocol data.

| UI event | Source event/status | User-facing meaning |
| --- | --- | --- |
| `deposit_initiated` | `DepositRequestedV2` / `DEPOSIT_OWNER_INITIATED` | Deposit was created and a destination vault was assigned. |
| `vault_received_deposit` | `VaultReceivedForDeposit` / `DEPOSIT_VAULT_RECEIVED` | Vault signed that the deposited card was received. |
| `verification_recorded` | `Inspected` | Verifier inspection was recorded on-chain. |
| `nft_minted` | ERC-721 `Transfer` from zero address | NFT was minted or activated for the user. |
| `relocation_started` | `VaultDispatchedForRelocationV2` / `RELOCATION_VAULT_DISPATCHED` | Source vault signed transfer out to another vault. |
| `relocation_received` | `VaultReceivedForRelocation` / `RELOCATION_VAULT_RECEIVED` | Destination vault signed receipt after relocation. |
| `redemption_requested` | `RedemptionRequested` / `REDEMPTION_OWNER_REQUESTED` | Redemption request was recorded on-chain. |
| `redemption_cancelled` | `RedemptionCanceled` / `REDEMPTION_OWNER_CANCELED` | Redemption was cancelled on-chain. |
| `vault_released_for_redemption` | `VaultDispatchedForRedemptionV2` / `REDEMPTION_VAULT_DISPATCHED` | Vault signed release/transfer out for redemption. |
| `nft_removed` | ERC-721 `Transfer` to zero address or indexed burn/removal signal | NFT is no longer active; display as `redeemed` when tied to user redemption, otherwise `burned` when tied to platform inventory reuse. |

Each on-chain row should show timestamp, actor/address, role, source event/status, `requestId`, `tokenId`, vaults when relevant, tx hash, and proof/signature links when available.

### Deposit And Redemption Tracking

Show this inside Deposit and Redeem pages. Tracking views can combine on-chain milestones with off-chain events because the user's main question is "what happens next?"

| UI event | Source | User-facing meaning |
| --- | --- | --- |
| `verification_submitted` | verification provider / app DB | User submitted card details/photos for verification. |
| `verification_in_review` | verification provider / app DB | Verification provider is reviewing the card. |
| `verification_needs_more_photos` | verification provider / app DB | User must upload more or better photos. |
| `verification_approved` | verification provider, app DB, or `Inspected` | Card passed verification. |
| `verification_rejected` | verification provider, app DB, or `Inspected` | Card failed verification; show the reason. |
| `deposit_initiated` | `DepositRequestedV2` / app DB | Deposit was created and destination vault was assigned. |
| `shipping_label_created` | shipping provider / app DB | Shipping instructions or label are ready. |
| `shipped_to_vault` | carrier / app DB | User shipped the card to the vault. |
| `vault_received_deposit` | `VaultReceivedForDeposit` | Vault signed that the card was received. |
| `redemption_requested` | `RedemptionRequested` / redemption request DB | User requested physical redemption. |
| `redemption_cancelled` | `RedemptionCanceled` / redemption request DB | Redemption was cancelled. |
| `vault_released_for_redemption` | `VaultDispatchedForRedemptionV2` | Vault signed release/transfer out for redemption. |
| `shipped_to_user` | carrier / app DB | Redeemed card is shipping to the user. |
| `delivered` | carrier / app DB | Redeemed card was delivered. |
| `needs_attention` | support / app DB | User, support, verifier, or vault action is required. |

Each tracking row should show step title, state, timestamp/ETA, responsible party, next step, and any carrier/tx/proof link. For active redemptions, show a protocol custody panel with NFT holder, request association, on-chain redemption state, and physical shipment state.

Hide raw implementation events from normal users unless needed for support/debug mode: legacy event variants, cashier fee events, access-control/diamond events, repeated ERC-721 transfers with no user-facing state change, and raw `RelocationCanceledByPlatform`.

## 8. Deposit Flow

Deposit should be a guided, multi-step flow.

### Step 1: Start Deposit

User inputs:

- Card category.
- Card name.
- Set name.
- Card number.
- Year.
- Grading company.
- Grade.
- Certification number.
- Estimated declared value.
- Notes about condition or special handling.

For a demo, support an assisted search/autocomplete so the user can search a card name and prefill set/year/card number.

### Step 2: Upload Photos

Required photos:

- Front of slab/card.
- Back of slab/card.
- Certification number close-up.
- Optional extra condition photos.

Photo requirements should be visible:

- Good lighting.
- No glare.
- Full slab/card visible.
- Certification number readable.

### Step 3: Submit For Verification

The app sends card data and images to the verification provider, e.g. Legit App.

UI should show:

- Submitted timestamp.
- Estimated review time: `3-4 business days`.
- Verification provider.
- Current status.
- What happens next.

Possible statuses:

- `submitted`
- `in_review`
- `needs_more_photos`
- `approved`
- `rejected`
- `cancelled`

If the provider returns `needs_more_photos`, user can upload replacement/additional photos.

If rejected, show reason categories:

- Cannot verify identity.
- Card details mismatch.
- Suspected counterfeit.
- Photo quality insufficient.
- Unsupported item.

### Step 4: Ship To Vault

Only available after verification approval.

User should choose or receive:

- Destination vault.
- Shipping instructions.
- Shipping label or manual shipping address.
- Tracking number input/upload if user ships independently.
- Insurance recommendation based on declared value.

The app should show a clear warning:

> Do not ship cards before verification approval. Cards shipped early may be delayed or returned.
On-chain sequencing note:

- Deposit request creation (`DEPOSIT_OWNER_REQUESTED` / `DEPOSIT_OWNER_INITIATED`) can happen before final verifier outcome is written on-chain.
- Vault receipt/dispatch and redemption transitions should require verifier status `SUCCESS`.


### Step 5: Vault Receipt And Mint

When the vault receives the card:

- Vault signer verifies package/card.
- Vault signs receipt.
- The app records custody vault.
- NFT is minted or activated for the user, if not already minted.

Possible outcomes:

- `received_and_minted`
- `received_needs_review`
- `received_card_mismatch`
- `package_missing_item`
- `lost_or_damaged_claim`

## 9. Redemption Flow

The redemption flow should reuse the current redemption pattern:

1. User chooses eligible cards.
2. User reviews restrictions, fees, and vault region rules.
3. User enters or selects shipping address.
4. User chooses courier/shipping option when available.
5. User optionally selects insurance.
6. App calculates handling, shipping, insurance, duties/taxes when applicable.
7. User signs/authorizes redemption.
8. User pays with the existing token/payment flow, e.g. USDT/Permit2 where applicable.
9. Backend creates a redemption request.
10. NFT is burned or locked according to current protocol.
11. Vault prepares physical shipment.
12. User tracks shipment until delivered.

### Redemption Eligibility

A card is redeemable only if:

- User owns the NFT or owns the custody account that controls it.
- Physical card is confirmed `in_vault`.
- No relocation is active.
- No active listing/order/hold prevents redemption.
- Card is not already in a redemption request.
- Vault supports shipment to selected destination or a manual flow exists.

### Redemption UX Rules

- If selected cards are in different vault regions, warn the user and either split orders or require a single-region cart.
- Clearly show which card cannot be redeemed and why.
- On the redemption page, clicking a card should open a card info dialog instead of immediately selecting it.
- The card info dialog should show card metadata, vault/NFT status, redemption eligibility, estimated fees/region constraints when available, and on-chain activity.
- The dialog should have clear actions: `Add to redemption`, `Remove from redemption`, `View full card detail`, and `Close`.
- After order submission, show a tracking page instead of sending the user back to an empty cart.
- Redemption state should remain visible in both card detail and redemption history.

## 10. Demo UI Requirements

The demo should prioritize these screens:

### Login

- Wallet/social login entry.
- Short value proposition: "Deposit, track, and redeem vaulted collectibles."

### My Cards

- Portfolio stats: total owned cards, in vault, in transit/relocating, redeemable.
- Overview search for token ID, card name, or certification number.
- Card grid with rich cards and badges.
- Token lookup result drawer/page for unowned cards with public on-chain status only.
- Table mode for advanced users if time allows.
- Empty state prompting user to start a deposit or review the Redeem tracking/history section if they are tracking an active redemption.

### Card Detail

- Large card image.
- Card metadata.
- Status summary.
- Vault/NFT status split.
- On-chain activity/custody proof timeline.
- Active deposit/redemption tracking summary when relevant.
- Actions: redeem, track deposit, contact support.

### Deposit Page

- Deposit request list/history.
- Card details form.
- Photo upload.
- Verification review screen.
- Approved-to-ship screen.
- Tracking screen.

### Redeem Flow

- Eligible card picker.
- Clickable card preview/dialog showing full card info, vault/NFT status, redemption eligibility, and on-chain activity.
- Cart summary.
- Address form.
- Shipping/fee review.
- Signature/payment confirmation.
- Redemption success/tracking detail.
- Active and historical redemption tracking list.

## 11. Visual Theme And CSS Reuse

Renaiss Layer should reuse the current Renaiss web visual language instead of creating a new brand direction.

### Theme Summary

- Overall style: premium dark crypto/collectibles interface with high-contrast white text, purple brand accents, rainbow gradients, glassy borders, and card-forward layouts.
- Base background: near-black purple/black. Use `bg-brand` / `#131313` for main surfaces and `brand.100` / `#07050F`, `brand.900` / `#0E091E`, `brand.1000` / `#0b0813` for deeper backgrounds.
- Primary accent: purple `#8260FF` / `var(--color-primary)`.
- Status accents: green `#4AFF32`, red `#FF3268`, yellow/gold `#FDC600` or rarity gold/yellow for value/rarity signals.
- Border system: mostly `border-white/20`, with `border-white/10` for subtle sections and `border-white/40` for selected states.
- Text hierarchy: `text-white` for primary, `text-white/80` for strong secondary, `text-white/60` for hints, `text-white/50` for muted metadata.
- Fonts: Poppins for UI (`--font-sans`, weights 400/500/600) and JetBrains Mono for code-like metadata such as token IDs, tx hashes, and keyboard shortcuts.

### Gradients And Effects

Reuse current Tailwind background images:

- `bg-rainbow`: linear gradient from yellow to red, pink, purple, and blue.
- `bg-rainbow-conic`: animated conic rainbow for premium CTAs.
- `bg-rainbow-1.5`, `bg-rainbow-2`, `bg-rainbow-3`, `bg-rainbow-4`, `bg-rainbow-5`: lower/high opacity rainbow variants.
- Rarity gradients: `bg-rarity-gold`, `bg-rarity-yellow`, `bg-rarity-orange`, `bg-rarity-pink`, `bg-rarity-purple`, `bg-rarity-white`.

Recommended usage:

- Use rainbow/conic gradients for primary conversion moments: login, deposit submit, add to redemption, checkout.
- Use subtle white alpha borders and dark fills for normal cards/panels.
- Use glow/gradient edges on hover rather than permanently noisy backgrounds.

### Layout

- Use the current app shell pattern: dark sidebar + sticky top header + content area on `bg-brand`.
- Header: sticky, `bg-brand`, `border-b border-white/20`, compact `p-2` mobile and `p-4` desktop.
- Sidebar: `bg-brand`, logo at top, nav icons, `border-white/20` rail/separators.
- Page content: centered containers, common max width around `max-w-7xl`, mobile padding `px-5`, desktop padding `md:px-6`.
- For page-local headers like redemption, use sticky section headers with `top-20 md:top-24`, `z-10`, and `bg-brand`.

### Cards And Panels

Use the existing card grid feel:

- Card shell: `rounded-xl`, dark fill `bg-[#131313]`, thin `bg-white/20 p-px` border wrapper.
- Hover: reveal `bg-rainbow` border/glow with `opacity-0 md:group-hover:opacity-100` and blurred pseudo layer.
- Image area: square card image, `object-cover`, hover zoom around `md:group-hover:scale-[120%]`.
- Metadata footer: dark footer `bg-[#131313]`, `border-t border-white/20`, compact `p-3`, muted title `text-white/50`.
- Badges: small rounded pills with translucent backgrounds, e.g. `bg-white/10`, `bg-[#FDC60033]`, or `bg-[#78FF6C23]`, plus small colored dot indicators.

For Renaiss Layer:

- Owned cards should use rich card tiles.
- Token lookup result can use a wider detail card/drawer with the same dark shell, white alpha borders, and token/tx metadata in mono.
- On-chain timeline events should be compact rows/cards with left status dots, `border-white/20`, and tx hash/explorer links.

### Buttons

Use two current button styles:

- App `Button`:
  - Base: rounded full, bold text, `active:scale-[0.98]`, full width by default.
  - `variant="rainbow"` for premium primary actions, with animated conic border and dark inner fill.
  - `variant="outline"` for secondary actions: `border-white/20 bg-brand text-white`.
- `SharedButton`:
  - Pill shape `rounded-[30px]`.
  - Primary: `bg-[var(--color-primary)] text-white`.
  - Outline: transparent with purple border/text.

Guidance:

- Use rainbow buttons sparingly for the main action per flow.
- Use purple primary buttons for normal confirmations.
- Use outline/dark buttons for secondary actions.
- Mobile action buttons should be full width when inside drawers/dialogs.

### Forms And Search

- Inputs: height `44px`, `rounded-md`, `border-white/20`, transparent/dark background, `placeholder:text-white/50`.
- Mobile text inputs should stay at `text-base` to avoid iOS zoom; desktop can use `md:text-sm`.
- Search triggers can use rounded-xl outline buttons with `!bg-transparent !border-white/20 text-white/50`.
- Long token IDs, wallet addresses, and tx hashes should use mono font, truncation, copy buttons, and explorer links.

### Dialogs And Drawers

- Dialog shell: `bg-brand`, `border border-white/20`, `!rounded-2xl`, no extra padding on the outer content.
- Dialog header: `p-5`, `border-b border-white/20`.
- Dialog title: uppercase, extra-bold, small on mobile and larger on desktop.
- Dialog footer: `p-5`, `gap-y-3`, `border-t border-white/20`, stacked full-width buttons.
- On mobile, important redemption/deposit dialogs can expand to full-screen for form-heavy content.

Use dialogs for:

- Redemption card preview.
- Token lookup detail.
- Deposit photo requirements.
- On-chain activity/proof details.

### Motion

Reuse existing subtle motion:

- `animate-fade-in-up` for card/list entry.
- `animate-pop` for cart count changes.
- Hover scale on cards and active scale on buttons.
- Avoid heavy animation for operational tracking; timelines should feel stable and trustworthy.

## 12. Suggested Mock Scenarios

The demo should include realistic sample cards across states:

- PSA 10 Pikachu, in YamaCardo Vault, redeemable.
- PSA 9 Charizard, verification pending, estimated 2 days remaining.
- PSA 10 Luffy, approved to ship, waiting for user tracking number.
- PSA 8 Blastoise, relocating from YamaCardo Vault to Collector Crypt Vault.
- PSA 10 Mew, redemption pending, NFT held by `CollectibleManager`, vault preparing release.
- PSA 10 Rayquaza, redemption shipped, NFT status `redeemed`, carrier tracking available.
- PSA 9 Gengar, rejected verification due to unreadable cert photo.

This makes the UI demonstrate all important edge cases without needing live backend integration.

## 13. Data And API Needs

For production, Renaiss Layer likely needs app-facing APIs for:

- `GET /layer/cards`: list current owned cards for My Cards.
- `GET /layer/cards/:id`: card detail for currently owned cards.
- `GET /layer/cards/:id/onchain-activity`: card on-chain activity/proof timeline.
- `GET /layer/cards/lookup?tokenId=...`: public token lookup for card metadata, NFT/custody status, and on-chain activity only.
- `POST /layer/deposits`: create deposit request.
- `POST /layer/deposits/:id/photos`: upload card photos.
- `POST /layer/deposits/:id/submit-verification`: send to verification provider.
- `POST /layer/deposits/:id/tracking`: add user shipment tracking.
- `GET /layer/deposits/:id`: deposit progress.
- `GET /layer/deposits`: list active and historical deposit requests.
- `GET /layer/redeem/eligible-cards`: list redeemable cards.
- `GET /layer/redeem/cards/:id/preview`: redemption-page card preview with eligibility and on-chain activity.
- `GET /layer/redemptions`: list active and historical redemption requests.
- `POST /layer/redemptions/quote`: calculate fees/shipping.
- `POST /layer/redemptions/checkout`: create redemption request.
- `GET /layer/redemptions/:id`: redemption tracking, including request status and card on-chain status.
- `GET /layer/redemptions/:id/card`: redemption-scoped card detail, authorized by redemption request ownership even if the current NFT owner is `CollectibleManager`.

Important access rule:

- My Cards can be authorized by current NFT ownership/current owned custody state.
- Deposit/redemption-scoped card detail must be authorized by deposit/redemption request ownership, not current NFT ownership.
- When the NFT owner is `CollectibleManager`, resolve the user relationship from `RedemptionRequested.requestId`, the redemption request row, or the active collectible request token.
- Deposit/redemption detail responses should include enough card metadata and on-chain state for the user to understand the card even if it no longer appears in My Cards.

For demo UI, mock these APIs behind a local fixture layer.

## 14. Verification Provider Integration

The Legit App integration should be treated as asynchronous:

- Submit card metadata and photos.
- Store provider request ID.
- Poll or receive webhook updates.
- Record reviewer/verifier identity when available.
- Store result, reason, confidence, and reviewed timestamp.
- Allow resubmission only when the failure reason supports it.

Do not block the user in the browser for 3-4 days. The app should show a persistent request and send notification updates.

## 15. Notifications

Useful notifications:

- Verification submitted.
- More photos required.
- Verification approved.
- Verification rejected.
- Shipment to vault received.
- NFT minted.
- Relocation started/completed.
- Redemption order created.
- Vault released card.
- Shipment delivered.
- Support action required.

Channels can be email first; in-app notification center can come later.

## 16. Open Questions

- Should users be allowed to deposit raw/ungraded cards, or only PSA/BGS/CGC/SGC slabs?
- Does the NFT mint after vault receipt only, or can it be minted earlier after verification approval?
- Does redemption burn the NFT immediately at checkout, or only after vault confirms release?
- Which app owns verification review: Legit App only, admin-panel, or a new verifier portal?
- Should users choose the destination vault, or should Renaiss assign it based on region/capacity?
- How are high-value insurance rules handled for deposit and redemption shipments?
- Are relocation events user-visible for all cards, or only when relocation delays redemption?
- What happens when the verifier approves but the vault receives a mismatched card?

## 17. MVP Scope

Recommended MVP:

- Login.
- My Cards portfolio.
- Card detail with on-chain activity/proof timeline.
- Deposit page with creation flow, mock verification lifecycle, and deposit tracking/history.
- Redeem page with eligible card selection, checkout, and redemption tracking/history.
- Mock data layer that can later be replaced with real APIs.

Recommended post-MVP:

- Real Legit App integration.
- Real shipment label purchasing for deposits.
- User notifications.
- Support case creation.
- Multi-vault split redemptions.
- Admin/verifier tools for deposit review.

## 18. Prompt For Demo UI Agent

Use this brief to create a polished demo UI for **Renaiss Layer**, a custody portal for physical-card-backed NFTs. Build a responsive web app with these flows:

- User logs in and sees a card overview page: currently owned cards by default, plus a token ID lookup for public status of other cards.
- Card cards show image, name, set, grade, token ID, vault status, NFT status, and primary action.
- Token lookup lets a user inspect an unowned card's public metadata, current on-chain owner/status, custody status, and on-chain activity, without exposing private order/shipping/support data.
- Card detail shows metadata, current custody summary, and an on-chain activity/proof timeline.
- Deposit page lets user input card info, upload photos, submit to verification, see a 3-4 business day review status, get shipping-to-vault instructions, and track deposit history.
- Redeem page lets user inspect eligible in-vault cards in a dialog, review card info/on-chain status/eligibility, select cards, review shipping/fees, enter address, authorize payment/signature, and track active/historical redemptions. Redeeming cards remain accessible here even when the NFT is held by `CollectibleManager`.
- Reuse the current Renaiss dark theme: `bg-brand` / `#131313` surfaces, white alpha borders, Poppins typography, purple primary accents, rainbow CTAs, rounded cards, glassy badges, and subtle hover motion.

Use realistic mock data and include edge cases: pending verification, approved to ship, in vault and redeemable, relocating, redemption pending, and rejected verification. The design should feel premium, trustworthy, and operationally transparent.
