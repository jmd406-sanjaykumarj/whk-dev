import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserAccess } from "../store/user/hooks";

type User = {
  name: string;
  email: string;
};

type Access = {
  id: string;
  user_id: string;
  component: string;
  component_type: string;
};

type GroupedAccess = {
  models: string[];
  features: string[];
  workspaces: string[];
};

type UserContextType = {
  user: User | null;
  access: GroupedAccess | null;
  setUserData: (user: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Utility to group access by component_type
const groupAccessByType = (accessList: Access[]): GroupedAccess => {
  const grouped: GroupedAccess = {
    models: [],
    features: [],
    workspaces: [],
  };

  for (const item of accessList) {
    const key = item.component_type.toLowerCase();
    if (key === "model") grouped.models.push(item.component);
    else if (key === "feature") grouped.features.push(item.component);
    else if (key === "workspace") grouped.workspaces.push(item.component);
  }

  return grouped;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<GroupedAccess | null>(null);
  const { data: accessData } = useUserAccess();

  useEffect(() => {
    if (accessData?.length) {
      const grouped = groupAccessByType(accessData);
      setAccess(grouped);
      console.log("Grouped Access:", grouped);
    }
  }, [accessData]);


  const setUserData = (user: User) => {
    setUser(user);
  };

  return (
    <UserContext.Provider value={{ user, access, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used inside UserProvider");
  return ctx;
};