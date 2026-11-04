import { useEffect, useState } from 'react'
import { createContact, updateContact } from '../lib/contacts'
import { loadContacts, saveContacts } from '../lib/storage'
import type { Contact, ContactInput } from '../types'

/** Contact list state, persisted to localStorage on every change. */
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(() => loadContacts())

  useEffect(() => {
    saveContacts(contacts)
  }, [contacts])

  /** Add a new contact built from form input. */
  function add(input: ContactInput): void {
    setContacts((current) => [createContact(input), ...current])
  }

  /** Replace the contact matching `id` with the updated input. */
  function update(id: string, input: ContactInput): void {
    setContacts((current) =>
      current.map((contact) => (contact.id === id ? updateContact(contact, input) : contact)),
    )
  }

  /** Delete the contact matching `id`. */
  function remove(id: string): void {
    setContacts((current) => current.filter((contact) => contact.id !== id))
  }

  return { contacts, add, update, remove }
}
