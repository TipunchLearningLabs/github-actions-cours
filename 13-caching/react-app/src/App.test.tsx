import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Get started' })).toBeInTheDocument()
  })

  it('starts the counter at 0', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Count is 0' })).toBeInTheDocument()
  })

  it('increments the counter on click', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is/i })
    fireEvent.click(button)
    fireEvent.click(button)
    expect(button).toHaveTextContent('Count is 2')
  })
})
