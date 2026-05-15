import {
  type CreateItemBody,
  type UpdateItemBody,
  type UpdateUserItemBody,
  type ItemCondition,
  type BoxedStatus,
} from '@/types/database'

const VALID_CONDITIONS: ItemCondition[] = [
  'mint',
  'near-mint',
  'good',
  'fair',
  'poor',
]

const VALID_BOXED_STATUS: BoxedStatus[] = ['boxed', 'unboxed', 'unknown']
const VALID_RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary']
const VALID_STATUS = ['confirmed', 'rumoured', 'duplicate', 'reissue']

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult<T> {
  valid: boolean
  data?: T
  errors: ValidationError[]
}

function isValidCondition(value: unknown): value is ItemCondition {
  return typeof value === 'string' && VALID_CONDITIONS.includes(value as ItemCondition)
}

function isValidBoxedStatus(value: unknown): value is BoxedStatus {
  return typeof value === 'string' && VALID_BOXED_STATUS.includes(value as BoxedStatus)
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0
}

function isValidYear(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 1900 &&
    value <= new Date().getFullYear() + 1
  )
}

function isValidUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateCreateItem(body: unknown): ValidationResult<CreateItemBody> {
  const errors: ValidationError[] = []

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be an object' }] }
  }

  const b = body as Record<string, unknown>

  if (!b.name || typeof b.name !== 'string' || b.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'name is required and must be a non-empty string' })
  } else if (b.name.trim().length > 200) {
    errors.push({ field: 'name', message: 'name must be 200 characters or fewer' })
  }

  if (!b.manufacturer || typeof b.manufacturer !== 'string' || b.manufacturer.trim().length === 0) {
    errors.push({ field: 'manufacturer', message: 'manufacturer is required and must be a non-empty string' })
  }

  if (!b.reference_number || typeof b.reference_number !== 'string' || b.reference_number.trim().length === 0) {
    errors.push({ field: 'reference_number', message: 'reference_number is required and must be a non-empty string' })
  }

  if (!b.scale || typeof b.scale !== 'string' || b.scale.trim().length === 0) {
    errors.push({ field: 'scale', message: 'scale is required and must be a non-empty string' })
  }

  if (!b.rarity || !VALID_RARITY.includes(String(b.rarity))) {
    errors.push({ field: 'rarity', message: `rarity must be one of: ${VALID_RARITY.join(', ')}` })
  }

  if (!b.status || !VALID_STATUS.includes(String(b.status))) {
    errors.push({ field: 'status', message: `status must be one of: ${VALID_STATUS.join(', ')}` })
  }

  if (b.livery !== undefined && b.livery !== null && typeof b.livery !== 'string') {
    errors.push({ field: 'livery', message: 'livery must be a string' })
  }

  if (b.description !== undefined && typeof b.description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' })
  }

  if (b.notes !== undefined && typeof b.notes !== 'string') {
    errors.push({ field: 'notes', message: 'notes must be a string' })
  }

  if (b.image_url !== undefined && !isValidUrl(b.image_url)) {
    errors.push({ field: 'image_url', message: 'image_url must be a valid http or https URL' })
  }

  if (b.release_year !== undefined && !isValidYear(b.release_year)) {
    errors.push({ field: 'release_year', message: 'release_year must be a valid 4-digit year' })
  }

  if (errors.length > 0) return { valid: false, errors }

  return {
    valid: true,
    errors: [],
    data: {
      name: (b.name as string).trim(),
      manufacturer: (b.manufacturer as string).trim(),
      reference_number: (b.reference_number as string).trim(),
      scale: (b.scale as string).trim(),
      livery: b.livery ? (b.livery as string).trim() : undefined,
      rarity: b.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
      status: b.status as 'confirmed' | 'rumoured' | 'duplicate' | 'reissue',
      description: b.description as string | undefined,
      notes: b.notes as string | undefined,
      image_url: b.image_url as string | undefined,
      release_year: b.release_year as number | undefined,
    },
  }
}

