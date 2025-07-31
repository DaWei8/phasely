// app/dashboard/habits/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { format, parseISO, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  X,
  Flame,
  Target,
  BarChart3,
  BookOpen,
  Dumbbell,
  User,
  Activity,
  Save,
  Smile,
  Meh,
  Frown,
  Bell
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

const moodIcons = {
  1: Frown,
  2: Frown,
  3: Meh,
  4: Smile,
  5: Smile
};

export default function HabitDetailPage() {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [logForm, setLogForm] = useState({
    duration: '',
    notes: '',
    mood: 3
  });
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    category: 'learning' as 'learning' | 'health' | 'productivity' | 'personal',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    target_frequency: 1,
    target_duration_minutes: 30,
    reminder_time: '09:00'
  });
  
  const router = useRouter();
  const params = useParams();
  const habitId = params.id as string;

  useEffect(() => {
    if (habitId) {
      fetchHabit();
    }
  }, [habitId]);

  const fetchHabit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to view this habit");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("habits")
        .select(`
          *,
          habit_entries (*)
        `)
        .eq("id", habitId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching habit:", error);
        setError("Habit not found");
      } else {
        const habitData = data as Habit;
        setHabit(habitData);
        // Initialize edit form with current habit data
        setEditForm({
          name: habitData.name,
          description: habitData.description || '',
          category: habitData.category,
          frequency: habitData.frequency,
          target_frequency: habitData.target_frequency || 1,
          target_duration_minutes: habitData.target_duration_minutes || 30,
          reminder_time: habitData.reminder_time || '09:00'
        });
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

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
    
    const hasToday = entries.some(e => e.date === todayStr && e.completed);
    const hasYesterday = entries.some(e => e.date === yesterdayStr && e.completed);

    if (hasToday || hasYesterday) {
      currentStreak = 1;
      
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

  const getWeeklyData = () => {
    if (!habit?.habit_entries) return [];
    
    const today = new Date();
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return daysInWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const entry = habit.habit_entries?.find(e => e.date === dayStr);
      return {
        date: day,
        dateStr: dayStr,
        completed: entry?.completed || false,
        duration: entry?.duration_minutes || 0,
        mood: entry?.mood_rating || null,
        notes: entry?.notes || '',
        isToday: isToday(day)
      };
    });
  };

  const handleLogEntry = async () => {
    if (!habit) return;

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const existingEntry = habit.habit_entries?.find(e => e.date === dateStr);

      const entryData = {
        habit_id: habit.id,
        date: dateStr,
        completed: true,
        duration_minutes: logForm.duration ? parseInt(logForm.duration) : null,
        notes: logForm.notes || null,
        mood_rating: logForm.mood
      };

      if (existingEntry) {
        const { error } = await supabase
          .from("habit_entries")
          .update(entryData)
          .eq("id", existingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("habit_entries")
          .insert([entryData]);
        if (error) throw error;
      }

      await fetchHabit();
      setShowLogModal(false);
      setLogForm({ duration: '', notes: '', mood: 3 });
    } catch (err) {
      console.error("Error logging entry:", err);
      setError("Failed to log entry");
    }
  };

  const handleDeleteHabit = async () => {
    if (!habit || !confirm("Are you sure you want to delete this habit? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("habits")
        .update({ is_active: false })
        .eq("id", habit.id);

      if (error) throw error;
      router.push("/dashboard/habits");
    } catch (err) {
      console.error("Error deleting habit:", err);
      setError("Failed to delete habit");
    }
  };

  const handleEditSubmit = async () => {
    if (!habit || !editForm.name.trim()) {
      setError("Habit name is required");
      return;
    }

    try {
      const { error } = await supabase
        .from("habits")
        .update({
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          category: editForm.category,
          frequency: editForm.frequency,
          target_frequency: editForm.target_frequency,
          target_duration_minutes: editForm.target_duration_minutes,
          reminder_time: editForm.reminder_time || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", habit.id);

      if (error) throw error;

      await fetchHabit();
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error("Error updating habit:", err);
      setError("Failed to update habit");
    }
  };

  const updateEditForm = (field: keyof typeof editForm, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleDayCompletion = async (dateStr: string) => {
    if (!habit) return;

    try {
      const existingEntry = habit.habit_entries?.find(e => e.date === dateStr);

      if (existingEntry) {
        const { error } = await supabase
          .from("habit_entries")
          .update({ completed: !existingEntry.completed })
          .eq("id", existingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("habit_entries")
          .insert([{
            habit_id: habit.id,
            date: dateStr,
            completed: true
          }]);
        if (error) throw error;
      }

      await fetchHabit();
    } catch (err) {
      console.error("Error toggling completion:", err);
      setError("Failed to update completion");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 dark:text-gray-300">Loading habit details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !habit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-xl text-red-600 dark:text-red-300 mb-4">{error}</p>
              <button 
                onClick={() => router.push("/dashboard/habits")}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Back to Habits
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { current, longest } = calculateStreak(habit.habit_entries || []);
  const weeklyData = getWeeklyData();
  const CategoryIcon = categoryIcons[habit.category];
  const completedEntries = habit.habit_entries?.filter(e => e.completed) || [];
  const totalEntries = habit.habit_entries?.length || 0;
  const completionRate = totalEntries > 0 ? Math.round((completedEntries.length / totalEntries) * 100) : 0;

  return (
    <div className="min-h-screen   bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/habits")}
              className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${categoryColors[habit.category]}`}>
                <CategoryIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {habit.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 capitalize">
                  {habit.category} • {habit.frequency}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Log Entry
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDeleteHabit}
              className="p-3 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl">
                <Flame className="w-7 h-7 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{current}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Current Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-2xl">
                <Award className="w-7 h-7 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{longest}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Longest Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-2xl">
                <TrendingUp className="w-7 h-7 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{completionRate}%</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Completion Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-2xl">
                <BarChart3 className="w-7 h-7 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{completedEntries.length}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Total Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly View */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">This Week</h3>
          <div className="grid grid-cols-7 gap-4">
            {weeklyData.map((day, index) => {
              const MoodIcon = day.mood ? moodIcons[day.mood as keyof typeof moodIcons] : null;
              
              return (
                <div key={index} className="text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {format(day.date, 'EEE')}
                  </p>
                  <div
                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-200 mx-auto mb-2 ${
                      day.completed
                        ? 'bg-green-100 border-green-500 dark:bg-green-900 dark:border-green-400'
                        : day.isToday
                        ? 'bg-blue-100 border-blue-500 dark:bg-blue-900 dark:border-blue-400'
                        : 'bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => toggleDayCompletion(day.dateStr)}
                  >
                    {day.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                        {format(day.date, 'd')}
                      </span>
                    )}
                  </div>
                  {MoodIcon && (
                    <MoodIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
                  )}
                  {day.duration > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{day.duration}m</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        {habit.description && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Description</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{habit.description}</p>
          </div>
        )}

        {/* Recent Entries */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Recent Entries</h3>
          <div className="space-y-4">
            {completedEntries.slice(0, 10).map((entry) => {
              const MoodIcon = entry.mood_rating ? moodIcons[entry.mood_rating as keyof typeof moodIcons] : null;
              
              return (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {format(parseISO(entry.date), 'MMMM d, yyyy')}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {entry.duration_minutes && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.duration_minutes}m
                      </span>
                    )}
                    {MoodIcon && (
                      <MoodIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log Entry Modal */}
        {showLogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Log Entry</h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={logForm.duration}
                    onChange={(e) => setLogForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Optional"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mood (1-5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((mood) => {
                      const MoodIcon = moodIcons[mood as keyof typeof moodIcons];
                      return (
                        <button
                          key={mood}
                          onClick={() => setLogForm(prev => ({ ...prev, mood }))}
                          className={`p-3 rounded-xl border-2 transition-colors ${
                            logForm.mood === mood
                              ? 'border-blue-500 bg-blue-100 dark:bg-blue-900'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <MoodIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={logForm.notes}
                    onChange={(e) => setLogForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="How did it go?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogEntry}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Habit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Habit</h3>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl">
                  <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Habit Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Habit Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => updateEditForm('name', e.target.value)}
                    placeholder="e.g., Read for 30 minutes"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => updateEditForm('description', e.target.value)}
                    placeholder="What does this habit involve?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'learning', label: 'Learning', icon: BookOpen, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' },
                      { value: 'health', label: 'Health', icon: Dumbbell, color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
                      { value: 'productivity', label: 'Productivity', icon: Target, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' },
                      { value: 'personal', label: 'Personal', icon: User, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300' }
                    ].map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => updateEditForm('category', category.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            editForm.category === category.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${category.color}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {category.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Frequency and Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Frequency
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                        { value: 'custom', label: 'Custom' }
                      ].map((freq) => (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() => updateEditForm('frequency', freq.value)}
                          className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                            editForm.frequency === freq.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {freq.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {editForm.frequency === 'custom' && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Times per week
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="7"
                          value={editForm.target_frequency}
                          onChange={(e) => updateEditForm('target_frequency', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                    )}
                  </div>

                  {/* Duration and Reminder */}
                  <div className="space-y-4">
                    {/* Target Duration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Duration
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          min="1"
                          value={editForm.target_duration_minutes}
                          onChange={(e) => updateEditForm('target_duration_minutes', parseInt(e.target.value))}
                          className="w-full pl-10 pr-16 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                          min
                        </span>
                      </div>
                    </div>

                    {/* Reminder Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reminder Time
                      </label>
                      <div className="relative">
                        <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={editForm.reminder_time}
                          onChange={(e) => updateEditForm('reminder_time', e.target.value)}
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}