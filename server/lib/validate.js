// Request-body validation helpers for the /api/* routes.
// Each validator returns { ok: true, value } on success or { ok: false, message }
// on failure, so routes can return a clean 400 without crashing on bad input.

export const ALLOWED_GRADES = ['Like New', 'Very Good', 'Good', 'Acceptable', 'Not Sellable']

// 10 MB raw image ≈ 13,981,013 base64 chars (4/3 expansion). Reject above this.
export const MAX_IMAGE_B64_LEN = 13_981_013
export const MAX_PRICE = 10_000_000
export const MAX_NAME_LEN = 200
export const MAX_CATEGORY_LEN = 100

export function validateImageBase64(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return { ok: false, message: 'imageBase64 is required and must be a non-empty string.' }
  }
  if (value.length > MAX_IMAGE_B64_LEN) {
    return { ok: false, message: 'Image is too large (max 10 MB). Please compress the photo.' }
  }
  return { ok: true, value }
}

export function validateMediaType(value) {
  if (!value || typeof value !== 'string' || !value.startsWith('image/')) {
    return { ok: false, message: 'mediaType must be an image MIME type (e.g. image/jpeg).' }
  }
  return { ok: true, value }
}

export function validateGrade(value, { required = true } = {}) {
  if (value == null || value === '') {
    return required
      ? { ok: false, message: `grade is required and must be one of: ${ALLOWED_GRADES.join(', ')}.` }
      : { ok: true, value: undefined }
  }
  if (!ALLOWED_GRADES.includes(value)) {
    return { ok: false, message: `grade must be one of: ${ALLOWED_GRADES.join(', ')}.` }
  }
  return { ok: true, value }
}

// Accepts a positive finite number within [0, MAX_PRICE]. Coerces numeric strings.
export function validatePrice(value, { required = false } = {}) {
  if (value == null || value === '') {
    return required
      ? { ok: false, message: 'price is required.' }
      : { ok: true, value: 0 }
  }
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false, message: 'price must be a non-negative number.' }
  }
  if (n > MAX_PRICE) {
    return { ok: false, message: `price must not exceed ${MAX_PRICE}.` }
  }
  return { ok: true, value: n }
}

export function validateCategory(value, { required = false } = {}) {
  if (value == null || value === '') {
    return required
      ? { ok: false, message: 'category is required.' }
      : { ok: true, value: undefined }
  }
  if (typeof value !== 'string') {
    return { ok: false, message: 'category must be a string.' }
  }
  if (value.length > MAX_CATEGORY_LEN) {
    return { ok: false, message: `category must be ${MAX_CATEGORY_LEN} characters or fewer.` }
  }
  return { ok: true, value }
}

export function validateName(value, { required = false, max = MAX_NAME_LEN } = {}) {
  if (value == null || value === '') {
    return required
      ? { ok: false, message: 'name is required.' }
      : { ok: true, value: undefined }
  }
  if (typeof value !== 'string') {
    return { ok: false, message: 'name must be a string.' }
  }
  if (value.length > max) {
    return { ok: false, message: `name must be ${max} characters or fewer.` }
  }
  return { ok: true, value }
}
