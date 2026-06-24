import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { NAV_ITEMS } from "@/lib/constants";

function NavIcon({ icon }: { icon: (typeof NAV_ITEMS)[number]["icon"] }) {
  const paths: Record<(typeof NAV_ITEMS)[number]["icon"], string> = {
    cards:
      "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    deposit:
      "M12 4v16m8-8H4",
    redeem:
      "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    settings:
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  };

  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[icon]} />
    </svg>
  );
}

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden md:flex md:h-screen md:w-56 md:flex-col md:overflow-hidden md:border-r md:border-white/20 md:bg-brand">
      <div className="flex h-16 items-center border-b border-white/20 px-5">
        <Link href="/cards" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rainbow text-xs font-bold">
            R
          </div>
          <span className="text-sm font-semibold tracking-wide">Renaiss Layer</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80",
              )}
            >
              <NavIcon icon={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/20 bg-brand md:hidden">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium",
              active ? "text-primary" : "text-white/50",
            )}
          >
            <NavIcon icon={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
