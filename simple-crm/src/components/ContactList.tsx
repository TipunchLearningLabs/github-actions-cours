import { useState } from 'react'
import { displayName, isFollowUpDue, STATUS_LABELS } from '../lib/contacts'
import type { Contact } from '../types'

interface ContactListProps {
  contacts: Contact[]
  today: string
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
}

/** Contact table with a two-step delete confirmation. */
export function ContactList({ contacts, today, onEdit, onDelete }: ContactListProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  if (contacts.length === 0) {
    return <p className="empty">No contacts found.</p>
  }

  return (
    <div className="table-wrapper">
      <table className="contacts">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Contact</th>
            <th scope="col">Status</th>
            <th scope="col">Follow-up</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const name = displayName(contact)
            const due = isFollowUpDue(contact, today)
            return (
              <tr key={contact.id}>
                <td>
                  <strong>{name}</strong>
                  {contact.company && name !== contact.company && (
                    <span className="muted">{contact.company}</span>
                  )}
                </td>
                <td>
                  {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
                  {contact.phone && <a href={`tel:${contact.phone}`}>{contact.phone}</a>}
                </td>
                <td>
                  <span className={`badge badge--${contact.status}`}>
                    {STATUS_LABELS[contact.status]}
                  </span>
                </td>
                <td className={due ? 'due' : undefined}>
                  {contact.followUpDate || '—'}
                  {due && <span className="visually-hidden"> (due)</span>}
                </td>
                <td className="actions">
                  {pendingDeleteId === contact.id ? (
                    <>
                      <button
                        type="button"
                        className="button button--danger"
                        onClick={() => onDelete(contact.id)}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="button button--ghost"
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="button button--ghost"
                        aria-label={`Edit ${name}`}
                        onClick={() => onEdit(contact)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="button button--ghost"
                        aria-label={`Delete ${name}`}
                        onClick={() => setPendingDeleteId(contact.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
