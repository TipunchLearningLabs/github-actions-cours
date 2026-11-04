export const CONTACT_STATUSES = ['lead', 'prospect', 'client', 'inactive'] as const

export type ContactStatus = (typeof CONTACT_STATUSES)[number]

export interface Contact {
  id: string
  firstName: string
  lastName: string
  company: string
  email: string
  phone: string
  status: ContactStatus
  /** Next follow-up date as `YYYY-MM-DD`, or an empty string when none is planned. */
  followUpDate: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type ContactInput = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>

export type ContactErrors = Partial<Record<keyof ContactInput, string>>

export interface ContactFilters {
  query: string
  status: ContactStatus | 'all'
}

export interface ContactStats {
  total: number
  byStatus: Record<ContactStatus, number>
  followUpsDue: number
}
