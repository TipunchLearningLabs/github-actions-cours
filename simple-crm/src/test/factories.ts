import type { Contact } from '../types'

/** Build a contact with sensible defaults for tests. */
export function makeContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: crypto.randomUUID(),
    firstName: 'Marie',
    lastName: 'Dupont',
    company: 'Boulangerie Dupont',
    email: 'marie@dupont.fr',
    phone: '06 12 34 56 78',
    status: 'lead',
    followUpDate: '',
    notes: '',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-01T10:00:00.000Z',
    ...overrides,
  }
}
