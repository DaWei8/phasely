import { TrendingUp } from "lucide-react";

export function StatsWidget() {
  return (
    <div className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm lg:p-6 p-3 shadow-xl shadow-gray-200/20 dark:shadow-gray-900/20 border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-300" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100">This Week</h3>
      </div>
      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">12h</div>
      <p className="text-sm text-gray-600 dark:text-gray-300">Learning time</p>
      <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full w-3/4 transition-all duration-500"></div>
      </div>
    </div>
  );
}