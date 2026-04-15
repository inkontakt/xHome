"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/auth/image-upload";
import type { ColorTokens, SiteSettings } from "@/lib/site-settings";

type ColorKey = keyof ColorTokens;

const colorTokens: Array<{ key: ColorKey; label: string }> = [
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "card", label: "Card" },
  { key: "cardForeground", label: "Card Foreground" },
  { key: "popover", label: "Popover" },
  { key: "popoverForeground", label: "Popover Foreground" },
  { key: "primary", label: "Primary" },
  { key: "primaryForeground", label: "Primary Foreground" },
  { key: "secondary", label: "Secondary" },
  { key: "secondaryForeground", label: "Secondary Foreground" },
  { key: "muted", label: "Muted" },
  { key: "mutedForeground", label: "Muted Foreground" },
  { key: "accent", label: "Accent" },
  { key: "accentForeground", label: "Accent Foreground" },
  { key: "destructive", label: "Destructive" },
  { key: "destructiveForeground", label: "Destructive Foreground" },
  { key: "border", label: "Border" },
  { key: "input", label: "Input" },
  { key: "ring", label: "Focus color" },
  { key: "headerMenuBg", label: "Header menu background" },
  { key: "headerMenuText", label: "Header menu text" },
  { key: "headerMenuHover", label: "Header menu hover" },
  { key: "footerMenuBg", label: "Footer menu background" },
  { key: "footerMenuText", label: "Footer menu text" },
  { key: "footerMenuHover", label: "Footer menu hover" },
];

const defaultSettings: SiteSettings = {
  logos: {
    header: "",
    footer: "",
    alt: "",
    headerWidth: 60,
    footerWidth: 60,
  },
  menus: {
    header: [],
    footer: [],
  },
  footerText: "",
  theme: {
    allowLight: true,
    allowDark: true,
    defaultMode: "system",
    showToggle: true,
    enableDarkModeOnly: false,
    modePreset: "allow-both",
  },
  colors: {
    light: {} as ColorTokens,
    dark: {} as ColorTokens,
    custom: [],
    globalLight: [],
    globalDark: [],
  },
};

