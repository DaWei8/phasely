import { Flame } from "lucide-react";
import { useEffect, useState } from "react";

export function StreakWidget() {
  const [streak, setStreak] = useState(7);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="group relative rounded-3xl bg-gradient-to-br from-blue-400 via-blue-600 to-blue-500 dark:from-blue-500 dark:via-blue-700 dark:to-blue-600 p-6 hover:shadow-2xl hover:shadow-blue-300/40 dark:hover:shadow-blue-500/40 transition-all duration-500 transform hover:-translate-y-2 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">Learning Streak</h2>
        </div>

        <div className="text-center">
          <div
            className={`text-[100px] font-bold mb-2 ${
              isAnimating ? "animate-pulse" : ""
            }`}
          >
            {streak}
          </div>
          <p className="text-white/90 text-lg font-medium">Days Strong! 🔥</p>

          <div className="mt-4 flex justify-center gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < streak ? "bg-white" : "bg-white/30"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">Keep it up! You're on fire! 🚀</p>
        </div>
      </div>
    </div>
  );
}