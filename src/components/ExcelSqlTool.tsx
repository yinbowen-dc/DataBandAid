import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'

interface ExcelSqlToolProps {
  onBack: () => void;
}

function ExcelSqlTool({ onBack }: ExcelSqlToolProps) {
  const [data, setData] = useState<any[]>([])
  const [query, setQuery] = useState('SELECT * FROM data')
  const [result, setResult] = useState<any[]>([])
  const [error, setError] = useState('')
  const sandboxRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Listen for messages from the sandbox
    const handleMessage = (event: MessageEvent) => {
      if (event.data.id === 'sql-result') {
        if (event.data.status === 'success') {
          setResult(event.data.result)
          setError('')
        } else {
          setError(event.data.error)
          setResult([])
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const jsonData = XLSX.utils.sheet_to_json(ws)
        setData(jsonData)
        setError('')
      } catch (err) {
        setError('读取文件失败')
        console.error(err)
      }
    }
    reader.readAsBinaryString(file)
  }

  const runQuery = () => {
    if (!sandboxRef.current?.contentWindow) {
      setError('沙盒环境未就绪')
      return
    }

    // Send data and query to sandbox
    sandboxRef.current.contentWindow.postMessage({
      command: 'exec',
      sql: query,
      data: data,
      id: 'sql-result'
    }, '*')
  }

  return (
    <div className="w-full h-full p-6 bg-white flex flex-col">
      {/* Hidden Sandbox Iframe */}
      <iframe 
        ref={sandboxRef} 
        src="sandbox.html" 
        style={{ display: 'none' }} 
        title="sql-sandbox"
      />

      <div className="flex items-center space-x-2 mb-6 border-b pb-4">
        <button 
          onClick={onBack}
          className="mr-2 p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          title="返回"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-800">数据逻辑验证工具</h1>
      </div>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs mr-2">1</span>
          上传 Excel 文件
        </label>
        <div className="flex items-center space-x-4">
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              file:cursor-pointer cursor-pointer"
          />
        </div>
        {data.length > 0 && (
          <div className="mt-3 flex items-center text-green-600 text-sm font-medium bg-green-50 p-2 rounded w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            已成功加载 {data.length} 行数据
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
          <div className="flex items-center">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs mr-2">2</span>
            编写 SQL 查询
          </div>
          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded">表名: data</span>
        </label>
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm resize-none"
            placeholder="SELECT * FROM data..."
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400 pointer-events-none">
            支持 Hive SQL 语法
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          示例：SELECT * FROM data WHERE age &gt; 20
        </div>
        
        <button
          onClick={runQuery}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center w-full sm:w-auto"
          disabled={data.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          运行查询
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg mb-6 text-sm flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {result.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-medium text-gray-500 flex justify-between items-center">
            <span>查询结果</span>
            <span className="bg-white px-2 py-0.5 rounded border border-gray-200">{result.length} 条记录</span>
          </div>
          <div className="overflow-auto max-h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {Object.keys(result[0]).map((key) => (
                    <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-50">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-600">
                        {val?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExcelSqlTool
