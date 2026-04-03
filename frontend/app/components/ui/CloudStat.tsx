"use client";
import React from "react";
import { KawaiiCloud } from "../doodles";

interface CloudStatProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  cloudColor?: string;
  className?: string;
  id?: string;
}

export function CloudStat({
  label,
  value,
  subtitle,
  icon,
  cloudColor = "#B8E8FC",
  className = "",
  id,
}: CloudStatProps) {
  return (
    <div id={id} className={`flex flex-col items-center text-center ${className}`}>
      <KawaiiCloud size={100} color={cloudColor} mood="happy">
        <div className="flex flex-col items-center -mt-1">
          {icon && <span className="mb-[-2px]">{icon}</span>}
          <span className="text-2xl font-heading font-extrabold text-text leading-none">{value}</span>
        </div>
      </KawaiiCloud>
      <p className="font-heading font-bold text-sm text-text mt-1">{label}</p>
      {subtitle && <p className="font-accent text-sm text-text-muted">{subtitle}</p>}
    </div>
  );
}
