import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/nav/mobile-nav";
import { siteConfig } from "@/site.config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ConfiguratorDrawer } from "@/components/configurator/configurator-drawer";
import type { SiteSettings } from "@/lib/site-settings";

interface NavProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  settings: SiteSettings;
}

export function Nav({ className, children, id, settings }: NavProps) {
  return (
    <nav
      className={cn(
        "sticky z-50 top-0 bg-background",
        "border-b header-menu",
        className,
      )}
      id={id}
    >
      <div
        id="nav-container"
        className="max-w-5xl mx-auto py-4 px-6 sm:px-8 flex justify-between items-center"
      >
        <Link
          className="hover:opacity-75 transition-all flex gap-4 items-center"
          href="/"
        >
          <img
            src={settings.logos.header}
            alt={settings.logos.alt}
            width={settings.logos.headerWidth}
            height={settings.logos.headerWidth}
            loading="eager"
            className="w-auto"
            style={{ height: settings.logos.headerWidth }}
          />
        </Link>
        {children}
        <div className="flex items-center gap-2">
          <div className="mx-2 hidden md:flex">
            {settings.menus.header.map((item, index) => (
              <Button
                key={`${item.href}-${index}`}
                asChild
                variant="ghost"
                size="sm"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
          <ConfiguratorDrawer />
          <MobileNav
            mainMenu={settings.menus.header}
            footerMenu={settings.menus.footer}
            siteName={siteConfig.site_name}
          />
        </div>
      </div>
    </nav>
  );
}
