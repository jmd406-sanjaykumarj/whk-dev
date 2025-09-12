import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useWorkspaces, useSharedWorkspaces } from '../store/layout/workspace/hooks';
import { useUserContext } from './UserContext';
import { useLocation } from 'react-router-dom';

type Workspace = {
  id: string;
  name: string;
  description?: string;
  pre_prompt?: string;
  is_private?: boolean;
  [key: string]: any;
};

interface WorkspaceContextType {
  workspaces: Workspace[] | undefined;
  isLoading: boolean;
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  sharedWorkspaces: Workspace[] | undefined;
  refetchWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);
const workspaceID= import.meta.env.VITE_WORKSPACE_ID
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: workspaces, isLoading, refetch } = useWorkspaces();
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>({
    id: workspaceID,
    name: "WHK Contracts",
    description: "Contract related workspace",
  });

  const { access } = useUserContext();
  const { data: sharedWorkspaces } = useSharedWorkspaces(access?.workspaces[0] || '');

  const location = useLocation();
  const workspaceIdFromUrl = location.pathname.split('/')[3];

  useEffect(() => {
    if (!selectedWorkspace && workspaces && workspaceIdFromUrl) {
      const match = workspaces.find((w:Workspace) => w.id === workspaceIdFromUrl);
      if (match) {
        setSelectedWorkspace(match);
      }
    }
  }, [selectedWorkspace, workspaces, workspaceIdFromUrl]);

  const value = useMemo(
    () => ({
      workspaces,
      isLoading,
      selectedWorkspace,
      setSelectedWorkspace,
      sharedWorkspaces,
      refetchWorkspaces: refetch,
    }),
    [workspaces, isLoading, selectedWorkspace, sharedWorkspaces, refetch]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
};
