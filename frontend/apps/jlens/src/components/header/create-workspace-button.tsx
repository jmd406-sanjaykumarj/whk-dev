import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { AtomicButton } from "@ui/components/atomic/atoms/button/button"
import { useCreateWorkspace } from "../../store/layout/workspace/hooks"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@ui/components/ui/dialog"
import { Input } from "@ui/components/ui/input"
import { Label } from "@ui/components/ui/label"

type Workspace = { id: string; name: string }

interface CreateWorkspaceButtonProps {
  onWorkspaceSelect?: (workspace: Workspace) => void
}

export function CreateWorkspaceButton({ onWorkspaceSelect }: CreateWorkspaceButtonProps) {
  const { mutateAsync } = useCreateWorkspace()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [preprompt, setPreprompt] = useState("You are an AI assistant that helps people find information.")
  const [isPrivate, setIsPrivate] = useState(true)

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await mutateAsync({ name, description, preprompt, is_private: isPrivate })
      if (onWorkspaceSelect && res?.id && res?.name) {
        onWorkspaceSelect({ id: res.id, name: res.name })
      }
      toast.success("Workspace created")
      setOpen(false)
      setName("")
      setDescription("")
      setPreprompt("")
      setIsPrivate(true)
    } catch (error) {
      console.error("Error creating workspace:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
<DialogTrigger asChild>
  <div className="relative overflow-hidden">
    <AtomicButton
      disabled={loading}
      variant="outline"
      size="sm"
      text="Create Workspace"
      icon={
        <Plus className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ml-1 sm:ml-2 text-[#0971EB] group-hover:text-white dark:text-white dark:group-hover:text-gray-900" />
      }
      iconPosition="left"
      iconWrapperClass="bg-transparent p-0 border-none"
      textWrapperClass="ml-1 whitespace-nowrap overflow-hidden text-[#0971EB] group-hover:text-white dark:text-white dark:group-hover:text-gray-900 text-xs sm:text-sm "
      className="text-[#0971EB] hover:bg-[#0971EB] hover:text-white dark:border-white dark:text-white dark:hover:bg-[#0971EB] dark:hover:text-gray-900 rounded-md bg-transparent h-7 sm:h-8 transition-all duration-200 gap-0 p-0"
    />
  </div>
</DialogTrigger>

      <DialogContent className="dark:bg-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Team"
              className="mt-1 border border-gray-300 dark:border-gray-600 "
            />
          </div>

          <div>
            <Label htmlFor="workspace-description">Description</Label>
            <Input
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="mt-1 border border-gray-300 dark:border-gray-600 "
            />
          </div>
          <div>
            <Label htmlFor="workspace-preprompt">Pre-Prompt</Label>
            <Input
              id="workspace-preprompt"
              value={preprompt}
              onChange={(e) => setPreprompt(e.target.value)}
              placeholder="Optional"
              className="mt-1 border border-gray-300 dark:border-gray-600 "
            />
          </div>
        </div>

        <DialogFooter>
          <AtomicButton
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            text={loading ? "Creating..." : "Create"}
            className="w-full sm:w-auto text-white hover:bg-primary-foreground" 
            textWrapperClass="bg-transparent"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}