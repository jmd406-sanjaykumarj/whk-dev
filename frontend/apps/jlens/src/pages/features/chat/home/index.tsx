import { useLocation, useNavigate } from "react-router-dom"
import { useState, useCallback, useEffect } from "react"
import { ChatInput } from "../../../../components/chat-area"
import { ChatMessages } from "../chat-area/chat-messages"
import {
  useConversationMessages,
  useSendMessage,
  useCreateConversation,
} from "../../../../store/layout/conversations/hooks"
import { useConversationContext } from "../../../../context/ConversationContext"
import { useWorkspaceContext } from "../../../../context/WorkspaceContext"
import { useModelChatContext } from "../../../../context/ModelContext"
import { useUploadWorkspaceFiles } from "../../../../store/layout/workspace/hooks"
import CitationSidebar from "../chat-area/citations"
import { useUserContext } from "../../../../context/UserContext"
// import { useMemo } from 'react'

interface Message {
  id: string
  role: "user" | "assistant" | "tool"
  content: string
  timestamp: Date
}

const ChatContainer = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const feature = pathname.split("/")[2]
  const workspaceId = pathname.split("/")[3]
  const conversationId = pathname.split("/")[4]

  const [input, setInput] = useState("")
  const [pendingMessages, setPendingMessages] = useState<Message[]>([])
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [isCitationSidebarOpen, setIsCitationSidebarOpen] = useState(false)
  const [citationContent, setCitationContent] = useState("")

  const { selectedWorkspace } = useWorkspaceContext()
  const { selectedModel, selectedChatType } = useModelChatContext()
  const { setSelectedConversation } = useConversationContext()

  const { mutate: createConversation } = useCreateConversation()
  const { mutateAsync: sendMessage, isPending } = useSendMessage()
  const { data: serverMessages, refetch: refetchMessages } = useConversationMessages(conversationId)
  const { mutateAsync: uploadFilesMutation } = useUploadWorkspaceFiles()
  const { access } = useUserContext();
  const { user } = useUserContext()


  console.log(user)
  
  useEffect(() => {
    const autoSendMessage = location.state?.autoSendMessage
    if (autoSendMessage && conversationId && !isPending) {
      navigate(location.pathname, { replace: true, state: {} })

      setTimeout(() => {
        handleSend(autoSendMessage)
      }, 100)
    }
  }, [conversationId, location.state?.autoSendMessage])

  useEffect(() => {
    if (citationContent) {
      setIsCitationSidebarOpen(true)
    }
  }, [citationContent])

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    try {
      await uploadFilesMutation({ workspaceId: selectedWorkspace?.id || "", files })
      console.log("Files uploaded successfully")
    } catch (error) {
      console.error("File upload failed", error)
    }
  }

  const handleCreateConversation = async (text: string): Promise<string | null> => {
    if (isCreatingConversation) return null

    setIsCreatingConversation(true)

    const payload = {
      title: text.slice(0, 30) + (text.length > 30 ? "..." : ""), // Use first part of message as title
      workspace_id: selectedWorkspace?.id || "",
      component_type: "chat",
    }

    try {
      const res = await new Promise<any>((resolve, reject) => {
        createConversation(payload, {
          onSuccess: resolve,
          onError: reject,
        })
      })

      if (res?.id) {
        setSelectedConversation({
          id: res.id,
          title: res.title,
          workspace_id: res.workspace_id,
        })

        navigate(`/app/${feature}/${selectedWorkspace?.id}/${res.id}`, {
          replace: true,
          state: {
            autoSendMessage: text,
          },
        })

        return res.id
      }
    } catch (err) {
      console.error("Conversation creation failed:", err)
    } finally {
      setIsCreatingConversation(false)
    }

    return null
  }

  const handleSend = useCallback(
    async (text: string) => {
      if (!selectedWorkspace || !feature || !text.trim()) return

      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      }

      if (!conversationId) {
        await handleCreateConversation(text.trim())
        return
      }

      setPendingMessages((prev) => [...prev, tempUserMessage])

      const chat_type_payload =  access?.workspaces[0] === selectedWorkspace.id ? "document" : selectedChatType

      const payload = {
        conversation_id: conversationId,
        workspace_id: workspaceId,
        content: text.trim(),
        role: "user" as const,
        model_type: selectedModel,
        chat_type: chat_type_payload,
        component_type: "chat",
        input_tokens: 0,
        output_tokens: 0,
      }

      try {
        console.log(conversationId)
       await sendMessage(payload)
        setPendingMessages([])
        refetchMessages()
      } catch (err) {
        console.error("Send failed:", err)
        setPendingMessages((prev) => prev.filter((pm) => pm.id !== tempUserMessage.id))
      }
    },
    [conversationId, workspaceId, selectedWorkspace, selectedModel, selectedChatType, sendMessage, refetchMessages],
  )

const messages: Message[] = Array.isArray(serverMessages)
  ? serverMessages.map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.created_at),
    }))
  : []
  console.log("Server Messagesssss......",messages)
  console.log("Pending Messages:", pendingMessages);

  const filteredPendingMessages = pendingMessages.filter((pm) => {
  return !messages.some((m) => {
    console.log("Server message timestamp:", m.timestamp, "Pending message timestamp:", pm.timestamp);
    const isSameContent = m.content === pm.content
    const isSameRole = m.role === pm.role
    const isTimeClose = Math.abs(m.timestamp.getTime() - pm.timestamp.getTime()) < 10000 // 10s window
    return isSameContent && isSameRole && isTimeClose
  })
})
  const displayedMessages = [...messages, ...filteredPendingMessages].sort(
  (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
)

  console.log("Displayed messages",displayedMessages)

  const isInChatView = !!conversationId
  const isLoading = isPending || isCreatingConversation

  // const randomImageIndex = useMemo(() => Math.floor(Math.random() * 5) + 1, []);
  // const backgroundImage = `/image${randomImageIndex}.png`;


  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        {/* <div className="flex flex-col justify-center h-full bg-gray-100 dark:bg-gray-900 flex-1"> */}
        <div
          className="flex flex-col justify-center h-full bg-cover bg-center dark:bg-gray-900 flex-1"
          // style={{ backgroundColor: '#F7FDFF' }}        
          >
          {isInChatView ? (
            <>
              <ChatMessages
                messages={displayedMessages}
                isLoading={isLoading}
                setCitationContent={setCitationContent}
              />
              <ChatInput
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                messagesLength={displayedMessages.length}
                conversationId={conversationId}
                onSend={handleSend}
              />
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-2 text-center text-primary">Hi, I'm Lincoln,</h1>
              <p className="text-muted-foreground mb-4 text-center">
              your Customer Contract Chatbot. What would you like to know?
              </p>
              {/* <div className="w-full max-w-[52rem]"> */}
                <ChatInput
                  input={input}
                  setInput={setInput}
                  isLoading={isLoading}
                  messagesLength={0}
                  onSend={handleSend}
                  showWorkspaceSelector={true}
                  uploadFiles={uploadFiles}
                />
              {/* </div> */}
            </>
          )}
        </div>
      </div>

      {/* Citation Sidebar */}
      {isCitationSidebarOpen && (
        <div className="w-80 border-l border-gray-300 dark:border-gray-700">
          <CitationSidebar
            content={citationContent}
            onClose={() => {
              setIsCitationSidebarOpen(false)
              setCitationContent("")
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ChatContainer