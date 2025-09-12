import {
  PanelLeft,
  PanelLeftClose,
  // MoreHorizontal,
} from "lucide-react";
// import { ModelSelector } from "./model-selector";
// import { CreateWorkspaceButton } from "./create-workspace-button";
import { AtomicButton } from "@ui/components/atomic/atoms/button/button";
// import { Text, TextType } from "@ui/components/atomic/atoms/text/text";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@ui/components/ui/dropdown-menu";
// import { useWorkspaceContext } from "../../context/WorkspaceContext";
import { useConversationContext } from "../../context/ConversationContext";

interface HeaderProps {
  selectedChat: string;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({
  isCollapsed,
  onToggleSidebar,
}: HeaderProps) {

  // const { selectedWorkspace } = useWorkspaceContext()

  const { selectedConversation } = useConversationContext();

  console.log(selectedConversation, "selected convo")

  return (
    <div className="p-2 sm:p-3 bg-white w-full dark:bg-gray-800 border-gray-200 dark:border-gray-700 flex-shrink-0 sticky top-0 z-50 relative">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <AtomicButton
            variant="ghost"
            size="sm"
            text=""
            onClick={onToggleSidebar}
            icon={
              isCollapsed ? (
                <PanelLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )
            }
            iconWrapperClass="w-8 h-8 flex items-center justify-center rounded-md bg-transparent"
            className="p-0 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
