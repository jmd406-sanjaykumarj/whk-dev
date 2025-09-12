"use client"

import type React from "react"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import remarkSuperSub from "remark-supersub"
import { X, GripVertical } from "lucide-react"

interface CitationSidebarProps {
  content: string
  onClose?: () => void
  className?: string
}

const CitationSidebar: React.FC<CitationSidebarProps> = ({ content, onClose, className }) => {
  let sharedUrl = ""
  const firstRefBlock = content
    .split(/\*\*Reference \d+\*\*/g)
    .map((r) => r.trim())
    .filter((r) => r.length > 0)[0]

  if (firstRefBlock) {
    const [urlPart] = firstRefBlock.split("\n\n")
    if (urlPart.startsWith("|http")) {
      sharedUrl = urlPart.slice(1).trim()
    }
  }

  const references = content
    .split(/\*\*Reference \d+\*\*/g)
    .map((ref) => ref.trim())
    .filter((ref) => ref.length > 0)
    .map((ref, idx) => {
      const [urlPart, ...contentParts] = ref.split("\n\n")
      const url = urlPart.startsWith("|http") ? urlPart.slice(1).trim() : ""
      const textContent = contentParts.join("\n\n")
      return { url, textContent, index: idx + 1 }
    })

  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200/60 shadow-lg z-50 transition-transform ${className}`}
    >
      <div className="bg-slate-50/80 p-4 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-semibold text-slate-800">Citations</h2>
            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full">({references.length})</span>
            {sharedUrl && (
              <button
                onClick={() => window.open(sharedUrl, "_blank", "noopener,noreferrer")}
                className="p-1.5 hover:bg-orange-50 rounded transition-colors"
                title="Open in SharePoint"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-orange-500"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-200 rounded flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100%-5rem)] p-4">
        <div className="space-y-3">
          {references.map((ref, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/50 rounded-lg p-4 hover:shadow-sm transition-all duration-200 hover:border-slate-300/60 cursor-move group"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", `Reference ${ref.index}`)
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0 mt-0.5">
                  <GripVertical className="h-4 w-4" />
                </div>

                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex-shrink-0 mt-0.5">
                  {ref.index}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Reference {ref.index}
                    </span>
                  </div>

                  <div className="text-sm text-slate-700 leading-relaxed">
                    <Markdown
                      remarkPlugins={[remarkGfm, remarkSuperSub]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => (
                          <span className="font-semibold text-slate-900 bg-yellow-100/60 px-1 py-0.5 rounded text-sm">
                            {children}
                          </span>
                        ),
                        em: ({ children }) => <em className="text-blue-700 font-medium">{children}</em>,
                      }}
                    >
                      {ref.textContent}
                    </Markdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200/60">
          <div className="flex space-x-1 mb-3">
            <button className="px-3 py-1.5 text-xs font-medium text-white bg-slate-700 rounded">All</button>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors">
              SharePoint
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors">
              Contracts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CitationSidebar