export function validateUpdateItem(body: unknown): ValidationResult<UpdateItemBody> {
  const errors: ValidationError[] = []

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be an object' }] }
  }

  const b = body as Record<string, unknown>

  if (b.name !== undefined) {
    if (typeof b.name !== 'string' || b.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'name must be a non-empty string' })
    } else if (b.name.trim().length > 200) {
      errors.push({ field: 'name', message: 'name must be 200 characters or fewer' })
    }
  }

  if (b.manufacturer !== undefined && (typeof b.manufacturer !== 'string' || b.manufacturer.trim().length === 0)) {
    errors.push({ field: 'manufacturer', message: 'manufacturer must be a non-empty string' })
  }

  if (b.reference_number !== undefined && (typeof b.reference_number !== 'string' || b.reference_number.trim().length === 0)) {
    errors.push({ field: 'reference_number', message: 'reference_number must be a non-empty string' })
  }

  if (b.scale !== undefined && (typeof b.scale !== 'string' || b.scale.trim().length === 0)) {
    errors.push({ field: 'scale', message: 'scale must be a non-empty string' })
  }

  if (b.livery !== undefined && b.livery !== null && typeof b.livery !== 'string') {
    errors.push({ field: 'livery', message: 'livery must be a string' })
  }

  if (b.rarity !== undefined && !VALID_RARITY.includes(String(b.rarity))) {
    errors.push({ field: 'rarity', message: `rarity must be one of: ${VALID_RARITY.join(', ')}` })
  }

  if (b.status !== undefined && !VALID_STATUS.includes(String(b.status))) {
    errors.push({ field: 'status', message: `status must be one of: ${VALID_STATUS.join(', ')}` })
  }

  if (b.description !== undefined && typeof b.description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' })
  }

  if (b.notes !== undefined && typeof b.notes !== 'string') {
    errors.push({ field: 'notes', message: 'notes must be a string' })
  }

  if (b.image_url !== undefined && !isValidUrl(b.image_url)) {
    errors.push({ field: 'image_url', message: 'image_url must be a valid http or https URL' })
  }

  if (b.release_year !== undefined && !isValidYear(b.release_year)) {
    errors.push({ field: 'release_year', message: 'release_year must be a valid 4-digit year' })
  }

  if (errors.length > 0) return { valid: false, errors }

  const data: UpdateItemBody = {}
  if (b.name !== undefined) data.name = (b.name as string).trim()
  if (b.manufacturer !== undefined) data.manufacturer = (b.manufacturer as string).trim()
  if (b.reference_number !== undefined) data.reference_number = (b.reference_number as string).trim()
  if (b.scale !== undefined) data.scale = (b.scale as string).trim()
  if (b.livery !== undefined) data.livery = b.livery as string | null
  if (b.rarity !== undefined) data.rarity = b.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  if (b.status !== undefined) data.status = b.status as 'confirmed' | 'rumoured' | 'duplicate' | 'reissue'
  if (b.description !== undefined) data.description = b.description as string | undefined
  if (b.notes !== undefined) data.notes = b.notes as string | undefined
  if (b.image_url !== undefined) data.image_url = b.image_url as string | undefined
  if (b.release_year !== undefined) data.release_year = b.release_year as number | undefined

  return { valid: true, errors: [], data }
}

export function validateUpdateUserItem(body: unknown): ValidationResult<UpdateUserItemBody> {
  const errors: ValidationError[] = []

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [{ field: 'body', message: 'Request body must be an object' }] }
  }

  const b = body as Record<string, unknown>

  if (b.condition !== undefined && b.condition !== null && !isValidCondition(b.condition)) {
    errors.push({
      field: 'condition',
      message: `condition must be one of: ${VALID_CONDITIONS.join(', ')}`,
    })
  }

  if (b.boxed_status !== undefined && b.boxed_status !== null && !isValidBoxedStatus(b.boxed_status)) {
    errors.push({
      field: 'boxed_status',
      message: `boxed_status must be one of: ${VALID_BOXED_STATUS.join(', ')}`,
    })
  }

  if (b.purchase_price !== undefined && b.purchase_price !== null && !isNonNegativeNumber(b.purchase_price)) {
    errors.push({ field: 'purchase_price', message: 'purchase_price must be a non-negative number' })
  }

  if (errors.length > 0) return { valid: false, errors }

  const data: UpdateUserItemBody = {}
  if (b.condition !== undefined) data.condition = b.condition as ItemCondition | null
  if (b.boxed_status !== undefined) data.boxed_status = b.boxed_status as BoxedStatus | null
  if (b.purchase_price !== undefined) data.purchase_price = b.purchase_price as number | null

  return { valid: true, errors: [], data }
}
