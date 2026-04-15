"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type ImageFile = {
  file_name: string | null;
  file_url: string | null;
  file_mime_type: string | null;
  file_position: number | null;
};

type ImageLightboxProps = {
  images: ImageFile[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
};

export default function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Reset selected index when modal opens with new initial index
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevPhoto();
      } else if (e.key === "ArrowRight") {
        handleNextPhoto();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleNextPhoto = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!isOpen || images.length === 0) return null;
  if (typeof document === "undefined") return null;

  const selectedImage = images[selectedIndex];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-background overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">
              Photo {selectedIndex + 1} of {images.length}
            </h2>
            {selectedImage.file_name && (
              <span className="text-sm text-muted-foreground">
                {selectedImage.file_name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-destructive bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
            aria-label="Close lightbox"
          >
            Close
          </button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Image display area */}
          <div className="flex-1 flex items-center justify-center bg-[#f1f5f9] rounded-lg overflow-hidden mx-6 my-4 max-h-[calc(100vh-200px)] min-h-[400px]">
            {selectedImage.file_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedImage.file_url}
                alt={selectedImage.file_name ?? `Photo ${selectedIndex + 1}`}
                className="max-w-full h-full object-contain"
              />
            ) : (
              <span className="text-muted-foreground">Image not available</span>
            )}
          </div>

          {/* Navigation controls */}
          <div className="px-6 pb-6">
            {/* Previous/Next buttons */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <button
                onClick={handlePrevPhoto}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-primary hover:text-white transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={handleNextPhoto}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-secondary bg-secondary text-white rounded-lg transition-colors hover:bg-primary hover:text-white"
                aria-label="Next photo"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, idx) => (
                <button
                  key={image.file_url ?? idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    idx === selectedIndex
                      ? "border-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  {image.file_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.file_url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">N/A</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 bg-foreground text-background text-xs font-bold w-5 h-5 flex items-center justify-center">
                    {idx + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
