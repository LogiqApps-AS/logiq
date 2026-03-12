import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

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
