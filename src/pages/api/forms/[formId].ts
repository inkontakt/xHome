import type { APIRoute } from 'astro'

import {
  getFluentFormSchema,
  getNumericFormId,
  jsonResponse,
  submitFluentForm
} from '@/lib/wordpress'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  try {
    const formId = getNumericFormId(params)
    const schema = await getFluentFormSchema(formId)

    return jsonResponse(schema)
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unable to fetch form schema'
      },
      { status: 500 }
    )
  }
}

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const formId = getNumericFormId(params)
    const payload = (await request.json()) as { data?: Record<string, unknown> }

    if (!payload?.data || typeof payload.data !== 'object') {
      return jsonResponse({ error: 'Missing form submission data' }, { status: 400 })
    }

    const result = await submitFluentForm(formId, payload.data)

    return jsonResponse({ ok: true, result })
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unable to submit form'
      },
      { status: 500 }
    )
  }
}
