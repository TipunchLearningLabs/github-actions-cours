import { makeContact } from '../test/factories'
import {
  computeStats,
  createContact,
  displayName,
  EMPTY_CONTACT,
  filterContacts,
  isFollowUpDue,
  sortContacts,
  toCsv,
  toIsoDate,
  updateContact,
  validateContact,
} from './contacts'

const TODAY = '2026-06-15'

describe('toIsoDate', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('validateContact', () => {
  it('accepts a contact with only a company', () => {
    expect(validateContact({ ...EMPTY_CONTACT, company: 'ACME' })).toEqual({})
  })

  it('requires a last name or a company', () => {
    expect(validateContact(EMPTY_CONTACT)).toHaveProperty('lastName')
  })

  it('rejects an invalid email and phone', () => {
    const errors = validateContact({
      ...EMPTY_CONTACT,
      lastName: 'Dupont',
      email: 'not-an-email',
      phone: 'abc',
    })
    expect(errors).toHaveProperty('email')
    expect(errors).toHaveProperty('phone')
  })

  it('accepts international phone formats', () => {
    const errors = validateContact({ ...EMPTY_CONTACT, lastName: 'Dupont', phone: '+33 6 12.34-56 78' })
    expect(errors).toEqual({})
  })
})

describe('createContact / updateContact', () => {
  it('creates a contact with id, timestamps and normalized fields', () => {
    const now = new Date('2026-03-01T09:00:00.000Z')
    const contact = createContact(
      { ...EMPTY_CONTACT, lastName: '  Martin ', email: ' Paul@Example.COM ' },
      now,
    )
    expect(contact.id).toEqual(expect.any(String))
    expect(contact.lastName).toBe('Martin')
    expect(contact.email).toBe('paul@example.com')
    expect(contact.createdAt).toBe(now.toISOString())
    expect(contact.updatedAt).toBe(now.toISOString())
  })

  it('keeps id and creation date when updating', () => {
    const original = makeContact()
    const now = new Date('2026-04-01T09:00:00.000Z')
    const updated = updateContact(original, { ...original, status: 'client' }, now)
    expect(updated.id).toBe(original.id)
    expect(updated.createdAt).toBe(original.createdAt)
    expect(updated.updatedAt).toBe(now.toISOString())
    expect(updated.status).toBe('client')
  })
})

describe('displayName', () => {
  it('uses the full name, falling back to the company', () => {
    expect(displayName(makeContact())).toBe('Marie Dupont')
    expect(displayName(makeContact({ firstName: '', lastName: '' }))).toBe('Boulangerie Dupont')
  })
})

describe('filterContacts', () => {
  const contacts = [
    makeContact({ lastName: 'Dupont', company: 'Boulangerie', status: 'lead' }),
    makeContact({ firstName: 'Paul', lastName: 'Martin', company: 'Garage Martin', email: 'paul@garage.fr', status: 'client' }),
  ]

  it('returns everything with empty filters', () => {
    expect(filterContacts(contacts, { query: '', status: 'all' })).toHaveLength(2)
  })

  it('filters by status', () => {
    const result = filterContacts(contacts, { query: '', status: 'client' })
    expect(result.map((contact) => contact.lastName)).toEqual(['Martin'])
  })

  it('searches case-insensitively across fields', () => {
    expect(filterContacts(contacts, { query: 'GARAGE', status: 'all' })).toHaveLength(1)
    expect(filterContacts(contacts, { query: 'paul@', status: 'all' })).toHaveLength(1)
  })

  it('combines query and status', () => {
    expect(filterContacts(contacts, { query: 'garage', status: 'lead' })).toHaveLength(0)
  })
})

describe('isFollowUpDue', () => {
  it.each([
    ['', 'lead', false],
    ['2026-06-20', 'lead', false],
    ['2026-06-15', 'lead', true],
    ['2026-06-01', 'client', true],
    ['2026-06-01', 'inactive', false],
  ] as const)('followUpDate=%s status=%s -> %s', (followUpDate, status, expected) => {
    expect(isFollowUpDue(makeContact({ followUpDate, status }), TODAY)).toBe(expected)
  })
})

describe('sortContacts', () => {
  it('puts due follow-ups first, then most recently updated', () => {
    const old = makeContact({ lastName: 'Old', updatedAt: '2026-01-01T00:00:00.000Z' })
    const recent = makeContact({ lastName: 'Recent', updatedAt: '2026-05-01T00:00:00.000Z' })
    const dueLater = makeContact({ lastName: 'DueLater', followUpDate: '2026-06-10' })
    const dueFirst = makeContact({ lastName: 'DueFirst', followUpDate: '2026-06-01' })

    const result = sortContacts([old, recent, dueLater, dueFirst], TODAY)
    expect(result.map((contact) => contact.lastName)).toEqual(['DueFirst', 'DueLater', 'Recent', 'Old'])
  })
})

describe('computeStats', () => {
  it('counts contacts per status and due follow-ups', () => {
    const stats = computeStats(
      [
        makeContact({ status: 'lead', followUpDate: '2026-06-01' }),
        makeContact({ status: 'lead' }),
        makeContact({ status: 'client' }),
        makeContact({ status: 'inactive', followUpDate: '2026-06-01' }),
      ],
      TODAY,
    )
    expect(stats).toEqual({
      total: 4,
      byStatus: { lead: 2, prospect: 0, client: 1, inactive: 1 },
      followUpsDue: 1,
    })
  })
})

describe('toCsv', () => {
  it('outputs a header and escapes special characters', () => {
    const csv = toCsv([makeContact({ company: 'Dupont, Fils & Co', notes: 'Said "hello"\nCall back' })])
    const [header] = csv.split('\n')
    expect(header).toBe('firstName,lastName,company,email,phone,status,followUpDate,notes,createdAt,updatedAt')
    expect(csv).toContain('"Dupont, Fils & Co"')
    expect(csv).toContain('"Said ""hello""\nCall back"')
  })

  it('outputs only the header for an empty list', () => {
    expect(toCsv([]).split('\n')).toHaveLength(1)
  })
})
