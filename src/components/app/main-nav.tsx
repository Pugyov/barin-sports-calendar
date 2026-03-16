import Image from "next/image";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { SidebarNav } from "@/components/app/sidebar-nav";
import { SignOutButton } from "@/components/app/sign-out-button";
import { ThemeToggle } from "@/components/app/theme-toggle";

export async function MainNav() {
  const session = await getAuthSession();
  const navItems = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/calendar", label: "Calendar", icon: "calendar" },
    { href: "/pipeline", label: "Pipeline", icon: "pipeline" },
    { href: "/import", label: "Import", icon: "import" },
    ...(session?.user.role === "admin" ? ([{ href: "/admin/users", label: "Users", icon: "users" }] as const) : [])
  ] as const;

  if (!session?.user) {
    return null;
  }

  return (
    <aside className="shrink-0 border-b bg-background/95 backdrop-blur md:sticky md:top-0 md:h-screen md:w-72 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col gap-6 px-4 py-4 md:px-5 md:py-6">
        <div className="flex items-start justify-between gap-3 rounded-2xl border bg-card p-3">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="inline-flex shrink-0 items-center rounded-xl bg-black px-2 py-1.5 shadow-sm">
              <Image
                src="/barin-sports-logo.svg"
                alt="Barin Sports Calendar"
                width={42}
                height={30}
                priority
                className="h-8 w-auto"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">Barin Sports</div>
              <div className="truncate text-xs text-muted-foreground">Marketing Calendar</div>
            </div>
          </Link>
          <ThemeToggle />
        </div>

        <div className="space-y-2">
          <p className="px-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
          <SidebarNav items={navItems} />
        </div>

        <div className="mt-auto rounded-2xl border bg-card p-4">
          <div className="space-y-1">
            <div className="truncate text-sm font-medium">{session.user.email}</div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{session.user.role}</div>
          </div>
          <SignOutButton email={session.user.email ?? "your account"} />
        </div>
      </div>
    </aside>
  );
}
