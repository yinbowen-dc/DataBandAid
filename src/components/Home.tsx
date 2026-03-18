import { useState, useEffect } from 'react'

type ToolId = 'sql-tool' | 'diff-tool' | 'sql-mapping' | 'json-checker'

interface ToolConfig {
  id: ToolId
  title: string
  description: string
  colorScheme: {
    border: string
    iconBg: string
    iconBgHover: string
    iconColor: string
    arrowHover: string
    titleHover: string
  }
  icon: JSX.Element
}

const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: 'sql-tool',
    title: '数据逻辑验证工具',
    description: '上传 Excel 文件并通过 SQL 语句快速验证数据逻辑，支持 Hive SQL 语法。',
    colorScheme: {
      border: 'hover:border-blue-500',
      iconBg: 'bg-blue-50',
      iconBgHover: 'group-hover:bg-blue-600',
      iconColor: 'text-blue-600',
      arrowHover: 'group-hover:text-blue-500',
      titleHover: 'group-hover:text-blue-600',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'diff-tool',
    title: '数据校验助手',
    description: '上传两个 Excel 文件，选择指定行进行数据比对，自动高亮显示差异字段。',
    colorScheme: {
      border: 'hover:border-purple-500',
      iconBg: 'bg-purple-50',
      iconBgHover: 'group-hover:bg-purple-600',
      iconColor: 'text-purple-600',
      arrowHover: 'group-hover:text-purple-500',
      titleHover: 'group-hover:text-purple-600',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: 'sql-mapping',
    title: 'SQL → JSON 生成器',
    description: '粘贴 SQL，自动生成 plugin_model_conf JSON，支持维度、指标、过滤、排序、日期解析。',
    colorScheme: {
      border: 'hover:border-green-500',
      iconBg: 'bg-green-50',
      iconBgHover: 'group-hover:bg-green-600',
      iconColor: 'text-green-600',
      arrowHover: 'group-hover:text-green-500',
      titleHover: 'group-hover:text-green-600',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'json-checker',
    title: 'JSON 检查器',
    description: '检测 plugin_model_conf JSON 中的括号缺失、多余逗号、字段结构问题，精确定位错误行列。',
    colorScheme: {
      border: 'hover:border-amber-500',
      iconBg: 'bg-amber-50',
      iconBgHover: 'group-hover:bg-amber-500',
      iconColor: 'text-amber-500',
      arrowHover: 'group-hover:text-amber-500',
      titleHover: 'group-hover:text-amber-600',
    },
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const DEFAULT_ORDER: ToolId[] = ['sql-tool', 'diff-tool', 'sql-mapping', 'json-checker']
const STORAGE_KEY = 'databandaid_tool_order'

function loadToolOrder(): ToolId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_ORDER
    const parsed: ToolId[] = JSON.parse(raw)
    // Validate: must contain exactly the same ids as DEFAULT_ORDER
    const valid =
      parsed.length === DEFAULT_ORDER.length &&
      DEFAULT_ORDER.every((id) => parsed.includes(id))
    return valid ? parsed : DEFAULT_ORDER
  } catch {
    return DEFAULT_ORDER
  }
}

interface HomeProps {
  onNavigate: (view: ToolId) => void
  toolOrderVersion?: number
}

function Home({ onNavigate, toolOrderVersion }: HomeProps) {
  const [toolOrder, setToolOrder] = useState<ToolId[]>(loadToolOrder)

  useEffect(() => {
    setToolOrder(loadToolOrder())
  }, [toolOrderVersion])

  const orderedTools = toolOrder.map((id) => TOOL_CONFIGS.find((t) => t.id === id)!)

  return (
    <div className="w-full h-full p-6 bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">数据工具箱</h1>
        </div>
      </div>

      {/* Tool cards */}
      <div className="grid grid-cols-1 gap-4">
        {orderedTools.map((tool) => {
          const { colorScheme } = tool
          return (
            <button
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className={`group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${colorScheme.border} hover:shadow-md transition-all duration-200 text-left`}
            >
              <div className="flex items-start justify-between">
                <div className={`${colorScheme.iconBg} p-3 rounded-lg ${colorScheme.iconBgHover} transition-colors duration-200`}>
                  <span className={`${colorScheme.iconColor} group-hover:text-white transition-colors duration-200 block`}>
                    {tool.icon}
                  </span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-300 ${colorScheme.arrowHover} transform group-hover:translate-x-1 transition-all duration-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h2 className={`mt-4 text-lg font-semibold text-gray-800 ${colorScheme.titleHover} transition-colors`}>
                {tool.title}
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {tool.description}
              </p>
            </button>
          )
        })}

        {/* Placeholder */}
        <div className="bg-gray-100 p-6 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center opacity-70">
          <div className="bg-gray-200 p-3 rounded-lg mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-500">更多工具开发中...</h3>
        </div>
      </div>
    </div>
  )
}

export default Home
