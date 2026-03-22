import type { Metadata } from "next";
import "./globals.css";
import { MainNav } from "@/components/app/main-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { getAuthSession } from "@/lib/auth";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Barin Marketing Calendar",
  description: "Internal marketing calendar replacing Excel workflow."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {session?.user ? (
            <SidebarProvider defaultOpen>
              <MainNav />
              <SidebarInset>
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/88 px-4 backdrop-blur-xl md:px-6">
                  <SidebarTrigger className="-ml-1 text-muted-foreground" />
                  <div className="min-w-0 app-fade-in">
                    <div className="workspace-kicker">Barin Sports</div>
                    <div className="truncate text-sm font-medium text-foreground/88">Marketing Calendar Workspace</div>
                  </div>
                </header>
                <div className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-8">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">{children}</main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
