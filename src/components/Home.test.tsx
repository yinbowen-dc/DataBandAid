/**
 * Unit tests for Home component:
 * - renders all 4 tool cards in default order
 * - toolOrderVersion prop triggers re-read from localStorage
 * - clicking a card calls onNavigate with correct tool id
 * - cards reflect custom order from localStorage
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { useState } from 'react'
import Home from './Home'
import { saveToolOrder } from './SettingsPanel'

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
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function getCardTitles(): string[] {
  return screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent ?? '')
}

describe('Home – default rendering', () => {
  it('renders all 4 tool cards', () => {
    render(<Home onNavigate={() => {}} />)
    expect(screen.getByText('数据逻辑验证工具')).toBeInTheDocument()
    expect(screen.getByText('数据校验助手')).toBeInTheDocument()
    expect(screen.getByText('SQL → JSON 生成器')).toBeInTheDocument()
    expect(screen.getByText('JSON 检查器')).toBeInTheDocument()
  })

  it('renders cards in default order when localStorage is empty', () => {
    render(<Home onNavigate={() => {}} />)
    const titles = getCardTitles()
    expect(titles[0]).toBe('数据逻辑验证工具')
    expect(titles[1]).toBe('数据校验助手')
    expect(titles[2]).toBe('SQL → JSON 生成器')
    expect(titles[3]).toBe('JSON 检查器')
  })

  it('renders cards in custom order from localStorage on mount', () => {
    saveToolOrder(['json-checker', 'sql-mapping', 'diff-tool', 'sql-tool'])
    render(<Home onNavigate={() => {}} />)
    const titles = getCardTitles()
    expect(titles[0]).toBe('JSON 检查器')
    expect(titles[1]).toBe('SQL → JSON 生成器')
    expect(titles[2]).toBe('数据校验助手')
    expect(titles[3]).toBe('数据逻辑验证工具')
  })

  it('renders header title 数据工具箱', () => {
    render(<Home onNavigate={() => {}} />)
    expect(screen.getByText('数据工具箱')).toBeInTheDocument()
  })

  it('does NOT render an 编辑顺序 button', () => {
    render(<Home onNavigate={() => {}} />)
    expect(screen.queryByText('编辑顺序')).toBeNull()
  })
})

describe('Home – navigation', () => {
  it('calls onNavigate with sql-tool when that card is clicked', () => {
    const nav = vi.fn()
    render(<Home onNavigate={nav} />)
    fireEvent.click(screen.getByText('数据逻辑验证工具'))
    expect(nav).toHaveBeenCalledWith('sql-tool')
  })

  it('calls onNavigate with diff-tool when that card is clicked', () => {
    const nav = vi.fn()
    render(<Home onNavigate={nav} />)
    fireEvent.click(screen.getByText('数据校验助手'))
    expect(nav).toHaveBeenCalledWith('diff-tool')
  })

  it('calls onNavigate with sql-mapping when that card is clicked', () => {
    const nav = vi.fn()
    render(<Home onNavigate={nav} />)
    fireEvent.click(screen.getByText('SQL → JSON 生成器'))
    expect(nav).toHaveBeenCalledWith('sql-mapping')
  })

  it('calls onNavigate with json-checker when that card is clicked', () => {
    const nav = vi.fn()
    render(<Home onNavigate={nav} />)
    fireEvent.click(screen.getByText('JSON 检查器'))
    expect(nav).toHaveBeenCalledWith('json-checker')
  })
})

describe('Home – toolOrderVersion sync', () => {
  function VersionWrapper() {
    const [version, setVersion] = useState(0)
    return (
      <>
        <button onClick={() => setVersion(v => v + 1)}>bump</button>
        <Home onNavigate={() => {}} toolOrderVersion={version} />
      </>
    )
  }

  it('re-reads order from localStorage when toolOrderVersion changes', () => {
    render(<VersionWrapper />)
    expect(getCardTitles()[0]).toBe('数据逻辑验证工具')

    act(() => {
      saveToolOrder(['diff-tool', 'sql-tool', 'sql-mapping', 'json-checker'])
      fireEvent.click(screen.getByText('bump'))
    })

    expect(getCardTitles()[0]).toBe('数据校验助手')
    expect(getCardTitles()[1]).toBe('数据逻辑验证工具')
  })

  it('does NOT reload if version stays the same', () => {
    render(<VersionWrapper />)
    act(() => {
      saveToolOrder(['json-checker', 'sql-mapping', 'diff-tool', 'sql-tool'])
    })
    // No bump — Home keeps original order
    expect(getCardTitles()[0]).toBe('数据逻辑验证工具')
  })
})
