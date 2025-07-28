"use client";
import { useState } from "react";
import { Calendar, Clock, BookOpen, Trophy, Archive, Play, Pause, CheckCircle, Eye, Filter, Search, TrendingUp, Award, Target, BarChart3, History, Brain } from "lucide-react";

interface LearningCalendar {
  id: string;
  title: string;
  description: string;
  prompt_used: string;
  duration_days: number;
  daily_hours: number;
  learning_style: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  start_date: string;
  expected_end_date: string;
  actual_completion_date: string | null;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export default function HistoryPage() {
  const [calendars, setCalendars] = useState<LearningCalendar[]>([
    {
      id: "1",
      title: "Master React Development",
      description: "Complete guide to React including hooks, context, and advanced patterns",
      prompt_used: "Learn React from beginner to advanced",
      duration_days: 30,
      daily_hours: 2,
      learning_style: "balanced",
      status: "completed",
      start_date: "2024-01-15",
      expected_end_date: "2024-02-14",
      actual_completion_date: "2024-02-12",
      progress_percentage: 100,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-02-12T18:30:00Z"
    },
    {
      id: "2",
      title: "Python Data Science Bootcamp",
      description: "Learn pandas, numpy, matplotlib, and machine learning basics",
      prompt_used: "Learn Python for data science",
      duration_days: 45,
      daily_hours: 3,
      learning_style: "visual",
      status: "completed",
      start_date: "2023-11-01",
      expected_end_date: "2023-12-16",
      actual_completion_date: "2023-12-20",
      progress_percentage: 100,
      created_at: "2023-11-01T09:00:00Z",
      updated_at: "2023-12-20T16:45:00Z"
    },
    {
      id: "3",
      title: "JavaScript Fundamentals",
      description: "Core JavaScript concepts, ES6+, async programming",
      prompt_used: "Learn JavaScript fundamentals",
      duration_days: 21,
      daily_hours: 1,
      learning_style: "kinesthetic",
      status: "archived",
      start_date: "2023-09-01",
      expected_end_date: "2023-09-22",
      actual_completion_date: "2023-09-25",
      progress_percentage: 95,
      created_at: "2023-09-01T08:00:00Z",
      updated_at: "2023-09-25T20:15:00Z"
    },
    {
      id: "4",
      title: "TypeScript Advanced Patterns",
      description: "Advanced TypeScript features, generics, and type manipulation",
      prompt_used: "Learn advanced TypeScript",
      duration_days: 14,
      daily_hours: 2,
      learning_style: "balanced",
      status: "completed",
      start_date: "2024-03-01",
      expected_end_date: "2024-03-15",
      actual_completion_date: "2024-03-14",
      progress_percentage: 100,
      created_at: "2024-03-01T11:00:00Z",
      updated_at: "2024-03-14T19:20:00Z"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredCalendars = calendars
    .filter(calendar => {
      const matchesSearch = calendar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           calendar.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || calendar.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "duration":
          return b.duration_days - a.duration_days;
        case "progress":
          return b.progress_percentage - a.progress_percentage;
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'archived':
        return <Archive className="w-5 h-5 text-gray-600" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-600" />;
      default:
        return <Play className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800 border-green-200",
      archived: "bg-gray-100 text-gray-800 border-gray-200",
      paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
      active: "bg-blue-100 text-blue-800 border-blue-200"
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
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
    const completed = calendars.filter(c => c.status === 'completed').length;
    const totalHours = calendars.reduce((sum, c) => sum + (c.duration_days * c.daily_hours), 0);
    const avgProgress = calendars.reduce((sum, c) => sum + c.progress_percentage, 0) / calendars.length;
    const totalDays = calendars.reduce((sum, c) => sum + c.duration_days, 0);
    
    return { completed, totalHours, avgProgress, totalDays };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <History className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Learning History</h1>
          </div>
          <p className="text-gray-600">Track your completed learning journeys and achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
                <p className="text-gray-600 text-sm">Total Hours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgProgress)}%</p>
                <p className="text-gray-600 text-sm">Avg Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDays}</p>
                <p className="text-gray-600 text-sm">Total Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors appearance-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration">By Duration</option>
                <option value="progress">By Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Learning History Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your learning history...</p>
            </div>
          </div>
        ) : filteredCalendars.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCalendars.map((calendar) => (
              <div key={calendar.id} className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 h-40 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(calendar.status)}
                      <h2 className="text-xl w-64 font-bold">{calendar.title}</h2>
                    </div>
                    {getStatusBadge(calendar.status)}
                  </div>
                  <p className="text-blue-100 text-sm leading-relaxed">{calendar.description}</p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-blue-600">{calendar.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${calendar.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-gray-900">{calendar.duration_days}</p>
                      <p className="text-xs text-gray-600">Days</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-xl">
                      <Clock className="w-5 h-5 text-green-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-gray-900">{calendar.daily_hours}h</p>
                      <p className="text-xs text-gray-600">Daily</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(calendar.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expected End:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(calendar.expected_end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {calendar.actual_completion_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Completed:</span>
                        <span className="font-semibold text-green-700 flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {new Date(calendar.actual_completion_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Learning Style Badge */}
                  <div className="flex items-center gap-2 mb-6">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold border border-purple-200">
                      {calendar.learning_style.charAt(0).toUpperCase() + calendar.learning_style.slice(1)} Learning
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button className="px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors">
                      <Target className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Learning History Found</h3>
              <p className="text-gray-600 mb-6">
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