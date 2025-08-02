// app/dashboard/calendar/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  Star,
  ExternalLink,
  Edit,
  Save,
  X,
  Target,
  TrendingUp,
  Award,
  Lightbulb
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { GoogleCalendarModal, useGoogleCalendarModal } from "@/components/GoogleCalendarModal";
import { CalendarData } from "@/lib/googleCalendar"
import Image from "next/image";
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

const resourcesType = [
  {
    "link": "https://www.tutorialspoint.com/artificial_intelligence/artificial_intelligence_agents.htm",
    "name": "AI Agent Architecture"
  },
  {
    "link": "https://www.mpi-forum.org/",
    "name": "Message Passing Interface"
  }
]

interface DayModalData extends CalendarItem {
  resources?: typeof resourcesType;
}

export default function CalendarDetailPage() {
  const [calendar, setCalendar] = useState<CalendarData | null>(null);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayModalData | null>(null);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<number>(1);
  const [editSatisfaction, setEditSatisfaction] = useState<number>(1);
  const [editActualHours, setEditActualHours] = useState<number>(0);
  const router = useRouter();
  const params = useParams();
  const calendarId = params?.id as string;
  const { isOpen, openModal, closeModal } = useGoogleCalendarModal();

  useEffect(() => {
    if (calendarId) {
      fetchCalendarData();
    }
  }, [calendarId]);

  const fetchCalendarData = async () => {
    const supabase = await createClient();
    setLoading(true);

    try {
      // Fetch calendar info
      const { data: calendarData, error: calendarError } = await supabase
        .from("learning_calendars")
        .select("*")
        .eq("id", calendarId)
        .single();

      if (calendarError) {
        console.error("Error fetching calendar:", calendarError);
        return;
      }

      setCalendar(calendarData);

      // Fetch calendar items
      const { data: itemsData, error: itemsError } = await supabase
        .from("calendar_items")
        .select("*")
        .eq("calendar_id", calendarId)
        .order("day_number", { ascending: true });

      if (itemsError) {
        console.error("Error fetching calendar items:", itemsError);
      } else {
        setCalendarItems(itemsData || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (item: CalendarItem) => {
    const dayData: DayModalData = {
      ...item
    };
    setSelectedDay(dayData);
  };

  const handleCompleteDay = async (dayId: string, isCompleted: boolean) => {
    const supabase = await createClient();
     //console.log("this should be the calendar item id: ", dayId)

    try {
      const { error } = await supabase
        .from("calendar_items")
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq("id", dayId);

      const { error: pError } = await supabase
        .from("progress_entries")
        .update({
          completion_status: isCompleted,
        }).eq("calendar_item_id", dayId)

      if (!error || !pError) {
        setCalendarItems(prev => prev.map(item =>
          item.id === dayId
            ? { ...item, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : null }
            : item
        ));

        if (selectedDay && selectedDay.id === dayId) {
          setSelectedDay(prev => prev ? {
            ...prev,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null
          } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDay) return;

    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("calendar_items")
        .update({
          notes: editNotes,
          difficulty_rating: editDifficulty,
          satisfaction_rating: editSatisfaction,
          actual_hours_spent: editActualHours,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingDay);

      const { error: pError } = await supabase
        .from("progress_entries")
        .update({
          notes: editNotes,
          difficulty_rating: editDifficulty,
          satisfaction_rating: editSatisfaction,
          hours_spent: editActualHours,
        })
        .eq("calender_item_id", editingDay);

      if (!error || !pError) {
        setCalendarItems(prev => prev.map(item =>
          item.id === editingDay
            ? {
              ...item,
              notes: editNotes,
              difficulty_rating: editDifficulty,
              satisfaction_rating: editSatisfaction,
              actual_hours_spent: editActualHours
            }
            : item
        ));

        if (selectedDay && selectedDay.id === editingDay) {
          setSelectedDay(prev => prev ? {
            ...prev,
            notes: editNotes,
            difficulty_rating: editDifficulty,
            satisfaction_rating: editSatisfaction,
            actual_hours_spent: editActualHours
          } : null);
        }

        setEditingDay(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startEdit = (item: CalendarItem) => {
    setEditingDay(item.id);
    setEditNotes(item.notes || '');
    setEditDifficulty(item.difficulty_rating || 1);
    setEditSatisfaction(item.satisfaction_rating || 1);
    setEditActualHours(item.actual_hours_spent || 0);
  };

  // Helper function to get the actual date for a day number
  const getDateForDay = (dayNumber: number) => {
    if (!calendar) return new Date();
    const startDate = new Date(calendar.created_at);
    startDate.setHours(0, 0, 0, 0); // Normalize to start of day
    return new Date(startDate.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000);
  };

  const getDayStatus = (dayNumber: number) => {
    const today = new Date();
    const dayDate = getDateForDay(dayNumber);

    if (dayDate > today) return 'future';
    if (dayDate.toDateString() === today.toDateString()) return 'today';
    return 'past';
  };

  // Helper function to generate calendar grid with proper date alignment
  const generateCalendarGrid = () => {
    if (!calendar) return [];

    const startDate = new Date(calendar.created_at);
    // Normalize to start of day to avoid timezone issues
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate.getTime() + (calendar.duration_days - 1) * 24 * 60 * 60 * 1000);

    // Find the first day of the month that contains the start date
    const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    // Find the last day we need to show (end of the month containing the end date)
    const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);

    // Get the day of week for the first day of the month (0 = Sunday)
    const startDayOfWeek = firstDayOfMonth.getDay();

    const calendarCells = [];

    // Add empty cells for days before the start of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarCells.push({ isEmpty: true, date: null, dayNumber: null, item: null });
    }

    // Add all days from first day of month to last day of month
    const currentDate = new Date(firstDayOfMonth);
    while (currentDate <= lastDayOfMonth) {
      // Calculate the day number relative to the start date
      const timeDiff = currentDate.getTime() - startDate.getTime();
      const daysDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
      const dayNumber = daysDiff + 1; // day_number starts from 1

      const isInRange = currentDate >= startDate && currentDate <= endDate && dayNumber > 0;
      const item = isInRange ? calendarItems.find(item => item.day_number === dayNumber) : null;

      calendarCells.push({
        isEmpty: false,
        date: new Date(currentDate),
        dayNumber: isInRange ? dayNumber : null,
        item: item || null,
        isInRange
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return calendarCells;
  };

  // Get current month name
  const getCurrentMonthName = () => {
    if (!calendar) return '';
    const startDate = new Date(calendar.created_at);
    return startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderStars = (rating: number, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange?.(star)}
            className={`${star <= rating
              ? 'text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
              } hover:text-yellow-400 transition-colors ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
            disabled={!onChange}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const getCompletedDays = () => calendarItems.filter(item => item.is_completed).length;
  const getAverageHours = () => {
    const completedItems = calendarItems.filter(item => item.actual_hours_spent);
    return completedItems.length > 0
      ? (completedItems.reduce((acc, item) => acc + (item.actual_hours_spent || 0), 0) / completedItems.length).toFixed(1)
      : '0';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, ease: "linear", repeat: Infinity }}
        />
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Calendar not found
          </h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    );
  }

  const calendarGrid = generateCalendarGrid();

  return (
    <div className="mx-auto max-w-7xl p-6   space-y-8">
      {/* Header */}
      <div
        className="flex items-start justify-between"
      >
        <div className="flex w-full flex-col lg:flex-row items-start gap-4">
          <div className="flex gap-4 items-start" >
            <button
              onClick={() => router.back()}
              className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex flex-col " >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {calendar.title.trim().slice(0, 40)}...
              </h1>
              <p className="text-gray-600 lg:max-w-[70vw]  dark:text-gray-400 mt-1">
                {calendar.description && calendar.description.slice(0, 100)}...
              </p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex ml-auto justify-center md:w-fit w-full lg:float-right items-center gap-2 px-4 py-3 bg-blue-600/20 text-white rounded-md hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Image width={32} height={32} src={"/google_calendar.svg"} alt="google calendar" />
            Add to Google Calendar
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Completed',
            value: `${getCompletedDays()}/${calendar.duration_days}`,
            icon: CheckCircle2,
            color: 'green',
            percentage: (getCompletedDays() / calendar.duration_days) * 100
          },
          {
            label: 'Total Progress',
            value: `${Math.ceil(getCompletedDays() / calendar.duration_days * 100)}%`,
            icon: TrendingUp,
            color: 'blue',
            percentage: (getCompletedDays() / calendar.duration_days * 100)
          },
          {
            label: 'Avg Hours/Day',
            value: getAverageHours(),
            icon: Clock,
            color: 'purple',
            percentage: (parseFloat(getAverageHours()) / calendar.daily_hours) * 100
          },
          {
            label: 'Target Hours',
            value: `${calendar.daily_hours} h`,
            icon: Target,
            color: 'orange',
            percentage: 100
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white h-36 md:h-fit flex flex-col justify-between dark:bg-gray-800 md:p-4 rounded-2xl shadow-lg border p-3 border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col md:flex-row gap-3 items-center md:justify-between justify-between">
              <div className={`p-3 w-fit h-fit rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={` w-4 h-4 md:w-6 md:h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <div className=" flex flex-col items-center md:items-end text-right">
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className=" text-xs md:text-sm text-gray-600 text-center dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-${stat.color}-500 rounded-full`}
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(stat.percentage, 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-3.5 lg:p-6 pb-10"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Learning Calendar
            </h2>
          </div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            {getCurrentMonthName()}
          </div>
        </div>

        <div className="grid grid-cols-7 lg:gap-4 gap-2  mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center uppercase truncate text-xs md:text-base font-semibold p-2 w-full bg-gray-200 dark:bg-gray-700 rounded-md text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 lg:gap-4 gap-2">
          {calendarGrid.map((cell, index) => {
            if (cell.isEmpty) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const date = cell.date!;
            const dayNumber = cell.dayNumber;
            const item = cell.item;
            const isInRange = cell.isInRange;
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            const isFuture = date > today;
            const isCompleted = item?.is_completed || false;

            return (
              <motion.div
                key={`${date.getMonth()}-${date.getDate()}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={`
                  relative aspect-square p-2 lg:p-4 rounded-xl border-2 transition-all duration-300
                  ${!isInRange
                    ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 cursor-default'
                    : isFuture
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 cursor-pointer hover:shadow-lg hover:scale-105'
                      : isToday
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg cursor-pointer hover:shadow-xl hover:scale-105'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-lg hover:scale-105'
                  }
                  ${isCompleted && isInRange
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                    : ''
                  }
                  group
                `}
                onClick={() => item && isInRange && handleDayClick(item)}
                whileHover={isInRange ? { scale: 1.05 } : {}}
                whileTap={isInRange ? { scale: 0.98 } : {}}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`
                      text-sm font-bold
                      ${!isInRange
                        ? 'text-gray-300 dark:text-gray-700'
                        : isToday
                          ? 'text-blue-600 dark:text-blue-400'
                          : isFuture
                            ? 'text-gray-400 dark:text-gray-600'
                            : 'text-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {date.getDate()}
                    </span>
                    {isCompleted && isInRange && (
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>

                  {item && isInRange && (
                    <div className="flex-1 flex flex-col justify-between min-h-0">
                      <p className={`
                        text-xs md:flex hidden font-medium line-clamp-2 mb-1
                        ${isFuture
                          ? 'text-gray-400 dark:text-gray-600'
                          : 'text-gray-800 dark:text-gray-200'
                        }
                      `}>
                        {item.title}
                      </p>
                      <div className="md:flex hidden md:items-center mt-auto gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.estimated_hours} {item.estimated_hours >= 12 ? "m" : "h"}</span>
                      </div>
                    </div>
                  )}

                  {isToday && isInRange && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDay(null)}
          >

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Day {selectedDay.day_number}: {selectedDay.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {getDateForDay(selectedDay.day_number).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} • Phase {selectedDay.phase_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCompleteDay(selectedDay.id, !selectedDay.is_completed)}
                      className={`
                        px-4 py-2 rounded-lg font-medium text-nowrap w-fit transition-all flex items-center gap-2
                        ${selectedDay.is_completed
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }
                      `}
                    >
                      {selectedDay.is_completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                      {selectedDay.is_completed ? 'Completed' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    {selectedDay.description}
                  </p>
                </div>

                {/* Time & Progress */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Estimated Time</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedDay.estimated_hours} {selectedDay.estimated_hours >= 12 ? "mins" : "hours"}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Phase</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedDay.phase_number}
                    </p>
                  </div>
                </div>

                {/* Resources */}
                {selectedDay.resources && selectedDay.resources.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Resources</h4>
                    <div className="space-y-2">
                      {selectedDay.resources.map((resource, index) => (
                        <Link
                          href={resource.link}
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          <span className="flex-1 text-gray-700 dark:text-gray-300">{resource.name}</span>
                          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion Details */}
                {selectedDay.is_completed && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">Progress Details</h4>
                      {editingDay === selectedDay.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={() => setEditingDay(null)}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(selectedDay)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Actual Hours Spent
                        </label>
                        {editingDay === selectedDay.id ? (
                          <input
                            type="number"
                            step="0.1"
                            value={editActualHours}
                            onChange={(e) => setEditActualHours(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {selectedDay.actual_hours_spent || 0} hours
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Difficulty Rating
                        </label>
                        {editingDay === selectedDay.id ? (
                          <div className="flex gap-1">
                            {renderStars(editDifficulty, setEditDifficulty)}
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {renderStars(selectedDay.difficulty_rating || 0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Satisfaction Rating
                        </label>
                        {editingDay === selectedDay.id ? (
                          <div className="flex gap-1">
                            {renderStars(editSatisfaction, setEditSatisfaction)}
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {renderStars(selectedDay.satisfaction_rating || 0)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Lightbulb className="w-4 h-4 inline mr-1" />
                        Notes & Reflections
                      </label>
                      {editingDay === selectedDay.id ? (
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add your thoughts, learnings, or challenges from this day..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-24"
                        />
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg min-h-[60px]">
                          {selectedDay.notes || 'No notes added yet.'}
                        </p>
                      )}
                    </div>

                    {selectedDay.completed_at && (
                      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Completed on {new Date(selectedDay.completed_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GoogleCalendarModal
        isOpen={isOpen}
        onClose={closeModal}
        calendar={calendar}
        calendarItems={calendarItems}
        googleApiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY!}
        googleClientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
      />
    </div>
  );
}