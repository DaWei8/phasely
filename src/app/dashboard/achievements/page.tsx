// app/dashboard/achievements/page.tsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  TrophyIcon,
  SparklesIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import {
  Award,
  AwardIcon,
  BookOpenIcon,
  Rocket,
  Stars,
  UsersIcon
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import AchievementBadges from "@/components/dashboard/AchievementBadgesSection";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  /* ----------  DATA FETCHING  ---------- */
  useEffect(() => {
    (async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;

      // user achievements
      const { data: userAchievements, error: achievementsError } = await supabase
        .from("user_achievements")
        .select("*, achievements(*)")
        .eq("user_id", user.id);

      // completed calendars
      const { data: completedCalendars, error: calendarsError } = await supabase
        .from("learning_calendars")
        .select()
        .eq("user_id", user.id)
        .eq("status", "completed");

      // active habits
      const { data: activeHabits, error: habitsError } = await supabase
        .from("habits")
        .select()
        .eq("user_id", user.id)
        .eq("is_active", true);

      // progress entries for streak
      const { data: progressEntries, error: progressError } = await supabase
        .from("progress_entries")
        .select("date, completion_status")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (
        achievementsError ||
        calendarsError ||
        habitsError ||
        progressError
      ) {
        console.error(
          "Error fetching achievements:",
          achievementsError ||
          calendarsError ||
          habitsError ||
          progressError
        );
      } else {
        /* ----  longest streak calculation  ---- */
        let longestStreak = 0;
        let currentStreak = 0;

        if (progressEntries) {
          const completedDates = progressEntries
            .filter((p) => p.completion_status === "completed")
            .map((p) => p.date);

          const uniqueSorted = Array.from(new Set(completedDates))
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

          for (let i = 0; i < uniqueSorted.length; i++) {
            if (i === 0) {
              currentStreak = 1;
            } else {
              const prev = new Date(uniqueSorted[i - 1]);
              const cur = new Date(uniqueSorted[i]);
              const dayDiff = Math.floor(
                (cur.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (dayDiff === 1) {
                currentStreak++;
              } else if (dayDiff > 1) {
                currentStreak = 1;
              }
            }
            if (currentStreak > longestStreak) longestStreak = currentStreak;
          }
        }

        setStats({
          completedCalendars: completedCalendars?.length || 0,
          activeHabits: activeHabits?.length || 0,
          longestStreak,
          leaderboardRanking: Math.floor(Math.random() * 100) + 1 // placeholder
        });
        setAchievements(userAchievements ?? []);
        setLoading(false);
      }
    })();
  }, []);

  /* ----------  BADGE CONFIG  ---------- */
  const badges = [
    {
      name: "First Step",
      description: "Complete your first learning task",
      icon: <AwardIcon className="w-8 h-8 text-yellow-500" />,
      unlocked: achievements.some((a) => a.achievements.name === "First Step")
    },
    {
      name: "Week Warrior",
      description: "Complete 7 consecutive days of learning",
      icon: <ShieldCheckIcon className="w-8 h-8 text-yellow-500" />,
      unlocked: achievements.some((a) => a.achievements.name === "Week Warrior")
    },
    {
      name: "Month Master",
      description: "Complete 30 days of learning",
      icon: <ChartBarIcon className="w-8 h-8 text-yellow-500" />,
      unlocked: achievements.some((a) => a.achievements.name === "Month Master")
    },
    {
      name: "Tech Explorer",
      description: "Complete a technology-related learning path",
      icon: <SparklesIcon className="w-8 h-8 text-blue-500" />,
      unlocked: achievements.some((a) => a.achievements.name === "Tech Explorer")
    },
    {
      name: "Creative Mind",
      description: "Complete a creative skills learning path",
      icon: <Stars className="w-8 h-8 text-pink-500" />,
      unlocked: achievements.some((a) => a.achievements.name === "Creative Mind")
    },
    {
      name: "Productivity Pro",
      description: "Form 5 consistent learning habits",
      icon: <TrophyIcon className="w-8 h-8 text-green-500" />,
      unlocked: stats.activeHabits >= 5
    },
    {
      name: "Unstoppable",
      description: "Achieve a 100-day learning streak",
      icon: <Rocket className="w-8 h-8 text-red-500" />,
      unlocked: stats.longestStreak >= 100
    }
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 flex flex-col w-full gap-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-xl">
          <Award className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Achievements
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard
          icon={<BookOpenIcon className="w-6 h-6" />}
          title="Completed Calendars"
          value={stats.completedCalendars}
          color="text-blue-600"
        />
        <StatsCard
          icon={"⚡"}
          title="Active Habits"
          value={stats.activeHabits}
          color="text-yellow-500"
        />
        <StatsCard
          icon={"🔥"}
          title="Longest Streak"
          value={stats.longestStreak}
          unit=" days"
          color="text-green-500"
        />
        <StatsCard
          icon={<UsersIcon className="w-6 h-6" />}
          title="Leaderboard Rank"
          value={`#${stats.leaderboardRanking}`}
          color="text-blue-500"
        />
      </div>

      {/* Achievement Badges */}
      <AchievementBadges />

      {/* Achievement History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Achievement History
        </h2>
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">
            Loading achievements…</p>
        ) : (
          <div className="space-y-4">
            {achievements.length > 0 ? (
              achievements.map((a) => (
                <div
                  key={a.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {a.achievements.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {a.achievements.description}
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Earned on{" "}
                    {new Date(a.earned_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                You haven't unlocked any achievements yet. Keep learning to earn your
                first badge!
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}