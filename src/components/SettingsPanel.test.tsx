/**
 * Unit tests for SettingsPanel pure logic:
 * - loadSettings / saveSettings / applySettings
 * - loadToolOrder / saveToolOrder
 * - useSettings hook (local-state only, no auto-apply on change)
 * - SettingsPanel UI: tool order move up/down, apply button saves+applies
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react'
import {
  loadSettings,
  saveSettings,
  applySettings,
  loadToolOrder,
  saveToolOrder,
  DEFAULT_SETTINGS,
  DEFAULT_TOOL_ORDER,
  TOOL_ORDER_KEY,
  useSettings,
} from './SettingsPanel'
import SettingsPanel from './SettingsPanel'

const SETTINGS_KEY = 'databandaid_settings'

// Use a proper in-memory localStorage mock so every test gets a clean slate
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
  vi.restoreAllMocks()
})

// ─── loadSettings ────────────────────────────────────────────────────────────
describe('loadSettings', () => {
  it('returns DEFAULT_SETTINGS when localStorage is empty', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('merges stored values over defaults', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ fontSize: 'lg', theme: 'gray' }))
    const s = loadSettings()
    expect(s.fontSize).toBe('lg')
    expect(s.theme).toBe('gray')
    expect(s.width).toBe(DEFAULT_SETTINGS.width)
  })

  it('returns DEFAULT_SETTINGS when stored JSON is invalid', () => {
    localStorage.setItem(SETTINGS_KEY, 'NOT_JSON')
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})

// ─── saveSettings ────────────────────────────────────────────────────────────
describe('saveSettings', () => {
  it('persists settings to localStorage', () => {
    const s = { ...DEFAULT_SETTINGS, fontSize: 'sm', width: 500 }
    saveSettings(s)
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY)!)
    expect(stored.fontSize).toBe('sm')
    expect(stored.width).toBe(500)
  })

  it('round-trips through loadSettings', () => {
    const s = { ...DEFAULT_SETTINGS, theme: 'gray' as const, height: 750 }
    saveSettings(s)
    expect(loadSettings()).toEqual(s)
  })
})

// ─── applySettings ───────────────────────────────────────────────────────────
describe('applySettings', () => {
  it('sets --app-font-size to 13px for sm', () => {
    applySettings({ ...DEFAULT_SETTINGS, fontSize: 'sm' })
    expect(document.documentElement.style.getPropertyValue('--app-font-size')).toBe('13px')
  })

  it('sets --app-font-size to 15px for base', () => {
    applySettings({ ...DEFAULT_SETTINGS, fontSize: 'base' })
    expect(document.documentElement.style.getPropertyValue('--app-font-size')).toBe('15px')
  })

  it('sets --app-font-size to 17px for lg', () => {
    applySettings({ ...DEFAULT_SETTINGS, fontSize: 'lg' })
    expect(document.documentElement.style.getPropertyValue('--app-font-size')).toBe('17px')
  })

  it('falls back to 15px for unknown font size', () => {
    applySettings({ ...DEFAULT_SETTINGS, fontSize: 'xl' })
    expect(document.documentElement.style.getPropertyValue('--app-font-size')).toBe('15px')
  })

  it('applies body width and minHeight', () => {
    applySettings({ ...DEFAULT_SETTINGS, width: 600, height: 800 })
    expect(document.body.style.width).toBe('600px')
    expect(document.body.style.minHeight).toBe('800px')
  })

  it('adds theme-gray class for gray theme', () => {
    applySettings({ ...DEFAULT_SETTINGS, theme: 'gray' })
    expect(document.body.classList.contains('theme-gray')).toBe(true)
  })

  it('removes theme-gray class for light theme', () => {
    document.body.classList.add('theme-gray')
    applySettings({ ...DEFAULT_SETTINGS, theme: 'light' })
    expect(document.body.classList.contains('theme-gray')).toBe(false)
  })
})

// ─── loadToolOrder ───────────────────────────────────────────────────────────
describe('loadToolOrder', () => {
  it('returns DEFAULT_TOOL_ORDER when localStorage is empty', () => {
    expect(loadToolOrder()).toEqual(DEFAULT_TOOL_ORDER)
  })

  it('returns stored order when valid', () => {
    const customOrder = ['diff-tool', 'sql-tool', 'json-checker', 'sql-mapping']
    localStorage.setItem(TOOL_ORDER_KEY, JSON.stringify(customOrder))
    expect(loadToolOrder()).toEqual(customOrder)
  })

  it('falls back to default when stored order has wrong length', () => {
    localStorage.setItem(TOOL_ORDER_KEY, JSON.stringify(['sql-tool']))
    expect(loadToolOrder()).toEqual(DEFAULT_TOOL_ORDER)
  })

  it('falls back to default when stored order has unknown id', () => {
    const bad = ['sql-tool', 'diff-tool', 'sql-mapping', 'unknown-tool']
    localStorage.setItem(TOOL_ORDER_KEY, JSON.stringify(bad))
    expect(loadToolOrder()).toEqual(DEFAULT_TOOL_ORDER)
  })

  it('falls back to default when stored JSON is invalid', () => {
    localStorage.setItem(TOOL_ORDER_KEY, 'GARBAGE')
    expect(loadToolOrder()).toEqual(DEFAULT_TOOL_ORDER)
  })
})

// ─── saveToolOrder ───────────────────────────────────────────────────────────
describe('saveToolOrder', () => {
  it('persists order to localStorage and round-trips', () => {
    const order = ['json-checker', 'sql-mapping', 'sql-tool', 'diff-tool'] as const
    saveToolOrder([...order])
    expect(loadToolOrder()).toEqual([...order])
  })
})

// ─── useSettings hook ────────────────────────────────────────────────────────
describe('useSettings hook', () => {
  it('initialises from localStorage', () => {
    saveSettings({ ...DEFAULT_SETTINGS, fontSize: 'lg' })
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.fontSize).toBe('lg')
  })

  it('updateSettings updates local state without saving to localStorage', () => {
    const { result } = renderHook(() => useSettings())
    act(() => {
      result.current.updateSettings({ fontSize: 'sm' })
    })
    expect(result.current.settings.fontSize).toBe('sm')
    // localStorage should NOT be updated — only 应用设置 button saves
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull()
  })

  it('updateSettings merges multiple patches correctly', () => {
    const { result } = renderHook(() => useSettings())
    act(() => {
      result.current.updateSettings({ width: 800, theme: 'gray' })
    })
    expect(result.current.settings.width).toBe(800)
    expect(result.current.settings.theme).toBe('gray')
    expect(result.current.settings.fontSize).toBe(DEFAULT_SETTINGS.fontSize)
  })
})

// ─── SettingsPanel component ─────────────────────────────────────────────────
describe('SettingsPanel component', () => {
  it('renders all 4 tools in 工具顺序 section', () => {
    render(<SettingsPanel onClose={() => {}} />)
    expect(screen.getByText('数据逻辑验证工具')).toBeInTheDocument()
    expect(screen.getByText('数据校验助手')).toBeInTheDocument()
    expect(screen.getByText('SQL → JSON 生成器')).toBeInTheDocument()
    expect(screen.getByText('JSON 检查器')).toBeInTheDocument()
  })

  it('clicking ↑ on second tool swaps it to the top', () => {
    render(<SettingsPanel onClose={() => {}} />)
    fireEvent.click(screen.getAllByLabelText('上移')[1])
    const rows = screen.getAllByText(/验证工具|校验助手|JSON 生成器|JSON 检查器/)
    expect(rows[0].textContent).toBe('数据校验助手')
    expect(rows[1].textContent).toBe('数据逻辑验证工具')
  })

  it('clicking ↓ on first tool moves it to second position', () => {
    render(<SettingsPanel onClose={() => {}} />)
    fireEvent.click(screen.getAllByLabelText('下移')[0])
    const rows = screen.getAllByText(/验证工具|校验助手|JSON 生成器|JSON 检查器/)
    expect(rows[0].textContent).toBe('数据校验助手')
    expect(rows[1].textContent).toBe('数据逻辑验证工具')
  })

  it('↑ on first tool is disabled', () => {
    render(<SettingsPanel onClose={() => {}} />)
    expect(screen.getAllByLabelText('上移')[0]).toBeDisabled()
  })

  it('↓ on last tool is disabled', () => {
    render(<SettingsPanel onClose={() => {}} />)
    const downs = screen.getAllByLabelText('下移')
    expect(downs[downs.length - 1]).toBeDisabled()
  })

  it('move writes new order to localStorage immediately', () => {
    render(<SettingsPanel onClose={() => {}} />)
    fireEvent.click(screen.getAllByLabelText('下移')[0])
    const stored = JSON.parse(localStorage.getItem(TOOL_ORDER_KEY)!)
    expect(stored[0]).toBe('diff-tool')
    expect(stored[1]).toBe('sql-tool')
  })

  it('calls onToolOrderChange callback on move', () => {
    const cb = vi.fn()
    render(<SettingsPanel onClose={() => {}} onToolOrderChange={cb} />)
    fireEvent.click(screen.getAllByLabelText('下移')[0])
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('应用设置 button saves current settings to localStorage', () => {
    render(<SettingsPanel onClose={() => {}} />)
    // Click the 浅灰 theme button (unique text, no ambiguity)
    fireEvent.click(screen.getByText('浅灰'))
    // Before apply: nothing in localStorage
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull()
    // Apply
    fireEvent.click(screen.getByText('应用设置'))
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY)!)
    expect(stored.theme).toBe('gray')
  })

  it('应用设置 button applies settings to the DOM', () => {
    render(<SettingsPanel onClose={() => {}} />)
    fireEvent.click(screen.getByText('浅灰'))
    expect(document.body.classList.contains('theme-gray')).toBe(false)
    fireEvent.click(screen.getByText('应用设置'))
    expect(document.body.classList.contains('theme-gray')).toBe(true)
  })

  it('应用设置 button shows ✓ 已保存 then resets after 1.5 s', () => {
    vi.useFakeTimers()
    render(<SettingsPanel onClose={() => {}} />)
    fireEvent.click(screen.getByText('应用设置'))
    expect(screen.getByText('✓ 已保存')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1600) })
    expect(screen.getByText('应用设置')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('calls onClose when the × button is clicked', () => {
    const onClose = vi.fn()
    render(<SettingsPanel onClose={onClose} />)
    const xButton = screen.getAllByRole('button').find(b => b.className.includes('rounded-full'))!
    fireEvent.click(xButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
