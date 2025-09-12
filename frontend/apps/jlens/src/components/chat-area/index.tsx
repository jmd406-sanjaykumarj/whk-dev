"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@ui/components/ui/textarea"
import { Zap, Send, Paperclip, FileText, Layers, ChevronUp, ChevronDown, AlertTriangle, X } from "lucide-react"
import { WorkspaceSelector } from "@/components/workspaces/workspace-selector"
import { useWorkspaceContext } from "../../context/WorkspaceContext"
import { useUserContext } from "../../context/UserContext"
import { useModelChatContext } from "../../context/ModelContext"

const chatTypes = [
  {
    id: "standalone",
    name: "Standalone",
    icon: Zap,
    description: "Independent chat session",
  },
  {
    id: "document",
    name: "Document",
    icon: FileText,
    description: "Chat with document context",
  },
  {
    id: "hybrid",
    name: "Hybrid",
    icon: Layers,
    description: "Combined approach",
  },
]

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  messagesLength: number
  conversationId?: string
  onSend: (text: string) => void
  showWorkspaceSelector?: boolean
  uploadFiles?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ChatInput({
  input,
  setInput,
  isLoading,
  messagesLength,
  onSend,
  showWorkspaceSelector,
  uploadFiles,
}: ChatInputProps) {
  const [showChatTypeDropdown, setShowChatTypeDropdown] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { selectedWorkspace } = useWorkspaceContext()
  const { access } = useUserContext()
  const { selectedModel, selectedChatType, setSelectedChatType } = useModelChatContext()

  console.log("Selected Workspace:", selectedWorkspace)
  console.log("Selected Workspace ID:", messagesLength)

  const handleSend = (overrideText?: string) => {
    const content = overrideText || input
    if (!content.trim()) return

    if (!selectedWorkspace) {
      setAlertMessage("Please select a workspace before sending a message.")
      setShowAlert(true)
      return
    }

    if (!selectedModel) {
      setAlertMessage("No model selected. Please create or choose a workspace to continue.")
      setShowAlert(true)
      return
    }

    onSend(content)
    setInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    if (showAlert) {
      const timeout = setTimeout(() => {
        setShowAlert(false)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [showAlert])

  useEffect(() => {
    if (!input && textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [input])

  useEffect(() => {
    sessionStorage.setItem("chatType", selectedChatType)
  }, [selectedChatType])

  const selectedChatTypeData = chatTypes.find((t) => t.id === selectedChatType)

  return (
    <div className="pb-2">
      <div className="max-w-[52rem] p-1 mx-auto">
        <div className="w-full max-w-xl sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto">
          <div className="flex flex-col justify-end">
            <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between"></div>

            <div className="relative bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="min-h-[115px] max-h-[115px] resize-none overflow-y-auto px-4 pt-4 pb-14 border-0 rounded-xl bg-transparent text-slate-700 text-sm placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                disabled={isLoading}
              />

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-end">
                <div className="flex items-center hidden">
                  {/* Chat Type Buttons */}
                  {access?.workspaces[0] !== selectedWorkspace?.id && (
                    <div className="hidden sm:flex items-center">
                      {chatTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSelectedChatType(type.id)}
                          title={type.description}
                          className={`h-8 w-8 rounded-lg mr-2 flex items-center justify-center transition-all duration-200 ${
                            selectedChatType === type.id
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <type.icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Mobile Dropdown */}
                  <div className="sm:hidden relative">
                    <button
                      onClick={() => setShowChatTypeDropdown(!showChatTypeDropdown)}
                      className="h-8 w-12 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-1">
                        {selectedChatTypeData && <selectedChatTypeData.icon className="w-3 h-3" />}
                        {showChatTypeDropdown ? (
                          <ChevronDown className="w-2.5 h-2.5" />
                        ) : (
                          <ChevronUp className="w-2.5 h-2.5" />
                        )}
                      </div>
                    </button>

                    {showChatTypeDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[160px] overflow-hidden">
                        {chatTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => {
                              setSelectedChatType(type.id)
                              setShowChatTypeDropdown(false)
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors duration-200 ${
                              selectedChatType === type.id ? "bg-blue-50 text-blue-700" : "text-slate-700"
                            }`}
                          >
                            <type.icon className="w-4 h-4" />
                            <div className="text-left">
                              <div className="font-medium">{type.name}</div>
                              <div className="text-xs text-slate-500">{type.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {access?.workspaces[0] !== selectedWorkspace?.id && (
                    <>
                      <input type="file" id="chat-file-input" multiple hidden onChange={uploadFiles} />
                      <div className="hidden">
                        <button
                          onClick={() => document.getElementById("chat-file-input")?.click()}
                          className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}

                  {showWorkspaceSelector && (
                    <div className="hidden">
                      <WorkspaceSelector />
                    </div>
                  )}

                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      !input.trim() || isLoading
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500 flex flex-col sm:flex-row justify-end gap-1">
            <span className="hidden md:block">Press Enter to send, Shift+Enter for newline</span>
          </div>
        </div>

        {showAlert && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Action Required</h3>
                    <p className="text-sm text-slate-500">Please complete the following step</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  className="flex-shrink-0 w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors duration-200"
                  aria-label="Close alert"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <p className="text-slate-700 leading-relaxed">{alertMessage}</p>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Auto-closing</span>
                  <span>3s</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                    style={{
                      animation: "shrink 3s linear forwards",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
