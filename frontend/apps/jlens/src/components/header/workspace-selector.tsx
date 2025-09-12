import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select";
import { useEffect } from "react";

interface Workspace {
  id: string;
  name: string;
}

interface WorkspaceSelectorProps {
  selectedWorkspace: string;
  onWorkspaceSelect: (workspace: Workspace) => void;
  workspaces: Workspace[];
  isLoading: boolean;
}
const SESSION_KEY = "selectedWorkspaceId";

export function WorkspaceSelector({
  selectedWorkspace,
  onWorkspaceSelect,
  workspaces,
  isLoading,
}: WorkspaceSelectorProps) {
  // Load from sessionStorage when workspaces change
  useEffect(() => {
    if (!selectedWorkspace) {
      const storedId = sessionStorage.getItem(SESSION_KEY);
      const selected = workspaces.find((w) => w.id === storedId);
      if (selected) {
        onWorkspaceSelect(selected);
      }
    }
  }, );

  return (
    <Select
      value={selectedWorkspace}
      onValueChange={(id) => {
        const selected = workspaces.find((w) => w.id === id);
        if (selected) {
          sessionStorage.setItem(SESSION_KEY, id); 
          onWorkspaceSelect(selected);
        }
      }}
      disabled={isLoading}
    >
      <SelectTrigger className="w-32 sm:w-36 md:w-40 h-7 sm:h-8 border border-gray-300 text-[#0971EB] dark:border-white dark:text-white rounded-md text-xs sm:text-sm bg-gray-100 hover:shadow-md focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-gray-300">
        <SelectValue placeholder="Select Workspace" />
      </SelectTrigger>
      <SelectContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700 min-w-[180px] max-h-64 overflow-y-auto">
        {workspaces.length === 0 ? (
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
            No workspaces found.
          </div>
        ) : (
          workspaces.map((workspace) => (
            <SelectItem
              className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              key={workspace.id}
              value={workspace.id}
            >
              <div className="truncate">{workspace.name}</div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
