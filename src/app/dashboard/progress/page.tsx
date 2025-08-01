// app/dashboard/progress/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { Calendar, CheckCircle, Award, TrendingUp, Clock, Target, Star} from "lucide-react";
import Link from "next/link";

interface CalendarItem {
  id: string;
  calendar_id: string;
  day_number: number;
  phase_number: number;
  title: string;
  description: string;
  estimated_hours: number;
  is_completed: boolean;
  completed_at: string | null;
  actual_hours_spent: number | null;
  difficulty_rating: number | null;
  satisfaction_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface LearningCalendar {
  id: string;
  title: string;
  description: string;
  start_date: string;
  status: string;
  progress_percentage: number;
  duration_days: number;
  daily_hours: number;
}

interface ChartData {
  date: string;
  day: number;
  estimatedHours: number;
  actualHours: number;
  completed: boolean;
  phase: number;
}

interface StatsData {
  totalActualHours: number;
  totalEstimatedHours: number;
  completedTasks: number;
  totalTasks: number;
  avgDailyHours: number;
  longestStreak: number;
  avgSatisfaction: number;
  avgDifficulty: number;
  efficiencyRate: number;
}

export default function ProgressPage() {
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [learningCalendars, setLearningCalendars] = useState<LearningCalendar[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedCalendar, setSelectedCalendar] = useState<string>("all");
  const [stats, setStats] = useState<StatsData>({
    totalActualHours: 0,
    totalEstimatedHours: 0,
    completedTasks: 0,
    totalTasks: 0,
    avgDailyHours: 0,
    longestStreak: 0,
    avgSatisfaction: 0,
    avgDifficulty: 0,
    efficiencyRate: 0
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch learning calendars
      const { data: calendarsData, error: calendarsError } = await supabase
        .from("learning_calendars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (calendarsError) {
        console.error("Error fetching calendars:", calendarsError);
        setLoading(false);
        return;
      }

      setLearningCalendars(calendarsData || []);

      // Fetch calendar items with calendar info
      const { data: itemsData, error: itemsError } = await supabase
        .from("calendar_items")
        .select(`
          *,
          learning_calendars!inner (
            id,
            title,
            start_date,
            status,
            user_id
          )
        `)
        .eq("learning_calendars.user_id", user.id)
        .order("day_number", { ascending: true });

      if (itemsError) {
        console.error("Error fetching calendar items:", itemsError);
        setLoading(false);
        return;
      }

      const items = itemsData || [];
      setCalendarItems(items);

      // Transform data for chart
      const transformedData: ChartData[] = items.map((item, index) => {
        const calendar = calendarsData?.find(c => c.id === item.calendar_id);
        const itemDate = calendar?.start_date 
          ? new Date(new Date(calendar.start_date).getTime() + (item.day_number - 1) * 24 * 60 * 60 * 1000)
          : new Date();

        return {
          date: itemDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          }),
          day: item.day_number,
          estimatedHours: item.estimated_hours,
          actualHours: item.actual_hours_spent || 0,
          completed: item.is_completed,
          phase: item.phase_number
        };
      });

      setChartData(transformedData);

      // Calculate comprehensive stats
      const totalActualHours = items.reduce((sum, item) => sum + (item.actual_hours_spent || 0), 0);
      const totalEstimatedHours = items.reduce((sum, item) => sum + item.estimated_hours, 0);
      const completedTasks = items.filter(item => item.is_completed).length;
      const totalTasks = items.length;
      
      // Calculate average daily hours from completed items
      const completedItems = items.filter(item => item.is_completed && item.actual_hours_spent);
      const avgDailyHours = completedItems.length > 0 
        ? completedItems.reduce((sum, item) => sum + (item.actual_hours_spent || 0), 0) / completedItems.length
        : 0;

      // Calculate longest streak of completed consecutive days
      const completedDays = items
        .filter(item => item.is_completed)
        .map(item => item.day_number)
        .sort((a, b) => a - b);
      
      let currentStreak = 1;
      let longestStreak = completedDays.length > 0 ? 1 : 0;
      
      for (let i = 1; i < completedDays.length; i++) {
        if (completedDays[i] === completedDays[i - 1] + 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }

      // Calculate satisfaction and difficulty averages
      const ratedItems = items.filter(item => item.satisfaction_rating && item.difficulty_rating);
      const avgSatisfaction = ratedItems.length > 0
        ? ratedItems.reduce((sum, item) => sum + (item.satisfaction_rating || 0), 0) / ratedItems.length
        : 0;
      const avgDifficulty = ratedItems.length > 0
        ? ratedItems.reduce((sum, item) => sum + (item.difficulty_rating || 0), 0) / ratedItems.length
        : 0;

      // Calculate efficiency rate (actual vs estimated hours)
      const efficiencyRate = totalEstimatedHours > 0 
        ? (totalActualHours / totalEstimatedHours) * 100
        : 0;

      setStats({
        totalActualHours: parseFloat(totalActualHours.toFixed(1)),
        totalEstimatedHours: parseFloat(totalEstimatedHours.toFixed(1)),
        completedTasks,
        totalTasks,
        avgDailyHours: parseFloat(avgDailyHours.toFixed(1)),
        longestStreak,
        avgSatisfaction: parseFloat(avgSatisfaction.toFixed(1)),
        avgDifficulty: parseFloat(avgDifficulty.toFixed(1)),
        efficiencyRate: parseFloat(efficiencyRate.toFixed(1))
      });

      setLoading(false);
    })();
  }, []);

  const getTabData = () => {
    const filteredData = selectedCalendar === "all" 
      ? chartData 
      : chartData.filter(item => {
          const calendarItem = calendarItems.find(ci => ci.day_number === item.day);
          return calendarItem?.calendar_id === selectedCalendar;
        });

    if (tab === "daily") return filteredData;
    
    if (tab === "weekly") {
      const weeks: Record<string, { date: string; estimatedHours: number; actualHours: number }> = {};
      filteredData.forEach((entry) => {
        const weekNum = Math.floor((entry.day - 1) / 7) + 1;
        const key = `week-${weekNum}`;
        weeks[key] ??= {
          date: `Week ${weekNum}`,
          estimatedHours: 0,
          actualHours: 0
        };
        weeks[key].estimatedHours += entry.estimatedHours;
        weeks[key].actualHours += entry.actualHours;
      });
      return Object.values(weeks);
    }
    
    if (tab === "monthly") {
      const months: Record<string, { date: string; estimatedHours: number; actualHours: number }> = {};
      filteredData.forEach((entry) => {
        const monthNum = Math.floor((entry.day - 1) / 30) + 1;
        const key = `month-${monthNum}`;
        months[key] ??= {
          date: `Month ${monthNum}`,
          estimatedHours: 0,
          actualHours: 0
        };
        months[key].estimatedHours += entry.estimatedHours;
        months[key].actualHours += entry.actualHours;
      });
      return Object.values(months);
    }
    
    return filteredData;
  };

  const currentTabData = getTabData();

  return (
    <div className="min-h-screen   bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Learning Progress
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Track your learning journey and performance metrics
          </p>
        </div>

        {/* Calendar Filter */}
        {learningCalendars.length > 1 && (
          <div className="mb-6 w-full">
            <select
              value={selectedCalendar}
              onChange={(e) => setSelectedCalendar(e.target.value)}
              className="px-4 w-full py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Learning Plans</option>
              {learningCalendars.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalActualHours}h
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Hours Learning</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.completedTasks}/{stats.totalTasks}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Tasks Done</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <Award className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.longestStreak}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Day Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.efficiencyRate}%
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Efficiency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.avgDailyHours}h
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Avg Daily Hours</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.avgSatisfaction}/5
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Satisfaction</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl">
                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.avgDifficulty}/5
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Avg Difficulty</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6 mb-2">
          <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
            {(["daily", "weekly", "monthly"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 -mb-px text-sm font-medium transition-colors rounded-t-md
                  ${
                    tab === t
                      ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chart */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading your progress data...
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Learning Hours: Estimated vs Actual
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={currentTabData}
                  margin={{ top: 20, right: 0, left: -40, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#e5e7eb"
                    className="dark:stroke-gray-700"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="dark:fill-gray-300"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="dark:fill-gray-300" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      borderColor: "#ddd"
                    }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Legend iconType="rect" verticalAlign="top" height={36} />

                  <Bar
                    dataKey="estimatedHours"
                    fill="#93c5fd"
                    name="Estimated Hours"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="actualHours"
                    fill="#3b82f6"
                    name="Actual Hours"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}  

        {/* Progress Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Daily Progress Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {calendarItems.length ? (
              calendarItems
                .filter(item => selectedCalendar === "all" || item.calendar_id === selectedCalendar)
                .slice(0, 10) // Show recent 10 items
                .map((item) => (
                  <Link
                    href={`/dashboard/calendars/${item.calendar_id}`}
                    key={item.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          Day {item.day_number}: {item.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-nowrap w-fit text-gray-600 dark:text-gray-300">
                          {item.actual_hours_spent || 0}h / {item.estimated_hours}h
                        </p>
                        {item.satisfaction_rating && (
                          <div className="flex items-center justify-end gap-1 mt-2">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {item.satisfaction_rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium
                          ${
                            item.is_completed
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                      >
                        {item.is_completed ? "Completed" : "Pending"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Phase {item.phase_number}
                      </span>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full ml-3">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full"
                          style={{ 
                            width: `${Math.min(100, ((item.actual_hours_spent || 0) / item.estimated_hours) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
                        "{item.notes}"
                      </p>
                    )}
                  </Link>
                ))
            ) : (
              <div className="text-center flex flex-col items-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No progress entries found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Start a learning calendar to track your progress
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}