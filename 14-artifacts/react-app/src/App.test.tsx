import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('affiche le titre et un compteur initialisé à zéro', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Get started', level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Count is 0' })).toBeInTheDocument()
  })

  it('incrémente le compteur à chaque clic', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Count is 0' }))
    expect(screen.getByRole('button', { name: 'Count is 1' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Count is 1' }))
    expect(screen.getByRole('button', { name: 'Count is 2' })).toBeInTheDocument()
  })

  it('propose les liens vers les documentations de Vite et React', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'Explore Vite' })).toHaveAttribute(
      'href',
      'https://vite.dev/',
    )
    expect(screen.getByRole('link', { name: 'Learn more' })).toHaveAttribute(
      'href',
      'https://react.dev/',
    )
  })
})
