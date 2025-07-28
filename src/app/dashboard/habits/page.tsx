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
  MoreVertical
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
      .filter(e => e.completed)
      .map(e => new Date(e.date))
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
      const { error } = await supabase
        .from("habit_entries")
        .insert([
          {
            habit_id: habitId,
            date: format(today, "yyyy-MM-dd"),
            completed: true,
          },
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
    } catch (error) {
      console.error("Error logging habit:", error);
    }
  };

  const habitStats = habits.reduce((acc, habit) => {
    const entries = habit.habit_entries?.filter(e => e.completed) || [];
    const { current, longest } = calculateStreak(entries);
    acc.totalHabits += 1;
    acc.completedHabits += entries.length;
    acc.longestStreak = Math.max(acc.longestStreak, longest);
    return acc;
  }, { totalHabits: 0, completedHabits: 0, longestStreak: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
          </div>
          <p className="text-gray-600">Manage and track your daily habits</p>
        </div>

        {/* Stats Cards (visible when habits exist) */}
        {habits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{habitStats.longestStreak}</p>
                  <p className="text-gray-600 text-sm">Longest Streak</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{habitStats.completedHabits}</p>
                  <p className="text-gray-600 text-sm">Habits Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{habitStats.totalHabits}</p>
                  <p className="text-gray-600 text-sm">Active Habits</p>
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
              <p className="text-gray-600">Loading your habits...</p>
            </div>
          </div>
        ) : habits.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {habits.map((habit) => {
              const entries = habit.habit_entries?.filter(e => e.completed) || [];
              const { current } = calculateStreak(entries);
              const isCompletedToday = entries.some(
                e => 
                  e.date === format(today, "yyyy-MM-dd") && 
                  e.completed
              );

              return (
                <div 
                  key={habit.id} 
                  className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">{habit.name}</h2>
                      <div className="space-x-2">
                        <button 
                          className={`flex items-center gap-1 px-4 py-2 rounded-md transition-colors ${
                            isCompletedToday 
                              ? "bg-green-100 text-green-800" 
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }`}
                          onClick={() => logHabit(habit.id)}
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
                    <p className="text-gray-600 mb-4">{habit.description}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900">{habit.target_duration_minutes}m</p>
                        <p className="text-xs text-gray-600">Duration</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="w-5 h-5 text-gray-400 mx-auto mb-2">
                          {habit.frequency === "daily" ? "📅" : habit.frequency === "weekly" ? "🔄" : "⏱️"}
                        </div>
                        <p className="text-lg font-bold text-gray-900">{habit.frequency}</p>
                        <p className="text-xs text-gray-600">Frequency</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl">
                        <Award className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-gray-900">{current}️⃣</p>
                        <p className="text-xs text-gray-600">Current Streak</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Created: {new Date(habit.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
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
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Great Habits</h3>
              <p className="text-gray-600 mb-6">
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