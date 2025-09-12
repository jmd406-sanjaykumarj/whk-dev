import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select"
import { useModelChatContext } from "../../context/ModelContext"

export function ModelSelector() {
  const { allowedModels, selectedModel, setSelectedModel } = useModelChatContext()

  const selected = allowedModels.find((m: any) => m.name === selectedModel)

  if (!allowedModels.length) return <div className="p-2 text-sm">No models available</div>

  return (
    <Select value={selectedModel} onValueChange={setSelectedModel}>
      <SelectTrigger className="w-32 sm:w-36 md:w-40 h-7 sm:h-8 border text-[#0971EB] dark:text-white text-xs sm:text-sm bg-gray-100 dark:bg-gray-800 rounded-md">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <img
            src={selected?.logo || "/placeholder.svg"}
            alt={selected?.name}
            className="w-3 h-3 sm:w-4 sm:h-4"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
          <SelectValue placeholder="Model">
            <span className="truncate">{selectedModel}</span>
          </SelectValue>
        </div>
      </SelectTrigger>

      <SelectContent className="dark:bg-gray-800 dark:text-white min-w-[200px]">
        {allowedModels.map((model) => (
          <SelectItem key={model.name} value={model.name} className="flex items-center">
            <img
              src={model.logo}
              alt={model.name}
              className="w-4 h-4"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <span className="ml-2">{model.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}