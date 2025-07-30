// app/dashboard/progress/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
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
    longestStreak: 0
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
        const transformedData: ChartData[] =
          data?.map((entry) => ({
            date: new Date(entry.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            }),
            hours: entry.hours_spent,
            status: entry.completion_status
          })) || [];

        setProgressEntries(data as ProgressEntry[]);
        setChartData(transformedData);

        // stats
        const totalHours = transformedData.reduce((sum, entry) => sum + entry.hours, 0);
        const completedTasks = data?.filter((e) => e.completion_status === "completed").length || 0;
        const totalTasks = data?.length || 0;
        const avgDailyHours = totalHours / Math.max(1, data?.length || 1);
        const dates = transformedData.map((e) => new Date(e.date)).sort((a, b) => a.getTime() - b.getTime());

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
    if (tab === "daily") return chartData;
    if (tab === "weekly") {
      const weeks: Record<string, { date: string; hours: number }> = {};
      chartData.forEach((entry) => {
        const d = new Date(entry.date);
        const key = `${d.getFullYear()}-${d.getMonth()}-${Math.floor(d.getDate() / 7)}`;
        weeks[key] ??= {
          date: `Week ${Math.floor(d.getDate() / 7) + 1} (${new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString("en-US", { month: "short" })})`,
          hours: 0
        };
        weeks[key].hours += entry.hours;
      });
      return Object.values(weeks);
    }
    if (tab === "monthly") {
      const months: Record<string, { date: string; hours: number }> = {};
      chartData.forEach((entry) => {
        const d = new Date(entry.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        months[key] ??= {
          date: `${d.getFullYear()} ${new Date(d.getFullYear(), d.getMonth()).toLocaleDateString("en-US", { month: "long" })}`,
          hours: 0
        };
        months[key].hours += entry.hours;
      });
      return Object.values(months);
    }
    return chartData;
  };

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
    { date: "Jul 14", hours: 5.8 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
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
            Track your learning journey over time
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalHours}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Total Hours</p>
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
                  {stats.completedTasks}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Completed Tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Award className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.longestStreak}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Longest Streak</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.avgDailyHours}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Avg Daily Hours</p>
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
                  cursor={{ className: "dark:fill-gray-700" }}
                />
                <Legend iconType="circle" verticalAlign="top" height={36} />

                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    r: 3,
                    strokeWidth: 2,
                    fill: "#3b82f6",
                    stroke: "#fff"
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "#fff",
                    strokeWidth: 2,
                    fill: "#3b82f6"
                  }}
                  fillOpacity={1}
                  fill="url(#colorHours)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Completion Statistics */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            Completion Statistics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Total Hours Logged</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalHours}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.completedTasks} / {stats.totalTasks}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Longest Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.longestStreak} days
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Avg Daily Hours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.avgDailyHours}
              </p>
            </div>
          </div>
        </div> */}

        {/* Progress Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Progress Details
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {chartData.length ? (
              chartData.map((entry, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {entry.date}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{entry.hours} hours</p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium mr-2
                        ${
                          entry.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : entry.status === "in_progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                    >
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full ml-3">
                      <div
                        className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full"
                        style={{ width: `${entry.hours * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center flex flex-col items-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No progress entries found</p>
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