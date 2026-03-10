import React, { createContext, useContext, useState } from "react";

interface CopilotContextType {
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  openCopilot: () => void;
}

const CopilotContext = createContext<CopilotContextType>({
  isCopilotOpen: false,
  setIsCopilotOpen: () => {},
  openCopilot: () => {},
});

export const useCopilot = () => useContext(CopilotContext);

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const openCopilot = () => setIsCopilotOpen(true);

  return (
    <CopilotContext.Provider value={{ isCopilotOpen, setIsCopilotOpen, openCopilot }}>
      {children}
    </CopilotContext.Provider>
  );
};
