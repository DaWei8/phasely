// app/dashboard/habits/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import {
  Plus,
  CheckCircle,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  MoreVertical,
  HeartPulse
} from "lucide-react";
import { Habit, HabitEntry } from "@/types/supabase";

interface StreakInfo {
  current: number;
  longest: number;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("habits")
        .select("*, habit_entries(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching habits:", error);
      } else {
        setHabits(data as Habit[]);
        setLoading(false);
      }
    })();
  }, []);

  const calculateStreak = (entries: HabitEntry[]): StreakInfo => {
    const dates = entries
      .filter((e) => e.completed)
      .map((e) => new Date(e.date))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 1;
    let longestStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const diffTime = Math.abs(dates[i - 1].getTime() - dates[i].getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    return { current: currentStreak, longest: longestStreak };
  };

  const logHabit = async (habitId: string) => {
    try {
      const { error } = await supabase.from("habit_entries").insert([
        {
          habit_id: habitId,
          date: format(today, "yyyy-MM-dd"),
          completed: true
        }
      ]);
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("habits")
          .select("*, habit_entries(*)")
          .eq("user_id", user.id);
        setHabits(data as Habit[]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const habitStats = habits.reduce(
    (acc, h) => {
      const entries = h.habit_entries?.filter((e) => e.completed) ?? [];
      const { current, longest } = calculateStreak(entries);
      acc.totalHabits += 1;
      acc.completedHabits += entries.length;
      acc.longestStreak = Math.max(acc.longestStreak, longest);
      return acc;
    },
    { totalHabits: 0, completedHabits: 0, longestStreak: 0 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Habit Tracker
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and track your daily habits
          </p>
        </div>

        {/* Stats */}
        {habits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {habitStats.longestStreak}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Longest Streak
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {habitStats.completedHabits}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Habits Completed
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {habitStats.totalHabits}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Active Habits
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="mb-6">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium">
            <Plus className="w-5 h-5" />
            Create New Habit
          </button>
        </div>

        {/* Habits List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading your habits...
              </p>
            </div>
          </div>
        ) : habits.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {habits.map((h) => {
              const entries = h.habit_entries?.filter((e) => e.completed) ?? [];
              const { current } = calculateStreak(entries);
              const isCompletedToday = entries.some(
                (e) =>
                  e.date === format(today, "yyyy-MM-dd") && e.completed
              );

              return (
                <div
                  key={h.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {h.name}
                      </h2>
                      <div className="space-x-2">
                        <button
                          className={`flex items-center gap-1 px-4 py-2 rounded-md transition-colors ${
                            isCompletedToday
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                          }`}
                          onClick={() => logHabit(h.id)}
                          disabled={isCompletedToday}
                        >
                          {isCompletedToday ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4" />
                              Log Today
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {h.description}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {h.target_duration_minutes}m
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="w-5 h-5 text-gray-400 mx-auto mb-2">
                          {h.frequency === "daily"
                            ? "📅"
                            : h.frequency === "weekly"
                            ? "🔄"
                            : "⏱️"}
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">
                          {h.frequency}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Frequency</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-300 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {current}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Current Streak
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          Created:{" "}
                          {new Date(h.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400 dark:text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Start Building Great Habits
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Track your progress and build consistency with habits that matter to you
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                Create Your First Habit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}