// components/ProgressBar.tsx
"use client";
import { twMerge } from "tailwind-merge";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={twMerge("relative bg-gray-200 rounded-full overflow-hidden", className)}>
      <div 
        style={{ width: `${value}%` }}
        className="h-full bg-blue-600 transition-width duration-300"
      />
    </div>
  );
}