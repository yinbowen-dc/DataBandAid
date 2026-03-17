interface HomeProps {
  onNavigate: (view: 'sql-tool' | 'diff-tool') => void;
}

function Home({ onNavigate }: HomeProps) {
  return (
    <div className="w-full h-full p-6 bg-gray-50">
      <div className="flex items-center space-x-2 mb-8">
        <div className="bg-blue-600 p-2 rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">数据工具箱</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* SQL Tool Card */}
        <button
          onClick={() => onNavigate('sql-tool')}
          className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left"
        >
          <div className="flex items-start justify-between">
            <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-600 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <h2 className="mt-4 text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
            数据逻辑验证工具
          </h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            上传 Excel 文件并通过 SQL 语句快速验证数据逻辑，支持 Hive SQL 语法。
          </p>
        </button>

        {/* Diff Tool Card */}
        <button
          onClick={() => onNavigate('diff-tool')}
          className="group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all duration-200 text-left"
        >
          <div className="flex items-start justify-between">
            <div className="bg-purple-50 p-3 rounded-lg group-hover:bg-purple-600 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <h2 className="mt-4 text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
            数据校验助手
          </h2>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            上传两个 Excel 文件，选择指定行进行数据比对，自动高亮显示差异字段。
          </p>
        </button>

        {/* Placeholder for future tools */}
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
