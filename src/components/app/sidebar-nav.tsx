"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileSpreadsheet, LayoutDashboard, Users, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarNavIcon = "dashboard" | "calendar" | "pipeline" | "import" | "users";

type SidebarNavItem = {
  href: string;
  label: string;
  icon: SidebarNavIcon;
};

type SidebarNavProps = {
  items: readonly SidebarNavItem[];
};

const iconMap = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  pipeline: Workflow,
  import: FileSpreadsheet,
  users: Users
} satisfies Record<SidebarNavIcon, typeof LayoutDashboard>;

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-border bg-accent text-accent-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
