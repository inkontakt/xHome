import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get("url");
  const isDownload = searchParams.get("download") === "1";
  const requestedFilename = searchParams.get("filename");

  if (!fileUrl) {
    return NextResponse.json({ error: "Missing url parameter." }, { status: 400 });
  }

  if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid url parameter." }, { status: 400 });
  }

  const response = await fetch(fileUrl, {
    cache: "force-cache",
    next: { revalidate: 600 },
  });
  const durationMs = Date.now() - startedAt;

  if (!response.ok || !response.body) {
    if (durationMs >= 3000) {
      console.warn("[pdf] slow-fetch", {
        ms: durationMs,
        status: response.status,
        url: fileUrl,
      });
    }
    return NextResponse.json(
      { error: "Unable to fetch PDF." },
      { status: response.status || 502 },
    );
  }

  const headers = new Headers(response.headers);
  if (isDownload) {
    const fallbackName = "document.pdf";
    const safeName =
      requestedFilename && requestedFilename.trim().length > 0
        ? requestedFilename.trim()
        : fallbackName;
    const fileNameWithExt = safeName.toLowerCase().endsWith(".pdf")
      ? safeName
      : `${safeName}.pdf`;
    headers.set(
      "content-disposition",
      `attachment; filename="${fileNameWithExt}"`,
    );
  } else {
    headers.set("content-disposition", "inline");
  }
  headers.set(
    "cache-control",
    "public, max-age=600, s-maxage=600, stale-while-revalidate=86400",
  );
  if (!headers.get("content-type")) {
    headers.set("content-type", "application/pdf");
  }

  if (durationMs >= 3000) {
    console.warn("[pdf] slow-fetch", {
      ms: durationMs,
      status: response.status,
      url: fileUrl,
      size: headers.get("content-length"),
    });
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
