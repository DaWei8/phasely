// app/dashboard/habits/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { Habit, HabitEntry } from "@/types/supabase";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState(new Date());

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

      // Refresh habits data
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

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Habits</h1>

        <div className="mb-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Create New Habit
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : habits.length ? (
          <div className="space-y-6">
            {habits.map((habit) => (
              <div key={habit.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{habit.name}</h2>
                  <div className="space-x-2">
                    <button className="text-green-600 hover:text-green-800" onClick={() => logHabit(habit.id)}>
                      Log Completion
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{habit.description}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p>{habit.frequency} · {habit.target_duration_minutes} minutes</p>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(habit.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    Streak: {habit.habit_entries?.filter(
                      (entry: HabitEntry) => entry.completed
                    ).length} days
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500">You don't have any habits yet.</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Create Your First Habit
            </button>
          </div>
        )}
      </div>
  );
}