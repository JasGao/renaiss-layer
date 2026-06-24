import Link from "next/link";
import { CopyInlineButton } from "@/components/common/copy-inline-button";

type DepositStepId = "details" | "photos" | "ship" | "verification" | "mint";
type VerificationStepStatus =
  | "pending"
  | "verified"
  | "rejected";

const DEPOSIT_STEPS: { id: DepositStepId; label: string; description: string }[] = [
  {
    id: "details",
    label: "Fill card details",
    description: "Input card metadata and declared value.",
  },
  {
    id: "photos",
    label: "Upload photos",
    description: "Add slab images and cert close-up.",
  },
  {
    id: "ship",
    label: "Ship to verifier",
    description: "Send package and provide tracking.",
  },
  {
    id: "verification",
    label: "Verification",
    description: "Legit App reviews authenticity result.",
  },
  {
    id: "mint",
    label: "Mint card",
    description: "Mint collectible token after approval.",
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
  setName: "Pokemon Japanese Neo 2 Promo",
  cardNumber: "6",
  gradingCompany: "PSA",
  certificationNumber: "PSA74736597",
  grade: "10",
  year: "2000",
  language: "Japanese",
  tokenId: "Pending mint",
} as const;

function normalizeStep(value: string | undefined): DepositStepId {
  if (
    value === "details" ||
    value === "photos" ||
    value === "ship" ||
    value === "verification" ||
    value === "mint"
  ) {
    return value;
  }
  return "details";
}

function normalizeVerificationStatus(value: string | undefined): VerificationStepStatus {
  if (value === "pending" || value === "verified" || value === "rejected") {
    return value;
  }
  return "pending";
}

export default async function NewDepositPage({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string; status?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const step = normalizeStep(resolvedSearchParams?.step);
  const status = normalizeVerificationStatus(resolvedSearchParams?.status);
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
          Complete each step to ship to verifier, pass verification, and mint your card.
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
                        href={`/deposit/new?step=${item.id}&status=${status}`}
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
                      href={`/deposit/new?step=${item.id}&status=${status}`}
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

      {step === "details" ? (
        <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <h2 className="text-lg font-semibold">Step 1 · Enter Card Information</h2>
          <p className="mt-1 text-sm text-white/50">
            Fill in your card details to start the deposit request.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-white/50" htmlFor="category">
                Card category
              </label>
              <input
                id="category"
                placeholder="e.g. Pokemon"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50" htmlFor="card-name">
                Card name
              </label>
              <input
                id="card-name"
                placeholder="e.g. Charizard"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50" htmlFor="set-name">
                Set name
              </label>
              <input
                id="set-name"
                placeholder="e.g. Pokemon Japanese Neo 2 Promo"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50" htmlFor="card-number">
                Card number
              </label>
              <input
                id="card-number"
                placeholder="e.g. 6"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50" htmlFor="year">
                Year
              </label>
              <input
                id="year"
                placeholder="e.g. 2000"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50" htmlFor="grader">
                Grading company and grade
              </label>
              <input
                id="grader"
                placeholder="e.g. PSA 9"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50" htmlFor="cert">
                Certification number
              </label>
              <input
                id="cert"
                placeholder="e.g. PSA74736597"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand px-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-white/50" htmlFor="value">
                Declared value (USD)
              </label>
              <input
                id="value"
                placeholder="e.g. 2500"
                className="mt-1 h-11 w-full rounded-xl border border-white/20 bg-brand px-3 text-sm text-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-white/50" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                placeholder="Add condition notes or special handling requests."
                className="mt-1 min-h-24 w-full rounded-xl border border-white/20 bg-brand px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/deposit/new?step=photos&status=${status}`}
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
            >
              Continue to photo upload
            </Link>
          </div>
        </section>
      ) : null}

      {step === "photos" ? (
        <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <h2 className="text-lg font-semibold">Step 2 · Upload Photos</h2>
          <p className="mt-1 text-sm text-white/50">
            Upload required photos before shipping to verifier.
          </p>

          <div className="mt-4 rounded-xl border border-white/15 bg-brand p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Required photos</p>
                <ul className="mt-2 space-y-1 text-sm text-white/75">
                  <li>1. Front of slab/card</li>
                  <li>2. Back of slab/card</li>
                  <li>3. Certification number close-up</li>
                  <li>4. Optional extra condition photos</li>
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Photo requirements</p>
                <ul className="mt-2 space-y-1 text-sm text-white/75">
                  <li>- Good lighting</li>
                  <li>- No glare</li>
                  <li>- Full slab/card visible</li>
                  <li>- Certification number readable</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {["Front", "Back", "Cert close-up", "Other photos"].map((label) => (
              <div
                key={label}
                className="rounded-xl border border-dashed border-white/30 bg-brand p-4 text-center"
              >
                <p className="text-sm font-medium">{label}</p>
                <p className="mt-1 text-xs text-white/50">Upload ready</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={`/deposit/new?step=details&status=${status}`}
              className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white/80"
            >
              Back to details
            </Link>
            <Link
              href="/deposit/new?step=ship&status=pending"
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
            >
              Continue to ship to verifier
            </Link>
          </div>
        </section>
      ) : null}

      {step === "verification" ? (
        <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <h2 className="text-lg font-semibold">Step 4 · Verification</h2>
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
                  href={`/deposit/new?step=verification&status=${option}`}
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
                href={`/deposit/new?step=verification&status=verified`}
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                Mark verified
              </Link>
            )}
            {status === "verified" && (
              <Link
                href="/deposit/new?step=mint&status=verified"
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                View mint status
              </Link>
            )}
            {status === "rejected" && (
              <Link
                href="/deposit/new?step=details&status=rejected"
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
              href={`/deposit/new?step=photos&status=${status}`}
              className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white/80"
            >
              Back to photos
            </Link>
            <Link
              href="/deposit/new?step=verification&status=pending"
              className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
            >
              Submit
            </Link>
          </div>
        </section>
      ) : null}

      {step === "mint" ? (
        <section className="mt-6 rounded-2xl border border-white/20 bg-brand-1000/30 p-5 md:p-6">
          <h2 className="text-lg font-semibold">Step 5 · Mint Card</h2>
          <p className="mt-1 text-sm text-white/50">
            Minting is available after verification approval.
          </p>

          {isVerificationApproved ? (
            <div className="mt-4 space-y-3">
              <section className="rounded-xl border border-white/15 bg-brand p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">Card detail</p>
                <h3 className="mt-2 text-base font-semibold">{DEPOSIT_CARD_DETAIL.name}</h3>
                <p className="mt-1 text-sm text-white/70">
                  {DEPOSIT_CARD_DETAIL.setName} #{DEPOSIT_CARD_DETAIL.cardNumber}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-white/50">Token ID</p>
                    <p className="mt-1 font-mono text-sm">{DEPOSIT_CARD_DETAIL.tokenId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Grader</p>
                    <p className="mt-1 text-sm">{DEPOSIT_CARD_DETAIL.gradingCompany}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Serial</p>
                    <p className="mt-1 font-mono text-sm">{DEPOSIT_CARD_DETAIL.certificationNumber}</p>
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
              </section>
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
              href={`/deposit/new?step=verification&status=${status}`}
              className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white/80"
            >
              Back to verification
            </Link>
            {isVerificationApproved ? (
              <Link
                href="/deposit"
                className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white"
              >
                Mint card (demo)
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
