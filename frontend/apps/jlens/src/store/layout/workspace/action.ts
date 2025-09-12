import { axiosInstance } from '../../axios'

export interface WorkspacePayload {
  name: string
  description: string
  preprompt?: string
  is_private: boolean
}

export const getWorkspaces = async () => {
  const res = await axiosInstance.get('/workspaces/')
  return res.data
}

export const createWorkspace = async (payload: WorkspacePayload) => {
  const res = await axiosInstance.post('/workspaces/', payload)
  return res.data
}

export const getSharedWorkspaces = async (workspaceId: string) => {
  const res = await axiosInstance.get(`/workspaces/${workspaceId}`)
  return res.data
}

export const deleteWorkspace = async (workspaceId: string) => {
  await axiosInstance.delete(`/workspaces/${workspaceId}/`)
  return workspaceId
}

export const uploadWorkspaceFiles = async ({
  workspaceId,
  files
}: {
  workspaceId: string
  files: FileList
}): Promise<any> => {
  const formData = new FormData()
  formData.append("workspaceId", workspaceId)

  Array.from(files).forEach((file) => {
    formData.append("files", file)
  })

  const response = await axiosInstance.post(`/workspaces/upload-file`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })

  return response.data
}

export const updateWorkspace = async (workspaceId: string, updatedData?: string ) => {
  console.log("Updating workspace:", workspaceId, updatedData);
  
  await axiosInstance.put(
    `/workspaces/${workspaceId}/pre-prompt`,
    { pre_prompt: updatedData },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  console.log("Workspace updated successfully:", workspaceId, updatedData);
  
  return { workspaceId, updatedData };
};