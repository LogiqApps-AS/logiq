import React from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  delay?: number;
}

export const RevealSection: React.FC<RevealSectionProps> = ({
  children,
  className = "",
  style,
  id,
  delay,
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      id={id}
      className={`reveal ${isVisible ? "visible" : ""} ${className}`}
      style={{
        ...style,
        ...(delay ? { transitionDelay: `${delay}s` } : {}),
      }}
    >
      {children}
    </div>
  );
};

interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}

export const RevealItem: React.FC<RevealItemProps> = ({
  children,
  className = "",
  style,
  delay = 0,
}) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`reveal ${isVisible ? "visible" : ""} ${className}`}
      style={{
        ...style,
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
};
