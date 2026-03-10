import React, { createContext, useContext, useState } from "react";

export type UserRole = "lead" | "member";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  userTitle: string;
}

const RoleContext = createContext<RoleContextType>({
  role: "lead",
  setRole: () => {},
  userName: "Magnus Lindqvist",
  userTitle: "Team Lead",
});

export const useRole = () => useContext(RoleContext);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>("lead");

  const userName = role === "lead" ? "Magnus Lindqvist" : "Alex Chen";
  const userTitle = role === "lead" ? "Team Lead" : "Mid Developer";

  return (
    <RoleContext.Provider value={{ role, setRole, userName, userTitle }}>
      {children}
    </RoleContext.Provider>
  );
};
