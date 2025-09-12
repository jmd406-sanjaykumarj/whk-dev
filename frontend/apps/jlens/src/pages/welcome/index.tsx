import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { UserProvider, useUserContext } from "../../context/UserContext";
import { WorkspaceProvider } from "../../context/WorkspaceContext";
import { ModelChatProvider } from "../../context/ModelContext";
import { jwtDecode } from "jwt-decode";
import { ConversationProvider } from "../../context/ConversationContext";
import { useWorkspaceContext } from "../../context/WorkspaceContext";

export interface Workspace {
  id: string;
  name: string;
  chats?: { name: string; id: string }[];
  isExpanded?: boolean;
}
interface DecodedToken {
  user_name?: string;
  sub?: string;
}

const Dashboard = () => {
  const { workspaces } = useWorkspaceContext();
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const [selectedChat, setSelectedChat] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { setUserData } = useUserContext();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setUserData({
        name: decoded.user_name ?? "User",
        email: decoded.sub || "",
      });
    }
  }, []);

  // 👇 Redirect if path is exactly "/app"
  useEffect(() => {
    if (location.pathname === "/app") {
      navigate("/app/chat", { replace: true });
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setIsSidebarCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChatSelect = (chat: string, workspace: Workspace) => {
    setSelectedChat(chat);
    setSelectedWorkspace(workspace);
    if (window.innerWidth < 640) setIsSidebarCollapsed(true);
  };

  const handleWorkspaceSelect = (partialWorkspace: Workspace) => {
    const fullWorkspace = workspaces?.find(
      (w: Workspace) => w.id === partialWorkspace.id
    );
    if (fullWorkspace) {
      setSelectedWorkspace(fullWorkspace);
      setSelectedChat(""); 
    }
  };

  console.log(selectedWorkspace)

  const handleViewChange = (
    view: "chat" | "ai-proposal" | "self-analytics"
  ) => {
    console.log("View changed to:", view);
    if (window.innerWidth < 640) setIsSidebarCollapsed(true);
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      <Sidebar
        selectedChat={selectedChat}
        onWorkspaceSelect={handleWorkspaceSelect}
        onChatSelect={handleChatSelect}
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        onViewChange={handleViewChange}
      />

      <div className="flex-1 flex flex-col bg-transparent min-w-0">
        <Header
          selectedChat={selectedChat}
          isCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />
        <div className="flex-1 overflow-y-auto">
        <Outlet />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <>
      <UserProvider>
        <WorkspaceProvider>
          <ModelChatProvider>
            <ConversationProvider>
          <Dashboard />
          </ConversationProvider>
          </ModelChatProvider>
        </WorkspaceProvider>
      </UserProvider>
    </>
  );
}
