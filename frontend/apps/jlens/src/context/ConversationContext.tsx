import React, { createContext, useContext, useMemo, useState, useEffect } from "react"
import {
  useAllConversations,
  useConversationMessages,
  useSendMessage,
  useDeleteConversation,
} from "../store/layout/conversations/hooks"
import { useLocation } from "react-router-dom"

type Conversation = {
  id: string
  title: string
  workspace_id: string
}

type ConversationContextType = {
  conversations: Conversation[] | undefined
  isLoading: boolean
  selectedConversation: Conversation | null
  setSelectedConversation: (conv: Conversation | null) => void
  messages: any[] | undefined
  setMessages: any
  isMessagesLoading: boolean
  sendMessage: ReturnType<typeof useSendMessage>["mutate"]
  deleteConversation: ReturnType<typeof useDeleteConversation>["mutate"]
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: conversations, isLoading } = useAllConversations()

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const [messages, setMessages] = useState<any[]>([]);

  const {
    data: fetchedMessages,
    isLoading: isMessagesLoading,
  } = useConversationMessages(selectedConversation?.id || "");

  const location = useLocation();
  const conversationId = location.pathname.split("/").pop();

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  useEffect(() => {
    if (!conversationId || !conversations) return;

    const match = conversations.find((conv) => conv.id === conversationId);
    if (match) {
      setSelectedConversation(match);
    }
  }, [conversationId, conversations]);
  
  const sendMessageMutation = useSendMessage()
  const deleteConversationMutation = useDeleteConversation()

  const value = useMemo(
    () => ({
      conversations,
      isLoading,
      selectedConversation,
      setSelectedConversation,
      messages,
      setMessages,
      isMessagesLoading,
      sendMessage: sendMessageMutation.mutate,
      deleteConversation: deleteConversationMutation.mutate,
    }),
    [
      conversations,
      isLoading,
      selectedConversation,
      messages,
      isMessagesLoading,
      sendMessageMutation.mutate,
      deleteConversationMutation.mutate,
    ]
  )

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>
}

export const useConversationContext = () => {
  const context = useContext(ConversationContext)
  if (!context) {
    throw new Error("useConversationContext must be used within a ConversationProvider")
  }
  return context
}