import { twMerge } from "tailwind-merge";
import { ParticleSystem } from "./ParticleSystem";
import { useEffect, useRef, useState } from "react";
import { AchievementBadgeProps } from "@/types/global";
import { CircularProgressBar } from "./CircularProgressBar";

export const AchievementBadge = ({ 
  badge, 
  index, 
  onUnlock, 
  progress = 0 
}: AchievementBadgeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevUnlocked = useRef(badge.unlocked);

  // Trigger celebration when badge is unlocked
  useEffect(() => {
    if (badge.unlocked && !prevUnlocked.current) {
      setIsFlipping(true);
      setTimeout(() => {
        setShowCelebration(true);
        setIsFlipping(false);
      }, 600);
      setTimeout(() => setShowCelebration(false), 3000);
      onUnlock?.(badge);
    }
    prevUnlocked.current = badge.unlocked;
  }, [badge.unlocked, badge, onUnlock]);

  const getBadgeGradient = () => {
    if (!badge.unlocked) return "";
    
    switch (badge.rarity || "common") {
      case "legendary": return "from-blue-400 via-orange-500 to-red-500";
      case "epic": return "from-purple-400 via-pink-500 to-red-500";
      case "rare": return "from-blue-400 via-blue-500 to-blue-600";
      default: return "from-green-400 via-green-500 to-green-600";
    }
  };

  const getBorderGlow = () => {
    if (!badge.unlocked) return "";
    
    switch (badge.rarity || "common") {
      case "legendary": return "shadow-blue-300/50";
      case "epic": return "shadow-purple-300/50";
      case "rare": return "shadow-blue-300/30";
      default: return "shadow-blue-300/30";
    }
  };

  return (
    <div
      className={twMerge(`
        group relative overflow-hidden
        backdrop-blur-sm border-2 rounded-2xl p-6
        transform transition-all duration-500 ease-out
        cursor-pointer select-none
        ${badge.unlocked 
          ? `border-transparent shadow-xl ${getBorderGlow()} hover:scale-105 hover:shadow-xl` 
          : 'border-gray-200 hover:border-gray-300 hover:scale-102'
        }
        ${isFlipping ? 'animate-pulse scale-110' : ''}
        before:absolute before:inset-0 before:bg-gradient-to-br
        before:${getBadgeGradient()} before:opacity-0 before:transition-opacity
        before:duration-500 ${badge.unlocked ? 'hover:before:opacity-10' : ''}
      `)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Particle celebration effect */}
      <ParticleSystem
        isActive={showCelebration} 
        color={badge.unlocked ? "bg-blue-400" : "bg-gray-400"} 
      />

      {/* Animated background rays */}
      {badge.unlocked && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-0.5 bg-gradient-to-t from-transparent via-blue-400/30 to-transparent
                transform origin-bottom transition-all duration-1000
                ${isHovered ? 'opacity-100 scale-y-150' : 'opacity-0 scale-y-100'}
              `}
              style={{
                height: '200%',
                left: `${12.5 * (i + 1)}%`,
                bottom: '50%',
                transform: `rotate(${45 * i}deg)`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Badge Icon Container */}
        <div className={`
          relative mb-4 transform transition-all duration-500
          ${isHovered ? 'scale-110' : 'scale-100'}
          ${isFlipping ? 'animate-spin' : ''}
        `}>
          {badge.unlocked ? (
            <div className={`
              relative p-4 rounded-full
              bg-gradient-to-br ${getBadgeGradient()}
              shadow-xl transform transition-all duration-300
              ${isHovered ? 'shadow-xl rotate-12' : ''}
            `}>
              {/* Glowing ring effect */}
              <div className={`
                absolute inset-0 rounded-full
                bg-gradient-to-br ${getBadgeGradient()}
                animate-ping opacity-20
                ${showCelebration ? 'animate-pulse' : ''}
              `} />
              
              {/* Icon */}
              <div className="relative z-10 text-white text-3xl transform transition-transform duration-300">
                {badge.icon}
              </div>
              
              {/* Sparkle effects */}
              {badge.unlocked && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-60" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-200 rounded-full animate-pulse" />
                  <div className="absolute top-1/2 -right-2 w-1 h-1 bg-white rounded-full animate-bounce" />
                </>
              )}
            </div>
          ) : (
            <div className="relative">
              {/* Progress ring */}
              <CircularProgressBar
                progress={progress}
                size={80}
                strokeWidth={6}
                className="relative"
              />
              
              {/* Locked icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-3 rounded-full bg-gray-200 text-gray-400 text-xl opacity-60">
                  {badge.icon}
                </div>
              </div>
              
              {/* Lock indicator */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">
                  🔒
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Badge Details */}
        <div className="space-y-2">
          <h3 className={`
            font-bold text-lg transition-all duration-300
            ${badge.unlocked 
              ? 'text-gray-800 group-hover:text-blue-600' 
              : 'text-gray-500'
            }
          `}>
            {badge.name}
          </h3>
          
          <p className={`
            text-sm leading-relaxed transition-all duration-300
            ${badge.unlocked ? 'text-gray-600' : 'text-gray-400'}
          `}>
            {badge.description}
          </p>

          {/* Progress indicator for locked badges */}
          {!badge.unlocked && progress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Rarity indicator */}
          {badge.unlocked && badge.rarity && (
            <div className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
              ${badge.rarity === 'legendary' ? 'bg-blue-100 text-blue-800' :
                badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'}
              transform transition-all duration-300
              ${isHovered ? 'scale-105' : ''}
            `}>
              {badge.rarity.toUpperCase()}
            </div>
          )}

          {/* Unlock date */}
          {badge.unlocked && badge.unlockedAt && (
            <p className="text-xs text-gray-400 mt-2">
              Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Celebration burst effect */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}
    </div>
  );
};