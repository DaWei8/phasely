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

            // Fetch user profile
            const { data: profileData } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            // Fetch user achievements
            const { data: achievementsData } = await supabase
                .from("user_achievements")
                .select("*, achievements(*)")
                .eq("user_id", user.id);

            setProfile(profileData);
        })();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Profile</h1>

            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-4 mb-6">
                    <Image
                        src={user?.user_metadata?.avatar_url || "/assets/favicon-32x32.png"}
                        alt="profile image"
                        width={32}
                        height={32}
                        className="h-10 w-10 rounded-full"
                    />
                    <div>
                        <h2 className="text-xl font-semibold">{profile?.display_name}</h2>
                        <p className="text-gray-500">{profile?.email}</p>
                    </div>
                </div>
                <div className="border-t py-4">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`px-4 py-2 ${activeTab === "overview"
                                ? "border-b-2 border-blue-600 font-medium"
                                : ""
                                }`}
                        >
                            Overview
                        </button>
                        
                    </div>
                </div>
            </div>

            {activeTab === "overview" && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Learning Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="font-medium">Learning Style:</p>
                            <p className="text-gray-600">{profile?.learning_style}</p>
                        </div>
                        <div>
                            <p className="font-medium">Weekly Commitment:</p>
                            <p className="text-gray-600">
                                {profile?.weekly_commitment_hours} hours
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}