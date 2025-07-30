// app/dashboard/calendar/page.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import AICalendarSection from "@/components/dashboard/AICalendarSection";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  SparklesIcon,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  Eye,
  MoreVertical,
  Filter,
  Search,
  CalendarClock
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CalendarType {
  id: string;
  title: string;
  description: string;
  daily_hours: number;
  duration_days: number;
  progress_percentage: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  user_id: string;
}

export default function CalendarPage() {
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [filteredCalendars, setFilteredCalendars] = useState<CalendarType[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredCalendar, setHoveredCalendar] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const router = useRouter();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />;
      case 'paused': return <Pause className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:pt-8 space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex items-start gap-4">
            <motion.div
              className="p-3 bg-blue-600 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Learning Calendars
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and track your learning journey
              </p>
            </div>
          </div>

          <motion.button
            className="bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SparklesIcon className="w-5 h-5" />
            Create Calendar
          </motion.button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Calendars', value: calendars.length, icon: BookOpen, color: 'blue' },
            { label: 'Active', value: calendars.filter(c => c.status === 'active').length, icon: Play, color: 'green' },
            { label: 'Completed', value: calendars.filter(c => c.status === 'completed').length, icon: CheckCircle, color: 'purple' },
            { label: 'Avg Progress', value: `${Math.round(calendars.reduce((acc, c) => acc + c.progress_percentage, 0) / calendars.length || 0)}%`, icon: TrendingUp, color: 'orange' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search calendars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pr-8 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          />
        </div>
      ) : filteredCalendars.length ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredCalendars.map((calendar) => (
            <div
              key={calendar.id}
              // variants={cardVariants}
              className={`bg-white hover:dark:bg-blue-700 hover:dark:bg-opacity-20 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 cursor-pointer group ${hoveredCalendar === calendar.id ? 'scale-102  shadow-2xl' : ''
                }`}
              onMouseEnter={() => setHoveredCalendar(calendar.id)}
              onMouseLeave={() => setHoveredCalendar(null)}
              onClick={() => router.push(`/dashboard/calendars/${calendar.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 transition-all duration-200"
                  >
                    <div className="w-9 h-9 p-1.5 flex items-center gap-2 bg-blue-100 dark:bg-blue-100 rounded-lg " >
                      <CalendarClock className="  text-blue-400 dark:text-blue-600" />
                    </div>
                    <h3 title={calendar.title} className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                      {calendar.title}
                    </h3>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(calendar.status)}`}>
                    {getStatusIcon(calendar.status)}
                    <span className="capitalize">{calendar.status}</span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(showDropdown === calendar.id ? null : calendar.id);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {showDropdown === calendar.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10"
                      >
                        <div className="p-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/calendars/${calendar.id}`);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Calendar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCalendarStatusUpdate(calendar.id, calendar.status === 'active' ? 'paused' : 'active');
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {calendar.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {calendar.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCalendarStatusUpdate(calendar.id, 'completed');
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-2 text-sm">
                {calendar.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {calendar.progress_percentage}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${calendar.progress_percentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{calendar.daily_hours}h/day</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Target className="w-4 h-4" />
                    <span>{calendar.duration_days} days</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 text-blue-500"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <SparklesIcon className="h-full w-full" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {searchQuery || selectedStatus !== 'all' ? 'No calendars found' : 'No calendars yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchQuery || selectedStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first learning calendar to get started on your journey'
            }
          </p>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your First Calendar
          </motion.button>
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <AICalendarSection onCancel={() => setShowCreateModal(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}