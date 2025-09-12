import { Button } from "@ui/components/ui/button"
import { Hash, X } from "lucide-react"

interface ChatItemProps {
  chat: { name: string }
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
}

export function ChatItem({ chat, isSelected, onClick, onDelete }: ChatItemProps) {
  return (
    <div className="flex items-center group">
      <Button
        variant="ghost"
        className={`flex-1 justify-start h-auto p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md ${
          isSelected ? "bg-[#0971EB] text-white hover:bg-[#0971EB] dark:bg-[#0971EB]" : ""
        }`}
        onClick={onClick}
      >
        <Hash className="w-3 h-3 mr-2" />
        <span className="text-xs font-medium truncate">{chat.name}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={onDelete}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
}