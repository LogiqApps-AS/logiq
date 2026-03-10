import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

/**
 * Keeps tab state in the URL search params so pages can be opened
 * directly via URL with the correct tab selected.
 *
 * Example: /team?tab=skills  →  activeTab = "skills"
 */
export function useTabParam(defaultTab: string, paramName = "tab") {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get(paramName) || defaultTab;

  const setActiveTab = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === defaultTab) {
            next.delete(paramName);
          } else {
            next.set(paramName, value);
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, defaultTab, paramName]
  );

  return [activeTab, setActiveTab] as const;
}
