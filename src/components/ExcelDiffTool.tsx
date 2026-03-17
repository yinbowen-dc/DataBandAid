import { useState } from 'react'
import * as XLSX from 'xlsx'

interface ExcelDiffToolProps {
  onBack: () => void;
}

interface FileData {
  name: string;
  headers: string[];
  rows: any[];
}

function ExcelDiffTool({ onBack }: ExcelDiffToolProps) {
  const [file1, setFile1] = useState<FileData | null>(null)
  const [file2, setFile2] = useState<FileData | null>(null)
  const [selectedRowIndex1, setSelectedRowIndex1] = useState<number>(0)
  const [selectedRowIndex2, setSelectedRowIndex2] = useState<number>(0)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [diffResult, setDiffResult] = useState<any[]>([])
  const [error, setError] = useState('')

  const [pasteMode1, setPasteMode1] = useState(false)
  const [pasteMode2, setPasteMode2] = useState(false)
  const [pasteContent1, setPasteContent1] = useState('')
  const [pasteContent2, setPasteContent2] = useState('')

  const parsePastedContent = (content: string, fileNum: 1 | 2) => {
    try {
      if (!content.trim()) return

      const wb = XLSX.read(content, { type: 'string' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const jsonData = XLSX.utils.sheet_to_json(ws) as any[]

      if (jsonData.length === 0) {
        setError('粘贴内容为空或格式不正确')
        return
      }

      const headers = Object.keys(jsonData[0])
      const fileData = {
        name: `粘贴内容 ${fileNum}`,
        headers,
        rows: jsonData
      }

      if (fileNum === 1) {
        setFile1(fileData)
        setPasteMode1(false)
      } else {
        setFile2(fileData)
        setPasteMode2(false)
      }
      
      setError('')
    } catch (err) {
      setError('解析粘贴内容失败，请确保从 Excel 复制')
      console.error(err)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileNum: 1 | 2) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const jsonData = XLSX.utils.sheet_to_json(ws) as any[]
        
        if (jsonData.length === 0) {
          setError('文件内容为空')
          return
        }

        const headers = Object.keys(jsonData[0])
        const fileData = {
          name: file.name,
          headers,
          rows: jsonData
        }

        if (fileNum === 1) setFile1(fileData)
        else setFile2(fileData)
        
        setError('')
      } catch (err) {
        setError('读取文件失败')
        console.error(err)
      }
    }
    reader.readAsBinaryString(file)
  }

  // Effect to update selectedColumns when files are loaded
  const displayColumns = file1 && file2
    ? Array.from(new Set([...file1.headers, ...file2.headers]))
    : []

  const toggleColumnSelection = (col: string) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter(c => c !== col))
    } else {
      setSelectedColumns([...selectedColumns, col])
    }
  }

  const selectAllColumns = () => {
    if (selectedColumns.length === displayColumns.length) {
      setSelectedColumns([])
    } else {
      setSelectedColumns(displayColumns)
    }
  }

  const compareFiles = () => {
    if (!file1 || !file2) {
      setError('请先上传两个文件')
      return
    }
    
    if (selectedColumns.length === 0) {
      setError('请至少选择一列进行比对')
      return
    }

    const row1 = file1.rows[selectedRowIndex1]
    const row2 = file2.rows[selectedRowIndex2]

    if (!row1) {
      setError('文件1中选择的行不存在')
      return
    }
    if (!row2) {
      setError('文件2中选择的行不存在')
      return
    }

    const diffs: any[] = []
    
    selectedColumns.forEach(col => {
      const val1 = row1[col]
      const val2 = row2[col]
      
      const isDiff = String(val1 || '') !== String(val2 || '')
      
      diffs.push({
        field: col,
        val1,
        val2,
        isDiff
      })
    })

    setDiffResult(diffs)
  }

  // Get common columns for key selection (not used anymore but kept for reference if needed)
  // const commonColumns = file1 && file2 
  //   ? file1.headers.filter(h => file2.headers.includes(h))
  //   : []

  return (
    <div className="w-full h-full p-6 bg-white flex flex-col overflow-y-auto pt-24 relative">
      <div className="flex items-center space-x-2 mb-6 border-b pb-4 fixed top-0 left-0 right-0 bg-white z-20 shadow-sm px-6 pt-6 h-20">
        <button 
          onClick={onBack}
          className="mr-2 p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
          title="返回"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="bg-purple-600 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">数据校验助手</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* File 1 Input */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-gray-700">文件 1 (基准)</label>
            <button 
              onClick={() => setPasteMode1(!pasteMode1)}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              {pasteMode1 ? '切换回文件上传' : '从剪贴板粘贴'}
            </button>
          </div>
          
          {pasteMode1 ? (
            <div className="flex-1 flex flex-col">
              <textarea
                value={pasteContent1}
                onChange={(e) => setPasteContent1(e.target.value)}
                placeholder="请直接从 Excel 复制内容并粘贴到这里..."
                className="w-full h-24 p-2 text-xs border border-gray-300 rounded mb-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              <button
                onClick={() => parsePastedContent(pasteContent1, 1)}
                disabled={!pasteContent1.trim()}
                className="w-full py-1.5 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                确认粘贴内容
              </button>
            </div>
          ) : (
            <>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={(e) => handleFileUpload(e, 1)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-600 file:text-white
                  hover:file:bg-purple-700
                  file:cursor-pointer cursor-pointer mb-2"
              />
            </>
          )}
          {file1 && <div className="text-xs text-green-600 mt-2">已加载: {file1.name} ({file1.rows.length} 行)</div>}
        </div>

        {/* File 2 Input */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-gray-700">文件 2 (比对)</label>
            <button 
              onClick={() => setPasteMode2(!pasteMode2)}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              {pasteMode2 ? '切换回文件上传' : '从剪贴板粘贴'}
            </button>
          </div>

          {pasteMode2 ? (
            <div className="flex-1 flex flex-col">
              <textarea
                value={pasteContent2}
                onChange={(e) => setPasteContent2(e.target.value)}
                placeholder="请直接从 Excel 复制内容并粘贴到这里..."
                className="w-full h-24 p-2 text-xs border border-gray-300 rounded mb-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              <button
                onClick={() => parsePastedContent(pasteContent2, 2)}
                disabled={!pasteContent2.trim()}
                className="w-full py-1.5 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                确认粘贴内容
              </button>
            </div>
          ) : (
            <>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={(e) => handleFileUpload(e, 2)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-purple-600 file:text-white
                  hover:file:bg-purple-700
                  file:cursor-pointer cursor-pointer mb-2"
              />
            </>
          )}
          {file2 && <div className="text-xs text-green-600 mt-2">已加载: {file2.name} ({file2.rows.length} 行)</div>}
        </div>
      </div>

      {file1 && file2 && (
        <div className="space-y-4 mb-6">
          {/* Row Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">选择文件1的行</label>
              <select 
                value={selectedRowIndex1} 
                onChange={(e) => setSelectedRowIndex1(Number(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                {file1.rows.map((row, idx) => (
                  <option key={idx} value={idx}>
                    行 {idx + 1}: {String(Object.values(row)[0])}...
                  </option>
                ))}
              </select>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <label className="block text-sm font-semibold text-gray-700 mb-2">选择文件2的行</label>
              <select 
                value={selectedRowIndex2} 
                onChange={(e) => setSelectedRowIndex2(Number(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
              >
                {file2.rows.map((row, idx) => (
                  <option key={idx} value={idx}>
                    行 {idx + 1}: {String(Object.values(row)[0])}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column Selection */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">选择参与比对的列</label>
              <button 
                onClick={selectAllColumns}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                {selectedColumns.length === displayColumns.length ? '取消全选' : '全选'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md bg-white">
              {displayColumns.map(col => (
                <label key={col} className="inline-flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col)}
                    onChange={() => toggleColumnSelection(col)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4 border-gray-300"
                  />
                  <span className="truncate text-gray-600">{col}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={compareFiles}
            className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            开始比对
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {diffResult.length > 0 ? (
        <div className="flex-1 min-h-[400px] overflow-hidden border border-gray-200 rounded-lg flex flex-col mt-6">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-medium text-gray-500 flex justify-between items-center">
            <span>比对结果 (显示选中的 {diffResult.length} 个字段)</span>
            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{diffResult.filter(d => d.isDiff).length} 处差异</span>
          </div>
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r w-1/3">
                    字段名
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-r w-1/3">
                    文件1 (基准)
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider bg-gray-50 w-1/3">
                    文件2 (比对)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diffResult.map((diff, i) => (
                  <tr key={i} className={`hover:bg-gray-50 ${diff.isDiff ? 'bg-yellow-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 border-r">
                      {diff.field}
                    </td>
                    <td className="px-6 py-4 text-gray-500 border-r break-all">
                      {diff.val1 !== undefined ? String(diff.val1) : <span className="text-gray-300 italic">null</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 break-all">
                      {diff.isDiff ? (
                        <span className="font-bold text-red-600">
                          {diff.val2 !== undefined ? String(diff.val2) : <span className="text-gray-300 italic">null</span>}
                        </span>
                      ) : (
                        <span className="text-green-600">
                          {diff.val2 !== undefined ? String(diff.val2) : <span className="text-gray-300 italic">null</span>}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        selectedColumns.length > 0 && !error && (
          <div className="flex-1 min-h-[200px] flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg mt-6">
            {diffResult.length === 0 && selectedColumns.length > 0 && selectedRowIndex1 !== undefined && selectedRowIndex2 !== undefined 
              ? '点击"开始比对"查看结果' 
              : '暂无差异或尚未开始比对'}
          </div>
        )
      )}
    </div>
  )
}

export default ExcelDiffTool
