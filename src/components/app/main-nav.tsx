import Image from "next/image";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { SidebarAccountMenu } from "@/components/app/sidebar-account-menu";
import { SidebarNav } from "@/components/app/sidebar-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from "@/components/ui/sidebar";

export async function MainNav() {
  const session = await getAuthSession();
  const navItems = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/calendar", label: "Calendar", icon: "calendar" },
    { href: "/pipeline", label: "Pipeline", icon: "pipeline" },
    ...(session?.user.role === "admin"
      ? ([
          { href: "/admin/users", label: "Users", icon: "users" },
          { href: "/admin/task-types", label: "Task Types", icon: "taskTypes" }
        ] as const)
      : [])
  ] as const;

  if (!session?.user) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="px-3 pb-3 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="min-h-14 rounded-2xl border border-sidebar-border/80 bg-sidebar/70 group-data-[collapsible=icon]:min-h-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
            >
              <Link href="/">
                <div className="inline-flex aspect-square size-10 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white shadow-sm transition-transform group-data-[collapsible=icon]:size-11">
                  <Image
                    src="/barin-redline-logo.png"
                    alt="Barin Sports Calendar"
                    width={64}
                    height={64}
                    priority
                    className="h-8 w-auto rounded-md"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">Barin Sports</span>
                  <span className="truncate text-xs text-muted-foreground">Marketing Calendar</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3">
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNav items={navItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarAccountMenu
              name={session.user.name}
              email={session.user.email ?? "your account"}
              role={session.user.role}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
