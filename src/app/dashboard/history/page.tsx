"use client";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  Trophy,
  Archive,
  Play,
  Pause,
  CheckCircle,
  Eye,
  Filter,
  Search,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  History,
  Brain
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface LearningCalendar {
  id: string;
  title: string;
  description: string;
  prompt_used: string;
  duration_days: number;
  daily_hours: number;
  learning_style: string;
  status: "active" | "completed" | "paused" | "archived";
  start_date: string;
  expected_end_date: string;
  actual_completion_date: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

interface CalendarType {
  id: string;
  title: string;
  description: string;
  prompt_used: string;
  duration_days: number;
  daily_hours: number;
  learning_style: string;
  user_id: string;
  status: "active" | "completed" | "paused" | "archived";
  start_date: string;
  expected_end_date: string;
  actual_completion_date: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

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

export default function HistoryPage() {
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [filteredCalendars, setFilteredCalendars] = useState<CalendarType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState("newest");
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendars();
  }, []);

  useEffect(() => {
    filterCalendars();
  }, [calendars, selectedStatus, searchQuery]);

  const fetchCalendars = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("learning_calendars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching calendars:", error);
      } else {
        const typeSafeCalendars = data?.map((c) => ({
          ...c,
          daily_hours: Math.round(c.daily_hours),
          duration_days: Math.round(c.duration_days),
          progress_percentage: Math.round(c.progress_percentage)
        })) ?? [];
        setCalendars(typeSafeCalendars);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filterCalendars = () => {
    let filtered = calendars;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(c => c.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCalendars(filtered);
  };

  const handleCalendarStatusUpdate = async (id: string, status: string) => {
    try {
      const supabase = await createClient();
      await supabase.from("learning_calendars").update({ status }).eq("id", id);

      setCalendars(prev => prev.map(c =>
        c.id === id ? { ...c, status: status as any } : c
      ));
      setShowDropdown(null);
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "archived":
        return <Archive className="w-5 h-5 text-gray-600" />;
      case "paused":
        return <Pause className="w-5 h-5 text-yellow-600" />;
      default:
        return <Play className="w-5 h-5 text-blue-600" />;
    }
  };

  const getCompletedDays = () => calendarItems.filter(item => item.is_completed).length;
  const getAverageHours = () => {
    const completedItems = calendarItems.filter(item => item.actual_hours_spent);
    return completedItems.length > 0
      ? (completedItems.reduce((acc, item) => acc + (item.actual_hours_spent || 0), 0) / completedItems.length).toFixed(1)
      : '0';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
      archived: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      paused: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
      active: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const calculateDaysElapsed = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getTotalStats = () => {
    const completed = calendars.filter((c) => c.status === "completed").length;
    const totalHours = calendars.reduce(
      (sum, c) => sum + c.duration_days * c.daily_hours,
      0
    );
    const avgProgress =
      calendars.reduce((sum, c) => sum + c.progress_percentage, 0) /
      calendars.length;
    const totalDays = calendars.reduce((sum, c) => sum + c.duration_days, 0);

    return { completed, totalHours, avgProgress, totalDays };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <History className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Learning History
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Track your completed learning journeys and achievements
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <Trophy className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="flex flex-col justify-center items-center md:items-start md:justify-center " >
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.completed}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Completed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex flex-col justify-center items-center md:items-start md:justify-center " >
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalHours}h
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Total Hours
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex flex-col justify-center items-center md:items-start md:justify-center " >
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(stats.avgProgress)}%
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Avg Progress
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div className="flex flex-col justify-center items-center md:items-start md:justify-center " >
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalDays}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Total Days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 lg:p-6 p-4 mb-8">
          <div className="flex flex-wrap lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 lg:w-full min-w-[100%] md:min-w-[50%] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative ml-auto ">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors appearance-none bg-white dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative ">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors appearance-none bg-white dark:bg-gray-800"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration">By Duration</option>
                <option value="progress">By Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Loading your learning history...
              </p>
            </div>
          </div>
        ) : filteredCalendars.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCalendars.map((calendar) => (
              <div
                key={calendar.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className=" bg-blue-800/10 lg:p-6 p-4 h-40 text-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-12 h-12 flex justify-center items-center p-1.5 rounded-lg bg-blue-800/20" >
                        {getStatusIcon(calendar.status)}
                      </div>
                      <h2 title={calendar.title} className="text-xl text-gray-700 dark:text-gray-100 max-w-64 font-bold">{calendar.title.trim().slice(0, 24)}...
                      </h2>
                    </div>
                    {getStatusBadge(calendar.status)}
                  </div>
                  <p title={calendar.description} className="text-gray-700 dark:text-gray-100 text-sm leading-relaxed">
                    {calendar.description.trim().slice(0, 70)}...
                  </p>
                </div>

                {/* Card Body */}
                <div className="lg:p-6 p-4">


                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {calendar.duration_days}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Days</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {calendar.daily_hours}h
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Daily</p>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {getCompletedDays() / calendar.duration_days * 100}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${calendar.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Started:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(calendar.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Expected End:</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(calendar.expected_end_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    {calendar.actual_completion_date && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                        <span className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {new Date(calendar.actual_completion_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Learning Style */}
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold border border-blue-200 dark:border-blue-700">
                      {calendar.learning_style.charAt(0).toUpperCase() +
                        calendar.learning_style.slice(1)}{" "}
                      Learning
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link href={`/dashboard/calendars/${calendar.id}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                    <button className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Target className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Learning History Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Complete your first learning path to see it here"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}