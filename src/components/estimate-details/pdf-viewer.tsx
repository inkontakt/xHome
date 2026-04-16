'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { ScrollMode, SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'

type PdfViewerProps = {
  url: string
}

const workerUrl = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

const PdfViewer = ({ url }: PdfViewerProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [fileUrl, setFileUrl] = useState(url)
  const [viewerKey, setViewerKey] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [viewerReady, setViewerReady] = useState(false)
  const proxyUrl = useMemo(() => `/api/pdf?url=${encodeURIComponent(url)}`, [url])

  useEffect(() => {
    if (!containerRef.current) return

    const updateWidth = () => {
      setContainerWidth(containerRef.current?.clientWidth ?? 0)
    }

    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let isActive = true

    setLoadError(null)
    setPreviewUrl(null)
    setViewerReady(false)

    const checkDirect = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' })

        if (!isActive) return

        setFileUrl(response.ok ? url : proxyUrl)
        setViewerKey(current => current + 1)
      } catch {
        if (!isActive) return

        setFileUrl(proxyUrl)
        setViewerKey(current => current + 1)
      }
    }

    void checkDirect()

    return () => {
      isActive = false
    }
  }, [proxyUrl, url])

  useEffect(() => {
    let isActive = true

    if (!fileUrl || containerWidth <= 0) return

    const buildPreview = async () => {
      try {
        const pdfjs = await import('pdfjs-dist/build/pdf')
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

        const loadingTask = pdfjs.getDocument({ url: fileUrl })
        const doc = await loadingTask.promise
        const page = await doc.getPage(1)
        const viewport = page.getViewport({ scale: 1 })
        const scale = containerWidth / viewport.width
        const scaledViewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (!context) return

        canvas.width = Math.ceil(scaledViewport.width)
        canvas.height = Math.ceil(scaledViewport.height)

        await page.render({ canvasContext: context, viewport: scaledViewport }).promise

        if (!isActive) return

        setPreviewUrl(canvas.toDataURL('image/png'))
        page.cleanup()
        doc.cleanup()
      } catch {
        if (isActive) {
          setPreviewUrl(null)
        }
      }
    }

    void buildPreview()

    return () => {
      isActive = false
    }
  }, [containerWidth, fileUrl])

  return (
    <div className='space-y-4'>
      <div ref={containerRef} className='relative min-h-[600px] w-full rounded-md border bg-background'>
        {previewUrl && !viewerReady ? (
          <img src={previewUrl} alt='PDF preview' className='absolute inset-0 h-full w-full object-contain' />
        ) : null}
        <Worker workerUrl={workerUrl}>
          <Viewer
            key={viewerKey}
            fileUrl={fileUrl}
            defaultScale={SpecialZoomLevel.PageWidth}
            scrollMode={ScrollMode.Vertical}
            renderError={() => (
              <div className='p-4 text-sm text-destructive'>{loadError ?? 'Unable to load the PDF file.'}</div>
            )}
            renderLoader={() => <div className='p-4 text-sm text-muted-foreground'>Loading PDF...</div>}
            onDocumentLoad={() => {
              setLoadError(null)
              setViewerReady(true)
            }}
          />
        </Worker>
      </div>
    </div>
  )
}

export default PdfViewer
