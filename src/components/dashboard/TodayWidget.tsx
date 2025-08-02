import { ArrowRight, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CalendarItem {
  id: string;
  title: string;
  description: string;
  day_number: number;
  phase_number: number;
  is_completed: boolean;
  estimated_hours: number;
  calendar_id: string;
  calendar?: {
    id: string;
    title: string;
    duration_days: number;
  };
}

interface Calendar {
  id: string;
  title: string;
  duration_days: number;
  status: string;
}

import { createClient } from "@/lib/supabase";

const supabase = createClient();

export default function TodayWidget() {
  const [tasks, setTasks] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to determine task priority based on phase and day
  const getTaskPriority = (task: CalendarItem) => {
    // Priority logic:
    // 1. Lower phase numbers get higher priority (earlier in learning path)
    // 2. Within same phase, lower day numbers get higher priority
    // 3. This ensures users progress through content in the intended order

    return {
      priority: task.phase_number,
      day: task.day_number
    };
  };

  // Function to sort tasks by priority
  const sortTasksByPriority = (tasks: CalendarItem[]) => {
    return tasks.sort((a, b) => {
      const priorityA = getTaskPriority(a);
      const priorityB = getTaskPriority(b);

      // First sort by phase_number (ascending - earlier phases first)
      if (priorityA.priority !== priorityB.priority) {
        return priorityA.priority - priorityB.priority;
      }

      // Then by day_number (ascending - earlier days first)
      return priorityA.day - priorityB.day;
    });
  };

  // Get task status - simplified without current_day tracking
  const getTaskStatus = (task: CalendarItem) => {
    // Since we don't have current_day tracking, we'll use phase_number as indicator
    if (task.phase_number === 1) {
      return { status: "priority", color: "text-green-600 dark:text-green-400" };
    } else if (task.phase_number === 2) {
      return { status: "medium", color: "text-yellow-600 dark:text-yellow-400" };
    } else {
      return { status: "future", color: "text-blue-600 dark:text-blue-400" };
    }
  };

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

       //console.log('Fetching calendars...');

      // First, fetch all active calendars
      const { data: calendars, error: calendarsError } = await supabase
        .from('learning_calendars')
        .select(`
          id,
          title,
          duration_days,
          status
        `)
        .eq('status', 'active'); // Changed from false to 'active'

       //console.log('Calendars response:', { calendars, calendarsError });

      if (calendarsError) {
        console.error('Calendars error:', calendarsError);
        throw new Error(`Calendar fetch failed: ${calendarsError.message}`);
      }

      if (!calendars || calendars.length === 0) {
         //console.log('No active calendars found');
        setTasks([]);
        return;
      }

      // Create a map for quick calendar lookup
      const calendarsMap = new Map<string, Calendar>();
      calendars.forEach(cal => calendarsMap.set(cal.id, cal));

      // Get calendar IDs
      const calendarIds = calendars.map(cal => cal.id);
       //console.log('Calendar IDs:', calendarIds);

      // Fetch incomplete tasks from all active calendars
      const { data: tasksData, error: tasksError } = await supabase
        .from('calendar_items')
        .select(`
          id,
          title,
          description,
          day_number,
          phase_number,
          is_completed,
          estimated_hours,
          calendar_id
        `)
        .in('calendar_id', calendarIds)
        .eq('is_completed', false) // This correctly filters for incomplete tasks
        .order('phase_number', { ascending: true });

       //console.log('Tasks response:', { tasksData, tasksError });

      if (tasksError) {
        console.error('Tasks error:', tasksError);
        throw new Error(`Tasks fetch failed: ${tasksError.message}`);
      }

      if (tasksData) {
         //console.log('Processing tasks:', tasksData.length);

        // Add calendar info to tasks
        const tasksWithCalendar = tasksData.map(task => ({
          ...task,
          calendar: calendarsMap.get(task.calendar_id)
        }));

        const sortedTasks = sortTasksByPriority(tasksWithCalendar);
        const topTasks = sortedTasks.slice(0, 3); // Get top 3 tasks
         //console.log('Final tasks:', topTasks);
        setTasks(topTasks);
      }
    } catch (err) {
      console.error('Full error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    try {
      // Update task in Supabase
      const { error } = await supabase
        .from('calendar_items')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      // Remove from local state
      setTasks(prevTasks =>
        prevTasks.filter(task => task.id !== taskId)
      );

      // Refetch to get the next priority task
      setTimeout(() => {
        fetchTasks();
      }, 500);
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const handleTaskClick = (calendarId: string) => {
    router.push(`/dashboard/calendars/${calendarId}`);
  };

  if (loading) {
    return (
      <div className="group relative rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm lg:p-6 p-3 border border-white/20 dark:border-gray-700/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group relative rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm lg:p-6 p-3 border border-red-200/20 dark:border-red-700/20">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>Error loading tasks: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm lg:p-6 p-3 border border-white/20 dark:border-gray-700/20 hover:shadow-2xl hover:shadow-blue-300/30 dark:hover:shadow-blue-900/30 transition-all duration-500 transform hover:-translate-y-1">
      {/* Animated background */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/10 to-blue-500/10 dark:from-blue-400/10 dark:via-blue-400/10 dark:to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative w-full z-10">
        <div className="flex items-center gap-3 flex-1 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Top Priority Tasks
          </h2>
          <div className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
            {tasks.length}
          </div>
        </div>

        {tasks.length > 0 ? (
          <div className="space-y-3 flex-1 w-full">
            {tasks.map((task, index) => {
              const taskStatus = getTaskStatus(task);

              return (
                <div
                  key={task.id}
                  className="flex relative items-center gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-700/80 hover:bg-blue-50/80 dark:hover:bg-blue-900/80 transition-all duration-300 group/item cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleTaskClick(task.calendar_id)}
                >
                  <div className="flex absolute right-2 top-2  items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${taskStatus.status === 'priority' ? 'bg-green-500 dark:bg-green-400' :
                          taskStatus.status === 'medium' ? 'bg-yellow-500 dark:bg-yellow-400' :
                            'bg-blue-500 dark:bg-blue-400'
                        }`}
                    />

                  </div>
                  <div className="flex-1">
                    <div className=" flex gap-1 items-center" >
                      <span className="text-xs text-nowrap font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        Phase {task.phase_number}
                      </span>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {task.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {task.description.slice(0, 40)}...
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {task.estimated_hours}h
                        </span>
                      </div>
                      <span className={`text-xs text-nowrap font-medium ${taskStatus.color}`}>
                        Day {task.day_number}
                      </span>

                    </div>
                  </div>
                  <CheckCircle
                    className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 cursor-pointer transition-colors opacity-0 group-hover/item:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskComplete(task.id);
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              All caught up! Great work! 🎉
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            className="w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            onClick={() => router.push('/dashboard/calendars')}
          >
            <span>View All Calendars</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}