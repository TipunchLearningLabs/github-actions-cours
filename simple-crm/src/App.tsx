import { useMemo, useState } from 'react'
import './App.css'
import { ContactForm } from './components/ContactForm'
import { ContactList } from './components/ContactList'
import { StatsBar } from './components/StatsBar'
import { useContacts } from './hooks/useContacts'
import { computeStats, filterContacts, sortContacts, STATUS_LABELS, toCsv, toIsoDate } from './lib/contacts'
import { CONTACT_STATUSES, type Contact, type ContactFilters, type ContactInput } from './types'

type Editor = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; contact: Contact }

/** Trigger a browser download of the given contacts as a CSV file. */
function downloadCsv(contacts: Contact[], today: string): void {
  const blob = new Blob([toCsv(contacts)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `contacts-${today}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/** Mini CRM: dashboard, searchable contact list and contact editor. */
function App() {
  const { contacts, add, update, remove } = useContacts()
  const [filters, setFilters] = useState<ContactFilters>({ query: '', status: 'all' })
  const [editor, setEditor] = useState<Editor>({ mode: 'closed' })
  const [today] = useState(() => toIsoDate(new Date()))

  const stats = useMemo(() => computeStats(contacts, today), [contacts, today])
  const visibleContacts = useMemo(
    () => sortContacts(filterContacts(contacts, filters), today),
    [contacts, filters, today],
  )

  /** Save the editor content as a new or updated contact, then close it. */
  function handleSubmit(input: ContactInput): void {
    if (editor.mode === 'edit') {
      update(editor.contact.id, input)
    } else {
      add(input)
    }
    setEditor({ mode: 'closed' })
  }

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Mini CRM</h1>
          <p className="muted">Track your leads, prospects and clients.</p>
        </div>
        <div className="app__header-actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => downloadCsv(contacts, today)}
            disabled={contacts.length === 0}
          >
            Export CSV
          </button>
          <button type="button" className="button" onClick={() => setEditor({ mode: 'create' })}>
            New contact
          </button>
        </div>
      </header>

      <StatsBar stats={stats} />

      {editor.mode !== 'closed' && (
        <ContactForm
          key={editor.mode === 'edit' ? editor.contact.id : 'new'}
          contact={editor.mode === 'edit' ? editor.contact : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setEditor({ mode: 'closed' })}
        />
      )}

      <section className="toolbar" aria-label="Filters">
        <input
          type="search"
          placeholder="Search name, company, email…"
          aria-label="Search contacts"
          value={filters.query}
          onChange={(event) => setFilters({ ...filters, query: event.target.value })}
        />
        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(event) =>
            setFilters({ ...filters, status: event.target.value as ContactFilters['status'] })
          }
        >
          <option value="all">All statuses</option>
          {CONTACT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </section>

      <ContactList
        contacts={visibleContacts}
        today={today}
        onEdit={(contact) => setEditor({ mode: 'edit', contact })}
        onDelete={remove}
      />
    </div>
  )
}

export default App