const fetchSettings = async (): Promise<SiteSettings> => {
  const response = await fetch("/api/site-settings", {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to load site settings");
  }
  return (await response.json()) as SiteSettings;
};

const saveSettings = async (settings: SiteSettings): Promise<SiteSettings> => {
  const response = await fetch("/api/site-settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error("Failed to save site settings");
  }
  return (await response.json()) as SiteSettings;
};

const parseHsl = (value: string) => {
  const cleaned = value.replace(/hsl|\(|\)|,/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;
  const h = Number.parseFloat(parts[0]);
  const s = Number.parseFloat(parts[1].replace("%", ""));
  const l = Number.parseFloat(parts[2].replace("%", ""));
  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) return null;
  return { h, s, l };
};

const hslToHex = (hslValue: string): string | null => {
  const hsl = parseHsl(hslValue);
  if (!hsl) return null;
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    let time = t;
    if (time < 0) time += 1;
    if (time > 1) time -= 1;
    if (time < 1 / 6) return p + (q - p) * 6 * time;
    if (time < 1 / 2) return q;
    if (time < 2 / 3) return p + (q - p) * (2 / 3 - time) * 6;
    return p;
  };

  let r = l;
  let g = l;
  let b = l;
  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsl = (hex: string): string | null => {
  const cleaned = hex.replace("#", "").trim();
  if (![3, 6].includes(cleaned.length)) return null;
  const full =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((char) => char + char)
          .join("")
      : cleaned;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

type ConfiguratorFormProps = {
  onSaved?: () => void;
};

export function ConfiguratorForm({ onSaved }: ConfiguratorFormProps) {
  const router = useRouter();
  const configuratorButtonClass =
    "bg-[#3457d5] text-white hover:bg-[#2f4fc0] border-transparent";
  const saveButtonClass =
    "bg-[#03c03c] text-white hover:bg-[#029f32] border-transparent";
  const [activeSection, setActiveSection] = React.useState<
    | "logos"
    | "header-menu"
    | "footer-menu"
    | "footer-text"
    | "theme"
    | "colors"
    | null
  >(null);
  const [showAdvancedColors, setShowAdvancedColors] = React.useState(false);
  const [settings, setSettings] = React.useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isActive = true;
    fetchSettings()
      .then((data) => {
        if (isActive) {
          setSettings(data);
        }
      })
      .catch((error) => {
        console.error(error);
        if (isActive) {
          setStatus("Failed to load settings.");
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const saved = await saveSettings(settings);
      setSettings(saved);
      setStatus("Saved.");
      router.refresh();
      onSaved?.();
    } catch (error) {
      console.error(error);
      setStatus("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const updateLogo = (
    key: "header" | "footer" | "alt" | "headerWidth" | "footerWidth",
    value: string | number,
  ) => {
    setSettings((prev) => ({
      ...prev,
      logos: {
        ...prev.logos,
        [key]: value,
      },
    }));
  };

  const updateFooterText = (value: string) => {
    setSettings((prev) => ({
      ...prev,
      footerText: value,
    }));
  };

  const updateTheme = <K extends keyof SiteSettings["theme"]>(
    key: K,
    value: SiteSettings["theme"][K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value,
      },
    }));
  };

  const updateMenuItem = (
    section: "header" | "footer",
    index: number,
    key: "label" | "href",
    value: string,
  ) => {
    setSettings((prev) => {
      const nextMenu = prev.menus[section].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      );
      return {
        ...prev,
        menus: {
          ...prev.menus,
          [section]: nextMenu,
        },
      };
    });
  };

  const addMenuItem = (section: "header" | "footer") => {
    setSettings((prev) => ({
      ...prev,
      menus: {
        ...prev.menus,
        [section]: [...prev.menus[section], { label: "", href: "" }],
      },
    }));
  };

  const removeMenuItem = (section: "header" | "footer", index: number) => {
    setSettings((prev) => ({
      ...prev,
      menus: {
        ...prev.menus,
        [section]: prev.menus[section].filter((_, i) => i !== index),
      },
    }));
  };

  const updateColor = (
    mode: "light" | "dark",
    key: ColorKey,
    value: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [mode]: {
          ...prev.colors[mode],
          [key]: value,
        },
      },
    }));
  };

  const updateCustomColor = (
    index: number,
    key: "name" | "value",
    value: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        custom: prev.colors.custom.map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, [key]: value } : entry,
        ),
      },
    }));
  };

  const addCustomColor = () => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        custom: [...prev.colors.custom, { name: "", value: "0 0% 0%" }],
      },
    }));
  };

  const removeCustomColor = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        custom: prev.colors.custom.filter((_, entryIndex) => entryIndex !== index),
      },
    }));
  };

  const updateGlobalColor = (
    mode: "light" | "dark",
    index: number,
    key: "name" | "value",
    value: string,
  ) => {
    setSettings((prev) => {
      const listKey = mode === "light" ? "globalLight" : "globalDark";
      const list = prev.colors[listKey];
      const nextList = list.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry,
      );
      return {
        ...prev,
        colors: {
          ...prev.colors,
          [listKey]: nextList,
        },
      };
    });
  };

  const addGlobalColor = (mode: "light" | "dark") => {
    setSettings((prev) => {
      const listKey = mode === "light" ? "globalLight" : "globalDark";
      return {
        ...prev,
        colors: {
          ...prev.colors,
          [listKey]: [...prev.colors[listKey], { name: "", value: "0 0% 0%" }],
        },
      };
    });
  };

  const removeGlobalColor = (mode: "light" | "dark", index: number) => {
    setSettings((prev) => {
      const listKey = mode === "light" ? "globalLight" : "globalDark";
      return {
        ...prev,
        colors: {
          ...prev.colors,
          [listKey]: prev.colors[listKey].filter((_, i) => i !== index),
        },
      };
    });
  };

  const paletteOptions = (mode: "light" | "dark") =>
    mode === "light"
      ? settings.colors.globalLight ?? []
      : settings.colors.globalDark ?? [];

  const applyPaletteToToken = (
    mode: "light" | "dark",
    key: ColorKey,
    paletteIndex: number,
  ) => {
    const palette = paletteOptions(mode);
    const selected = palette[paletteIndex];
    if (selected) {
      updateColor(mode, key, selected.value);
    }
  };

  const getPaletteIndexForToken = (mode: "light" | "dark", key: ColorKey) => {
    const palette = paletteOptions(mode);
    const tokenValue = settings.colors[mode][key];
    const matchIndex = palette.findIndex((entry) => entry.value === tokenValue);
    return matchIndex >= 0 ? matchIndex : 0;
  };

  const renderColorRows = (mode: "light" | "dark") => (
    <div className="grid gap-4 md:grid-cols-2">
      {colorTokens.map((token) => {
        const value = settings.colors[mode][token.key] ?? "0 0% 0%";
        const hexValue = hslToHex(value) ?? "#000000";
        return (
          <div key={`${mode}-${token.key}`} className="flex flex-col gap-2">
            <Label className="text-sm">{token.label}</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={hexValue}
                onChange={(event) => {
                  const nextHsl = hexToHsl(event.target.value);
                  if (nextHsl) {
                    updateColor(mode, token.key, nextHsl);
                  }
                }}
                aria-label={`${token.label} color`}
                className="h-10 w-10 rounded-full p-0 border border-input bg-transparent cursor-pointer [appearance:none] [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderColorSubset = (
    mode: "light" | "dark",
    keys: ColorKey[],
    title: string,
    descriptions?: Partial<Record<ColorKey, string>>,
  ) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {keys.map((key) => {
          const token = colorTokens.find((item) => item.key === key);
          if (!token) return null;
          const value = settings.colors[mode][key] ?? "0 0% 0%";
          const hexValue = hslToHex(value) ?? "#000000";
          return (
            <div key={`${mode}-${key}`} className="flex flex-col gap-2">
              <Label className="text-sm">{token.label}</Label>
              {descriptions?.[key] ? (
                <p className="text-xs text-muted-foreground">
                  {descriptions[key]}
                </p>
              ) : null}
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={hexValue}
                  onChange={(event) => {
                    const nextHsl = hexToHsl(event.target.value);
                    if (nextHsl) {
                      updateColor(mode, key, nextHsl);
                    }
                  }}
                  aria-label={`${token.label} color`}
                  className="h-10 w-10 rounded-full p-0 border border-input bg-transparent cursor-pointer [appearance:none] [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGlobalPalette = (mode: "light" | "dark") => {
    const palette = paletteOptions(mode);
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">
          Global colors ({mode === "light" ? "light" : "dark"})
        </h3>
        <div className="flex flex-wrap gap-2">
          {palette.map((entry, index) => (
            <button
              key={`${mode}-swatch-${index}`}
              type="button"
              title={entry.name?.trim() ? entry.name : `Color ${index + 1}`}
              className="h-8 w-8 rounded-full border border-input"
              style={{ backgroundColor: `hsl(${entry.value})` }}
            />
          ))}
        </div>
        {palette.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add colors to build your global palette.
          </p>
        ) : null}
        <div className="space-y-3">
          {palette.map((entry, index) => {
            const hexValue = hslToHex(entry.value) ?? "#000000";
            return (
              <div
                key={`${mode}-global-${index}`}
                className="grid gap-2 md:grid-cols-[2fr_2fr_auto] items-end"
              >
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={entry.name}
                    onChange={(event) =>
                      updateGlobalColor(mode, index, "name", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={hexValue}
                      onChange={(event) => {
                        const nextHsl = hexToHsl(event.target.value);
                        if (nextHsl) {
                          updateGlobalColor(mode, index, "value", nextHsl);
                        }
                      }}
                      className="h-10 w-10 rounded-full p-0 border border-input bg-transparent cursor-pointer [appearance:none] [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => removeGlobalColor(mode, index)}
                  className={configuratorButtonClass}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
        <Button
          variant="secondary"
          onClick={() => addGlobalColor(mode)}
          className={configuratorButtonClass}
        >
          Add global color
        </Button>
      </div>
    );
  };

  const renderSectionAssignments = (mode: "light" | "dark") => {
    const palette = paletteOptions(mode);
    const sections: Array<{
      label: string;
      key: ColorKey;
      help: string;
    }> = [
      { label: "Body background", key: "background", help: "Page background." },
      { label: "Body text", key: "foreground", help: "Default text color." },
      { label: "Links", key: "accent", help: "Link and highlight color." },
      { label: "Header background", key: "card", help: "Header surface." },
      { label: "Header text", key: "cardForeground", help: "Header text." },
      { label: "Footer background", key: "card", help: "Footer surface." },
      { label: "Footer text", key: "cardForeground", help: "Footer text." },
      { label: "Primary button", key: "primary", help: "Main buttons." },
      {
        label: "Primary button text",
        key: "primaryForeground",
        help: "Text on primary buttons.",
      },
      {
        label: "Secondary button",
        key: "secondary",
        help: "Secondary buttons.",
      },
      {
        label: "Secondary button text",
        key: "secondaryForeground",
        help: "Text on secondary buttons.",
      },
      {
        label: "Header menu background",
        key: "headerMenuBg",
        help: "Header menu bar background.",
      },
      {
        label: "Header menu text",
        key: "headerMenuText",
        help: "Header menu text color.",
      },
      {
        label: "Header menu hover",
        key: "headerMenuHover",
        help: "Header menu hover color.",
      },
      {
        label: "Footer menu background",
        key: "footerMenuBg",
        help: "Footer menu background.",
      },
      {
        label: "Footer menu text",
        key: "footerMenuText",
        help: "Footer menu text color.",
      },
      {
        label: "Footer menu hover",
        key: "footerMenuHover",
        help: "Footer menu hover color.",
      },
    ];

    const ColorPickerPopover = ({
      value,
      onChange,
      label,
      mode,
    }: {
      value: string;
      onChange: (next: string) => void;
      label: string;
      mode: "light" | "dark";
    }) => {
      const [open, setOpen] = React.useState(false);
      const containerRef = React.useRef<HTMLDivElement>(null);
      const hexValue = hslToHex(value) ?? "#000000";
      const palette = paletteOptions(mode);
      const matchedIndex = palette.findIndex((entry) => entry.value === value);
      const matchedName =
        matchedIndex >= 0 ? palette[matchedIndex]?.name?.trim() : "";
      const displayValue =
        matchedName && matchedName.length > 0 ? matchedName : hexValue;

      React.useEffect(() => {
        const handleClick = (event: MouseEvent) => {
          if (!containerRef.current) return;
          if (!containerRef.current.contains(event.target as Node)) {
            setOpen(false);
          }
        };
        if (open) {
          document.addEventListener("mousedown", handleClick);
        }
        return () => {
          document.removeEventListener("mousedown", handleClick);
        };
      }, [open]);

      return (
        <div className="relative" ref={containerRef}>
          <button
            type="button"
            title={label}
            className="h-8 w-8 rounded-full border border-input"
            style={{ backgroundColor: `hsl(${value})` }}
            onClick={() => setOpen((prev) => !prev)}
          />
          {open ? (
            <div className="absolute left-0 top-10 z-50 w-64 rounded-md border border-input bg-background p-3 shadow-lg">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Custom color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={hexValue}
                      onChange={(event) => {
                        const nextHsl = hexToHsl(event.target.value);
                        if (nextHsl) {
                          onChange(nextHsl);
                        }
                      }}
                      className="h-10 w-10 rounded-full p-0 border border-input bg-transparent cursor-pointer [appearance:none] [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1 text-xs">
                        <span className="text-muted-foreground">#</span>
                        <span className="font-medium">{displayValue}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Global colors</Label>
                  <div className="flex flex-wrap gap-2">
                    {palette.map((entry, index) => (
                      <button
                        key={`popup-${label}-${index}`}
                        type="button"
                        title={entry.name?.trim() ? entry.name : `Color ${index + 1}`}
                        className="h-7 w-7 rounded-full border border-input"
                        style={{ backgroundColor: `hsl(${entry.value})` }}
                        onClick={() => {
                          onChange(entry.value);
                          setOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
                {matchedIndex >= 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onChange(palette[matchedIndex].value);
                      setOpen(false);
                    }}
                    className={configuratorButtonClass}
                  >
                    Use global color
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Section colors ({mode === "light" ? "light" : "dark"})
        </h3>
        {palette.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add at least one global color to assign section colors.
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <div key={`${mode}-section-${section.key}`} className="space-y-2">
              <Label className="text-sm">{section.label}</Label>
              <p className="text-xs text-muted-foreground">{section.help}</p>
              <ColorPickerPopover
                value={settings.colors[mode][section.key] ?? "0 0% 0%"}
                onChange={(next) => updateColor(mode, section.key, next)}
                label={section.label}
                mode={mode}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <p>Loading configurator...</p>;
  }

  const SectionList = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Site Configurator</h2>
        <p className="text-muted-foreground">
          Choose what you want to update.
        </p>
      </div>
      <div className="overflow-hidden rounded-md border border-input">
        {[
          { id: "logos", label: "Logo" },
          { id: "header-menu", label: "Header menu" },
          { id: "footer-menu", label: "Footer menu" },
          { id: "footer-text", label: "Footer text" },
          { id: "theme", label: "Theme mode" },
          { id: "colors", label: "Brand colors" },
          // Custom colors now live under Brand colors.
        ].map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setActiveSection(
                item.id as NonNullable<typeof activeSection>,
              )
            }
            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/40 ${
              index === 0 ? "" : "border-t border-input"
            }`}
          >
            <span>{item.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3">
      <Button className={configuratorButtonClass} onClick={() => setActiveSection(null)}>
        Back
      </Button>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );

  const SaveBar = () => (
    <div className="sticky bottom-0 bg-background pt-4">
      <div className="flex flex-wrap items-center gap-4 border-t pt-4">
        <Button onClick={handleSave} disabled={saving} className={saveButtonClass}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {activeSection === null ? (
        <SectionList />
      ) : (
        <>
          {activeSection === "logos" && (
            <div className="space-y-6">
              <SectionHeader title="Logo" />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Header logo</Label>
                  <ImageUpload
                    bucket="tenant-logos"
                    folder="site-logos/header"
                    inputId="logo-header-upload"
                    initialUrl={settings.logos.header}
                    onUploadComplete={(url) => updateLogo("header", url)}
                    buttonClassName={configuratorButtonClass}
                  />
                  <Label htmlFor="header-logo-size">Header logo size</Label>
                  <Input
                    id="header-logo-size"
                    type="number"
                    min={20}
                    max={200}
                    value={settings.logos.headerWidth}
                    onChange={(event) =>
                      updateLogo("headerWidth", Number(event.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Footer logo</Label>
                  <ImageUpload
                    bucket="tenant-logos"
                    folder="site-logos/footer"
                    inputId="logo-footer-upload"
                    initialUrl={settings.logos.footer}
                    onUploadComplete={(url) => updateLogo("footer", url)}
                    buttonClassName={configuratorButtonClass}
                  />
                  <Label htmlFor="footer-logo-size">Footer logo size</Label>
                  <Input
                    id="footer-logo-size"
                    type="number"
                    min={20}
                    max={200}
                    value={settings.logos.footerWidth}
                    onChange={(event) =>
                      updateLogo("footerWidth", Number(event.target.value))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logo-alt">Logo alt text</Label>
                  <Input
                    id="logo-alt"
                    value={settings.logos.alt}
                    onChange={(event) => updateLogo("alt", event.target.value)}
                  />
                </div>
              </div>
              <SaveBar />
            </div>
          )}

          {activeSection === "header-menu" && (
            <div className="space-y-6">
              <SectionHeader title="Header menu" />
              <div className="space-y-3">
                {settings.menus.header.map((item, index) => (
                  <div
                    key={`header-${index}`}
                    className="grid gap-2 md:grid-cols-[2fr_3fr_auto] items-end"
                  >
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={item.label}
                        onChange={(event) =>
                          updateMenuItem("header", index, "label", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        value={item.href}
                        onChange={(event) =>
                          updateMenuItem("header", index, "href", event.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => removeMenuItem("header", index)}
                      className={configuratorButtonClass}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() => addMenuItem("header")}
                  className={configuratorButtonClass}
                >
                  Add menu item
                </Button>
              </div>
              <SaveBar />
            </div>
          )}

          {activeSection === "footer-menu" && (
            <div className="space-y-6">
              <SectionHeader title="Footer menu" />
              <div className="space-y-3">
                {settings.menus.footer.map((item, index) => (
                  <div
                    key={`footer-${index}`}
                    className="grid gap-2 md:grid-cols-[2fr_3fr_auto] items-end"
                  >
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={item.label}
                        onChange={(event) =>
                          updateMenuItem("footer", index, "label", event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        value={item.href}
                        onChange={(event) =>
                          updateMenuItem("footer", index, "href", event.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => removeMenuItem("footer", index)}
                      className={configuratorButtonClass}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() => addMenuItem("footer")}
                  className={configuratorButtonClass}
                >
                  Add menu item
                </Button>
              </div>
              <SaveBar />
            </div>
          )}

          {activeSection === "footer-text" && (
            <div className="space-y-6">
              <SectionHeader title="Footer text" />
              <div className="space-y-2">
                <Label htmlFor="footer-text">Footer line</Label>
                <Input
                  id="footer-text"
                  value={settings.footerText}
                  onChange={(event) => updateFooterText(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Tip: use {"{year}"} to insert the current year automatically.
                </p>
              </div>
              <SaveBar />
            </div>
          )}

          {activeSection === "theme" && (
            <div className="space-y-6">
              <SectionHeader title="Theme mode" />
              <div className="space-y-2">
                <Label htmlFor="theme-preset">Theme behavior</Label>
                <select
                  id="theme-preset"
                  className="h-10 w-full rounded-md border border-input bg-background px-3"
                  value={settings.theme.modePreset ?? "allow-both"}
                  onChange={(event) => {
                    const preset = event.target
                      .value as NonNullable<SiteSettings["theme"]["modePreset"]>;
                    updateTheme("modePreset", preset);
                    if (preset === "allow-both") {
                      updateTheme("allowDark", true);
                      updateTheme("allowLight", true);
                      updateTheme("showToggle", true);
                    } else if (preset === "dark-only") {
                      updateTheme("allowDark", true);
                      updateTheme("allowLight", false);
                      updateTheme("showToggle", false);
                    } else {
                      updateTheme("allowDark", false);
                      updateTheme("allowLight", true);
                      updateTheme("showToggle", false);
                    }
                  }}
                >
                  <option value="light-only">Light only</option>
                  <option value="dark-only">Dark only</option>
                  <option value="allow-both">Allow both (toggle)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  The toggle is shown automatically when both modes are allowed.
                </p>
              </div>
              <SaveBar />
            </div>
          )}

          {activeSection === "colors" && (
            <div className="space-y-6">
              <SectionHeader title="Brand colors" />
              {renderGlobalPalette("light")}
              {renderGlobalPalette("dark")}
              <Separator />
              {renderSectionAssignments("light")}
              {renderSectionAssignments("dark")}
              <Button
                variant="secondary"
                onClick={() => setShowAdvancedColors((prev) => !prev)}
                className={configuratorButtonClass}
              >
                {showAdvancedColors ? "Hide advanced colors" : "Show advanced colors"}
              </Button>
              {showAdvancedColors ? (
                <>
                  {renderColorSubset(
                    "light",
                    [
                      "background",
                      "foreground",
                      "card",
                      "cardForeground",
                      "popover",
                      "popoverForeground",
                      "muted",
                      "mutedForeground",
                      "destructive",
                      "destructiveForeground",
                      "border",
                      "input",
                      "ring",
                    ],
                    "Light theme (advanced)",
                    {
                      background: "Page background color.",
                      foreground: "Default text color.",
                      card: "Card and panel background.",
                      cardForeground: "Text on cards and panels.",
                      popover: "Dropdowns, tooltips, and modal background.",
                      popoverForeground: "Text inside popovers.",
                      muted: "Subtle surfaces and muted areas.",
                      mutedForeground: "Muted text color.",
                      destructive: "Destructive actions (delete, remove).",
                      destructiveForeground: "Text on destructive actions.",
                      border: "Default border color.",
                      input: "Input field background/border color.",
                      ring: "Focus ring color.",
                    },
                  )}
                  {renderColorSubset(
                    "dark",
                    [
                      "background",
                      "foreground",
                      "card",
                      "cardForeground",
                      "popover",
                      "popoverForeground",
                      "muted",
                      "mutedForeground",
                      "destructive",
                      "destructiveForeground",
                      "border",
                      "input",
                      "ring",
                    ],
                    "Dark theme (advanced)",
                    {
                      background: "Page background color.",
                      foreground: "Default text color.",
                      card: "Card and panel background.",
                      cardForeground: "Text on cards and panels.",
                      popover: "Dropdowns, tooltips, and modal background.",
                      popoverForeground: "Text inside popovers.",
                      muted: "Subtle surfaces and muted areas.",
                      mutedForeground: "Muted text color.",
                      destructive: "Destructive actions (delete, remove).",
                      destructiveForeground: "Text on destructive actions.",
                      border: "Default border color.",
                      input: "Input field background/border color.",
                      ring: "Focus ring color.",
                    },
                  )}
                </>
              ) : null}
              <SaveBar />
            </div>
          )}
        </>
      )}
    </div>
  );
}
