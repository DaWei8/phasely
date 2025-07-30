import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: 'consistency' | 'completion' | 'exploration' | 'mastery';
  criteria: Record<string, any>;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

interface StatsCardProps {
  icon: React.ReactNode | string;
  title: string;
  value: string | number;
  color: string;
  unit?: string;
  className?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  description?: string;
  animated?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export function StatsCard({ 
  icon, 
  title, 
  value, 
  color, 
  unit, 
  className,
  trend,
  trendValue,
  description,
  animated = true,
  rarity = 'common'
}: StatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!animated) {
      setDisplayValue(typeof value === 'number' ? value : 0);
      return;
    }

    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [animated]);

  useEffect(() => {
    if (!isVisible || typeof value !== 'number') return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const getTrendIcon = () => {
    if (trend === "up") return "↗";
    if (trend === "down") return "↘";
    return "→";
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-emerald-500 dark:text-emerald-400";
    if (trend === "down") return "text-red-500 dark:text-red-400";
    return "text-gray-500 dark:text-gray-400";
  };

  const getRarityBorder = () => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500/40 dark:border-yellow-400/50';
      case 'epic': return 'border-purple-500/40 dark:border-purple-400/50';
      case 'rare': return 'border-blue-500/40 dark:border-blue-400/50';
      default: return 'border-gray-200/40 dark:border-gray-700/40';
    }
  };

  const getRarityTriangle = () => {
    switch (rarity) {
      case 'legendary': return 'border-l-transparent border-b-yellow-500/60 dark:border-b-yellow-400/70';
      case 'epic': return 'border-l-transparent border-b-purple-500/60 dark:border-b-purple-400/70';
      case 'rare': return 'border-l-transparent border-b-blue-500/60 dark:border-b-blue-400/70';
      default: return 'border-l-transparent border-b-gray-500/40 dark:border-b-gray-400/50';
    }
  };

  const getRarityGlow = () => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-500/20 dark:from-yellow-400/30 dark:via-yellow-300/30 dark:to-yellow-400/30';
      case 'epic': return 'bg-gradient-to-r from-purple-500/20 via-purple-400/20 to-purple-500/20 dark:from-purple-400/30 dark:via-purple-300/30 dark:to-purple-400/30';
      case 'rare': return 'bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20 dark:from-blue-400/30 dark:via-blue-300/30 dark:to-blue-400/30';
      default: return 'bg-gradient-to-r from-gray-500/10 via-gray-400/10 to-gray-500/10 dark:from-gray-400/20 dark:via-gray-300/20 dark:to-gray-400/20';
    }
  };

  return (
    <div 
      className={twMerge(`
        group relative overflow-hidden
        bg-white/90 dark:bg-gray-800 backdrop-blur-xl 
        border border-white/20 dark:border-gray-800/50 ${getRarityBorder()}
        rounded-2xl lg:p-6 p-3 shadow-xl transform transition-all duration-500 ease-out
        hover:scale-105 hover:${getRarityGlow()}
        cursor-pointer
      `, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px] ${getRarityTriangle()}`} />

      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl
        bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-700`} 
      />
      
      <div className="relative z-10 flex items-start justify-between h-full">
        <div className="flex-1">
          <div className={`
            inline-flex items-center justify-center
            w-16 h-16 rounded-xl mb-4
            bg-gradient-to-br from-white/20 to-white/5 dark:from-gray-800/40 dark:to-gray-900/20 
            border border-white/30 dark:border-gray-700/30
            backdrop-blur-sm 
            transform transition-all duration-500
            group-hover:scale-110 group-hover:rotate-3
            ${color}
          `}>
            <div className="text-3xl duration-300 group-hover:scale-110">
              {icon}
            </div>
          </div>

          <h3 className={`text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 tracking-wide uppercase letter-spacing-wider`}>
            {title}
          </h3>

          <div className="mb-4">
            <p className={`
              text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300
              bg-clip-text text-transparent
              transform transition-all duration-300
              ${isHovered ? 'scale-105' : ''}
            `}>
              {typeof value === 'number' ? displayValue.toLocaleString() : value}
              {unit && (
                <span className={`text-lg font-medium ml-1 text-gray-500 dark:text-gray-400`}>
                  {unit}
                </span>
              )}
            </p>
          </div>

          {trend && trendValue && (
            <div className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
              bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-700/30 
              border border-white/30 dark:border-gray-600/30
              backdrop-blur-sm 
              transform transition-all duration-300
              ${getTrendColor()}
              ${isHovered ? 'scale-105 shadow-lg' : ''}
            `}>
              <span className="mr-1 text-sm">{getTrendIcon()}</span>
              {trendValue}
            </div>
          )}

          {description && (
            <p className={`text-xs text-gray-500 dark:text-gray-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
              {description}
            </p>
          )}
        </div>

        <div className="ml-4 flex flex-col items-end">
          <div className={`
            w-2 h-20 rounded-full
            bg-gradient-to-b ${color.replace('text-', 'from-').replace('-500', '-400')} to-transparent
            transform transition-all duration-500
            ${isHovered ? 'scale-y-125 shadow-lg' : ''}
          `} />
          <div className={`
            w-1.5 h-1.5 rounded-full mt-2
            bg-gradient-to-r ${color.replace('text-', 'from-').replace('-500', '-400')} to-blue-400
            transform transition-all duration-300
            ${isHovered ? 'scale-150 animate-ping' : ''}
          `} />
        </div>
      </div>

      <div className={`
        absolute inset-0 rounded-2xl
        ${getRarityGlow()}
        opacity-0 group-hover:opacity-100
        transition-opacity duration-500
        blur-sm -z-10 transform scale-105
      `} />
    </div>
  );
}