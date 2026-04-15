import { promises as fs } from "node:fs";
import path from "node:path";

import { contentMenu, mainMenu } from "@/menu.config";
import { siteConfig } from "@/site.config";

export type MenuItem = {
  label: string;
  href: string;
};

export type ThemeSettings = {
  allowLight: boolean;
  allowDark: boolean;
  defaultMode: "system" | "light" | "dark";
  showToggle: boolean;
  enableDarkModeOnly?: boolean;
  modePreset?: "light-only" | "dark-only" | "allow-both";
};

export type ColorTokens = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  headerMenuBg: string;
  headerMenuText: string;
  headerMenuHover: string;
  footerMenuBg: string;
  footerMenuText: string;
  footerMenuHover: string;
};

export type ColorSettings = {
  light: ColorTokens;
  dark: ColorTokens;
  custom: Array<{ name: string; value: string }>;
  globalLight: Array<{ name: string; value: string }>;
  globalDark: Array<{ name: string; value: string }>;
};

export type SiteSettings = {
  logos: {
    header: string;
    footer: string;
    alt: string;
    headerWidth: number;
    footerWidth: number;
  };
  menus: {
    header: MenuItem[];
    footer: MenuItem[];
  };
  footerText: string;
  footerTextHelp?: string;
  theme: ThemeSettings;
  colors: ColorSettings;
};

export type ThemeRuntime = {
  defaultTheme: "system" | "light" | "dark";
  enableSystem: boolean;
  forcedTheme?: "light" | "dark";
  showToggle: boolean;
};

const SETTINGS_PATH = path.join(process.cwd(), "data", "site-settings.json");

const menuToArray = (menu: Record<string, string>): MenuItem[] =>
  Object.entries(menu).map(([label, href]) => ({ label, href }));

export const defaultSiteSettings: SiteSettings = {
  logos: {
    header: "/carfit_logo-300x273.png.webp",
    footer: "/carfit_logo-300x273.png.webp",
    alt: "Carfit Logo",
    headerWidth: 60,
    footerWidth: 60,
  },
  menus: {
    header: menuToArray(mainMenu),
    footer: menuToArray(contentMenu),
  },
  footerText: `All rights reserved | ${siteConfig.site_name} (c) {year}`,
  footerTextHelp: "Tip: use {year} to insert the current year automatically.",
  theme: {
    allowLight: true,
    allowDark: true,
    defaultMode: "system",
    showToggle: true,
    enableDarkModeOnly: false,
    modePreset: "allow-both",
  },
  colors: {
    light: {
      background: "0 0% 100%",
      foreground: "0 0% 3.9%",
      card: "0 0% 100%",
      cardForeground: "0 0% 3.9%",
      popover: "0 0% 100%",
      popoverForeground: "0 0% 3.9%",
      primary: "252 70% 32%",
      primaryForeground: "0 0% 98%",
      secondary: "193 100% 43%",
      secondaryForeground: "0 0% 9%",
      muted: "210 4% 20%",
      mutedForeground: "0 0% 45.1%",
      accent: "193 100% 43%",
      accentForeground: "0 0% 9%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 89.8%",
      input: "0 0% 89.8%",
      ring: "252 70% 32%",
      headerMenuBg: "0 0% 100%",
      headerMenuText: "0 0% 3.9%",
      headerMenuHover: "252 70% 32%",
      footerMenuBg: "0 0% 100%",
      footerMenuText: "0 0% 3.9%",
      footerMenuHover: "252 70% 32%",
    },
    dark: {
      background: "210 4% 20%",
      foreground: "0 0% 98%",
      card: "210 4% 20%",
      cardForeground: "0 0% 98%",
      popover: "210 4% 20%",
      popoverForeground: "0 0% 98%",
      primary: "252 70% 32%",
      primaryForeground: "0 0% 98%",
      secondary: "193 100% 43%",
      secondaryForeground: "0 0% 9%",
      muted: "0 0% 14.9%",
      mutedForeground: "0 0% 63.9%",
      accent: "193 100% 43%",
      accentForeground: "0 0% 9%",
      destructive: "0 62.8% 30.6%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 14.9%",
      input: "0 0% 14.9%",
      ring: "252 70% 32%",
      headerMenuBg: "210 4% 20%",
      headerMenuText: "0 0% 98%",
      headerMenuHover: "193 100% 43%",
      footerMenuBg: "210 4% 20%",
      footerMenuText: "0 0% 98%",
      footerMenuHover: "193 100% 43%",
    },
    custom: [],
    globalLight: [
      { name: "Primary", value: "252 70% 32%" },
      { name: "Secondary", value: "193 100% 43%" },
      { name: "Accent", value: "193 100% 43%" },
    ],
    globalDark: [
      { name: "Primary", value: "252 70% 32%" },
      { name: "Secondary", value: "193 100% 43%" },
      { name: "Accent", value: "193 100% 43%" },
    ],
  },
};

