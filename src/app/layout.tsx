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
          <MainNav />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
