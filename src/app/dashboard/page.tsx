// app/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { QuickActionsWidget } from "@/components/dashboard/QuickActions";
import { StatsWidget } from "@/components/dashboard/StatsWidget";
import { AchievementsWidget } from "@/components/dashboard/AchievementsWidget";
import { ProgressWidget } from "@/components/dashboard/ProgressWidget";
import { MotivationWidget } from "@/components/dashboard/MotivationWidget";
import { StreakWidget } from "@/components/dashboard/StreakWidget";
import { createClient } from "@/lib/supabase";
import TodayWidget from "@/components/dashboard/TodayWidget";

const supabase = createClient();

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");
  const [name, setName] = useState("");

  // Fixed: Added dependency array to prevent infinite loop
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Fetching user profile...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }

        if (!user) {
          console.log("No user found");
          return;
        }

        console.log("User ID:", user.id);

        /* ---- Get Name ---- */
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        if (profile && profile.display_name) {
          console.log("Display name found:", profile.display_name);
          setName(profile.display_name);
        } else {
          console.log("No display name found in profile");
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchUserProfile();
  }, []); // Added empty dependency array

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <div className="text-left mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl lg:p-6 p-5 py-7 border border-white/20 dark:border-gray-700/20">
            <div className="flex flex-wrap gap-8 items-center justify-between">
              <div className="w-fit mr-auto gap-1">
                <div className="flex w-fit items-center gap-3 mb-2">
                  <div className="relative">
                    <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
                    <div className="absolute inset-0 h-8 w-8 text-blue-400 animate-ping opacity-75">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  </div>
                  <h1 className="text-3xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 bg-clip-text text-transparent">
                    {greeting}{name ? `, ${name.split(' ')[0]}!` : "!"}
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-lg">
                  Ready to continue your learning journey?
                </p>
              </div>
              <div className="text-right w-full justify-between flex flex-row-reverse md:block gap-2 items-center ml-auto md:w-fit">
                <div className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TodayWidget />
          <QuickActionsWidget />
          <StreakWidget />
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
