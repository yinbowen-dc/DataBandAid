import { useState } from 'react'
import Home from './components/Home'
import ExcelSqlTool from './components/ExcelSqlTool'
import ExcelDiffTool from './components/ExcelDiffTool'

type View = 'home' | 'sql-tool' | 'diff-tool'

function App() {
  const [currentView, setCurrentView] = useState<View>('home')

  return (
    <div className="w-full h-full bg-gray-50">
      {currentView === 'home' && (
        <Home onNavigate={(view) => setCurrentView(view)} />
      )}
      
      {currentView === 'sql-tool' && (
        <ExcelSqlTool onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'diff-tool' && (
        <ExcelDiffTool onBack={() => setCurrentView('home')} />
      )}
    </div>
  )
}

export default App
