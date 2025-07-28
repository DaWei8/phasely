// app/dashboard/calendar/page.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import AICalendarSection from "@/components/dashboard/AICalendarSection";
import { motion } from "framer-motion";
import { SparklesIcon } from "lucide-react";

export default function CalendarPage() {
  const [calendars, setCalendars] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredCalendar, setHoveredCalendar] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("learning_calendars")
          .select("*, calendar_items:calendar_items(*)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching calendars:", error);
        } else {
          const typeSafeCalendars = data?.map((calendar) => ({
            ...calendar,
            daily_hours: Math.round(calendar.daily_hours),
            duration_days: Math.round(calendar.duration_days),
            progress_percentage: Math.round(calendar.progress_percentage),
          })) || [];

          setCalendars(typeSafeCalendars);
        }
      } catch (error) {
        console.error("Error fetching calendars:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCalendarStatusUpdate = async (id: string, status: string) => {
    try {
      const supabase = await createClient();
      await supabase
        .from("learning_calendars")
        .update({ status })
        .eq("id", id);
    } catch (error) {
      console.error("Error updating calendar status:", error);
    }
  };

  return (
    <div className=" mx-auto max-w-7xl p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white text-gray-800">
        <motion.span
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          📅 My Learning Calendars
        </motion.span>
      </h1>

      <div className="mb-8">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transition-all"
          onClick={() => setShowCreateModal(true)}
        >
          <motion.span
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring" }}
          >
            <SparklesIcon className="inline-block mr-2 h-5 w-5" /> Create New Calendar
          </motion.span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
          ></motion.div>
        </div>
      ) : calendars.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {calendars.map((calendar) => (
            <motion.div
              key={calendar.id}
              className={`bg-white rounded-xl shadow-lg p-6 transition-all ${
                hoveredCalendar === calendar.id ? "shadow-2xl" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => setHoveredCalendar(calendar.id)}
              onMouseLeave={() => setHoveredCalendar(null)}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">{calendar.title}</h2>
                <div className="space-x-3">
                  <button
                    onClick={() => handleCalendarStatusUpdate(calendar.id, "paused")}
                    className="text-yellow-600 hover:text-yellow-800 focus:outline-none"
                  >
                    Pause
                  </button>
                  <button
                    onClick={() => handleCalendarStatusUpdate(calendar.id, "completed")}
                    className="text-green-600 hover:text-green-800 focus:outline-none"
                  >
                    Complete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-6 line-clamp-2">{calendar.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-500">
                  {calendar.duration_days} days · {calendar.daily_hours} hours/day
                </div>
                <div className="text-gray-400">
                  Progress: {calendar.progress_percentage}%
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <motion.div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${calendar.progress_percentage}%` }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${calendar.progress_percentage}%` }}
                  transition={{ duration: 1 }}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-4">
          <motion.div
            className="w-16 h-16 text-blue-500"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <SparklesIcon className="h-full w-full" />
          </motion.div>
          <p className="text-gray-500 text-center">
            You don't have any active learning calendars yet. Get started by creating your first calendar!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transition-all"
          >
            Create Your First Calendar
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-3xl overflow-y-scroll h-[85dvh] bg-white rounded-xl shadow-2xl mx-3 p-8">
            <AICalendarSection onCancel={() => setShowCreateModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}