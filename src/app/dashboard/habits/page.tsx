// app/dashboard/habits/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { format, isToday, parseISO } from "date-fns";
import {
  Plus,
  CheckCircle,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  HeartPulse,
  Target,
  TrendingUp,
  BookOpen,
  Dumbbell,
  User,
  Activity,
  Flame
} from "lucide-react";

interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: 'learning' | 'health' | 'productivity' | 'personal';
  frequency: 'daily' | 'weekly' | 'custom';
  target_frequency: number | null;
  target_duration_minutes: number | null;
  reminder_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  habit_entries?: HabitEntry[];
}

interface HabitEntry {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  duration_minutes: number | null;
  notes: string | null;
  mood_rating: number | null;
  created_at: string;
}

interface StreakInfo {
  current: number;
  longest: number;
}

const categoryIcons = {
  learning: BookOpen,
  health: Dumbbell,
  productivity: Target,
  personal: User
};

const categoryColors = {
  learning: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  health: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
  productivity: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
  personal: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300'
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const today = new Date();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to view your habits");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("habits")
        .select(`
          *,
          habit_entries (*)
        `)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching habits:", error);
        setError("Failed to load habits");
      } else {
        setHabits(data as Habit[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (entries: HabitEntry[]): StreakInfo => {
    if (!entries || entries.length === 0) {
      return { current: 0, longest: 0 };
    }

    const completedDates = entries
      .filter(e => e.completed)
      .map(e => parseISO(e.date))
      .sort((a, b) => b.getTime() - a.getTime());

    if (completedDates.length === 0) {
      return { current: 0, longest: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Check if today or yesterday was completed for current streak
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(new Date(today.getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

    const hasToday = entries.some(e => e.date === todayStr && e.completed);
    const hasYesterday = entries.some(e => e.date === yesterdayStr && e.completed);

    if (hasToday || hasYesterday) {
      currentStreak = 1;

      // Count consecutive days backwards
      for (let i = 1; i < completedDates.length; i++) {
        const diffTime = completedDates[i - 1].getTime() - completedDates[i].getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < completedDates.length; i++) {
      const diffTime = completedDates[i - 1].getTime() - completedDates[i].getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  };

  const logHabit = async (habitId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to detail page

    try {
      const todayStr = format(today, "yyyy-MM-dd");

      // Check if already logged today
      const existingEntry = habits
        .find(h => h.id === habitId)
        ?.habit_entries?.find(e => e.date === todayStr);

      if (existingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from("habit_entries")
          .update({ completed: !existingEntry.completed })
          .eq("id", existingEntry.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from("habit_entries")
          .insert([{
            habit_id: habitId,
            date: todayStr,
            completed: true
          }]);

        if (error) throw error;
      }

      // Refresh habits data
      await fetchHabits();
    } catch (err) {
      console.error("Error logging habit:", err);
      setError("Failed to log habit");
    }
  };

  const navigateToHabitDetail = (habitId: string) => {
    router.push(`/dashboard/habits/${habitId}`);
  };

  const getTodayCompletion = (habit: Habit): boolean => {
    const todayStr = format(today, "yyyy-MM-dd");
    return habit.habit_entries?.some(e => e.date === todayStr && e.completed) || false;
  };

  const getCompletionRate = (habit: Habit): number => {
    if (!habit.habit_entries || habit.habit_entries.length === 0) return 0;
    const completed = habit.habit_entries.filter(e => e.completed).length;
    return Math.round((completed / habit.habit_entries.length) * 100);
  };

  // Calculate overall stats
  const habitStats = habits.reduce(
    (acc, habit) => {
      const entries = habit.habit_entries?.filter(e => e.completed) || [];
      const { current, longest } = calculateStreak(habit.habit_entries || []);
      const todayCompleted = getTodayCompletion(habit);

      acc.totalHabits += 1;
      acc.completedToday += todayCompleted ? 1 : 0;
      acc.totalCompletions += entries.length;
      acc.longestStreak = Math.max(acc.longestStreak, longest);
      acc.averageStreak += current;

      return acc;
    },
    {
      totalHabits: 0,
      completedToday: 0,
      totalCompletions: 0,
      longestStreak: 0,
      averageStreak: 0
    }
  );

  if (habits.length > 0) {
    habitStats.averageStreak = Math.round(habitStats.averageStreak / habits.length);
  }

  const completionPercentage = habits.length > 0
    ? Math.round((habitStats.completedToday / habits.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
                Loading your habits...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartPulse className="w-8 h-8 text-red-600 dark:text-red-300" />
              </div>
              <p className="text-xl text-red-600 dark:text-red-300 font-medium mb-4">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen   bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 ">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <HeartPulse className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Habit Tracker
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Build better habits, one day at a time
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/dashboard/habits/create')}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white pl-4 pr-6 py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg md:mx-0 hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-6 h-6" />
              New Habit
            </button>
          </div>

          {/* Today's Progress Bar */}
          {habits.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Today's Progress
                </h3>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {habitStats.completedToday} of {habits.length} habits completed today
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Stats */}
        {habits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl">
                  <Flame className="w-7 h-7 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {habitStats.longestStreak}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    Longest Streak
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-2xl">
                  <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {habitStats.totalCompletions}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    Total Completions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-2xl">
                  <Activity className="w-7 h-7 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {habits.length}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    Active Habits
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-2xl">
                  <TrendingUp className="w-7 h-7 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {habitStats.averageStreak}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    Avg. Streak
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Habits List */}
        {habits.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {habits.map((habit) => {
              const entries = habit.habit_entries || [];
              const { current, longest } = calculateStreak(entries);
              const isCompletedToday = getTodayCompletion(habit);
              const completionRate = getCompletionRate(habit);
              const CategoryIcon = categoryIcons[habit.category];

              return (
                <div
                  key={habit.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                  onClick={() => navigateToHabitDetail(habit.id)}
                >
                  {/* Enhanced Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${categoryColors[habit.category]}`}>
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {habit.name}
                          </h3>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {habit.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                      </div>
                    </div>

                    {habit.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {habit.description}
                      </p>
                    )}


                    {/* Progress Ring or Bar */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Completion Rate
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {completionRate}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Card Body */}
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <Flame className="w-5 h-5 text-orange-600 dark:text-orange-300 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {current}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          Current
                        </p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-300 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {longest}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          Best
                        </p>
                      </div>

                      <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-300 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                          {habit.target_duration_minutes || 0}m
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          Target
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">{habit.frequency}</span>
                      </div>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium shadow-sm ${isCompletedToday
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 hover:shadow-md"
                          }`}
                        onClick={(e) => logHabit(habit.id, e)}
                      >
                        {isCompletedToday ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Done
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Mark
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-12 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartPulse className="w-10 h-10 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Start Your Journey
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                Create your first habit and begin building the life you want, one day at a time.
              </p>
              <button
                onClick={() => router.push('/dashboard/habits/create')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Your First Habit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}