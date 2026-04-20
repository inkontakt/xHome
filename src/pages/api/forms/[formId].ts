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
    if (error instanceof Error) {
      const match = error.message.match(/^WordPress request failed \((\d+)\):\s*(.+)$/s)

      if (match) {
        const status = Number(match[1])
        const rawPayload = match[2]

        try {
          const parsedPayload = JSON.parse(rawPayload) as Record<string, unknown>

          return jsonResponse(
            {
              error:
                typeof parsedPayload.message === 'string'
                  ? parsedPayload.message
                  : parsedPayload.errors && typeof parsedPayload.errors === 'object'
                    ? 'Please correct the highlighted fields.'
                  : error.message,
              ...(parsedPayload.errors && typeof parsedPayload.errors === 'object'
                ? { errors: parsedPayload.errors }
                : {})
            },
            { status: Number.isNaN(status) ? 400 : status }
          )
        } catch {
          return jsonResponse(
            {
              error: error.message
            },
            { status: Number.isNaN(status) ? 400 : status }
          )
        }
      }
    }

    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unable to submit form'
      },
      { status: 500 }
    )
  }
}
