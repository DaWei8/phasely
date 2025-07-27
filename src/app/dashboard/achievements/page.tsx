// app/dashboard/achievements/page.tsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    TrophyIcon,
    SparklesIcon,
    ChartBarIcon,
    UserGroupIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { ProgressBar } from "@/components/ProgressBar";
import clsx from "clsx";
import { AwardIcon, BookOpenIcon, MedalIcon, RepeatIcon, Rocket, Stars, UsersIcon, Weight } from "lucide-react";
import { CircularProgressBar } from "@/components/CircularProgressBar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import AchievementBadges from "@/components/dashboard/AchievementBadgesSection";

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get user achievements
            const { data: userAchievements, error: achievementsError } = await supabase
                .from("user_achievements")
                .select("*, achievements(*)")
                .eq("user_id", user.id);

            // Get completed calendars
            const { data: completedCalendars, error: calendarsError } = await supabase
                .from("learning_calendars")
                .select()
                .eq("user_id", user.id)
                .eq("status", "completed");

            // Get active habits
            const { data: activeHabits, error: habitsError } = await supabase
                .from("habits")
                .select()
                .eq("user_id", user.id)
                .eq("is_active", true);

            // Get progress entries for streak calculation
            const { data: progressEntries, error: progressError } = await supabase
                .from("progress_entries")
                .select("date, completion_status")
                .eq("user_id", user.id)
                .order("date", { ascending: true });

            if (achievementsError || calendarsError || habitsError || progressError) {
                console.error(
                    "Error fetching achievements data:",
                    achievementsError || calendarsError || habitsError || progressError
                );
            } else {
                // Calculate longest streak
                let longestStreak = 0;
                let currentStreak = 0;

                if (progressEntries) {
                    const completedDates = progressEntries
                        .filter(item => item.completion_status === "completed")
                        .map(item => item.date);

                    const uniqueSortedDates = Array.from(new Set(completedDates))
                        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                    for (let i = 0; i < uniqueSortedDates.length; i++) {
                        if (i === 0) {
                            currentStreak = 1;
                        } else {
                            const prevDate = new Date(uniqueSortedDates[i - 1]);
                            const currentDate = new Date(uniqueSortedDates[i]);

                            const dayDiff = Math.floor(
                                (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
                            );

                            if (dayDiff === 1) {
                                currentStreak++;
                            } else if (dayDiff > 1) {
                                currentStreak = 1;
                            }
                        }

                        if (currentStreak > longestStreak) {
                            longestStreak = currentStreak;
                        }
                    }
                }

                setStats({
                    completedCalendars: completedCalendars?.length || 0,
                    activeHabits: activeHabits?.length || 0,
                    longestStreak,
                    // For leaderboard ranking, you would need a more complex query
                    // that compares the user's achievements with other users
                    leaderboardRanking: Math.floor(Math.random() * 100) + 1 // Placeholder
                });

                setAchievements(userAchievements);
                setLoading(false);
            }
        })();
    }, []);

    const achievementBadges = [
        {
            name: "First Step",
            description: "Complete your first learning task",
            icon: <AwardIcon className="w-8 h-8 text-yellow-500" />,
            unlocked: achievements.some(a => a.achievements.name === "First Step")
        },
        {
            name: "Week Warrior",
            description: "Complete 7 consecutive days of learning",
            icon: <ShieldCheckIcon className="w-8 h-8 text-yellow-500" />,
            unlocked: achievements.some(a => a.achievements.name === "Week Warrior")
        },
        {
            name: "Month Master",
            description: "Complete 30 days of learning",
            icon: <ChartBarIcon className="w-8 h-8 text-yellow-500" />,
            unlocked: achievements.some(a => a.achievements.name === "Month Master")
        },
        {
            name: "Tech Explorer",
            description: "Complete a technology-related learning path",
            icon: <SparklesIcon className="w-8 h-8 text-blue-500" />,
            unlocked: achievements.some(a => a.achievements.name === "Tech Explorer")
        },
        {
            name: "Creative Mind",
            description: "Complete a creative skills learning path",
            icon: <Stars className="w-8 h-8 text-pink-500" />,
            unlocked: achievements.some(a => a.achievements.name === "Creative Mind")
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
        },
    ];

    return (
        <div className="p-6 flex flex-col w-full gap-8 ">
            <h1 className="text-2xl font-bold ">Achievements</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    color="text-purple-500"
                />
            </div>

            {/* Achievement Badges */}
            {/* <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Your Badges</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {achievementBadges.map((badge, index) => (
                        <div
                            key={index}
                            className={clsx(
                                "bg-white p-4 rounded-lg shadow flex flex-col items-center",
                                badge.unlocked ? "border-2 border-yellow-500" : "opacity-30"
                            )}
                        >
                            <div className="relative">
                                {badge.unlocked ? (
                                    badge.icon
                                ) : (
                                    <>
                                        <CircularProgressBar
                                            progress={Math.min(100, (index + 1) * 20)}
                                            size={60}
                                            strokeWidth={6}
                                            className="mb-4"
                                        />
                                        <div className="absolute bottom-4 inset-0 flex items-center justify-center">
                                            {badge.icon}
                                        </div>
                                    </>
                                )}
                            </div>
                            <h3 className="mt-2 font-medium">{badge.name}</h3>
                            <p className="text-sm text-gray-500 text-center mt-1">
                                {badge.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div> */}
            <AchievementBadges />
            {/* Achievement History */}
            <div className="bg-white p-6 rounded-2xl shadow">
                <h2 className="text-xl font-semibold mb-4">Achievement History</h2>
                {loading ? (
                    <p className="text-gray-500">Loading achievements...</p>
                ) : (
                    <div className="space-y-4">
                        {achievements.length > 0 ? (
                            achievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className="p-4 border rounded-lg transition-colors hover:bg-gray-50"
                                >
                                    <h3 className="font-semibold">{achievement.achievements.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {achievement.achievements.description}
                                    </p>
                                    <p className="mt-2 text-gray-400">
                                        Earned on {new Date(achievement.earned_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">
                                You haven't unlocked any achievements yet. Keep learning to earn your first badge!
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}