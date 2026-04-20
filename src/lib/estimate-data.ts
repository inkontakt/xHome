type SupabaseConfig = {
  url: string
  serviceKey: string
}

type EstimateRecord = {
  id: number
  process_estimate_uuid: string | null
  person_id: string | null
  tenant_id: string | null
  form_submission_id: string | null
}

type EstimateTenant = {
  id: string
  name: string
  slug: string
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

type EstimateSubmissionFieldLink = {
  submission_id: string
  field_value: string | null
}

type EstimateAssetRow = {
  id: string
  file_name: string | null
  file_url: string | null
  file_mime_type: string | null
  file_position: number | null
  created_at: string | null
  estimate_sequence?: string | null
}

export type EstimateFile = {
  file_name: string | null
  file_url: string | null
  file_mime_type: string | null
  file_position: number | null
}

type EstimateDataBase = {
  estimate: EstimateRecord | null
  submission: EstimateSubmission | null
  tenant: EstimateTenant | null
  person: EstimatePerson | null
  pdfFile: EstimateFile | null
  imageFiles: EstimateFile[]
  message: string
}

export type EstimateDataResult =
  | ({ status: 'missing-query' } & EstimateDataBase)
  | ({ status: 'missing-config' } & EstimateDataBase)
  | ({ status: 'not-found' } & EstimateDataBase)
  | ({ status: 'error' } & EstimateDataBase)
  | ({ status: 'ready' } & EstimateDataBase)

const emptyResult = (
  status: EstimateDataResult['status'],
  message: string
): EstimateDataResult => ({
  status,
  estimate: null,
  submission: null,
  tenant: null,
  person: null,
  pdfFile: null,
  imageFiles: [],
  message
})

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

const INTEGER_PATTERN = /^\d+$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const getEstimateLookupFilter = (estimateId: string) => {
  if (INTEGER_PATTERN.test(estimateId)) {
    return `id=${eq(estimateId)}`
  }

  if (UUID_PATTERN.test(estimateId)) {
    return `process_estimate_uuid=${eq(estimateId)}`
  }

  return null
}

const isPdfFile = (file: Pick<EstimateAssetRow, 'file_mime_type' | 'file_name' | 'file_url'>) => {
  const mime = file.file_mime_type?.toLowerCase() || ''
  const name = file.file_name?.toLowerCase() || ''
  const url = file.file_url?.toLowerCase() || ''

  return mime.includes('pdf') || name.endsWith('.pdf') || url.includes('.pdf')
}

const isImageFile = (file: Pick<EstimateAssetRow, 'file_mime_type' | 'file_name' | 'file_url'>) => {
  const mime = file.file_mime_type?.toLowerCase() || ''
  const name = file.file_name?.toLowerCase() || ''
  const url = file.file_url?.toLowerCase() || ''

  return (
    mime.startsWith('image/') ||
    /\.(avif|gif|jpe?g|png|webp)$/i.test(name) ||
    /\.(avif|gif|jpe?g|png|webp)(?:$|[?#])/i.test(url)
  )
}

const sortAssets = (left: EstimateAssetRow, right: EstimateAssetRow) => {
  const leftPosition = left.file_position ?? Number.MAX_SAFE_INTEGER
  const rightPosition = right.file_position ?? Number.MAX_SAFE_INTEGER

  if (leftPosition !== rightPosition) {
    return leftPosition - rightPosition
  }

  const leftTime = left.created_at ? new Date(left.created_at).getTime() : Number.MAX_SAFE_INTEGER
  const rightTime = right.created_at ? new Date(right.created_at).getTime() : Number.MAX_SAFE_INTEGER

  if (leftTime !== rightTime) {
    return leftTime - rightTime
  }

  return (left.id || left.file_name || '').localeCompare(right.id || right.file_name || '')
}

const toEstimateFile = (file: EstimateAssetRow): EstimateFile => ({
  file_name: file.file_name,
  file_url: file.file_url,
  file_mime_type: file.file_mime_type,
  file_position: file.file_position
})

const dedupeAssets = (files: EstimateAssetRow[]) => {
  const seen = new Set<string>()

  return files.filter((file) => {
    const key = file.id || file.file_url || `${file.file_name}-${file.file_position ?? ''}`

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

const selectPdfFile = (files: EstimateAssetRow[]) => {
  const sortedFiles = dedupeAssets(files)
    .filter((file) => Boolean(file.file_url))
    .filter(isPdfFile)
    .sort(sortAssets)

  return sortedFiles[0] ? toEstimateFile(sortedFiles[0]) : null
}

const selectImageFiles = (files: EstimateAssetRow[]) =>
  dedupeAssets(files)
    .filter((file) => Boolean(file.file_url))
    .filter(isImageFile)
    .sort(sortAssets)
    .map(toEstimateFile)

const getTenantLookupFilter = (tenantIdentifier: string) => {
  if (UUID_PATTERN.test(tenantIdentifier)) {
    return `id=${eq(tenantIdentifier)}`
  }

  return `slug=${eq(tenantIdentifier)}`
}

const inFilter = (values: string[]) => `in.(${values.map((value) => `"${value.replace(/"/g, '\\"')}"`).join(',')})`

export const loadEstimateData = async (tenantIdentifier: string, estimateId: string): Promise<EstimateDataResult> => {
  if (!tenantIdentifier || !estimateId) {
    return emptyResult('missing-query', 'Missing tenant or estimate_id query parameters.')
  }

  const config = getSupabaseConfig()
  if (!config) {
    return emptyResult('missing-config', 'Supabase URL or service role key is not configured for this Astro app.')
  }

  try {
    const estimateLookupFilter = getEstimateLookupFilter(estimateId)

    if (!estimateLookupFilter) {
      return emptyResult('not-found', 'The supplied estimate ID format is not supported.')
    }

    const tenants = await supabaseFetch<EstimateTenant[]>(
      config,
      `tenants?select=id,name,slug&${getTenantLookupFilter(tenantIdentifier)}&limit=1`
    )

    const tenant = tenants[0] ?? null

    if (!tenant) {
      return emptyResult('not-found', 'No tenant was found for the supplied tenant value.')
    }

    const estimates = await supabaseFetch<EstimateRecord[]>(
      config,
      `process_estimate?select=id,process_estimate_uuid,person_id,tenant_id,form_submission_id&tenant_id=${eq(
        tenant.id
      )}&${estimateLookupFilter}&limit=1`
    )

    const estimate = estimates[0] ?? null

    if (!estimate) {
      return emptyResult('not-found', 'No estimate was found for the supplied tenant and estimate IDs.')
    }

    if (!estimate.form_submission_id) {
      return emptyResult('error', 'The estimate is missing its linked form submission ID.')
    }

    if (!estimate.process_estimate_uuid) {
      return emptyResult('error', 'The estimate is missing its public estimate UUID.')
    }

    const [submissions, people, childEstimateLinks, formImageFiles] =
      await Promise.all([
      supabaseFetch<EstimateSubmission[]>(
        config,
        `form_submissions?select=submission_id,tenant_id,title,summary,connected_person_id&tenant_id=${eq(
          tenant.id
        )}&submission_id=${eq(estimate.form_submission_id)}&limit=1`
      ),
      estimate.person_id
        ? supabaseFetch<EstimatePerson[]>(
            config,
            `sa_persons?select=first_name,last_name,email_primary&person_id=${eq(estimate.person_id)}&limit=1`
          )
        : Promise.resolve([]),
      supabaseFetch<EstimateSubmissionFieldLink[]>(
        config,
        `estimate_submission_fields?select=submission_id,field_value&field_key=${eq('parent_estimate_id')}&field_value=${eq(
          estimate.process_estimate_uuid
        )}`
      ),
      supabaseFetch<EstimateAssetRow[]>(
        config,
        `form_submission_files?select=id:file_id,file_name,file_url,file_mime_type,file_position,created_at&submission_id=${eq(
          estimate.form_submission_id
        )}&order=file_position.asc`
      )
    ])

    const submission = submissions[0] ?? null

    if (!submission) {
      return {
        ...emptyResult('error', 'The estimate could not be matched to a form submission.'),
        estimate,
        tenant
      }
    }

    const childEstimateSubmissionIds = [...new Set(childEstimateLinks.map((link) => link.submission_id).filter(Boolean))]
    const pdfSourceFiles =
      childEstimateSubmissionIds.length > 0
        ? await supabaseFetch<EstimateAssetRow[]>(
            config,
            `estimate_submission_files?select=id,file_name,file_url,file_mime_type,file_position,created_at,estimate_sequence&submission_id=${inFilter(
              childEstimateSubmissionIds
            )}&order=file_position.asc`
          )
        : []

    const pdfFile = selectPdfFile(pdfSourceFiles)
    const imageFiles = selectImageFiles(formImageFiles)

    return {
      status: 'ready',
      estimate,
      submission,
      tenant,
      person: people[0] ?? null,
      pdfFile,
      imageFiles,
      message: 'Estimate data loaded.'
    }
  } catch (error) {
    return emptyResult('error', error instanceof Error ? error.message : 'Unable to load estimate data.')
  }
}
