import { ArrowRight, BookOpen, Plus, Target, Zap } from "lucide-react";

export function QuickActionsWidget() {
  const actions = [
    {
      icon: Plus,
      label: "New Learning Path",
      href: "/dashboard/calendar/create",
      color: "blue",
      description: "Start your next journey"
    },
    {
      icon: BookOpen,
      label: "My Learning Paths",
      href: "/dashboard/calendars", 
      color: "purple",
      description: "Continue where you left off"
    },
    {
      icon: Target,
      label: "Set Goals",
      href: "/dashboard/goals",
      color: "green",
      description: "Define your objectives"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200';
      case 'purple':
        return 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-purple-200';
      case 'green':
        return 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-200';
      default:
        return 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-gray-200';
    }
  };

  return (
    <div className="group relative rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl shadow-gray-200/30 border border-white/20 hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-500 transform hover:-translate-y-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
          <Zap className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={action.label}
            className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${getColorClasses(action.color)} text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
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
          </button>
        ))}
      </div>
    </div>
  );
}