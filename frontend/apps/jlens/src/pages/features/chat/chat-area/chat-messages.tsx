"use client"
import { useLayoutEffect, useMemo, useRef } from "react"
import type React from "react"

import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import remarkSuperSub from "remark-supersub"
import he from "he"
import CitationAccordion from "./references"

interface CitationReference {
  id: string
  citationContent: string
  filepath: string
  url?: string
}
interface Message {
  id: string
  role: "user" | "assistant" | "tool"
  content: string
  timestamp: Date
  citationReferences?: CitationReference[]
}
interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  setCitationContent: React.Dispatch<React.SetStateAction<string>>
}

export function ChatMessages({ messages, isLoading, setCitationContent }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const lastMessageRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const target = isLoading ? loadingRef.current : lastMessageRef.current
    if (!target) return

    try {
      if (typeof (target as HTMLElement).scrollIntoView === "function") {
        ; (target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
        return
      }
    } catch (e) { }

    const scrollArea = scrollAreaRef.current
    if (scrollArea && typeof scrollArea.scrollTo === "function") {
      scrollArea.scrollTo({ top: (target as HTMLElement).offsetTop, behavior: "smooth" })
    }
  }, [messages.length, isLoading])

  const citationMessages: CitationReference[][] = useMemo(() => {
    return messages
      .filter((msg) => msg.role === "tool")
      .map((citation) => {
        const id = citation.id
        const parsedContent = JSON.parse(citation.content)
        return parsedContent.citations.map((references: any) => {
          const decoded = decodeURIComponent(atob(references.title))
          console.log("Decoded title:", decoded)
          const parts = decoded.split("/")
          const sharePointBase =
              "https://wasteharmonics.sharepoint.com/SalesManagementProcess/2025 ZS/Customer Contracts/"
          if (parts[3] === "customer-contracts") {
            const checkIndex = 5
            const remainingPath = parts.slice(checkIndex).join("/")
            const updatedPath = `${sharePointBase}${encodeURIComponent(remainingPath)}`
            console.log("Updated Path:", updatedPath)
            return {
              id: id,
              citationContent: references.content,
              filepath: references.filepath,
              url: updatedPath,
            } as CitationReference
          }
          else {
            const checkIndex = 4
            let prefix = ""
            if (parts[checkIndex] === "waste-harmonics") {
              prefix = "Waste Harmonics - Customer Contracts 12.01.24"
            } else if (parts[checkIndex] === "keter") {
              prefix = "Keter - Customer Contracts 12.01.24"
            } else if (parts[checkIndex] === "initial-contract") {
              prefix = "Waste Harmonics - Customer Contracts 12.01.24"
            } else {
              prefix = "Unknown - Customer Contracts"
            }
            const remainingPath = parts.slice(checkIndex + 1).join("/")
            const updatedPath = `${sharePointBase}${encodeURIComponent(prefix)}/${encodeURIComponent(remainingPath)}`
            return {
              id: id,
              citationContent: references.content,
              filepath: references.filepath,
              url: updatedPath,
            } as CitationReference
          }
        })
      })
  }, [messages.length, isLoading])

  const filepathUrlMap = useMemo(() => {
    const map: Record<string, string> = {}
    citationMessages.flat().forEach((ref) => {
      if (ref.filepath && ref.url && !map[ref.filepath]) {
        map[ref.filepath] = ref.url
      }
    })
    return map
  }, [citationMessages])

  const formattedMessages = useMemo(() => {
  let removeThisMsg = false

  return messages.map((msg) => {
    if (removeThisMsg) {
      removeThisMsg = false
      return { ...msg, citationReferences: undefined }
    }
    if (msg.content.includes("The requested information is not available in the retrieved data")) {
      removeThisMsg = true
    }

    const citations = citationMessages.find((c) => c[0]?.id === msg.id)
    let content = he.decode(msg.content)

    if (/\[doc\d+\]/.test(content)) {
      let relevantCitations = citations
      if (!relevantCitations) {
        relevantCitations = [...citationMessages].reverse()[0] || []
      }

      if (relevantCitations.length > 0) {
        const refsByFilepath = relevantCitations.reduce(
          (acc, ref) => {
            if (!acc[ref.filepath]) acc[ref.filepath] = []
            acc[ref.filepath].push(ref.citationContent)
            return acc
          },
          {} as Record<string, string[]>,
        )

        const uniqueFilepaths = Object.keys(refsByFilepath)
        const originalToReducedMap = new Map<number, number>()
        relevantCitations.forEach((ref, idx) => {
          originalToReducedMap.set(idx + 1, uniqueFilepaths.indexOf(ref.filepath) + 1)
        })

        content = content.replace(/\[doc(\d+)\]/g, (_, num) => {
          const reducedNum = originalToReducedMap.get(Number.parseInt(num, 10))
          return reducedNum ? `<sup>${reducedNum}</sup> ` : _
        })
        content = content.replace(/doc(\d+)/g, (_, num) => {
          const reducedNum = originalToReducedMap.get(Number.parseInt(num, 10))
          return reducedNum ? `<sup>${reducedNum}</sup> ` : _
        })
      }
    }

    content = content
      .replace(/(\w)\.(##)/g, "$1\n\n$2")
      .replace(/\[DONE\]/g, "")
      .replace(/(?:<sup>(\d+)<\/sup>\s*)+/g, (match) => {
        const seen = new Set<string>()
        const unique = [...match.matchAll(/<sup>(\d+)<\/sup>/g)]
          .map((m) => m[1])
          .filter((num) => {
            if (seen.has(num)) return false
            seen.add(num)
            return true
          })
        return unique.map((n) => `<sup>${n}</sup>`).join(" ")
      })

    return { ...msg, citationReferences: citations, content }
  })
}, [messages, citationMessages])

  return (
    <div className="flex-1 overflow-hidden pt-2">
      <div className="h-full overflow-y-auto" ref={scrollAreaRef}>
        <div className="flex flex-col p-2 sm:p-2 space-y-4 sm:space-y-4 max-w-[52rem] mx-auto">
          {formattedMessages.map((message, index) => {
            const isUser = message.role === "user"
            const isLast = index === formattedMessages.length - 1

            return (
              <div key={message.id} className="space-y-2">
                <div
                  ref={isLast ? lastMessageRef : null}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[85%] sm:max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
                    {message.role === "user" ||
                      message.role === "assistant" ||
                      message.content.includes("The requested information is not available in the retrieved data") ? (
                      <div
                        className={`rounded-lg p-1 sm:p-2 text-sm leading-relaxed break-words prose prose-custom max-w-[100ch] text-[0.875rem] ${false ? "text-white" : "text-black"
                          } ${isUser
                            ? // keeping user message colors as Full Stream Blue
                            "bg-blue-600 text-white mb-4 border border-blue-700/30 shadow-sm"
                            : // adding #F7F5F1 background color for assistant messages
                            "bg-[#F7F5F1] text-slate-800"
                          }`}
                        style={
                          !isUser
                            ? {
                              backgroundColor: "#F7F5F1",
                              paddingTop: "15px",
                              paddingRight: "15px",
                              paddingBottom: "15px",
                              paddingLeft: "15px",
                            }
                            : {
                              paddingRight: "15px",
                              paddingLeft: "15px",
                            }
                        }
                      >
                        <Markdown remarkPlugins={[remarkGfm, remarkSuperSub]} rehypePlugins={[rehypeRaw]}>
                          {message.content}
                        </Markdown>
                      </div>
                    ) : null}
                  </div>
                </div>

                {!isUser && message.citationReferences && message.citationReferences.length > 0 && (
                  <div className="max-w-[85%] sm:max-w-[80%]">
                    <CitationAccordion
                      messageId={message.id}
                      citationMessages={citationMessages}
                      setCitationContent={setCitationContent}
                      filepathUrlMap={filepathUrlMap}
                    />
                  </div>
                )}
              </div>
            )
          })}

          {isLoading && ( 
            <div className="flex justify-start" ref={loadingRef}>
              <div className="flex max-w-[85%] sm:max-w-[80%]">
                <div className="rounded-lg px-4 py-3 sm:px-6 sm:py-4 flex items-center space-x-3">
                  {/* Light text */}
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-500 animate-gentle-fade">Linc is thinking</p>
                  </div>

                  {/* Simple light dots */}
                  <div className="flex space-x-1.5">
                    <div
                      className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-light-bounce"
                      style={{ animationDelay: "0s" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-light-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-light-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
