import { useState, useRef, useEffect, useCallback } from 'react'

interface SettingsPanelProps {
  onClose: () => void
  onToolOrderChange?: () => void
}

export interface Settings {
  width: number
  height: number
  fontSize: string
  theme: 'light' | 'gray'
  compactMode: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  width: 400,
  height: 600,
  fontSize: 'base',
  theme: 'light',
  compactMode: false,
}

const SIZE_PRESETS = [
  { label: '小', w: 360, h: 540 },
  { label: '中', w: 480, h: 680 },
  { label: '大', w: 600, h: 800 },
  { label: '宽屏', w: 800, h: 640 },
]

const FONT_OPTIONS = [
  { label: '小', value: 'sm' },
  { label: '中', value: 'base' },
  { label: '大', value: 'lg' },
]

// 读取/保存/应用 settings
export function loadSettings(): Settings {
  try {
    const s = localStorage.getItem('databandaid_settings')
    if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) }
  } catch (_) {}
  return { ...DEFAULT_SETTINGS }
}

export function saveSettings(s: Settings) {
  try { localStorage.setItem('databandaid_settings', JSON.stringify(s)) } catch (_) {}
}

export function applySettings(s: Settings) {
  const root = document.documentElement
  const sizeMap: Record<string, string> = { sm: '13px', base: '15px', lg: '17px' }
  root.style.setProperty('--app-font-size', sizeMap[s.fontSize] || '15px')
  document.body.style.width = s.width + 'px'
  document.body.style.minHeight = s.height + 'px'
  if (s.theme === 'gray') {
    document.body.classList.add('theme-gray')
  } else {
    document.body.classList.remove('theme-gray')
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings)
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettingsState(prev => ({ ...prev, ...patch }))
  }, [])
  useEffect(() => { applySettings(settings) }, [])
  return { settings, updateSettings }
}

// ---- Tool order ----
export type ToolId = 'sql-tool' | 'diff-tool' | 'sql-mapping' | 'json-checker'
export const TOOL_ORDER_KEY = 'databandaid_tool_order'
export const DEFAULT_TOOL_ORDER: ToolId[] = ['sql-tool', 'diff-tool', 'sql-mapping', 'json-checker']
export const TOOL_LABELS: Record<ToolId, string> = {
  'sql-tool': '数据逻辑验证工具',
  'diff-tool': '数据校验助手',
  'sql-mapping': 'SQL → JSON 生成器',
  'json-checker': 'JSON 检查器',
}

export function loadToolOrder(): ToolId[] {
  try {
    const raw = localStorage.getItem(TOOL_ORDER_KEY)
    if (!raw) return [...DEFAULT_TOOL_ORDER]
    const parsed: ToolId[] = JSON.parse(raw)
    const valid =
      parsed.length === DEFAULT_TOOL_ORDER.length &&
      DEFAULT_TOOL_ORDER.every((id) => parsed.includes(id))
    return valid ? parsed : [...DEFAULT_TOOL_ORDER]
  } catch {
    return [...DEFAULT_TOOL_ORDER]
  }
}

export function saveToolOrder(order: ToolId[]): void {
  try { localStorage.setItem(TOOL_ORDER_KEY, JSON.stringify(order)) } catch (_) {}
}

