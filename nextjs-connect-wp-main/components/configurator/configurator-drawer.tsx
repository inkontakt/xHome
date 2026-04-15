"use client";

import * as React from "react";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfiguratorForm } from "@/components/configurator/configurator-form";

export function ConfiguratorDrawer() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open configurator">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Configurator</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 px-6 py-6">
            <ConfiguratorForm onSaved={() => setOpen(false)} />
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
