import Image from "next/image";
import Link from "next/link";
import { CopyInlineButton } from "@/components/common/copy-inline-button";
import { RENAISS_CARD_IMAGES } from "@/lib/constants/media";

type DepositStepId = "intake" | "review" | "ship" | "verification" | "mint";
type VerificationStepStatus =
  | "pending"
  | "verified"
  | "rejected";
type CardReviewStatus = "idle" | "verified" | "retry";
type MintStatus = "pending_mint" | "minted";

const DEPOSIT_STEPS: { id: DepositStepId; label: string; description: string }[] = [
  {
    id: "intake",
    label: "Upload card",
    description: "Input cert number and upload card front image.",
  },
  {
    id: "review",
    label: "Card review",
    description: "API validates cert and image details.",
  },
  {
    id: "ship",
    label: "Shipping",
    description: "Ship card to verifier and submit tracking.",
  },
  {
    id: "verification",
    label: "Card verification",
    description: "Legit App verifies the physical card.",
  },
  {
    id: "mint",
    label: "Check mint status",
    description: "Review mint readiness after verification.",
  },
];

const VERIFICATION_LABELS: Record<VerificationStepStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

const VERIFICATION_TONE_CLASS: Record<VerificationStepStatus, string> = {
  pending: "bg-[#FDC60033] text-[#FDC600]",
  verified: "bg-[#78FF6C23] text-[#78FF6C]",
  rejected: "bg-[#FF326833] text-[#FF7D9F]",
};

const CARD_REVIEW_LABELS: Record<CardReviewStatus, string> = {
  idle: "Not checked",
  verified: "Verified",
  retry: "Photo unreadable",
};

const CARD_REVIEW_TONE_CLASS: Record<CardReviewStatus, string> = {
  idle: "bg-white/10 text-white/70",
  verified: "bg-[#78FF6C23] text-[#78FF6C]",
  retry: "bg-[#FF326833] text-[#FF7D9F]",
};

const MINT_STATUS_LABELS: Record<MintStatus, string> = {
  pending_mint: "Pending mint",
  minted: "Minted",
};

const MINT_STATUS_TONE_CLASS: Record<MintStatus, string> = {
  pending_mint: "bg-[#FDC60033] text-[#FDC600]",
  minted: "bg-[#78FF6C23] text-[#78FF6C]",
};

const VERIFIER_DESTINATION_FIELDS = [
  { label: "Recipient Name", value: "Legit Intake (#vlt_legit_hk)" },
  { label: "Street", value: "35 Industrial Blvd, Suite 2" },
  { label: "City", value: "New Castle" },
  { label: "State", value: "DE" },
  { label: "Postal Code", value: "19720" },
  { label: "Country", value: "USA" },
] as const;

const VERIFIER_DESTINATION_COPY_ALL = VERIFIER_DESTINATION_FIELDS.map(
  (field) => `${field.label}: ${field.value}`,
).join("\n");

const DEPOSIT_CARD_DETAIL = {
  name: "Charizard",
  imageUrl: RENAISS_CARD_IMAGES.charizard,
  setName: "Pokemon Japanese Neo 2 Promo",
  cardNumber: "6",
  gradingCompany: "PSA",
  certificationNumber: "PSA74736597",
  grade: "10",
  year: "2000",
  language: "Japanese",
  tokenId: "79231076852774006958229876952072361912714928956049120690326948509881775336997",
} as const;

const DEPOSIT_CARD_MINT_TX_HASH =
  "0x7f21b40e2f6f1d3a7d0e6c2e1f8b8fd9b8b70f7ebf4f7a2903e8b64a6b0a2d11";
const DEPOSIT_CARD_BSCSCAN_TX_URL = `https://bscscan.com/tx/${DEPOSIT_CARD_MINT_TX_HASH}`;

function normalizeStep(value: string | undefined): DepositStepId {
  if (
    value === "intake" ||
    value === "review" ||
    value === "ship" ||
    value === "verification" ||
    value === "mint"
  ) {
    return value;
  }
  return "intake";
}

function normalizeVerificationStatus(value: string | undefined): VerificationStepStatus {
  if (value === "pending" || value === "verified" || value === "rejected") {
    return value;
  }
  return "pending";
}

function normalizeCardReviewStatus(value: string | undefined): CardReviewStatus {
  if (value === "idle" || value === "verified" || value === "retry") {
    return value;
  }
  return "idle";
}

function normalizeMintStatus(value: string | undefined): MintStatus {
  if (value === "pending_mint" || value === "minted") {
    return value;
  }
  return "pending_mint";
}

