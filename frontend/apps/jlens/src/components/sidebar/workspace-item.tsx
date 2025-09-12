import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"
import { AtomicButton } from "@ui/components/atomic/atoms/button/button";
import {
  Trash2,
  MessageSquare,
  FolderOpen,
  Folder,
  ChevronRight,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ui/components/ui/dialog"
import { AtomicDropdown } from "@ui/components/atomic/molecules/dropdown-menu/dropdown-menu";
import { useDeleteConversation } from "../../store/layout/conversations/hooks";
import { AtomicModal } from "@ui/components/atomic/atoms/modal/modal";
import { useDeleteWorkspace } from "../../store/layout/workspace/hooks";
import { useUpdateWorkspace } from "../../store/layout/workspace/hooks";
import { useConversationContext } from "../../context/ConversationContext";
import { Input } from "@ui/components/ui/input"
import { Label } from "@ui/components/ui/label"

interface Workspace {
  id: string;
  name: string;
  isExpanded: boolean;
  pre_prompt?: string;
  chats: { name: string; id: string }[];
}

interface WorkspaceItemProps {
  workspace: Workspace;
  isSelected: boolean;
  selectedChat: string;
  onToggle: () => void;
  onSelectChat: (chat: {
    name: string;
    id: string;
    workspaceName: string;
  }) => void;
  onAddChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteWorkspace: (workspaceName: string) => void;
}

export function WorkspaceItem({
  workspace,
  isSelected,
  selectedChat,
  onToggle,
  onSelectChat,
  onDeleteChat,
}: WorkspaceItemProps) {
  const navigate = useNavigate();
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pre_prompt, setpre_prompt] = useState(workspace.pre_prompt || "");
  const [editpre_promptModalOpen, setEditpre_promptModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatTitle, setSelectedChatTitle] = useState<string | null>(
    null
  );
  const [workspaceDeleteModalOpen, setWorkspaceDeleteModalOpen] =
    useState(false);

  const { setSelectedConversation } = useConversationContext();

  const deleteConversation = useDeleteConversation();

  const deleteWorkspace = useDeleteWorkspace();
  const updatePrePrompt = useUpdateWorkspace();

  const confirmWorkspaceDelete = (workspaceId: string) => {
    deleteWorkspace.mutate(workspaceId, {
      onSuccess: () => {
        console.log("Workspace deleted successfully:", workspaceId);
        setWorkspaceDeleteModalOpen(false);
        navigate("chat", { replace: true });
        setSelectedConversation(null);
        toast.success('Workspace Deleted Successfully')
      },
      onError: (error) => {
        console.error("Error deleting workspace:", error);
      },
    });
  };

  const confirmDelete = () => {
    if (selectedChatId) {
      deleteConversation.mutate(selectedChatId, {
        onSuccess: () => {
          onDeleteChat(selectedChatId);
          setModalOpen(false);
          toast.success('Conversation Deleted Successfully')
          navigate("chat", { replace: true });
          setSelectedConversation(null);
        },
      });
    }
  };

  const handleUpdatePrePrompt = () => {
    updatePrePrompt.mutate(
      { workspaceId: workspace.id, updatedData: pre_prompt },
      {
        onSuccess: () => {
          console.log("Prompt updated");
          setEditpre_promptModalOpen(false);
          // Optionally trigger refetch or notify parent
        },
        onError: (err) => {
          console.error("Failed to update pre_prompt", err);
        },
      }
    );
  };


  return (
    <div className="space-y-1 w-full min-w-0">
      {/* Workspace Header */}
      <div
        className={`
          flex items-center justify-between group w-full min-w-0 rounded-md
          transition-colors
          ${isSelected ? "bg-gray-200 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-900"}
        `}
      >
        <div className="flex items-center gap-2 ps-2 pe-0 py-1">
          <ChevronRight
            onClick={onToggle}
            className={`
            w-4 h-4 text-gray-500 dark:text-gray-400 
            transition-transform flex-shrink-0
            ${workspace.isExpanded ? "rotate-90" : ""}
          `}
          />
        </div>
        <AtomicButton
          variant="ghost"
          text={workspace.name}
          onClick={onToggle}
          iconPosition="left"
          icon={
            workspace.isExpanded ? (
              <FolderOpen className="w-3 h-3 mr-2 text-[#0971EB] dark:text-white flex-shrink-0" />
            ) : (
              <Folder className="w-3 h-3 mr-2 text-[#0971EB] dark:text-white flex-shrink-0" />
            )
          }
          iconWrapperClass="flex items-center bg-transparent p-0 m-0 flex-shrink-0"
          textWrapperClass="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1 text-left "
          className={`
            justify-start h-7 px-2 py-2 gap-0 
            rounded-md flex-1 min-w-0
            hover:bg-transparent
          `}
        />
        <div className="flex items-center p-2">
          <AtomicDropdown
            className="w-36 px-1 py-1 flex flex-col dark:bg-gray-800 dark:border-gray-700 bg-white border border-gray-200 shadow-md rounded-md"
            trigger={
              <AtomicButton
                variant="ghost"
                size="icon"
                icon={
                  <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                }
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              />
            }
            items={[
              {
                label: (
                  <div className="flex w-full items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </div>
                ),
                value: "edit",
                onSelect: () => {
                  setpre_prompt(pre_prompt || ""); 
                  setEditpre_promptModalOpen(true);          
                },
              },
              {
                label: (
                  <div className="flex w-full items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-md text-sm text-red-600 dark:text-red-400">
                    <Trash2 className="w-4 h-4 text-red" />
                    <span>Delete</span>
                  </div>
                ),
                value: "delete",
                onSelect: () => setWorkspaceDeleteModalOpen(true),
              },
            ]}
          />
        </div>
      </div>

      {/* Chat Items */}
      {workspace.isExpanded && (
        <div className="ml-4 space-y-1">
          {workspace.chats.map((chat) => (
            <div
              key={chat.name}
              className="flex items-center justify-between group w-full min-w-0"
              onMouseEnter={() => setHoveredChat(chat.name)}
              onMouseLeave={() => setHoveredChat(null)}
            >
              <div
                className={`
                  flex items-center px-1 py-1 rounded-md cursor-pointer
                  hover:bg-gray-50 dark:hover:bg-gray-700 
                  flex-1 min-w-0
                  ${selectedChat === chat.name ? "bg-gray-100 dark:bg-gray-700" : ""}
                `}
                onClick={() =>
                  onSelectChat({ ...chat, workspaceName: workspace.name })
                }
              >
                <MessageSquare className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                <span
                  className={`
                    text-xs font-medium truncate flex-1
                    ${
                      selectedChat === chat.name
                        ? "text-[#0971EB] dark:text-white"
                        : "text-gray-600 dark:text-gray-400"
                    }
                  `}
                  title={chat.name}
                >
                  {chat.name}
                </span>
              </div>
              {hoveredChat === chat.name && (
                <AtomicButton
                  variant="ghost"
                  size="sm"
                  text=""
                  icon={<Trash2 className="w-3 h-3 text-secondary" />}
                  onClick={() => {
                    setSelectedChatId(chat.id);
                    setSelectedChatTitle(chat.name);
                    setModalOpen(true);
                  }}
                  className="
                    h-5 w-5 p-0 ml-1
                    hover:bg-secondary 
                    rounded-md flex-shrink-0
                  "
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Delete Confirmation */}
      <AtomicModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={`Delete Conversation: ${selectedChatTitle ?? ""}`}
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        variant="destructive"
        iconType="destructive"
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <AtomicModal
        open={workspaceDeleteModalOpen}
        onOpenChange={setWorkspaceDeleteModalOpen}
        title={`Delete Workspace: ${workspace.name}`}
        description="Are you sure you want to delete this workspace and all its conversations? This action cannot be undone."
        variant="destructive"
        iconType="destructive"
        onConfirm={() => confirmWorkspaceDelete(workspace.id)}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <Dialog open={editpre_promptModalOpen} onOpenChange={setEditpre_promptModalOpen}>
        <DialogContent className="dark:bg-gray-900 dark:text-white">
          <DialogHeader>
            <DialogTitle>Edit Prep Prompt</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-pre-prompt">Pre-Prompt</Label>
              <Input
                id="edit-pre-prompt"
                value={pre_prompt}
                onChange={(e) => setpre_prompt(e.target.value)}
                placeholder="Enter pre prompt"
                className="mt-1 border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>

          <DialogFooter>
            <AtomicButton
              onClick={handleUpdatePrePrompt}
              text="Save"
              className="w-full sm:w-auto text-white hover:bg-primary-foreground"
              textWrapperClass="bg-transparent"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    
  );
}
