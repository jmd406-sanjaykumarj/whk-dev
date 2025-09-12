
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkspaces, createWorkspace, getSharedWorkspaces, deleteWorkspace, uploadWorkspaceFiles, updateWorkspace } from './action'
import type { WorkspacePayload } from './action'
import type { Conversation } from "../conversations/hooks";

export const useWorkspaces = () =>
  useQuery({
    queryKey: ['workspaces'],
    queryFn: getWorkspaces,
  })

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: WorkspacePayload) => createWorkspace(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  })
}

export const useSharedWorkspaces = (workspaceId: string) =>
  useQuery({
    queryKey: ['sharedWorkspaces', workspaceId],
    queryFn: () => getSharedWorkspaces(workspaceId),
    enabled: !!workspaceId,
  })

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: (deletedWorkspaceId: string) => {

      queryClient.setQueryData<Conversation[]>(["allConversations"], (old = []) =>
        old.filter((conv) => conv.workspace_id !== deletedWorkspaceId)
      );

      queryClient.removeQueries({ queryKey: ["conversations", deletedWorkspaceId] });

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      console.log("Workspace deleted successfully:", deletedWorkspaceId);
    },
    onError: (err) => {
      console.error("Failed to delete workspace:", err);
    },
  });
};

export const useUploadWorkspaceFiles = () => {
  return useMutation({
    mutationFn: uploadWorkspaceFiles
  })
}

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      updatedData,
    }: {
      workspaceId: string;
      updatedData ?: string;
    }) => updateWorkspace(workspaceId, updatedData),

    onSuccess: ({ workspaceId, updatedData }) => {
      queryClient.setQueryData<any[]>(["workspaces"], (old = []) =>
        old.map((ws) =>
          ws.id === workspaceId ? { ...ws, updatedData } : ws
        )
      );

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      console.log("Workspace updated successfully:", workspaceId);
    },

    onError: (err) => {
      console.error("Failed to update workspace:", err);
    },
  });
};