/**
 * Unit tests for App component:
 * - Shows Home on initial render
 * - Settings button toggles SettingsPanel
 * - Navigating to a tool hides Home
 * - onToolOrderChange wired through SettingsPanel → Home re-reads order
 * - SettingsPanel close button hides the panel
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from './App'

function makeMockStorage() {
  let store: Record<string, string> = {}
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { store = {} },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length },
  }
}

const mockStorage = makeMockStorage()

beforeEach(() => {
  mockStorage.clear()
  vi.stubGlobal('localStorage', mockStorage)
  document.body.className = ''
  document.body.style.width = ''
  document.body.style.minHeight = ''
  document.documentElement.style.removeProperty('--app-font-size')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App – initial state', () => {
  it('renders Home on load', () => {
    render(<App />)
    expect(screen.getByText('数据工具箱')).toBeInTheDocument()
  })

  it('does not show SettingsPanel on load', () => {
    render(<App />)
    expect(screen.queryByText('工具顺序')).toBeNull()
  })
})

describe('App – settings panel toggle', () => {
  it('opens SettingsPanel when gear button is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByTitle('设置'))
    expect(screen.getByText('工具顺序')).toBeInTheDocument()
  })

  it('closes SettingsPanel when gear button is clicked again', () => {
    render(<App />)
    const gearBtn = screen.getByTitle('设置')
    fireEvent.click(gearBtn)
    fireEvent.click(gearBtn)
    expect(screen.queryByText('工具顺序')).toBeNull()
  })

  it('closes SettingsPanel when its own × button is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByTitle('设置'))
    const allButtons = screen.getAllByRole('button')
    const closeBtn = allButtons.find(b => b.className.includes('rounded-full'))!
    fireEvent.click(closeBtn)
    expect(screen.queryByText('工具顺序')).toBeNull()
  })
})

describe('App – navigation', () => {
  it('hides Home when navigating to sql-tool', () => {
    render(<App />)
    fireEvent.click(screen.getByText('数据逻辑验证工具'))
    expect(screen.queryByText('数据工具箱')).toBeNull()
  })

  it('hides Home when navigating to diff-tool', () => {
    render(<App />)
    fireEvent.click(screen.getByText('数据校验助手'))
    expect(screen.queryByText('数据工具箱')).toBeNull()
  })

  it('hides Home when navigating to sql-mapping', () => {
    render(<App />)
    fireEvent.click(screen.getByText('SQL → JSON 生成器'))
    expect(screen.queryByText('数据工具箱')).toBeNull()
  })

  it('hides Home when navigating to json-checker', () => {
    render(<App />)
    fireEvent.click(screen.getByText('JSON 检查器'))
    expect(screen.queryByText('数据工具箱')).toBeNull()
  })
})

describe('App – toolOrderVersion sync', () => {
  it('Home updates card order after SettingsPanel ↓ click', () => {
    render(<App />)
    // Initial order
    expect(screen.getAllByRole('heading', { level: 2 })[0].textContent).toBe('数据逻辑验证工具')

    // Open settings and move first tool down
    fireEvent.click(screen.getByTitle('设置'))
    act(() => {
      fireEvent.click(screen.getAllByLabelText('下移')[0])
    })

    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings[0].textContent).toBe('数据校验助手')
    expect(headings[1].textContent).toBe('数据逻辑验证工具')
  })

  it('SettingsPanel move persists order to localStorage', () => {
    render(<App />)
    fireEvent.click(screen.getByTitle('设置'))
    act(() => {
      fireEvent.click(screen.getAllByLabelText('下移')[0])
    })
    const stored = JSON.parse(localStorage.getItem('databandaid_tool_order')!)
    expect(stored[0]).toBe('diff-tool')
    expect(stored[1]).toBe('sql-tool')
  })
})
