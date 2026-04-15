import { Section, Container } from "@/components/craft";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/site.config";
import Link from "next/link";
import type { SiteSettings } from "@/lib/site-settings";

type FooterProps = {
  settings: SiteSettings;
  showThemeToggle: boolean;
};

export function Footer({ settings, showThemeToggle }: FooterProps) {
  const year = new Date().getFullYear().toString();
  const footerText = settings.footerText.replaceAll("{year}", year);

  return (
    <footer>
      <Section>
        <Container className="grid md:grid-cols-[1.5fr_1fr] gap-12">
          <div className="flex flex-col gap-6 not-prose">
            <Link href="/">
              <h3 className="sr-only">{siteConfig.site_name}</h3>
              <img
                src={settings.logos.footer}
                alt={settings.logos.alt}
                width={settings.logos.footerWidth}
                height={settings.logos.footerWidth}
                className="w-auto"
                style={{ height: settings.logos.footerWidth }}
              />
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-sm footer-menu">
            <h5 className="font-medium text-base">Rechtliches</h5>
            {settings.menus.footer.map((item, index) => (
              <Link
                className="hover:underline underline-offset-4"
                key={`${item.href}-${index}`}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </Container>
        <Container className="border-t not-prose flex flex-col md:flex-row md:gap-2 gap-6 justify-between md:items-center">
          {showThemeToggle ? <ThemeToggle /> : null}
          <p className="text-muted-foreground">{footerText}</p>
        </Container>
      </Section>
    </footer>
  );
}
