import {
  CONTACT_STATUSES,
  type Contact,
  type ContactErrors,
  type ContactFilters,
  type ContactInput,
  type ContactStats,
  type ContactStatus,
} from '../types'

export const STATUS_LABELS: Record<ContactStatus, string> = {
  lead: 'Lead',
  prospect: 'Prospect',
  client: 'Client',
  inactive: 'Inactive',
}

export const EMPTY_CONTACT: ContactInput = {
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  phone: '',
  status: 'lead',
  followUpDate: '',
  notes: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[\d\s.-]{6,20}$/

/** Return the local date of `date` formatted as `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Validate a contact form; returns an empty object when the input is valid. */
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {}

  if (!input.lastName.trim() && !input.company.trim()) {
    errors.lastName = 'A last name or a company is required.'
  }
  if (input.email.trim() && !EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = 'Invalid email address.'
  }
  if (input.phone.trim() && !PHONE_PATTERN.test(input.phone.trim())) {
    errors.phone = 'Invalid phone number.'
  }
  if (!CONTACT_STATUSES.includes(input.status)) {
    errors.status = 'Unknown status.'
  }

  return errors
}

/** Trim every text field of a contact input. */
function normalize(input: ContactInput): ContactInput {
  return {
    ...input,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    company: input.company.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    notes: input.notes.trim(),
  }
}

/** Build a new contact with a fresh id and timestamps. */
export function createContact(input: ContactInput, now: Date = new Date()): Contact {
  const timestamp = now.toISOString()
  return {
    ...normalize(input),
    id: crypto.randomUUID(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

/** Apply form changes to an existing contact, keeping its id and creation date. */
export function updateContact(
  contact: Contact,
  input: ContactInput,
  now: Date = new Date(),
): Contact {
  return {
    ...contact,
    ...normalize(input),
    updatedAt: now.toISOString(),
  }
}

/** Display name: "First Last", falling back to the company name. */
export function displayName(contact: Pick<Contact, 'firstName' | 'lastName' | 'company'>): string {
  const fullName = `${contact.firstName} ${contact.lastName}`.trim()
  return fullName || contact.company
}

/** Filter contacts by status and by a free-text query (name, company, email, phone). */
export function filterContacts(contacts: Contact[], filters: ContactFilters): Contact[] {
  const query = filters.query.trim().toLowerCase()

  return contacts.filter((contact) => {
    if (filters.status !== 'all' && contact.status !== filters.status) {
      return false
    }
    if (!query) {
      return true
    }
    const haystack = [
      contact.firstName,
      contact.lastName,
      contact.company,
      contact.email,
      contact.phone,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })
}

/** A follow-up is due when its date is today or past, unless the contact is inactive. */
export function isFollowUpDue(contact: Contact, today: string): boolean {
  return contact.status !== 'inactive' && contact.followUpDate !== '' && contact.followUpDate <= today
}

/** Sort contacts: due follow-ups first (oldest first), then most recently updated. */
export function sortContacts(contacts: Contact[], today: string): Contact[] {
  return [...contacts].sort((a, b) => {
    const aDue = isFollowUpDue(a, today)
    const bDue = isFollowUpDue(b, today)
    if (aDue !== bDue) {
      return aDue ? -1 : 1
    }
    if (aDue && bDue) {
      return a.followUpDate.localeCompare(b.followUpDate)
    }
    return b.updatedAt.localeCompare(a.updatedAt)
  })
}

/** Count contacts per status and follow-ups that are due. */
export function computeStats(contacts: Contact[], today: string): ContactStats {
  const byStatus = Object.fromEntries(CONTACT_STATUSES.map((status) => [status, 0])) as Record<
    ContactStatus,
    number
  >
  for (const contact of contacts) {
    byStatus[contact.status] += 1
  }

  return {
    total: contacts.length,
    byStatus,
    followUpsDue: contacts.filter((contact) => isFollowUpDue(contact, today)).length,
  }
}

const CSV_COLUMNS: (keyof Contact)[] = [
  'firstName',
  'lastName',
  'company',
  'email',
  'phone',
  'status',
  'followUpDate',
  'notes',
  'createdAt',
  'updatedAt',
]

/** Quote a CSV cell when it contains a separator, quote or line break. */
function escapeCsvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

/** Serialize contacts to CSV (comma-separated, header row included). */
export function toCsv(contacts: Contact[]): string {
  const rows = contacts.map((contact) =>
    CSV_COLUMNS.map((column) => escapeCsvCell(contact[column])).join(','),
  )
  return [CSV_COLUMNS.join(','), ...rows].join('\n')
}
