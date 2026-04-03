"use client";
import React from "react";

interface KawaiiAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function KawaiiAvatar({
  src,
  name,
  size = "md",
  className = "",
}: KawaiiAvatarProps) {
  const sizes: Record<string, { wh: string; text: string }> = {
    sm: { wh: "w-9 h-9", text: "text-xs" },
    md: { wh: "w-11 h-11", text: "text-sm" },
    lg: { wh: "w-14 h-14", text: "text-lg" },
  };

  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const bgColors = [
    "bg-primary-light",
    "bg-secondary-light",
    "bg-accent-light",
    "bg-butter-light",
    "bg-sky-light",
    "bg-peach-light",
  ];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % bgColors.length;

  return (
    <div
      className={`
        ${sizes[size].wh}
        rounded-full flex items-center justify-center
        font-heading font-bold text-text
        border-2 border-white
        shadow-kawaii overflow-hidden
        ${src ? "" : bgColors[idx]}
        ${sizes[size].text}
        ${className}
      `}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover"/>
      ) : initials}
    </div>
  );
}
