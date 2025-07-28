// app/dashboard/progress/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { Calendar, CheckCircle, Award, TrendingUp } from "lucide-react";
import { ProgressEntry } from "@/types/supabase";

interface ChartData {
  date: string;
  hours: number;
  status: string;
}

interface StatsData {
  totalHours: number;
  completedTasks: number;
  totalTasks: number;
  avgDailyHours: number;
  longestStreak: number;
}

export default function ProgressPage() {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [stats, setStats] = useState<StatsData>({
    totalHours: 0,
    completedTasks: 0,
    totalTasks: 0,
    avgDailyHours: 0,
    longestStreak: 0,
  });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("progress_entries")
        .select("date, hours_spent, completion_status")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching progress data:", error);
      } else {
        // Transform data for chart
        const transformedData: ChartData[] = data?.map((entry) => ({
          date: new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          hours: entry.hours_spent,
          status: entry.completion_status
        })) || [];

        setProgressEntries(data as ProgressEntry[]);
        setChartData(transformedData);

        // Calculate stats
        const totalHours = transformedData.reduce((sum, entry) => sum + entry.hours, 0);
        const completedTasks = data?.filter(entry => entry.completion_status === "completed").length || 0;
        const totalTasks = data?.length || 0;
        const avgDailyHours = totalHours / Math.max(1, data?.length || 1);
        const dates = transformedData.map(e => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());

        let currentStreak = 1;
        let longestStreak = 1;

        for (let i = 1; i < dates.length; i++) {
          const diffTime = Math.abs(dates[i - 1].getTime() - dates[i].getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1 && dates[i].getTime() > dates[i - 1].getTime()) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
          } else {
            currentStreak = 1;
          }
        }

        setStats({
          totalHours,
          completedTasks,
          totalTasks,
          avgDailyHours: parseFloat(avgDailyHours.toFixed(1)),
          longestStreak
        });

        setLoading(false);
      }
    })();
  }, []);

  const getTabData = () => {
    if (tab === "daily") {
      return chartData;
    } else if (tab === "weekly") {
      // Aggregate by week
      const weeks: Record<string, { date: string; hours: number }> = {};
      chartData.forEach(entry => {
        const dateObj = new Date(entry.date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const week = Math.floor(dateObj.getDate() / 7);
        const key = `${year}-${month}-${week}`;

        if (!weeks[key]) {
          weeks[key] = {
            date: `Week ${week + 1} (${new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short' })})`,
            hours: 0
          };
        }
        weeks[key].hours += entry.hours;
      });
      return Object.values(weeks);
    } else if (tab === "monthly") {
      // Aggregate by month
      const months: Record<string, { date: string; hours: number }> = {};
      chartData.forEach(entry => {
        const dateObj = new Date(entry.date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth();
        const key = `${year}-${month}`;

        if (!months[key]) {
          months[key] = {
            date: `${year} ${new Date(year, month).toLocaleDateString('en-US', { month: 'long' })}`,
            hours: 0
          };
        }
        months[key].hours += entry.hours;
      });
      return Object.values(months);
    }
    return chartData;
  };

  // const tabData = getTabData();
  const tabData = [
  { date: "Jul 01", hours: 1 },
  { date: "Jul 02", hours: 3 },
  { date: "Jul 03", hours: 2 },
  { date: "Jul 04", hours: 4 },
  { date: "Jul 05", hours: 3.5 },
  { date: "Jul 06", hours: 5 },
  { date: "Jul 07", hours: 4.2 },
  { date: "Jul 08", hours: 2.8 },
  { date: "Jul 09", hours: 4.5 },
  { date: "Jul 10", hours: 6 },
  { date: "Jul 11", hours: 5.5 },
  { date: "Jul 12", hours: 6.2 },
  { date: "Jul 13", hours: 3.9 },
  { date: "Jul 14", hours: 5.8 },
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
          </div>
          <p className="text-gray-600">Track your learning journey over time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
                <p className="text-gray-600 text-sm">Total Hours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
                <p className="text-gray-600 text-sm">Completed Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.longestStreak}</p>
                <p className="text-gray-600 text-sm">Longest Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.avgDailyHours}</p>
                <p className="text-gray-600 text-sm">Avg Daily Hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 mb-8">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setTab("daily")}
              className={`px-4 py-2 -mb-px ${tab === "daily"
                  ? "border-b-2 border-blue-600 font-medium text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTab("weekly")}
              className={`px-4 py-2 -mb-px ${tab === "weekly"
                  ? "border-b-2 border-blue-600 font-medium text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTab("monthly")}
              className={`px-4 py-2 -mb-px ${tab === "monthly"
                  ? "border-b-2 border-blue-600 font-medium text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Main Chart */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your progress data...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 mb-8">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={tabData}
                margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", borderRadius: 8, borderColor: "#ddd" }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend iconType="circle" verticalAlign="top" height={36} />

                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 2, fill: "#3b82f6", stroke: "#fff" }}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2, fill: "#3b82f6" }}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </LineChart>
            </ResponsiveContainer>

          </div>
        )}

        {/* Completion Statistics */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completion Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 mb-1">Total Hours Logged</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedTasks} / {stats.totalTasks}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 mb-1">Longest Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.longestStreak} days</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-gray-500 mb-1">Average Daily Hours</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgDailyHours}</p>
            </div>
          </div>
        </div>

        {/* Progress Details */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Progress Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {chartData.length ? (
              chartData.map((entry, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg transition-colors hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">{entry.date}</p>
                    <p className="text-gray-600">{entry.hours} hours</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${entry.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : entry.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                    <div className="flex-1 h-1 bg-gray-200 rounded-full ml-3">
                      <div
                        className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                        style={{ width: `${entry.hours * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No progress entries found</p>
                <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Add Progress Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}