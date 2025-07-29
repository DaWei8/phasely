import { Target } from "lucide-react";

export function ProgressWidget() {
  return (
    <div className="rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-xl shadow-gray-200/20 dark:shadow-gray-900/20 border border-white/20 dark:border-gray-700/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-xl">
          <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100">Progress</h3>
      </div>
      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
        85%
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Current path completion
      </p>
    </div>
  );
}