import { buildThemeStyle, type ColorSettings } from "@/lib/site-settings";

type SiteThemeProps = {
  colors: ColorSettings;
};

export function SiteTheme({ colors }: SiteThemeProps) {
  const style = buildThemeStyle(colors);
  return <style>{style}</style>;
}
