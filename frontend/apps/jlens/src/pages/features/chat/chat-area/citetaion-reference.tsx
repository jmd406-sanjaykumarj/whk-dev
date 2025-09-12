"use client"

import type React from "react"

import { SimpleAccordion } from "./simple-accordion"

interface CitationReference {
  id: string
  citationContent: string
  filepath: string
}

const CitationAccordion = ({
  messageId,
  citationMessages,
  setCitationContent,
}: {
  messageId: string
  citationMessages: CitationReference[][]
  setCitationContent: React.Dispatch<React.SetStateAction<string>>
}) => {
  return (
    <SimpleAccordion
      items={[
        {
          value: "ref-1",
          title: "References",
          content: (() => {
            const matchingRefs = citationMessages.filter((citations) => citations[0]?.id === messageId).flat()

            const refsByFilepath = matchingRefs.reduce(
              (acc, ref) => {
                if (!acc[ref.filepath]) acc[ref.filepath] = []
                acc[ref.filepath].push(ref.citationContent)
                return acc
              },
              {} as Record<string, string[]>,
            )

            return (
              <div className="space-y-3">
                {Object.entries(refsByFilepath).map(([filepath, contents], index) => (
                  <div
                    key={index}
                    className="group cursor-pointer p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all duration-200"
                    onClick={() => {
                      const fullContent = contents.join("\n\n")
                      setCitationContent(fullContent)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {index + 1}
                        </span>
                        <span className="text-blue-400 group-hover:text-blue-900 font-medium text-sm transition-colors duration-200">
                          {filepath}
                        </span>
                      </div>
                      <div className="text-orange-500 hover:text-orange-600 transition-colors duration-200">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21.5 8.5v7c0 1.1-.9 2-2 2h-15c-1.1 0-2-.9-2-2v-7c0-1.1.9-2 2-2h15c1.1 0 2 .9 2 2zm-2 0h-15v7h15v-7zm-13 2h2v3h-2v-3zm3 0h2v3h-2v-3zm3 0h2v3h-2v-3zm3 0h2v3h-2v-3z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600 line-clamp-2">{contents[0].substring(0, 120)}...</div>
                  </div>
                ))}
              </div>
            )
          })(),
        },
      ]}
    />
  )
}

export default CitationAccordion
