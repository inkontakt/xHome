type SupabaseConfig = {
  url: string
  serviceKey: string
}

export type EstimateSubmission = {
  submission_id: string
  tenant_id: string
  title: string | null
  summary: string | null
  connected_person_id: string | null
}

export type EstimatePerson = {
  first_name: string | null
  last_name: string | null
  email_primary: string | null
}

export type EstimateFile = {
  file_name: string | null
  file_url: string | null
  file_mime_type: string | null
  file_position: number | null
}

type PhotoAnnotation = {
  id: string
  photo_url: string | null
  is_top_picture: boolean
  created_at: string
}

export type EstimateDataResult =
  | {
      status: 'missing-query'
      submission: null
      person: null
      pdfFile: null
      imageFiles: EstimateFile[]
      message: string
    }
  | {
      status: 'missing-config'
      submission: null
      person: null
      pdfFile: null
      imageFiles: EstimateFile[]
      message: string
    }
  | {
      status: 'not-found'
      submission: null
      person: null
      pdfFile: null
      imageFiles: EstimateFile[]
      message: string
    }
  | {
      status: 'error'
      submission: null
      person: null
      pdfFile: null
      imageFiles: EstimateFile[]
      message: string
    }
  | {
      status: 'ready'
      submission: EstimateSubmission
      person: EstimatePerson | null
      pdfFile: EstimateFile | null
      imageFiles: EstimateFile[]
      message: string
    }

const requiredHeaders = (config: SupabaseConfig) => ({
  apikey: config.serviceKey,
  Authorization: `Bearer ${config.serviceKey}`,
  Accept: 'application/json'
})

const getSupabaseConfig = (): SupabaseConfig | null => {
  const env = import.meta.env
  const url =
    env.NEXT_PUBLIC_SUPABASE_URL ||
    env.PUBLIC_SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    ''
  const serviceKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    ''

  if (!url || !serviceKey) {
    return null
  }

  return {
    url: url.replace(/\/$/, ''),
    serviceKey
  }
}

const supabaseFetch = async <T>(config: SupabaseConfig, path: string): Promise<T> => {
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    headers: requiredHeaders(config)
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Supabase ${response.status}: ${body || response.statusText}`)
  }

  return (await response.json()) as T
}

const eq = (value: string) => `eq.${encodeURIComponent(value)}`

const extractFilenameFromUrl = (url: string | null): string | null => {
  if (!url) return null

  try {
    const cleanUrl = url.split('#')[0]
    const segments = cleanUrl.split('/')
    return segments[segments.length - 1] || null
  } catch {
    return null
  }
}

export const isPdfFile = (file: EstimateFile) => {
  const mime = file.file_mime_type?.toLowerCase() || ''
  const name = file.file_name?.toLowerCase() || ''

  return mime.includes('pdf') || name.endsWith('.pdf')
}

export const loadEstimateData = async (tenantId: string, estimateId: string): Promise<EstimateDataResult> => {
  if (!tenantId || !estimateId) {
    return {
      status: 'missing-query',
      submission: null,
      person: null,
      pdfFile: null,
      imageFiles: [],
      message: 'Missing tenant_id or estimate_id query parameters.'
    }
  }

  const config = getSupabaseConfig()
  if (!config) {
    return {
      status: 'missing-config',
      submission: null,
      person: null,
      pdfFile: null,
      imageFiles: [],
      message: 'Supabase URL or service role key is not configured for this Astro app.'
    }
  }

  try {
    const submissions = await supabaseFetch<EstimateSubmission[]>(
      config,
      `form_submissions?select=submission_id,tenant_id,title,summary,connected_person_id&tenant_id=${eq(
        tenantId
      )}&submission_id=${eq(estimateId)}&limit=1`
    )

    const submission = submissions[0] ?? null

    if (!submission) {
      return {
        status: 'not-found',
        submission: null,
        person: null,
        pdfFile: null,
        imageFiles: [],
        message: 'No estimate submission was found for the supplied tenant and estimate IDs.'
      }
    }

    const [submissionFiles, photoAnnotations, people] = await Promise.all([
      supabaseFetch<EstimateFile[]>(
        config,
        `form_submission_files?select=file_name,file_url,file_mime_type,file_position&submission_id=${eq(
          estimateId
        )}&order=file_position.asc`
      ),
      supabaseFetch<PhotoAnnotation[]>(
        config,
        `inquiry_photo_annotations?select=id,photo_url,is_top_picture,created_at&submission_id=${eq(
          estimateId
        )}&tenant_id=${eq(tenantId)}&is_top_picture=eq.true&order=created_at.asc`
      ),
      submission.connected_person_id
        ? supabaseFetch<EstimatePerson[]>(
            config,
            `sa_persons?select=first_name,last_name,email_primary&person_id=${eq(
              submission.connected_person_id
            )}&limit=1`
          )
        : Promise.resolve([])
    ])

    const annotationImages = photoAnnotations
      .map((annotation) => ({
        file_name: extractFilenameFromUrl(annotation.photo_url),
        file_url: annotation.photo_url,
        file_mime_type: 'image',
        file_position: null
      }))
      .filter((file) => Boolean(file.file_url))

    const directImageFiles = submissionFiles.filter((file) => {
      const mime = file.file_mime_type?.toLowerCase() || ''
      const name = file.file_name?.toLowerCase() || ''

      return mime.startsWith('image/') || /\.(avif|gif|jpe?g|png|webp)$/i.test(name)
    })

    return {
      status: 'ready',
      submission,
      person: people[0] ?? null,
      pdfFile: submissionFiles.find(isPdfFile) ?? null,
      imageFiles: annotationImages.length > 0 ? annotationImages : directImageFiles,
      message: 'Estimate data loaded.'
    }
  } catch (error) {
    return {
      status: 'error',
      submission: null,
      person: null,
      pdfFile: null,
      imageFiles: [],
      message: error instanceof Error ? error.message : 'Unable to load estimate data.'
    }
  }
}