export default function SettingsPanel({ onClose, onToolOrderChange }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings()

  // Tool order state
  const [toolOrder, setToolOrder] = useState<ToolId[]>(loadToolOrder)

  function moveToolUp(i: number) {
    if (i === 0) return
    const next = [...toolOrder]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setToolOrder(next)
    saveToolOrder(next)
    onToolOrderChange?.()
  }

  function moveToolDown(i: number) {
    if (i === toolOrder.length - 1) return
    const next = [...toolOrder]
    ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
    setToolOrder(next)
    saveToolOrder(next)
    onToolOrderChange?.()
  }

  // 拖动逻辑
  const panelRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origLeft: 0, origTop: 0 })
  const [pos, setPos] = useState({ left: 'auto', top: 'auto', right: '16px', bottom: '56px' })
  const [isDragging, setIsDragging] = useState(false)

  const onMouseDown = (e: React.MouseEvent) => {
    const el = panelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: rect.left,
      origTop: rect.top,
    }
    setIsDragging(true)
    e.preventDefault()
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current.dragging) return
      const dx = e.clientX - dragState.current.startX
      const dy = e.clientY - dragState.current.startY
      setPos({
        left: dragState.current.origLeft + dx + 'px',
        top: dragState.current.origTop + dy + 'px',
        right: 'auto',
        bottom: 'auto',
      })
    }
    const onMouseUp = () => {
      if (dragState.current.dragging) {
        dragState.current.dragging = false
        setIsDragging(false)
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const [saved, setSaved] = useState(false)
  const handleSave = () => {
    saveSettings(settings)
    applySettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-72 select-none"
      style={{
        left: pos.left,
        top: pos.top,
        right: pos.right === 'auto' ? undefined : pos.right,
        bottom: pos.bottom === 'auto' ? undefined : pos.bottom,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* 拖动手柄 */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-xl border-b border-gray-200 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">设置</span>
        </div>
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-5">

        {/* 窗口尺寸 - 快速预设 */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">窗口大小</div>
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            {SIZE_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => updateSettings({ width: p.w, height: p.h })}
                className={`py-1.5 text-xs rounded-md border transition-colors font-medium ${
                  settings.width === p.w && settings.height === p.h
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">宽度 (px)</label>
              <input
                type="number"
                value={settings.width}
                min={320} max={1200} step={10}
                onChange={e => updateSettings({ width: parseInt(e.target.value) || 400 })}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-mono focus:ring-1 focus:ring-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">高度 (px)</label>
              <input
                type="number"
                value={settings.height}
                min={400} max={1200} step={10}
                onChange={e => updateSettings({ height: parseInt(e.target.value) || 600 })}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm font-mono focus:ring-1 focus:ring-indigo-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 字体大小 */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">字体大小</div>
          <div className="flex gap-1.5">
            {FONT_OPTIONS.map(f => (
              <button
                key={f.value}
                onClick={() => updateSettings({ fontSize: f.value })}
                className={`flex-1 py-1.5 text-xs rounded-md border transition-colors font-medium ${
                  settings.fontSize === f.value
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 主题 */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">背景主题</div>
          <div className="flex gap-1.5">
            {[{ label: '纯白', value: 'light' }, { label: '浅灰', value: 'gray' }].map(t => (
              <button
                key={t.value}
                onClick={() => updateSettings({ theme: t.value as 'light' | 'gray' })}
                className={`flex-1 py-1.5 text-xs rounded-md border transition-colors font-medium ${
                  settings.theme === t.value
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 紧凑模式 */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-700">紧凑模式</div>
            <div className="text-xs text-gray-400">减少内边距，显示更多内容</div>
          </div>
          <button
            onClick={() => updateSettings({ compactMode: !settings.compactMode })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              settings.compactMode ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                settings.compactMode ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 工具顺序 */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">工具顺序</div>
          <div className="space-y-1">
            {toolOrder.map((id, i) => (
              <div key={id} className="flex items-center justify-between py-1 px-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-4 text-right">{i + 1}.</span>
                  <span className="text-xs text-gray-700">{TOOL_LABELS[id]}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => moveToolUp(i)}
                    disabled={i === 0}
                    className={`p-1 rounded border transition-colors duration-150 ${
                      i === 0
                        ? 'border-gray-100 text-gray-200 cursor-not-allowed bg-white'
                        : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 bg-white'
                    }`}
                    aria-label="上移"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveToolDown(i)}
                    disabled={i === toolOrder.length - 1}
                    className={`p-1 rounded border transition-colors duration-150 ${
                      i === toolOrder.length - 1
                        ? 'border-gray-100 text-gray-200 cursor-not-allowed bg-white'
                        : 'border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 bg-white'
                    }`}
                    aria-label="下移"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          className={`w-full py-2 text-sm font-medium rounded-lg transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {saved ? '✓ 已保存' : '应用设置'}
        </button>

        {/* 当前尺寸显示 */}
        <div className="text-center text-xs text-gray-400">
          当前：{settings.width} × {settings.height} px
        </div>
      </div>
    </div>
  )
}
