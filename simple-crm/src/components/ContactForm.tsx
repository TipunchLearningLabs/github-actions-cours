import { useState, type ChangeEvent, type FormEvent } from 'react'
import { EMPTY_CONTACT, STATUS_LABELS, validateContact } from '../lib/contacts'
import { CONTACT_STATUSES, type Contact, type ContactErrors, type ContactInput } from '../types'

interface ContactFormProps {
  contact?: Contact
  onSubmit: (input: ContactInput) => void
  onCancel: () => void
}

/** Extract the editable fields of an existing contact. */
function toInput(contact?: Contact): ContactInput {
  if (!contact) {
    return EMPTY_CONTACT
  }
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = contact
  return input
}

/** Create / edit form for a contact, with inline validation errors. */
export function ContactForm({ contact, onSubmit, onCancel }: ContactFormProps) {
  const [values, setValues] = useState<ContactInput>(() => toInput(contact))
  const [errors, setErrors] = useState<ContactErrors>({})

  /** Update the field matching the input's `name` attribute. */
  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  /** Validate, then hand the values to the parent. */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const nextErrors = validateContact(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values)
    }
  }

  /** Render a labelled text input with its error message. */
  function field(name: keyof ContactInput, label: string, type = 'text') {
    const error = errors[name]
    return (
      <div className="field">
        <label htmlFor={`contact-${name}`}>{label}</label>
        <input
          id={`contact-${name}`}
          name={name}
          type={type}
          value={values[name]}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {error && (
          <span id={`${name}-error`} className="field__error">
            {error}
          </span>
        )}
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <h2>{contact ? 'Edit contact' : 'New contact'}</h2>
      <div className="contact-form__grid">
        {field('firstName', 'First name')}
        {field('lastName', 'Last name')}
        {field('company', 'Company')}
        {field('email', 'Email', 'email')}
        {field('phone', 'Phone', 'tel')}
        <label className="field">
          <span>Status</span>
          <select name="status" value={values.status} onChange={handleChange}>
            {CONTACT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        {field('followUpDate', 'Next follow-up', 'date')}
      </div>
      <label className="field">
        <span>Notes</span>
        <textarea name="notes" rows={3} value={values.notes} onChange={handleChange} />
      </label>
      <div className="contact-form__actions">
        <button type="button" className="button button--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button">
          {contact ? 'Save' : 'Add contact'}
        </button>
      </div>
    </form>
  )
}
