"use client";
import React from "react";

interface KawaiiBadgeProps {
  children: React.ReactNode;
  variant?: "pink" | "mint" | "lavender" | "butter" | "sky" | "peach";
  className?: string;
}

export function KawaiiBadge({
  children,
  variant = "pink",
  className = "",
}: KawaiiBadgeProps) {
  const variants: Record<string, string> = {
    pink:     "bg-primary-light text-primary-dark border-primary",
    mint:     "bg-secondary-light text-secondary-dark border-secondary",
    lavender: "bg-accent-light text-accent-dark border-accent",
    butter:   "bg-butter-light text-butter-dark border-butter",
    sky:      "bg-sky-light text-sky-dark border-sky",
    peach:    "bg-peach-light text-peach-dark border-peach",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-heading font-bold
        text-xs px-3 py-1 rounded-full border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
