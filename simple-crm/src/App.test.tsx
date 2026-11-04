import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { saveContacts, loadContacts } from './lib/storage'
import { makeContact } from './test/factories'

/** Return the numeric value of the stat card with the given label. */
function statValue(label: string): string | null {
  const stats = screen.getByRole('region', { name: 'Statistics' })
  return within(stats).getByText(label).previousElementSibling?.textContent ?? null
}

describe('App', () => {
  it('shows the empty state', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Mini CRM' })).toBeInTheDocument()
    expect(screen.getByText('No contacts found.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
  })

  it('adds a contact and persists it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'New contact' }))
    await user.type(screen.getByLabelText('First name'), 'Paul')
    await user.type(screen.getByLabelText('Last name'), 'Martin')
    await user.type(screen.getByLabelText('Company'), 'Garage Martin')
    await user.click(screen.getByRole('button', { name: 'Add contact' }))

    expect(screen.getByRole('cell', { name: /Paul Martin/ })).toBeInTheDocument()
    expect(statValue('Contacts')).toBe('1')
    expect(statValue('Leads')).toBe('1')
    expect(loadContacts()).toHaveLength(1)
  })

  it('edits a contact', async () => {
    const user = userEvent.setup()
    saveContacts([makeContact()])
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Edit Marie Dupont' }))
    await user.selectOptions(screen.getByLabelText('Status'), 'client')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(statValue('Clients')).toBe('1')
    expect(loadContacts()[0].status).toBe('client')
  })

  it('deletes a contact after confirmation', async () => {
    const user = userEvent.setup()
    saveContacts([makeContact()])
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Delete Marie Dupont' }))
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(screen.getByText('No contacts found.')).toBeInTheDocument()
    expect(loadContacts()).toEqual([])
  })

  it('filters by search and status', async () => {
    const user = userEvent.setup()
    saveContacts([
      makeContact({ firstName: 'Marie', lastName: 'Dupont', status: 'lead' }),
      makeContact({ firstName: 'Paul', lastName: 'Martin', company: 'Garage', status: 'client' }),
    ])
    render(<App />)

    await user.type(screen.getByLabelText('Search contacts'), 'garage')
    expect(screen.queryByText('Marie Dupont')).not.toBeInTheDocument()
    expect(screen.getByText('Paul Martin')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Search contacts'))
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'lead')
    expect(screen.getByText('Marie Dupont')).toBeInTheDocument()
    expect(screen.queryByText('Paul Martin')).not.toBeInTheDocument()
  })

  it('counts overdue follow-ups', () => {
    saveContacts([makeContact({ followUpDate: '2020-01-01' })])
    render(<App />)

    expect(statValue('Follow-ups due')).toBe('1')
  })
})
