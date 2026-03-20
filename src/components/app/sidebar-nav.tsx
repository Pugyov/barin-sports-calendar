"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Shapes, Users, Workflow } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

type SidebarNavIcon = "dashboard" | "calendar" | "pipeline" | "users" | "taskTypes";

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
  users: Users,
  taskTypes: Shapes
} satisfies Record<SidebarNavIcon, typeof LayoutDashboard>;

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (isMobile && previousPathname.current !== pathname) {
      setOpenMobile(false);
    }
    previousPathname.current = pathname;
  }, [isMobile, pathname, setOpenMobile]);

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              size="lg"
              tooltip={item.label}
              className="group-data-[collapsible=icon]:justify-center"
            >
              <Link
                href={item.href}
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false);
                  }
                }}
              >
                <Icon />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
