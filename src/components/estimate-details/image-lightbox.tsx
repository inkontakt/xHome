'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { ChevronLeft, ChevronRight } from 'lucide-react'

type ImageFile = {
  file_name: string | null
  file_url: string | null
  file_mime_type: string | null
  file_position: number | null
}

type ImageLightboxProps = {
  images: ImageFile[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

const ImageLightbox = ({ images, initialIndex = 0, isOpen, onClose }: ImageLightboxProps) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(initialIndex)
    }
  }, [initialIndex, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handlePrevPhoto = () => {
      setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const handleNextPhoto = () => {
      setSelectedIndex(prev => (prev + 1) % images.length)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft') {
        handlePrevPhoto()
      } else if (event.key === 'ArrowRight') {
        handleNextPhoto()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [images.length, isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  if (!isOpen || images.length === 0 || typeof document === 'undefined') {
    return null
  }

  const selectedImage = images[selectedIndex]
  const handleNextPhoto = () => {
    setSelectedIndex(prev => (prev + 1) % images.length)
  }
  const handlePrevPhoto = () => {
    setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  return createPortal(
    <div className='fixed inset-0 z-[100] overflow-hidden bg-background' role='dialog' aria-modal='true'>
      <div className='flex h-full flex-col'>
        <div className='shrink-0 border-b border-border bg-card px-6 py-4'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <h2 className='text-lg font-semibold'>
                Photo {selectedIndex + 1} of {images.length}
              </h2>
              {selectedImage.file_name ? (
                <span className='text-sm text-muted-foreground'>{selectedImage.file_name}</span>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className='rounded-md border border-destructive bg-destructive px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-destructive/90'
              aria-label='Close lightbox'
            >
              Close
            </button>
          </div>
        </div>

        <div className='flex flex-1 flex-col'>
          <div className='mx-6 my-4 flex min-h-[400px] max-h-[calc(100vh-200px)] flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#f1f5f9]'>
            {selectedImage.file_url ? (
              <img
                src={selectedImage.file_url}
                alt={selectedImage.file_name ?? `Photo ${selectedIndex + 1}`}
                className='max-w-full h-full object-contain'
              />
            ) : (
              <span className='text-muted-foreground'>Image not available</span>
            )}
          </div>

          <div className='px-6 pb-6'>
            <div className='mb-4 flex items-center justify-between gap-3'>
              <button
                onClick={handlePrevPhoto}
                className='flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-foreground'
                aria-label='Previous photo'
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={handleNextPhoto}
                className='flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/35 bg-primary/18 px-3 py-2 text-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/28 hover:text-foreground'
                aria-label='Next photo'
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

            <div className='flex gap-2 overflow-x-auto pb-2'>
              {images.map((image, index) => (
                <button
                  key={image.file_url ?? index}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    index === selectedIndex ? 'border-primary' : 'border-border hover:border-muted-foreground'
                  }`}
                  aria-label={`View photo ${index + 1}`}
                >
                  {image.file_url ? (
                    <img src={image.file_url} alt={`Thumbnail ${index + 1}`} className='h-full w-full object-cover' />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center bg-muted'>
                      <span className='text-xs text-muted-foreground'>N/A</span>
                    </div>
                  )}
                  <div className='absolute right-0 bottom-0 flex h-5 w-5 items-center justify-center bg-foreground text-xs font-bold text-background'>
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ImageLightbox
