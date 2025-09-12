import { Button } from "@ui/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/ui/avatar"
import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUserContext } from "../../context/UserContext"
import { toast } from "sonner"
interface ProfileSectionProps {
  profileName?: string
  isCollapsed?: boolean
}

export function ProfileSection({ isCollapsed = false }: ProfileSectionProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStorage.clear()
    toast.info("Logged out successfully")
    navigate("/login")                
  }

  const { user } = useUserContext()

  if (isCollapsed) {
    return (
      <div className="mt-auto flex items-center justify-center p-1 sm:p-2">
        <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback className="bg-[#0971EB] text-white text-xs">{user?.name?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
        </Avatar>
      </div>
    )
  }

  return (
    <div
      className="
      p-2 sm:p-3 
      border-t border-gray-100 bg-background dark:border-gray-700 dark:bg-gray-800
      min-h-[50px] sm:min-h-[60px]
    "
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1">
          <Avatar className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
            <AvatarImage src="/placeholder.svg?height=24&width=24" />
            <AvatarFallback className="bg-[#0971EB] text-white text-xs">{user?.name?.[0].toUpperCase() ?? 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="
              text-xs sm:text-sm font-medium 
              text-gray-900 dark:text-gray-100 
              truncate
            "
            >{user?.name}
              
            </p>
          </div>
        </div>
        <div className="flex space-x-0.5 sm:space-x-1 flex-shrink-0">
          {/* <Button
            variant="ghost"
            size="sm"
            className="
              h-5 w-5 sm:h-6 sm:w-6 
              p-0 hover:bg-gray-100 dark:hover:bg-gray-700 
              rounded-md
            "
          >
            <Settings className="w-2 h-2 sm:w-3 sm:h-3 text-gray-600 dark:text-gray-400" />
          </Button> */}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="
              h-5 w-5 sm:h-6 sm:w-6 
              p-0 hover:bg-gray-100 dark:hover:bg-gray-700 
              rounded-md text-secondary hover:text-secondary
            "
          >
            <LogOut className="w-2 h-2 sm:w-3 sm:h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
