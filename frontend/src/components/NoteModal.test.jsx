import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import NoteModal from './NoteModal'

describe('NoteModal', () => {
  const noteText = '<p>This is a note</p>'
  const noteId = 1
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the modal when noteText is provided', () => {
    render(<NoteModal noteText={noteText} noteId={noteId} onClose={onClose} />)
    expect(screen.getByText('📌 Note')).toBeInTheDocument()
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('does not render the modal when noteText is null', () => {
    const { container } = render(<NoteModal noteText={null} noteId={noteId} onClose={onClose} />)
    expect(container.firstChild).toBeNull()
  })

  it('calls onClose when Close button is clicked', () => {
    render(<NoteModal noteText={noteText} noteId={noteId} onClose={onClose} />)
    fireEvent.click(screen.getByText('Close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when clicking outside the modal', () => {
    render(<NoteModal noteText={noteText} noteId={noteId} onClose={onClose} />)
    const backdrop = screen.getByText('📌 Note').closest('div').parentElement
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<NoteModal noteText={noteText} noteId={noteId} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
