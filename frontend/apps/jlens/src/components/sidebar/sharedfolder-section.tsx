import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AtomicButton } from "@ui/components/atomic/atoms/button/button";
import { Text, TextType } from "@ui/components/atomic/atoms/text/text";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useDeleteConversation } from "../../store/layout/conversations/hooks";
import { AtomicModal } from "@ui/components/atomic/atoms/modal/modal";
import { toast } from "sonner";
import { useConversationContext } from "../../context/ConversationContext";

interface Folder {
  name: string;
  isExpanded: boolean;
  chats: { name: string; id: string }[];
}

interface SharedFoldersSectionProps {
  folders: Folder[];
  onToggleFolder: (folderName: string) => void;
  onChatSelect: (
    chatName: string,
    workspaceName: string,
    chatId: string
  ) => void;
  isChatsCollapsed: boolean;
}

export function SharedFoldersSection({
  folders,
  isChatsCollapsed,
  onChatSelect,
}: SharedFoldersSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const pathAfterChat = pathSegments[pathSegments.length - 1];
  const navigate = useNavigate()
  const feature = location.pathname.split("/")[2]

  const deleteConversation = useDeleteConversation();
  const { setSelectedConversation } = useConversationContext();

  const confirmDelete = () => {
    if (selectedChatId) {
      deleteConversation.mutate(selectedChatId, {
        onSuccess: () => {
          toast.success("Conversation Deleted Successfully");
          setDeleteModalOpen(false);
          setSelectedConversation(null);
          navigate(`/app/${feature}`);
        },
        onError: () => {
          toast.error("Failed to delete conversation");
        },
      });
    }
  };

  return (
    <div
      className={`
        flex flex-col 
        ${isCollapsed ? "flex-shrink-0" : isChatsCollapsed ? "flex-1" : "flex-1"}
        min-h-0
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between font-bold p-2 sm:p-3 pb-1 sm:pb-2 flex-shrink-0">
        <Text
          type={TextType.paragraph}
          text="Recent Chats"
          className="text-xs sm:text-sm truncate"
        />
        <AtomicButton
          variant="ghost"
          size="sm"
          text=""
          icon={
            isCollapsed ? (
              <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronUp className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            )
          }
          iconWrapperClass="flex items-center justify-center w-5 h-5 bg-transparent rounded-md"
          className="p-0 m-0 w-5 h-5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex-shrink-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="px-2 sm:px-3 pb-2 sm:pb-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0 custom-scrollbar">
          <div className="space-y-1 pr-1">
            {folders?.map((folder) => (
              <div key={folder.name}>
                <div className="space-y-1 mt-1">
                  {folder.chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`
                        flex items-center justify-between px-1 py-1 rounded-md cursor-pointer min-w-0 w-full
                        hover:bg-gray-50 dark:hover:bg-gray-700
                        ${pathAfterChat === chat.id ? "bg-gray-100 dark:bg-gray-700" : ""}
                      `}
                      onMouseEnter={() => setHoveredChatId(chat.id)}
                      onMouseLeave={() => setHoveredChatId(null)}
                    >
                      <div
                        className="flex-1 min-w-0"
                        onClick={() =>
                          onChatSelect(chat.name, folder.name, chat.id)
                        }
                      >
                        <span
                          className={`
                            text-xs font-medium truncate flex-1
                            ${
                              pathAfterChat === chat.id
                                ? "text-[#0971EB] dark:text-white"
                                : "text-gray-600 dark:text-gray-400"
                            }
                          `}
                          title={chat.name}
                        >
                          {chat.name}
                        </span>
                      </div>

                      {hoveredChatId === chat.id && (
                        <AtomicButton
                          variant="ghost"
                          size="sm"
                          text=""
                          icon={<Trash2 className="w-3 h-3 text-secondary" />}
                          onClick={() => {
                            setSelectedChatId(chat.id);
                            setSelectedChatName(chat.name);
                            setDeleteModalOpen(true);
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AtomicModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title={`Delete Conversation: ${selectedChatName ?? ""}`}
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        variant="destructive"
        iconType="destructive"
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
