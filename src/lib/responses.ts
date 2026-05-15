import { type ApiResponse, type PaginatedResponse } from '@/types/database'
import { type ValidationError } from '@/lib/validation'

export function ok<T>(data: T, status = 200): Response {
  const body: ApiResponse<T> = { data, error: null }
  return Response.json(body, { status })
}

export function created<T>(data: T): Response {
  return ok(data, 201)
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): Response {
  const body: PaginatedResponse<T> = { data, error: null, total, page, limit }
  return Response.json(body, { status: 200 })
}

export function badRequest(message: string, errors?: ValidationError[]): Response {
  const body = { data: null, error: message, errors: errors ?? [] }
  return Response.json(body, { status: 400 })
}

export function unauthorized(): Response {
  const body: ApiResponse<null> = { data: null, error: 'Unauthorized' }
  return Response.json(body, { status: 401 })
}

export function forbidden(): Response {
  const body: ApiResponse<null> = { data: null, error: 'Forbidden' }
  return Response.json(body, { status: 403 })
}

export function notFound(resource = 'Resource'): Response {
  const body: ApiResponse<null> = { data: null, error: `${resource} not found` }
  return Response.json(body, { status: 404 })
}

export function internalError(message = 'Internal server error'): Response {
  const body: ApiResponse<null> = { data: null, error: message }
  return Response.json(body, { status: 500 })
}
