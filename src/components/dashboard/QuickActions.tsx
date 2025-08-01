import { ArrowRight, BookOpen, HeartPulse, Plus, Target, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export function QuickActionsWidget() {
  const actions = [
    {
      icon: BookOpen,
      label: "My Calendars",
      href: "/dashboard/calendars",
      color: "blue",
      description: "Continue where you left off"
    },
    {
      icon: Plus,
      label: "Create New Calendars",
      href: "/dashboard/calendars/",
      color: "blue",
      description: "Start your next journey"
    },
    {
      icon: TrendingUp,
      label: "See Progress",
      href: "/dashboard/progress",
      color: "green",
      description: "Tack your current progress"
    },
    {
      icon: HeartPulse,
      label: "Create New Habit",
      href: "/dashboard/habits/create",
      color: "yellow",
      description: "Build healthy habits"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 ";
      case "blue":
        return "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 ";
      case "green":
        return "from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 ";
      case "yellow":
        return "from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 hover:from-yellow-600 hover:to-yellow-700 dark:hover:from-yellow-700 dark:hover:to-yellow-800 ";
      default:
        return "from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 hover:from-gray-600 hover:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-800 ";
    }
  };

  return (
    <div className="group relative rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 lg:p-6 shadow-xl shadow-gray-200/30 dark:shadow-gray-900/30 border border-white/20 dark:border-gray-700/20 hover:shadow-2xl hover:shadow-gray-300/40 dark:hover:shadow-gray-700/40 transition-all duration-500 transform hover:-translate-y-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
          <Zap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Quick Actions
        </h2>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link
            href={action.href}
            key={action.label}
            className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${getColorClasses(
              action.color
            )} text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <action.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold">{action.label}</p>
              <p className="text-sm opacity-90">{action.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 opacity-70" />
          </Link>
        ))}
      </div>
    </div>
  );
}