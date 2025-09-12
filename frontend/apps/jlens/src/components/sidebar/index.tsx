import { useState } from "react";
import { LogoSection } from "./logo-section";
import { FeaturesSection } from "./features";
// import { ChatsSection } from "./chat-section";
import { SharedFoldersSection } from "./sharedfolder-section";
import { ProfileSection } from "./profile-section";
import { useLocation, useNavigate } from "react-router-dom";
import { useAllConversations, useSharedWorkspaceConversations } from "../../store/layout/conversations/hooks";
import { useUserContext } from "../../context/UserContext";
import { useWorkspaceContext } from "../../context/WorkspaceContext";
// import { useConversationContext } from "../../context/ConversationContext"
interface Workspace {
  id: string;
  name: string;
  chats?: { name: string; id: string }[];
  isExpanded?: boolean;
}

interface SidebarProps {
  selectedChat: string;
  onWorkspaceSelect: (workspace: Workspace) => void;
  onChatSelect: (chat: string, workspace: Workspace) => void;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
  onViewChange: (view: "chat" | "ai-proposal" | "self-analytics") => void;
}

export function Sidebar({
  selectedChat,
  onChatSelect,
  isCollapsed,
  onToggleSidebar,
  onViewChange,
}: SidebarProps) {
  const { data: allConversations } = useAllConversations( );
  const conversations = Array.isArray(allConversations) ? allConversations : [];
  const { access } = useUserContext();
  const { data: allSharedWorkspacesConversations } =
    useSharedWorkspaceConversations(access?.workspaces[0] || "");
  const navigate = useNavigate();
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<
    Record<string, boolean>
  >({});

  const location = useLocation();
  const pathname = location.pathname;
  void selectedChat
  // const { user } = useUserContext()

  const feature = pathname.split("/")[2];

  const { sharedWorkspaces, selectedWorkspace, workspaces } = useWorkspaceContext();

  const handleWorkspaceToggle = (workspaceName: string) => {
    setExpandedWorkspaces((prev) => ({
      ...prev,
      [workspaceName]: !prev[workspaceName],
    }));
  };

  const mappedWorkspaces = workspaces?.map((w) => ({
    ...w,
    isExpanded: expandedWorkspaces[w.name] ?? false,
    chats: conversations
      .filter((c) => c.workspace_id === w.id)
      .map((c) => ({ name: c.title, id: c.id })),
  }));

  const mappedSharedWorkspaces = (sharedWorkspaces || []).map((w) => ({
    ...w,
    isExpanded: expandedWorkspaces[w.name] ?? false,
    chats: Array.isArray(allSharedWorkspacesConversations)
      ? allSharedWorkspacesConversations
          .filter((c) => c.workspace_id === w.id )
          .map((c) => ({ name: c.title, id: c.id }))
      : [],
  }));

  console.log("Mapped Workspaces:", mappedWorkspaces);
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onToggleSidebar();
  };
  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={`sm:hidden fixed inset-0 z-50 transition-transform duration-300 ${
          isCollapsed
            ? "translate-x-[-100%] pointer-events-none"
            : "translate-x-0 pointer-events-auto"
        }`}
      >
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={handleBackdropClick}
        />
        <div className="relative w-80 bg-background dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <LogoSection isCollapsed={false} />
          <FeaturesSection onViewChange={onViewChange} isCollapsed={false} />
          {/* <ChatsSection
            workspaces={mappedWorkspaces ?? []}
            selectedWorkspace={selectedWorkspace?.name || ""}
            selectedChat={selectedChat}
            onWorkspaceToggle={handleWorkspaceToggle}
            onChatSelect={(chatName, workspaceName) => {
              const found = workspaces?.find((w) => w.name === workspaceName);
              if (found) onChatSelect(chatName, found);
            }}
            onAddChat={() => {}}
            onDeleteChat={() => {}}
            isSharedFoldersCollapsed={false}
          /> */}
          <SharedFoldersSection
            folders={mappedSharedWorkspaces}
            onToggleFolder={handleWorkspaceToggle}
            onChatSelect={(chatName, workspaceName, chatId) => {
              const found = sharedWorkspaces?.find(
                (w) => w.name === workspaceName
              );
              if (found) {
                onChatSelect(chatName, found);
                navigate(`/app/${feature}/${selectedWorkspace?.id}/${chatId}`);
              }
            }}
            isChatsCollapsed={false}
          />
          <ProfileSection isCollapsed={false} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`
          hidden sm:flex 
          bg-background dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          flex-col h-screen relative 
          transition-all duration-300 ease-in-out 
          overflow-hidden top-0 sticky ${
          isCollapsed ? "w-12 md:w-16" : "w-56 md:w-56 lg:w-64 xl:w-64 2xl:w-64"
        }`}
      >
        <div className="flex-shrink-0">
          <LogoSection isCollapsed={isCollapsed} />
        </div>

        <div className="flex-shrink-0">
          <FeaturesSection
            onViewChange={onViewChange}
            isCollapsed={isCollapsed}
          />
        </div>

        <div className="flex-1 flex flex-col min-h-0 relative">
          <div
            className={`
              absolute inset-0 flex flex-col
              transition-all duration-500 ease-in-out
              ${isCollapsed ? "transform translate-x-[-100%] opacity-0" : "transform translate-x-0 opacity-100"}
            `}
          >
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* <ChatsSection
              workspaces={mappedWorkspaces || []}
              selectedWorkspace={selectedWorkspace?.name || ""}
              selectedChat={selectedChat}
              onWorkspaceToggle={handleWorkspaceToggle}
              onChatSelect={(chatName, workspaceName, chatId) => {
                const found = workspaces?.find((w) => w.name === workspaceName);
                if (found) {
                  onChatSelect(chatName, found);
                  navigate(`/app/${feature}/${found?.id}/${chatId}`); // Navigate to the chat
                }
              }}
              onAddChat={() => {}}
              onDeleteChat={() => {}}
              isSharedFoldersCollapsed={false}
            /> */}

            <SharedFoldersSection
            folders={mappedSharedWorkspaces}
            onToggleFolder={handleWorkspaceToggle}
            onChatSelect={(chatName, workspaceName, chatId) => {
              const found = sharedWorkspaces?.find(
                (w) => w.name === workspaceName
              );
              if (found) {
                onChatSelect(chatName, found);
                navigate(`/app/${feature}/${selectedWorkspace?.id}/${chatId}`);
              }
            }}
            isChatsCollapsed={false}
          />
          </div>
           <div className="flex-shrink-0">
              <ProfileSection isCollapsed={false} />
            </div>
            </div>
          <div
            className={`
              absolute inset-0 flex flex-col items-center justify-end pb-4
              transition-all duration-300 ease-in-out
              ${isCollapsed ? "opacity-100 translate-x-0 delay-150" : "opacity-0 -translate-x-4 pointer-events-none"}
            `}
          >
            <ProfileSection isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>
    </>
  );
}
