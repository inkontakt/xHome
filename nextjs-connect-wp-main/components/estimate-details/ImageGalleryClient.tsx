"use client";

import { useState } from "react";
import ImageLightbox from "./ImageLightbox";

type SubmissionFile = {
  file_name: string | null;
  file_url: string | null;
  file_mime_type: string | null;
  file_position: number | null;
};

type ImageGalleryClientProps = {
  imageFiles: SubmissionFile[];
  showDynamic: boolean;
};

export default function ImageGalleryClient({ imageFiles, showDynamic }: ImageGalleryClientProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setLightboxStartIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <section className="rounded-lg border bg-background p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Image Gallery</h2>
          <span className="text-xs text-muted-foreground">Supabase</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {showDynamic && imageFiles.length > 0 ? (
            imageFiles.map((image, index) => (
              <button
                key={image.file_url ?? image.file_name ?? index}
                onClick={() => handleImageClick(index)}
                className="relative aspect-square overflow-hidden bg-muted hover:bg-primary border-0 p-0 cursor-pointer group rounded-md transition-colors"
                aria-label={`View photo ${index + 1} in detail`}
              >
                {image.file_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.file_url}
                    alt={image.file_name ?? "Estimate image"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-sm text-muted-foreground">Image URL missing</span>
                  </div>
                )}
                {/* Photo number badge */}
                <div className="absolute bottom-0 right-0 bg-white/90 backdrop-blur-sm px-3 py-2">
                  <span className="text-sm font-semibold text-foreground">
                    Photo #{index + 1}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full flex h-48 items-center justify-center rounded-md border border-dashed bg-muted/40 text-sm text-muted-foreground">
              Image thumbnails will appear here once linked to Supabase.
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {showDynamic
            ? "Click on any image to view it in full screen with navigation controls."
            : "Image thumbnails will appear here once linked to Supabase."
          }
        </p>
      </section>

      <ImageLightbox
        images={imageFiles}
        initialIndex={lightboxStartIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}