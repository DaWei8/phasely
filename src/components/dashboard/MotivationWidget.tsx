import { Star } from "lucide-react";
import { useState } from "react";

export function MotivationWidget() {
  const quotes = [
    "Every expert was once a beginner",
    "Progress, not perfection",
    "Learning never exhausts the mind",
    "The beautiful thing about learning is nobody can take it away from you"
  ];
  
  const [currentQuote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl shadow-purple-200/30 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Star className="h-6 w-6 animate-pulse" />
        <h3 className="font-bold">Daily Motivation</h3>
      </div>
      <p className="text-sm italic">"{currentQuote}"</p>
    </div>
  );
}