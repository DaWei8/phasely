import { TrendingUp } from "lucide-react";

export function StatsWidget() {
  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl shadow-gray-200/20 border border-white/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-xl">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="font-bold text-gray-900">This Week</h3>
      </div>
      <div className="text-3xl font-bold text-blue-600 mb-2">12h</div>
      <p className="text-sm text-gray-600">Learning time</p>
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
        <div className="bg-blue-500 h-2 rounded-full w-3/4 transition-all duration-500"></div>
      </div>
    </div>
  );
}