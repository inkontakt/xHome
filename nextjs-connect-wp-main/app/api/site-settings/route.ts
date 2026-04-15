import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import {
  getSiteSettings,
  saveSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const settings = await saveSiteSettings(body as Partial<SiteSettings>);
    revalidatePath("/", "layout");
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to save site settings:", error);
    return NextResponse.json(
      { message: "Failed to save site settings" },
      { status: 500 },
    );
  }
}
