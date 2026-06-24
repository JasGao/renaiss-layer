import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand px-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#8260FF22_0%,_transparent_60%)]" />
      <div className="relative w-full max-w-md animate-fade-in-up text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-rainbow text-2xl font-bold">
          R
        </div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Renaiss Layer
        </h1>
        <p className="mt-3 text-base text-white/60">
          Deposit, track, and redeem vaulted collectibles.
        </p>
        <p className="mt-2 text-sm text-white/40">
          Your custody portal for physical-card-backed NFTs.
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <Link href="/cards">
            <Button variant="rainbow" fullWidth>
              Connect Wallet
            </Button>
          </Link>
          <Link href="/cards">
            <Button variant="outline" fullWidth>
              Continue with Email
            </Button>
          </Link>
        </div>
        <p className="mt-8 text-xs text-white/30">
          Demo mode — no real wallet connection required.
        </p>
      </div>
    </div>
  );
}
