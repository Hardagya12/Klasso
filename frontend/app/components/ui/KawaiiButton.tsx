"use client";
import React from "react";

interface KawaiiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "pink" | "mint" | "lavender" | "butter" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function KawaiiButton({
  variant = "pink",
  size = "md",
  children,
  className = "",
  ...props
}: KawaiiButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-heading font-bold rounded-full border-2 transition-all duration-300 cursor-pointer select-none hover:scale-[1.05] active:scale-[0.95]";

  const variants: Record<string, string> = {
    pink:
      "bg-primary text-text border-primary-dark shadow-kawaii hover:shadow-kawaii-lg",
    mint:
      "bg-secondary text-text border-secondary-dark shadow-mint hover:bg-secondary-light",
    lavender:
      "bg-accent text-text border-accent-dark shadow-lavender hover:bg-accent-light",
    butter:
      "bg-butter text-text border-butter-dark shadow-butter hover:bg-butter-light",
    ghost:
      "bg-transparent text-text border-transparent hover:bg-primary-light",
    outline:
      "bg-surface text-text border-border-dark hover:border-primary hover:shadow-kawaii",
  };

  const sizes: Record<string, string> = {
    sm: "text-xs px-4 py-1.5",
    md: "text-sm px-6 py-2.5",
    lg: "text-base px-8 py-3.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      suppressHydrationWarning
      {...props}
    >
      {children}
    </button>
  );
}
