"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ITEMS } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/cn";

export function TopNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-foreground hover:text-accent">
          <span className="text-accent">Mini</span> Freds
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={cn("px-3 py-1.5 rounded-md text-sm font-medium transition",
                  isActive ? "bg-surface text-accent" : "text-foreground/80 hover:text-accent"
                )}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} 
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-surface hover:bg-surface-muted">
            {mobileOpen ? "✕" : "≡"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-surface">
          <ul className="px-4 py-2 flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-foreground/90 hover:text-accent hover:bg-surface-muted">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
