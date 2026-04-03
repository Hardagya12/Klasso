"use client";
import React from "react";

interface KawaiiInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function KawaiiInput({
  label,
  helperText,
  error,
  icon,
  className = "",
  id,
  ...props
}: KawaiiInputProps) {
  const inputId = id || `kawaii-input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="font-heading font-bold text-sm text-text flex items-center gap-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-full border-2 bg-surface
            px-5 py-2.5 font-body text-text text-sm
            transition-all duration-300
            placeholder:text-text-muted
            focus:outline-none focus:border-primary focus:shadow-kawaii
            ${error ? "border-primary shadow-kawaii" : "border-border"}
            ${icon ? "pl-11" : ""}
            ${className}
          `}
          suppressHydrationWarning
          {...props}
        />
      </div>
      {helperText && !error && (
        <span className="text-xs text-text-muted font-body pl-2">{helperText}</span>
      )}
      {error && (
        <span className="text-xs text-primary-dark font-body font-medium pl-2">{error}</span>
      )}
    </div>
  );
}
