import React, { createContext, useContext, useState, useCallback } from "react";
import { useCopilot } from "./CopilotContext";

interface AICoachContextType {
  isAICoachOpen: boolean;
  setIsAICoachOpen: (open: boolean) => void;
  openAICoach: () => void;
}

const AICoachContext = createContext<AICoachContextType>({
  isAICoachOpen: false,
  setIsAICoachOpen: () => {},
  openAICoach: () => {},
});

export const useAICoach = () => useContext(AICoachContext);

export const AICoachProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAICoachOpen, setIsAICoachOpen] = useState(false);
  const { setIsCopilotOpen } = useCopilot();

  const openAICoach = useCallback(() => {
    setIsCopilotOpen(false);
    setIsAICoachOpen(true);
  }, [setIsCopilotOpen]);

  return (
    <AICoachContext.Provider value={{ isAICoachOpen, setIsAICoachOpen, openAICoach }}>
      {children}
    </AICoachContext.Provider>
  );
};
