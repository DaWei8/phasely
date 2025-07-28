"use client";
import { useState, useEffect } from "react";
import { Sparkles, Calendar, Target, Plus, BookOpen, Clock, TrendingUp, Flame, CheckCircle, ArrowRight, Star, Zap, Award } from 'lucide-react';
// import TodayWidget from "@/components/dashboard/TodayWidget";
// import StreakWidget from "@/components/dashboard/StreakWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActions";
import { StatsWidget } from "@/components/dashboard/StatsWidget";
import { AchievementsWidget } from "@/components/dashboard/AchievementsWidget";
import { ProgressWidget } from "@/components/dashboard/ProgressWidget";
import { MotivationWidget } from "@/components/dashboard/MotivationWidget";
import { TodayWidget } from "@/components/dashboard/TodayWidget";
import { StreakWidget } from "@/components/dashboard/StreakWidget";



export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <div className="text-left mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-blue-200/20 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
                    <div className="absolute inset-0 h-8 w-8 text-blue-400 animate-ping opacity-75">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent">
                    {greeting}, John!
                  </h1>
                </div>
                <p className="text-gray-600 text-sm lg:text-lg">Ready to continue your learning journey?</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatTime(currentTime)}</div>
                <div className="text-sm text-gray-600">{formatDate(currentTime)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TodayWidget />
          <StreakWidget />
          <QuickActionsWidget />
        </div>

        {/* Secondary Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsWidget />
          <AchievementsWidget />
          <ProgressWidget />
          <MotivationWidget />
        </div>
      </div>
    </main>
  );
}
