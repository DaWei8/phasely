import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

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
  animated = true
}: StatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Animate number counting effect
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
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-red-500";
    return "text-gray-500";
  };

  return (
    <div 
      className={twMerge(`
        group relative overflow-hidden
        bg-white/10 rounded-2xl border
        bg-gradient-to-br from-white/90 to-white/60
        backdrop-blur-xl  border-white/20 p-4 shadow-xl
        transform transition-all duration-500 ease-out
        hover:scale-102 hover:shadow-xl hover:shadow-blue-500/20
        cursor-pointer hover:before:opacity-100
        after:opacity-0 after:transition-opacity after:duration-500
        hover:after:opacity-100
      `, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`
              absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-blue-400 rounded-full
              opacity-0 group-hover:opacity-60
              transition-all duration-1000 delay-${i * 100}
              group-hover:animate-pulse
            `}
            style={{
              left: `${20 + i * 12}%`,
              top: `${10 + i * 8}%`,
              animationDelay: `${i * 200}ms`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-start justify-between h-full">
        <div className="flex-1">
          {/* Icon with enhanced styling */}
          <div className={`
            inline-flex items-center justify-center
            w-14 h-14 rounded-xl mb-4
            bg-gradient-to-br from-white/20 to-white/5
            backdrop-blur-sm border border-white/30
            transform transition-all duration-500
            group-hover:scale-110 group-hover:rotate-3
            ${color}
          `}>
            <div className="text-2xl transform transition-transform duration-300 group-hover:scale-110">
              {icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-600 mb-2 tracking-wide uppercase letterspacing-wider">
            {title}
          </h3>

          {/* Value with animation */}
          <div className="mb-3">
            <p className={`
              text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
              bg-clip-text text-transparent
              transform transition-all duration-300
              ${isHovered ? 'scale-105' : ''}
            `}>
              {typeof value === 'number' ? displayValue.toLocaleString() : value}
              {unit && (
                <span className="text-lg font-medium text-gray-500 ml-1 animate-pulse">
                  {unit}
                </span>
              )}
            </p>
          </div>

          {/* Trend indicator */}
          {trend && trendValue && (
            <div className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
              bg-gradient-to-r from-white/50 to-white/30 backdrop-blur-sm
              border border-white/30
              transform transition-all duration-300
              ${getTrendColor()}
              ${isHovered ? 'scale-105 shadow-lg' : ''}
            `}>
              <span className="mr-1 text-sm">{getTrendIcon()}</span>
              {trendValue}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {description}
            </p>
          )}
        </div>

        {/* Decorative element */}
        <div className="ml-4 flex flex-col items-end">
          <div className={`
            w-2 h-16 rounded-full
            bg-gradient-to-b ${color.replace('text-', 'from-').replace('-500', '-400')} to-transparent
            transform transition-all duration-500
            ${isHovered ? 'scale-y-125 shadow-lg' : ''}
          `} />
          <div className={`
            w-1 h-1 rounded-full mt-2
            bg-gradient-to-r ${color.replace('text-', 'from-').replace('-500', '-400')} to-blue-400
            transform transition-all duration-300
            ${isHovered ? 'scale-150 animate-ping' : ''}
          `} />
        </div>
      </div>

      {/* Enhanced border glow effect */}
      <div className={`
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-blue-500/20 via-blue-500/20 to-blue-500/20
        opacity-0 group-hover:opacity-100
        transition-opacity duration-500
        blur-sm -z-10
        transform scale-105
      `} />
    </div>
  );
}

// Demo component to showcase the enhanced card
export default function StatsCardDemo() {
  const [refreshKey, setRefreshKey] = useState(0);

  const sampleCards = [
    {
      icon: "💰",
      title: "Total Revenue",
      value: 147500,
      color: "text-emerald-500",
      unit: "",
      trend: "up" as const,
      trendValue: "+12.5%",
      description: "Compared to last month"
    },
    {
      icon: "👥",
      title: "Active Users",
      value: 2847,
      color: "text-blue-500",
      unit: "",
      trend: "up" as const,
      trendValue: "+8%",
      description: "Monthly active users"
    },
    {
      icon: "📊",
      title: "Conversion Rate",
      value: "3.24",
      color: "text-blue-500",
      unit: "%",
      trend: "down" as const,
      trendValue: "-0.5%",
      description: "Last 30 days average"
    },
    {
      icon: "⚡",
      title: "Performance Score",
      value: 98,
      color: "text-orange-500",
      unit: "/100",
      trend: "up" as const,
      trendValue: "+5 pts",
      description: "System performance"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Enhanced Stats Cards
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Modern, interactive cards with glassmorphism effects and smooth animations
          </p>
          <button 
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
          >
            Restart Animations
          </button>
        </div>

        <div key={refreshKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleCards.map((card, index) => (
            <StatsCard
              key={index}
              icon={card.icon}
              title={card.title}
              value={card.value}
              color={card.color}
              unit={card.unit}
              trend={card.trend}
              trendValue={card.trendValue}
              description={card.description}
              animated={true}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Key Enhancements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "Visual Effects",
                items: ["Glassmorphism design", "Gradient overlays", "Floating particles", "Glow effects"]
              },
              {
                title: "Animations",
                items: ["Number counting", "Hover transforms", "Scale & rotate", "Smooth transitions"]
              },
              {
                title: "Interactive Features",
                items: ["Trend indicators", "Descriptions", "Enhanced typography", "Responsive design"]
              }
            ].map((section, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-white font-semibold mb-4">{section.title}</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}