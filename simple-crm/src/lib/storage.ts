import { CONTACT_STATUSES, type Contact } from '../types'

export const STORAGE_KEY = 'simple-crm.contacts'

/** Minimal check that a parsed value has the shape of a stored contact. */
function isContact(value: unknown): value is Contact {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.lastName === 'string' &&
    typeof candidate.company === 'string' &&
    CONTACT_STATUSES.includes(candidate.status as Contact['status'])
  )
}

/** Read contacts from storage; corrupted or missing data yields an empty list. */
export function loadContacts(storage: Storage = localStorage): Contact[] {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isContact) : []
  } catch {
    return []
  }
}

/** Persist the full contact list. */
export function saveContacts(contacts: Contact[], storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(contacts))
}
