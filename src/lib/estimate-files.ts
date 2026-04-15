export type EstimateFile = {
  fileName: string | null
  fileUrl: string | null
  fileMimeType: string | null
  filePosition: number | null
}

const PDF_EXTENSION_PATTERN = /\.pdf(?:$|[?#])/
const IMAGE_MIME_PATTERN = /^image\//
const IMAGE_EXTENSION_PATTERN = /\.(?:avif|gif|jpe?g|png|webp)(?:$|[?#])/

const normalize = (value: string | null | undefined) => value?.trim() || ''

export const extractFilenameFromUrl = (url: string | null | undefined) => {
  const value = normalize(url)

  if (!value) return null

  try {
    const parsed = new URL(value)
    const segment = parsed.pathname.split('/').filter(Boolean).at(-1)

    return segment ? decodeURIComponent(segment) : null
  } catch {
    const urlWithoutHash = value.split('#')[0]
    const urlWithoutQuery = urlWithoutHash.split('?')[0]
    const segment = urlWithoutQuery.split('/').filter(Boolean).at(-1)

    return segment ? decodeURIComponent(segment) : null
  }
}

export const isPdfFile = (file: Pick<EstimateFile, 'fileName' | 'fileUrl' | 'fileMimeType'>) => {
  const mime = normalize(file.fileMimeType).toLowerCase()
  const name = normalize(file.fileName).toLowerCase()
  const url = normalize(file.fileUrl).toLowerCase()

  return mime.includes('pdf') || PDF_EXTENSION_PATTERN.test(name) || PDF_EXTENSION_PATTERN.test(url)
}

export const isImageFile = (file: Pick<EstimateFile, 'fileName' | 'fileUrl' | 'fileMimeType'>) => {
  const mime = normalize(file.fileMimeType).toLowerCase()
  const name = normalize(file.fileName).toLowerCase()
  const url = normalize(file.fileUrl).toLowerCase()

  return IMAGE_MIME_PATTERN.test(mime) || IMAGE_EXTENSION_PATTERN.test(name) || IMAGE_EXTENSION_PATTERN.test(url)
}

export const safeDownloadFileName = (name: string | null | undefined, fallback = 'estimate-document.pdf') => {
  const value = normalize(name)
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()

  if (!value) return fallback

  return value.toLowerCase().endsWith('.pdf') ? value : `${value}.pdf`
}
