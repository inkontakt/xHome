import "./globals.css";

import { Inter as FontSans } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteTheme } from "@/components/theme/site-theme";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/react";

import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import { getSiteSettings, resolveThemeRuntime } from "@/lib/site-settings";

import type { Metadata } from "next";

const font = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "WordPress & Next.js Starter by 9d8",
  description:
    "A starter template for Next.js with WordPress as a headless CMS.",
  metadataBase: new URL(siteConfig.site_domain),
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const themeRuntime = resolveThemeRuntime(settings.theme);
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen font-sans antialiased", font.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme={themeRuntime.defaultTheme}
          enableSystem={themeRuntime.enableSystem}
          forcedTheme={themeRuntime.forcedTheme}
          disableTransitionOnChange
        >
          <SiteTheme colors={settings.colors} />
          <Nav settings={settings} />
          {children}
          <Footer settings={settings} showThemeToggle={themeRuntime.showToggle} />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
