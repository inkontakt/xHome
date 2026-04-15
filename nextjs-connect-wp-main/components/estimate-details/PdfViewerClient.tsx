"use client";

import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="text-sm text-muted-foreground">Loading PDF…</div>
  ),
});

export default PdfViewer;
