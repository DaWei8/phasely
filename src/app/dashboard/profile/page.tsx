// app/dashboard/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setUser(user);
      setProfile(profileData);
    })();
  }, []);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Profile
      </h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-gray-900/50">
        {/* Avatar & Name */}
        <div className="flex items-center space-x-4 mb-6">
          <Image
            src={user?.user_metadata?.avatar_url || "/assets/favicon-32x32.png"}
            alt="profile image"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {profile?.display_name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{profile?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 dark:border-gray-700 py-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-md
                ${activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                }`}
            >
              Overview
            </button>
          </div>
        </div>
      </div>

      {/* Overview Panel */}
      {activeTab === "overview" && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-gray-900/50">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Learning Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Learning Style:
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {profile?.learning_style}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Weekly Commitment:
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {profile?.weekly_commitment_hours} hours
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}