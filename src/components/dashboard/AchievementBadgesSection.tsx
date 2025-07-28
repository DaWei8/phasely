import { ChartBarIcon } from "@heroicons/react/24/outline";
import { AwardIcon, Rocket, ShieldCheckIcon, SparklesIcon, Stars, TrophyIcon } from "lucide-react";
import { useState } from "react";
import { AchievementBadge } from "../AchievementBadge";
import { AchievementBadgeData, CelebrationItem } from "@/types/global";

export default function AchievementBadges() {
  const [celebrationQueue, setCelebrationQueue] = useState<CelebrationItem[]>([]);
  const [stats, setStats] = useState({
    activeHabits: 3,
    longestStreak: 75,
  });

  // Mock achievements data
  const [achievements, setAchievements] = useState([
    { achievements: { name: "First Step" } },
    { achievements: { name: "Week Warrior" } },
    { achievements: { name: "Tech Explorer" } },
  ]);

  const achievementBadges: AchievementBadgeData[] = [
    {
      name: "First Step",
      description: "Complete your first learning task",
      icon: <AwardIcon className="w-8 h-8" />,
      unlocked: achievements.some(a => a.achievements.name === "First Step"),
      rarity: "common",
      unlockedAt: "2024-01-15",
    },
    {
      name: "Week Warrior",
      description: "Complete 7 consecutive days of learning",
      icon: <ShieldCheckIcon className="w-8 h-8" />,
      unlocked: achievements.some(a => a.achievements.name === "Week Warrior"),
      rarity: "rare",
      unlockedAt: "2024-01-22",
    },
    {
      name: "Month Master",
      description: "Complete 30 days of learning",
      icon: <ChartBarIcon className="w-8 h-8" />,
      unlocked: achievements.some(a => a.achievements.name === "Month Master"),
      rarity: "epic",
    },
    {
      name: "Tech Explorer",
      description: "Complete a technology-related learning path",
      icon: <SparklesIcon className="w-8 h-8" />,
      unlocked: achievements.some(a => a.achievements.name === "Tech Explorer"),
      rarity: "rare",
      unlockedAt: "2024-01-10",
    },
    {
      name: "Creative Mind",
      description: "Complete a creative skills learning path",
      icon: <Stars className="w-8 h-8" />,
      unlocked: achievements.some(a => a.achievements.name === "Creative Mind"),
      rarity: "epic",
    },
    {
      name: "Productivity Pro",
      description: "Form 5 consistent learning habits",
      icon: <TrophyIcon className="w-8 h-8" />,
      unlocked: stats.activeHabits >= 5,
      rarity: "legendary",
    },
    {
      name: "Unstoppable",
      description: "Achieve a 100-day learning streak",
      icon: <Rocket className="w-8 h-8" />,
      unlocked: stats.longestStreak >= 100,
      rarity: "legendary",
    },
  ];

  const handleBadgeUnlock = (badge: AchievementBadgeData) => {
    const celebrationItem: CelebrationItem = {
      id: badge.id || badge.name, // use id if available, fallback to name
      badge: badge,
      timestamp: Date.now(),
      type: "unlock"
    };

    setCelebrationQueue(prev => [...prev, celebrationItem]);

    // Remove from queue after celebration
    setTimeout(() => {
      setCelebrationQueue(prev => prev.filter(item => item.badge.name !== badge.name));
    }, 3000);
  };
  const getProgress = (badge: AchievementBadgeData, index: number) => {
    if (badge.name === "Productivity Pro") return (stats.activeHabits / 5) * 100;
    if (badge.name === "Unstoppable") return (stats.longestStreak / 100) * 100;
    return Math.min(100, (index + 1) * 15); // Mock progress
  };

  const unlockedCount = achievementBadges.filter(b => b.unlocked).length;
  const totalCount = achievementBadges.length;

  return (
    <div className="h-fit bg-white rounded-2xl shadow-xl p-5">
      <div className="">
        {/* Header Section */}
        <div className="text-center w-full flex justify-between items-center mb-12">
          <h1 className="text-2xl text-left font-bold text-gray-800 mb-4">
            Achievement Badges
          </h1>
          {/* <p className="text-gray-300 text-xl mb-8">
            Celebrate your learning journey with these prestigious badges
          </p> */}

          {/* Progress Summary */}
          <div className="inline-flex text-nowrap w-fit text-gray-800 items-center bg-blue-200/10 backdrop-blur-lg rounded-full pl-2 pr-3 lg:pl-5 lg:pr-7 py-3 border border-blue-700/20">
            <div className=" text-lg lg:text-3xl ">🏆</div>
            <div className="text-left">
              <div className="text-gray-700 font-bold lg:text-base text-sm">
                {unlockedCount} / {totalCount} Earned
              </div>
              <div className="text-gray-600 text-xs lg:text-sm">
                {Math.round((unlockedCount / totalCount) * 100)}% Complete
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 ">
          {achievementBadges.map((badge, index) => (
            <AchievementBadge
              key={index}
              badge={badge}
              index={index}
              onUnlock={handleBadgeUnlock}
              progress={getProgress(badge, index)}
            />
          ))}
        </div>

        {/* Achievement Stats */}
        {/* <div className="grid bg-black grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Badges Earned", value: unlockedCount, icon: "🏅" },
            { label: "Learning Streak", value: `${stats.longestStreak} days`, icon: "🔥" },
            { label: "Active Habits", value: stats.activeHabits, icon: "⚡" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-white font-bold text-2xl mb-1">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div> */}

        {/* Celebration Toast */}
        {celebrationQueue.length > 0 && (
          <div className="fixed top-8 right-8 z-50">
            {celebrationQueue.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-xl mb-4 animate-bounce"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎉</span>
                  <div>
                    <div className="font-bold">Badge Unlocked!</div>
                    <div className="text-sm opacity-90">{item.badge.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}