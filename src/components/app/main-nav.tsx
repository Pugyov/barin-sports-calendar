import Image from "next/image";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/app/theme-toggle";

const navTriggerClass =
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

export async function MainNav() {
  const session = await getAuthSession();

  return (
    <header className="border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="inline-flex items-center rounded-md bg-black px-2 py-1">
            <Image
              src="/barin-sports-logo.svg"
              alt="Barin Sports Calendar"
              width={42}
              height={30}
              priority
              className="h-8 w-auto"
            />
          </Link>
          {session?.user && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navTriggerClass}>
                    <Link href="/">Dashboard</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navTriggerClass}>
                    <Link href="/calendar">Calendar</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navTriggerClass}>
                    <Link href="/pipeline">Pipeline</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={navTriggerClass}>
                    <Link href="/import">Import</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          {session?.user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[12rem] justify-between">
                    <span className="truncate">{session.user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="space-y-1">
                    <div className="truncate text-xs font-normal text-muted-foreground">{session.user.email}</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{session.user.role}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/calendar">Calendar</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pipeline">Pipeline</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/import">Import</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/api/auth/signout?callbackUrl=/signin">Sign out</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
