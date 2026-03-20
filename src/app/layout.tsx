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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {session?.user ? (
            <SidebarProvider defaultOpen>
              <MainNav />
              <SidebarInset>
                <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur md:px-6">
                  <SidebarTrigger className="-ml-1" />
                  <div className="text-sm font-medium text-muted-foreground">Barin Sports Marketing Calendar</div>
                </header>
                <div className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
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
