import { Award } from "lucide-react";

export function AchievementsWidget() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 lg:p-6 p-3 shadow-xl shadow-orange-600/30 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600 dark:bg-blue-600 rounded-xl" >
          <Award className="h-6 w-6" />
        </div>
        <h3 className="font-bold">Latest Achievement</h3>
      </div>
      <div className="text-lg font-semibold mb-1">Week Warrior</div>
      <p className="text-sm opacity-90">Completed 7 days straight!</p>
    </div>
  );
}
