import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DjvuViewer from './DjvuViewer'

describe('DjvuViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.window.djvuReader = {
      init: vi.fn().mockResolvedValue(),
      setOnPageChange: vi.fn(),
      setScale: vi.fn(),
      goToPage: vi.fn(),
      prevPage: vi.fn(),
      nextPage: vi.fn()
    }
  })

  it('renders container div', () => {
    const { getByTestId } = render(<DjvuViewer fileUrl="/test.djvu" setPageInfo={() => {}} />)
    expect(getByTestId('djvu-container')).toBeInTheDocument()
  })

  it('zooms on Ctrl + wheel', () => {
    const { getByTestId } = render(<DjvuViewer fileUrl="/test.djvu" setPageInfo={() => {}} />)
    const container = getByTestId('djvu-container')

    fireEvent.wheel(container, {
      ctrlKey: true,
      deltaY: -100,
    })

    expect(window.djvuReader.setScale).toHaveBeenCalled()
  })

  it('resets zoom on double click', () => {
    const { getByTestId } = render(<DjvuViewer fileUrl="/test.djvu" setPageInfo={() => {}} />)
    const container = getByTestId('djvu-container')

    fireEvent.doubleClick(container)
    expect(window.djvuReader.setScale).toHaveBeenCalledWith(1)
  })

  it('navigates pages with ArrowUp and ArrowDown', () => {
    render(<DjvuViewer fileUrl="/test.djvu" setPageInfo={() => {}} />)

    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(window.djvuReader.nextPage).toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(window.djvuReader.prevPage).toHaveBeenCalled()
  })
})
