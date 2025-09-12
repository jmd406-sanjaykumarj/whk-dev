// import { Button } from "@ui/components/ui/button";
// import { Moon } from "lucide-react"

interface LogoSectionProps {
  isCollapsed?: boolean
}

export function LogoSection({ isCollapsed = false }: LogoSectionProps) {
  if (isCollapsed) {
    return (
      // <div
      //   className="
      //   w-8 h-8 sm:w-10 sm:h-10 
      //   bg-gradient-to-br mt-2 sm:mt-4 
      //   ml-2 sm:ml-3 
      //   from-[#0971EB] to-[#5B4FCF] 
      //   rounded-md flex items-center justify-center 
      //   shadow-lg mb-2 sm:mb-4
      // "
      // >
      //   <span className="text-white font-bold text-sm sm:text-lg">J</span>
      // </div>
      <img
        src="/icon_white.svg"
        alt="Logo"
        className="
          w-8 h-8 sm:w-10 sm:h-10 
          mt-2 sm:mt-4 
          ml-2 sm:ml-3 
          rounded-md 
          mb-2 sm:mb-4 
          flex-shrink-0
        "
      />
    )
  }

  return (
    <div
      className="
    p-3 sm:p-4 
    dark:border-gray-700
    min-h-[60px] sm:min-h-[72px] 
  "
    >
        <div className="flex items-center justify-center flex-1 min-w-0">
          <div className="flex items-center justify-center gap-2">
            <img
              src="/icon_white.svg"
              alt="Logo"
              className="
            w-8 h-8 sm:w-10 sm:h-10 
            rounded-md 
            flex-shrink-0
          "
            />
            <h1
              className="
            font-worksans 
            md:text-lg  
            font-semibold
            bg-[#0F2C58]
            text-transparent bg-clip-text
            truncate
          "
            >
              Lincoln
            </h1>
          </div>
        </div>
        {/* <Button
          variant="ghost"
          size="sm"
          className="
            h-6 w-6 sm:h-8 sm:w-8 
            p-0 hover:bg-gray-50 dark:hover:bg-gray-700 
            rounded-md flex-shrink-0
          "
        >
          <Moon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
        </Button> */}
      </div>
  )
}