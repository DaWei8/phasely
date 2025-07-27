// app/dashboard/progress/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProgressEntry } from "@/types/supabase";

interface ChartData {
  date: string;
  hours: number;
  status: string;
}

interface WeeklyData {
  date: string;
  hours: number;
}

interface MonthlyData {
  date: string;
  hours: number;
}

export default function ProgressPage() {
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"daily" | "weekly" | "monthly">("daily");

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
          date: entry.date,
          hours: entry.hours_spent,
          status: entry.completion_status
        })) || [];

        setProgressEntries(data as ProgressEntry[]);
        setChartData(transformedData);
        setLoading(false);
      }
    })();
  }, []);

  const getTabData = () => {
    if (tab === "daily") {
      return chartData;
    } else if (tab === "weekly") {
      // Aggregate by week
      const weeks: Record<string, WeeklyData> = {};
      chartData.forEach(entry => {
        const date = new Date(entry.date);
        const week = date.getDate() - date.getDay() + 1;
        const key = `${date.getFullYear()}-${week}`;

        if (!weeks[key]) {
          weeks[key] = { date: `Week ${week}`, hours: 0 };
        }
        weeks[key].hours += entry.hours || 0;
      });
      return Object.values(weeks) as WeeklyData[];
    } else if (tab === "monthly") {
      // Aggregate by month
      const months: Record<string, MonthlyData> = {};
      chartData.forEach(entry => {
        const date = new Date(entry.date);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!months[key]) {
          months[key] = { date: `${date.getFullYear()}-${date.getMonth() + 1}`, hours: 0 };
        }
        months[key].hours += entry.hours || 0;
      });
      return Object.values(months) as MonthlyData[];
    }
    return chartData;
  };

  const tabData = getTabData();

  return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Learning Progress</h1>

        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setTab("daily")}
                className={`px-4 py-2 ${
                  tab === "daily" ? "border-b-2 border-blue-600 font-medium" : ""
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTab("weekly")}
                className={`px-4 py-2 ${
                  tab === "weekly" ? "border-b-2 border-blue-600 font-medium" : ""
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTab("monthly")}
                className={`px-4 py-2 ${
                  tab === "monthly" ? "border-b-2 border-blue-600 font-medium" : ""
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={tabData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Completion Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Total Hours Logged</p>
              <p className="text-xl font-bold mt-1">
                {chartData.reduce((sum, entry) => sum + (entry.hours || 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Completion Rate</p>
              <p className="text-xl font-bold mt-1">
                {progressEntries.filter(entry => entry.completion_status === "completed").length} / {progressEntries.length}
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}