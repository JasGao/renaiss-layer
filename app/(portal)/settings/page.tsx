import { DEMO_USER_WALLET } from "@/lib/constants";
import { truncateAddress } from "@/lib/utils/badges";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl py-6 md:py-8">
      <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-white/50">Wallet, addresses, and notifications.</p>

      <div className="mt-8 space-y-4">
        <div className="rounded-xl border border-white/20 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-white/50">
            Connected wallet
          </p>
          <p className="mt-2 font-mono text-sm">{truncateAddress(DEMO_USER_WALLET, 8)}</p>
        </div>
        <div className="rounded-xl border border-white/20 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-white/50">
            Contact
          </p>
          <p className="mt-2 text-sm text-white/80">demo@renaiss.io</p>
        </div>
      </div>
    </div>
  );
}
