import { makeContact } from '../test/factories'
import { loadContacts, saveContacts, STORAGE_KEY } from './storage'

describe('storage', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(loadContacts()).toEqual([])
  })

  it('round-trips contacts', () => {
    const contacts = [makeContact(), makeContact({ lastName: 'Martin' })]
    saveContacts(contacts)
    expect(loadContacts()).toEqual(contacts)
  })

  it('ignores corrupted JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadContacts()).toEqual([])
  })

  it('drops entries that are not contacts', () => {
    const valid = makeContact()
    localStorage.setItem(STORAGE_KEY, JSON.stringify([valid, { foo: 'bar' }, null, 42]))
    expect(loadContacts()).toEqual([valid])
  })
})
