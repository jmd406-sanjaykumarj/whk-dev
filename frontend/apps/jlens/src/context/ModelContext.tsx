import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useUserContext } from "./UserContext"
import { Zap, FileText, Layers } from "lucide-react"

const GPT_LOGO = "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg"

export interface Model {
  name: string
  logo: string
  source?: string
}

const ALL_MODELS: Model[] = [
  { name: "gpt-4o-mini", logo: GPT_LOGO, source: "openai" },
  { name: "gpt-4o", logo: GPT_LOGO, source: "openai" },
  { name: "GPT-3.5", logo: GPT_LOGO, source: "openai" },
  { name: "Claude", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/anthropic.svg", source: "anthropic" },
  { name: "Gemini", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg", source: "google" },
]

export const chatTypes = [
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

interface ModelChatContextType {
  allowedModels: Model[]
  selectedModel: string
  setSelectedModel: (modelName: string) => void
  selectedChatType: string
  setSelectedChatType: (type: string) => void
}

const ModelChatContext = createContext<ModelChatContextType | undefined>(undefined)

export const ModelChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { access } = useUserContext()
  const [allowedModels, setAllowedModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedChatType, setSelectedChatType] = useState(
    () => sessionStorage.getItem("chatType") || "standalone"
  )

  useEffect(() => {
    const modelAccess: string[] = access?.models ?? []

    const filtered = ALL_MODELS.filter((model) =>
      modelAccess.includes(model.name)
    ).map((model) => ({
      ...model,
      logo: model.source === "openai" ? GPT_LOGO : model.logo,
    }))

    setAllowedModels(filtered)

    if (!filtered.some((m) => m.name === selectedModel)) {
      setSelectedModel(filtered[0]?.name ?? "")
    }
  }, [access])

  useEffect(() => {
    sessionStorage.setItem("chatType", selectedChatType)
  }, [selectedChatType])

  const value = useMemo(() => ({
    allowedModels,
    selectedModel,
    setSelectedModel,
    selectedChatType,
    setSelectedChatType,
  }), [allowedModels, selectedModel, selectedChatType])

  return (
    <ModelChatContext.Provider value={value}>
      {children}
    </ModelChatContext.Provider>
  )
}

export const useModelChatContext = () => {
  const ctx = useContext(ModelChatContext)
  if (!ctx) throw new Error("useModelChatContext must be used within a ModelChatProvider")
  return ctx
}
