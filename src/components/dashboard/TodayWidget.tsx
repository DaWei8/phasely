import { ArrowRight, Calendar, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

interface CalendarItem {
  id: string;
  title: string;
  description: string;
  day_number: number;
  is_completed: boolean;
  estimated_duration: number;
}

export function TodayWidget() {
  const [tasks, setTasks] = useState<CalendarItem[]>([
    {
      id: "1",
      title: "Complete React Hooks Tutorial",
      description: "Learn useState and useEffect",
      day_number: 1,
      is_completed: false,
      estimated_duration: 120
    },
    {
      id: "2",
      title: "Practice JavaScript Exercises",
      description: "Array methods and functions",
      day_number: 1,
      is_completed: false,
      estimated_duration: 90
    },
    {
      id: "3",
      title: "Read TypeScript Documentation",
      description: "Advanced types chapter",
      day_number: 1,
      is_completed: false,
      estimated_duration: 60
    }
  ]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm lg:p-6 p-3 shadow-xl shadow-blue-200/20 dark:shadow-blue-900/20 border border-white/20 dark:border-gray-700/20 hover:shadow-2xl hover:shadow-blue-300/30 dark:hover:shadow-blue-700/30 transition-all duration-500 transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 via-blue-500/10 to-blue-500/10 dark:from-blue-400/10 dark:via-blue-400/10 dark:to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Today's Tasks
          </h2>
          <div className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
            {tasks.length}
          </div>
        </div>

        {tasks.length ? (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-700/80 hover:bg-blue-50/80 dark:hover:bg-blue-900/80 transition-all duration-300 group-hover:transform group-hover:translate-x-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {task.estimated_duration}min
                    </span>
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 cursor-pointer transition-colors" />
              </div>
            ))}
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
          <button className="w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
            <span>View All Tasks</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}