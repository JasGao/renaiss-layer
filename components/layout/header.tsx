import { DEMO_USER_WALLET } from "@/lib/constants";
import { truncateAddress } from "@/lib/utils/badges";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-brand p-4 md:p-4">
      <div className="flex items-center justify-between">
        <div className="md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rainbow text-[10px] font-bold">
              R
            </div>
            <span className="text-sm font-semibold">Renaiss Layer</span>
          </div>
        </div>
        <div className="hidden md:block">
          <p className="text-sm text-white/50">Custody portal</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-white/80">Demo Collector</p>
            <p className="font-mono text-xs text-white/50">
              {truncateAddress(DEMO_USER_WALLET, 6)}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
            DC
          </div>
        </div>
      </div>
    </header>
  );
}
