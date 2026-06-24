"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { MobileNav, Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-brand">
      <Sidebar pathname={pathname} />
      <div className="flex h-screen flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <Header />
        <main className="flex-1 overflow-y-auto px-5 md:px-6">{children}</main>
      </div>
      <MobileNav pathname={pathname} />
    </div>
  );
}
