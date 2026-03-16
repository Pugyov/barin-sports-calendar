import type { Metadata } from "next";
import "./globals.css";
import { MainNav } from "@/components/app/main-nav";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Barin Marketing Calendar",
  description: "Internal marketing calendar replacing Excel workflow."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="min-h-screen md:flex">
            <MainNav />
            <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
