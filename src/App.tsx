import { useState } from 'react'
import Home from './components/Home'
import ExcelSqlTool from './components/ExcelSqlTool'
import ExcelDiffTool from './components/ExcelDiffTool'
import SqlMappingTool from './components/SqlMappingTool'
import JsonCheckerTool from './components/JsonCheckerTool'
import SettingsPanel from './components/SettingsPanel'

type View = 'home' | 'sql-tool' | 'diff-tool' | 'sql-mapping' | 'json-checker'

function App() {
  const [currentView, setCurrentView] = useState<View>('home')
  const [showSettings, setShowSettings] = useState(false)
  const [toolOrderVersion, setToolOrderVersion] = useState(0)

  return (
    <div className="w-full h-full bg-gray-50 relative">
      {currentView === 'home' && (
        <Home
          onNavigate={(view) => setCurrentView(view)}
          toolOrderVersion={toolOrderVersion}
        />
      )}
      {currentView === 'sql-tool' && (
        <ExcelSqlTool onBack={() => setCurrentView('home')} />
      )}
      {currentView === 'diff-tool' && (
        <ExcelDiffTool onBack={() => setCurrentView('home')} />
      )}
      {currentView === 'sql-mapping' && (
        <SqlMappingTool onBack={() => setCurrentView('home')} />
      )}
      {currentView === 'json-checker' && (
        <JsonCheckerTool onBack={() => setCurrentView('home')} />
      )}

      {/* 全局悬浮设置按钮 */}
      <button
        onClick={() => setShowSettings(v => !v)}
        className={`fixed bottom-4 right-4 z-40 p-2.5 rounded-full shadow-lg transition-all ${
          showSettings
            ? 'bg-indigo-600 text-white rotate-45'
            : 'bg-white text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300'
        }`}
        title="设置"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* 可拖动设置面板 */}
      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          onToolOrderChange={() => setToolOrderVersion(v => v + 1)}
        />
      )}
    </div>
  )
}

export default App