const mergeSettings = (
  base: SiteSettings,
  override?: Partial<SiteSettings>,
): SiteSettings => {
  if (!override) return base;
  return {
    ...base,
    ...override,
    logos: {
      ...base.logos,
      ...override.logos,
    },
    menus: {
      ...base.menus,
      ...override.menus,
      header: override.menus?.header ?? base.menus.header,
      footer: override.menus?.footer ?? base.menus.footer,
    },
    theme: {
      ...base.theme,
      ...override.theme,
    },
    colors: {
      ...base.colors,
      ...override.colors,
      light: {
        ...base.colors.light,
        ...override.colors?.light,
      },
      dark: {
        ...base.colors.dark,
        ...override.colors?.dark,
      },
      custom: override.colors?.custom ?? base.colors.custom,
      globalLight: override.colors?.globalLight ?? base.colors.globalLight,
      globalDark: override.colors?.globalDark ?? base.colors.globalDark,
    },
  };
};

const readStoredSettings = async (): Promise<Partial<SiteSettings> | null> => {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, "utf8");
    return JSON.parse(raw) as Partial<SiteSettings>;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return null;
    }
    console.error("Failed to read site settings:", error);
    return null;
  }
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const stored = await readStoredSettings();
  return mergeSettings(defaultSiteSettings, stored ?? undefined);
};

export const saveSiteSettings = async (
  nextSettings: Partial<SiteSettings>,
): Promise<SiteSettings> => {
  const current = await getSiteSettings();
  const merged = mergeSettings(current, nextSettings);
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(merged, null, 2), "utf8");
  return merged;
};

export const resolveThemeRuntime = (theme: ThemeSettings): ThemeRuntime => {
  const modePreset = theme.modePreset ?? "allow-both";
  const showToggle = theme.showToggle ?? true;
  const defaultMode = theme.defaultMode ?? "system";

  if (modePreset === "light-only") {
    return {
      defaultTheme: "light",
      enableSystem: false,
      forcedTheme: "light",
      showToggle: false,
    };
  }

  if (modePreset === "dark-only") {
    return {
      defaultTheme: "dark",
      enableSystem: false,
      forcedTheme: "dark",
      showToggle: false,
    };
  }

  const allowLight = theme.allowLight ?? true;
  const allowDark = theme.allowDark ?? true;

  if (allowLight && allowDark) {
    return {
      defaultTheme: defaultMode,
      enableSystem: defaultMode === "system",
      forcedTheme: undefined,
      showToggle,
    };
  }

  if (allowDark && !allowLight) {
    return {
      defaultTheme: "dark",
      enableSystem: false,
      forcedTheme: "dark",
      showToggle: false,
    };
  }

  return {
    defaultTheme: "light",
    enableSystem: false,
    forcedTheme: "light",
    showToggle: false,
  };
};

const toCssVars = (tokens: ColorTokens) => `
  --background: ${tokens.background};
  --foreground: ${tokens.foreground};
  --card: ${tokens.card};
  --card-foreground: ${tokens.cardForeground};
  --popover: ${tokens.popover};
  --popover-foreground: ${tokens.popoverForeground};
  --primary: ${tokens.primary};
  --primary-foreground: ${tokens.primaryForeground};
  --secondary: ${tokens.secondary};
  --secondary-foreground: ${tokens.secondaryForeground};
  --muted: ${tokens.muted};
  --muted-foreground: ${tokens.mutedForeground};
  --accent: ${tokens.accent};
  --accent-foreground: ${tokens.accentForeground};
  --destructive: ${tokens.destructive};
  --destructive-foreground: ${tokens.destructiveForeground};
  --border: ${tokens.border};
  --input: ${tokens.input};
  --ring: ${tokens.ring};
  --header-menu-bg: ${tokens.headerMenuBg};
  --header-menu-text: ${tokens.headerMenuText};
  --header-menu-hover: ${tokens.headerMenuHover};
  --footer-menu-bg: ${tokens.footerMenuBg};
  --footer-menu-text: ${tokens.footerMenuText};
  --footer-menu-hover: ${tokens.footerMenuHover};
`;

const toCustomVars = (custom: Array<{ name: string; value: string }>) =>
  custom
    .map((entry) => {
      const slug = entry.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (!slug) return null;
      return `  --custom-${slug}: ${entry.value};`;
    })
    .filter((value): value is string => Boolean(value))
    .join("\n");

export const buildThemeStyle = (colors: ColorSettings): string => {
  const customVars = toCustomVars(colors.custom);
  const light = toCssVars(colors.light);
  const dark = toCssVars(colors.dark);
  return `
:root {
${light}
${customVars ? `${customVars}` : ""}
}
.dark {
${dark}
${customVars ? `${customVars}` : ""}
}
  `.trim();
};
