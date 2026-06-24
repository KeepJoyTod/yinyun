export type BackendId = string

type BackendIdInput = string | number | bigint | null | undefined

export const normalizeBackendId = (value: BackendIdInput): BackendId => {
  if (value === null || value === undefined || value === '') {
    throw new Error('Missing backend id')
  }
  return String(value)
}

export const optionalBackendId = (value: BackendIdInput): BackendId | undefined => {
  if (value === null || value === undefined || value === '') return undefined
  return normalizeBackendId(value)
}
