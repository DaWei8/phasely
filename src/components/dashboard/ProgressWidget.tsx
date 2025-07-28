import { Target } from "lucide-react";

export function ProgressWidget() {
  return (
    <div className="rounded-3xl bg-white/80 backdrop-blur-sm p-6 shadow-xl shadow-gray-200/20 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-xl">
          <Target className="h-5 w-5 text-green-600" />
        </div>
        <h3 className="font-bold text-gray-900">Progress</h3>
      </div>
      <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
      <p className="text-sm text-gray-600">Current path completion</p>
    </div>
  );
}