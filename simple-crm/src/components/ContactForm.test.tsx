import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { makeContact } from '../test/factories'
import { ContactForm } from './ContactForm'

describe('ContactForm', () => {
  it('shows validation errors and does not submit invalid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText('Email'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Add contact' }))

    expect(screen.getByText('A last name or a company is required.')).toBeInTheDocument()
    expect(screen.getByText('Invalid email address.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits valid input', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ContactForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await user.type(screen.getByLabelText('Last name'), 'Martin')
    await user.selectOptions(screen.getByLabelText('Status'), 'prospect')
    await user.click(screen.getByRole('button', { name: 'Add contact' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ lastName: 'Martin', status: 'prospect' }),
    )
  })

  it('prefills fields when editing', () => {
    render(<ContactForm contact={makeContact()} onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByRole('heading', { name: 'Edit contact' })).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toHaveValue('Dupont')
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('calls onCancel', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<ContactForm onSubmit={vi.fn()} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