function maskMiddleDigits(value: string, prefix = 10, suffix = 8): string {
  if (value.length <= prefix + suffix) {
    return value;
  }
  return `${value.slice(0, prefix)}...${value.slice(-suffix)}`;
}

function buildDepositHref({
  step,
  status,
  review,
  certNumber,
  frontImage,
  mintStatus,
}: {
  step: DepositStepId;
  status: VerificationStepStatus;
  review: CardReviewStatus;
  certNumber?: string;
  frontImage?: string;
  mintStatus?: MintStatus;
}): string {
  const query = new URLSearchParams({
    step,
    status,
    review,
    mintStatus: mintStatus ?? "pending_mint",
  });
  if (certNumber) query.set("cert", certNumber);
  if (frontImage) query.set("frontImage", frontImage);
  return `/deposit/new?${query.toString()}`;
}

export default async function NewDepositPage({
  searchParams,
}: {
  searchParams?: Promise<{
    step?: string;
    status?: string;
    review?: string;
    cert?: string;
    frontImage?: string;
    mintStatus?: string;
  }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const step = normalizeStep(resolvedSearchParams?.step);
  const status = normalizeVerificationStatus(resolvedSearchParams?.status);
  const review = normalizeCardReviewStatus(resolvedSearchParams?.review);
  const mintStatus = normalizeMintStatus(resolvedSearchParams?.mintStatus);
  const certNumber = resolvedSearchParams?.cert?.trim() ?? "";
  const frontImage = resolvedSearchParams?.frontImage?.trim() ?? "";
  const currentStepIndex = DEPOSIT_STEPS.findIndex((item) => item.id === step);
  const isVerificationApproved = status === "verified";

  return (
    <div className="mx-auto max-w-5xl py-6 md:py-8">
      <Link href="/deposit" className="text-sm text-white/50 hover:text-white/80">
        ← Back to deposit
      </Link>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold md:text-3xl">New Deposit Request</h1>
        <p className="mt-2 text-sm text-white/60">
          Complete each step from cert intake to verification, shipping, and mint status.
        </p>
      </div>

      <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-4 md:p-5">
        <p className="text-xs uppercase tracking-wide text-white/50">Flow progress</p>
        <div className="mt-4 overflow-x-auto pb-1">
          <div className="flex min-w-max items-center gap-2">
            {DEPOSIT_STEPS.map((item, index) => {
              const isDone = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <div key={item.id} className="flex items-center gap-2">
                  {isCurrent ? (
                    <div className="rounded-full bg-rainbow p-px shadow-[0_0_20px_rgba(130,96,255,0.45)]">
                      <Link
                        href={buildDepositHref({
                          step: item.id,
                          status,
                          review,
                          certNumber,
                          frontImage,
                          mintStatus,
                        })}
                        className="inline-flex h-12 items-center gap-3 rounded-full bg-[#0f1014] px-4 text-white transition-colors"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <span className="whitespace-nowrap text-sm font-semibold">{item.label}</span>
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={buildDepositHref({
                        step: item.id,
                        status,
                        review,
                        certNumber,
                        frontImage,
                        mintStatus,
                      })}
                      className={`inline-flex h-12 items-center gap-3 rounded-full px-4 transition-colors ${
                        isDone ? "bg-white/10 text-white" : "bg-[#151515] text-white/60"
                      }`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isDone ? "bg-white/15 text-white" : "bg-white/10 text-white/70"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>
                    </Link>
                  )}
                  {index < DEPOSIT_STEPS.length - 1 ? (
                    <span className="px-1 text-xl leading-none text-white/35">{">"}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {step === "intake" ? (
        <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <h2 className="text-lg font-semibold">Step 1 · Upload Card</h2>
          <p className="mt-1 text-sm text-white/50">
            Enter certification number and upload the front image. Then submit for API review.
          </p>

          <form className="mt-5 space-y-4" method="GET" action="/deposit/new">
            <input type="hidden" name="step" value="review" />
            <input type="hidden" name="status" value={status} />

            <div>
              <label className="text-xs text-white/50" htmlFor="cert">
                Certification number
              </label>
              <input
                id="cert"
                name="cert"
                defaultValue={certNumber}
                placeholder="e.g. PSA74736597"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand px-3 text-sm text-white"
              />
            </div>

            <div className="rounded-xl border border-white/15 bg-brand p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Upload card front image</p>
              <div className="mt-2 rounded-xl border border-dashed border-white/30 bg-brand-1000/40 p-5 text-center">
                <p className="text-sm font-medium text-white/90">Front image upload area</p>
                <p className="mt-1 text-xs text-white/55">
                  Supported format: JPG, PNG. Please ensure the cert number is readable.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-brand p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">Front image upload checklist</p>
              <ul className="mt-2 space-y-1 text-sm text-white/75">
                <li>- Full card/slab visible</li>
                <li>- Cert number must be readable</li>
                <li>- Avoid glare and blur</li>
              </ul>
            </div>
            <input type="hidden" name="frontImage" value={frontImage || "card-front-uploaded.jpg"} />

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                name="review"
                value="verified"
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                Submit
              </button>
              <button
                type="submit"
                name="review"
                value="retry"
                className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white/80"
              >
                Submit (simulate unreadable photo)
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {step === "review" ? (
        <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <h2 className="text-lg font-semibold">Step 2 · Card Review</h2>
          <p className="mt-1 text-sm text-white/50">
            Our API checks cert number and front image. If valid, card details are returned.
          </p>

          <div className="mt-4 rounded-xl border border-white/15 bg-brand p-4">
            <p className="text-xs text-white/50">Certification number</p>
            <p className="mt-1 font-mono text-sm">{certNumber || "Not provided"}</p>
            <p className="mt-3 text-xs text-white/50">Uploaded front image</p>
            <p className="mt-1 text-sm">{frontImage || "Not provided"}</p>
          </div>

          <div className="mt-4 rounded-xl border border-white/15 bg-brand p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Card review status</p>
            <span
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${CARD_REVIEW_TONE_CLASS[review]}`}
            >
              {CARD_REVIEW_LABELS[review]}
            </span>
          </div>

          {review === "verified" ? (
            <>
              <section className="mt-4 rounded-xl border border-[#78FF6C55] bg-[#78FF6C12] p-4">
                <p className="text-sm font-medium text-[#78FF6C]">
                  Card information verified successfully.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-white/50">Card cert number</p>
                    <p className="mt-1 font-mono text-sm">{DEPOSIT_CARD_DETAIL.certificationNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Grading company</p>
                    <p className="mt-1 text-sm">{DEPOSIT_CARD_DETAIL.gradingCompany}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Grading</p>
                    <p className="mt-1 text-sm">{DEPOSIT_CARD_DETAIL.grade}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Set</p>
                    <p className="mt-1 text-sm">{DEPOSIT_CARD_DETAIL.setName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Card number</p>
                    <p className="mt-1 text-sm">{DEPOSIT_CARD_DETAIL.cardNumber}</p>
                  </div>
                </div>
              </section>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={buildDepositHref({
                    step: "intake",
                    status,
                    review,
                    certNumber,
                    frontImage,
                    mintStatus,
                  })}
                  className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white/80"
                >
                  Back to step 1
                </Link>
                <Link
                  href={buildDepositHref({
                    step: "ship",
                    status: "pending",
                    review,
                    certNumber,
                    frontImage,
                    mintStatus,
                  })}
                  className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
                >
                  Continue to shipping
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 rounded-xl border border-[#FF326855] bg-[#FF326822] p-4">
                <p className="text-sm font-medium text-[#FF7D9F]">
                  {review === "retry" ? "Picture not verified" : "Review not submitted"}
                </p>
                <p className="mt-1 text-sm text-white/85">
                  {review === "retry"
                    ? "We could not verify this image. Please upload the front picture again and resubmit."
                    : "Please complete step 1 and submit your cert number and front image."}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={buildDepositHref({
                    step: "intake",
                    status,
                    review: "idle",
                    certNumber,
                    frontImage,
                    mintStatus,
                  })}
                  className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
                >
                  Upload picture again
                </Link>
                {review === "retry" ? (
                  <Link
                    href={buildDepositHref({
                      step: "review",
                      status,
                      review: "verified",
                      certNumber,
                      frontImage,
                      mintStatus,
                    })}
                    className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white/80"
                  >
                    Simulate successful verification
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </section>
      ) : null}

      {step === "verification" ? (
        <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <h2 className="text-lg font-semibold">Step 4 · Card Verification</h2>
          <p className="mt-1 text-sm text-white/50">
            Verification is asynchronous. Expected review time is 3-4 business days.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/15 bg-brand p-4">
              <p className="text-xs text-white/50">Submitted at</p>
              <p className="mt-1 text-sm font-medium">Jun 24, 2026, 5:30 PM</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-brand p-4">
              <p className="text-xs text-white/50">Verification provider</p>
              <p className="mt-1 text-sm font-medium">Legit App</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-brand p-4">
              <p className="text-xs text-white/50">Current status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${VERIFICATION_TONE_CLASS[status]}`}
              >
                {VERIFICATION_LABELS[status]}
              </span>
            </div>
          </div>

          {status === "rejected" ? (
            <div className="mt-4 rounded-xl border border-[#FF326855] bg-[#FF326822] p-4">
              <p className="text-sm font-medium text-[#FF7D9F]">Rejected reason categories</p>
              <ul className="mt-2 space-y-1 text-sm text-white/80">
                <li>- Cannot verify identity</li>
                <li>- Card details mismatch</li>
                <li>- Suspected counterfeit</li>
                <li>- Photo quality insufficient</li>
                <li>- Unsupported item</li>
              </ul>
            </div>
          ) : null}

          {status === "verified" ? (
            <div className="mt-4 rounded-xl border border-[#78FF6C55] bg-[#78FF6C12] p-4">
              <p className="text-sm font-medium text-[#78FF6C]">Authentic</p>
              <p className="mt-1 text-sm text-white/80">
                Legit App has verified this card as authentic.
              </p>
              <p className="mt-2 text-sm text-white/80">
                Verification link:{" "}
                <a
                  href="https://verify.legitapp.com/renaiss/dep-charizard"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/40 underline-offset-2 hover:text-white"
                >
                  https://verify.legitapp.com/renaiss/dep-charizard
                </a>
              </p>
            </div>
          ) : null}

          <div className="mt-4 rounded-xl border border-white/15 bg-brand p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Simulate status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  "pending",
                  "verified",
                  "rejected",
                ] as VerificationStepStatus[]
              ).map((option) => (
                <Link
                  key={option}
                  href={buildDepositHref({
                    step: "verification",
                    status: option,
                    review,
                    certNumber,
                    frontImage,
                    mintStatus,
                  })}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    option === status
                      ? "border-primary/70 bg-primary/10 text-white"
                      : "border-white/20 text-white/70 hover:text-white"
                  }`}
                >
                  {VERIFICATION_LABELS[option]}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {status === "pending" && (
              <Link
                href={buildDepositHref({
                  step: "verification",
                  status: "verified",
                  review,
                  certNumber,
                  frontImage,
                  mintStatus,
                })}
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                Mark verified
              </Link>
            )}
            {status === "verified" && (
              <Link
                href={buildDepositHref({
                  step: "mint",
                  status: "verified",
                  review,
                  certNumber,
                  frontImage,
                  mintStatus,
                })}
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                Check mint status
              </Link>
            )}
            {status === "rejected" && (
              <Link
                href="/deposit/new?step=intake&status=rejected&review=idle"
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                Start a new submission
              </Link>
            )}
          </div>
        </section>
      ) : null}

      {step === "ship" ? (
        <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <h2 className="text-lg font-semibold">Step 3 · Ship To Verifier</h2>
          <p className="mt-1 text-sm text-white/50">
            Ship your card package to the verifier for physical inspection.
          </p>

          <div className="mt-4 rounded-xl border border-[#FDC60055] bg-[#FDC60022] p-4">
            <p className="text-sm font-medium text-[#FDC600]">
              Pack your card securely before shipping.
            </p>
            <p className="mt-1 text-sm text-white/80">
              Use a rigid holder, protective sleeve, and tamper-evident outer packaging.
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#FDC600]">
              Insurance Notice
            </p>
            <p className="mt-1 text-sm text-white/90">
              We do not provide insurance for cards during shipping. We strongly recommend that
              collectors add insurance when sending parcels and insure the full card value.
            </p>
            <p className="mt-2 text-sm text-white/80">
              This helps protect against loss or damage in transit. Please contact your shipping
              carrier for available insurance options and coverage details.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/15 bg-[#07080d] p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 20 20"
                  className="h-5 w-5 text-white/70"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M10 17s6-4.35 6-9a6 6 0 10-12 0c0 4.65 6 9 6 9z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="10" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <p className="text-lg font-semibold">Verifier Destination</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <CopyInlineButton
                  value={VERIFIER_DESTINATION_COPY_ALL}
                  label="Copy all verifier destination fields"
                />
                <span className="hidden sm:inline">Copy all</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {VERIFIER_DESTINATION_FIELDS.map((field) => (
                <div
                  key={field.label}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                >
                  <div>
                    <p className="text-xs text-white/50">{field.label}</p>
                    <p className="mt-1 text-lg font-medium leading-tight text-white/95">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-white/70">
              Please use this address when sending your card to our verifier and include your
              deposit request ID for proper identification.
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-white/15 bg-brand p-4">
            <p className="text-xs text-white/50">Shipping instructions</p>
            <ul className="mt-2 space-y-1 text-sm text-white/80">
              <li>- Include deposit request ID: dep-charizard.</li>
              <li>- Use tracked courier and keep drop-off receipt.</li>
              <li>- Submit tracking immediately after shipment.</li>
            </ul>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-white/15 bg-brand p-4">
              <label className="text-xs text-white/50" htmlFor="tracking-no">
                Tracking number
              </label>
              <input
                id="tracking-no"
                placeholder="Enter courier tracking number"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand-1000 px-3 text-sm text-white"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={buildDepositHref({
                step: "review",
                status,
                review,
                certNumber,
                frontImage,
                mintStatus,
              })}
              className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white/80"
            >
              Back to card review
            </Link>
            <Link
              href={buildDepositHref({
                step: "verification",
                status: "pending",
                review,
                certNumber,
                frontImage,
                mintStatus,
              })}
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
            >
              Submit
            </Link>
          </div>
        </section>
      ) : null}

      {step === "mint" ? (
        <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <h2 className="text-lg font-semibold">Step 5 · Check Mint Status</h2>
          <p className="mt-1 text-sm text-white/50">
            Check mint status after verification approval.
          </p>

          {isVerificationApproved ? (
            <div className="mt-4 space-y-3">
              <section className="rounded-xl border border-white/15 bg-brand p-4">
                <div className="grid gap-4 md:grid-cols-[160px_1fr] md:items-start">
                  <div className="relative mx-auto h-56 w-40 overflow-hidden rounded-xl border border-white/15 bg-black/20 md:mx-0">
                    <Image
                      src={DEPOSIT_CARD_DETAIL.imageUrl}
                      alt={DEPOSIT_CARD_DETAIL.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">Card detail</p>
                    <h3 className="mt-2 text-base font-semibold">{DEPOSIT_CARD_DETAIL.name}</h3>
                    <p className="mt-1 text-sm text-white/70">
                      {DEPOSIT_CARD_DETAIL.setName} #{DEPOSIT_CARD_DETAIL.cardNumber}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-white/50">Token ID</p>
                        <p className="mt-1 font-mono text-sm" title={DEPOSIT_CARD_DETAIL.tokenId}>
                          {maskMiddleDigits(DEPOSIT_CARD_DETAIL.tokenId)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Mint status</p>
                        <span
                          className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${MINT_STATUS_TONE_CLASS[mintStatus]}`}
                        >
                          {MINT_STATUS_LABELS[mintStatus]}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Grader</p>
                        <p className="mt-1 text-sm">{DEPOSIT_CARD_DETAIL.gradingCompany}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Serial</p>
                        <p className="mt-1 font-mono text-sm">
                          {DEPOSIT_CARD_DETAIL.certificationNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Grade</p>
                        <p className="mt-1 text-sm">{DEPOSIT_CARD_DETAIL.grade}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Year</p>
                        <p className="mt-1 text-sm">{DEPOSIT_CARD_DETAIL.year}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Language</p>
                        <p className="mt-1 text-sm">{DEPOSIT_CARD_DETAIL.language}</p>
                      </div>
                    </div>
                    {mintStatus === "minted" ? (
                      <div className="mt-4">
                        <p className="text-xs text-white/50">Tx hash</p>
                        <a
                          href={DEPOSIT_CARD_BSCSCAN_TX_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex font-mono text-sm text-white/80 underline decoration-white/40 underline-offset-2 hover:text-white"
                          title={DEPOSIT_CARD_MINT_TX_HASH}
                        >
                          {maskMiddleDigits(DEPOSIT_CARD_MINT_TX_HASH, 12, 10)}
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <div className="rounded-xl border border-white/15 bg-brand p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Simulate mint status</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["pending_mint", "minted"] as MintStatus[]).map((option) => (
                    <Link
                      key={option}
                      href={buildDepositHref({
                        step: "mint",
                        status,
                        review,
                        certNumber,
                        frontImage,
                        mintStatus: option,
                      })}
                      className={`rounded-full border px-3 py-1.5 text-xs ${
                        option === mintStatus
                          ? "border-primary/70 bg-primary/10 text-white"
                          : "border-white/20 text-white/70 hover:text-white"
                      }`}
                    >
                      {MINT_STATUS_LABELS[option]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-white/15 bg-brand p-4">
              <p className="text-sm text-white/80">
                Verification status is <span className="font-medium">{VERIFICATION_LABELS[status]}</span>.
                Minting unlocks after approval.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/deposit"
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
            >
              Back to deposit
            </Link>
            <Link
              href="/cards"
              className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white/80"
            >
              Check card
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
