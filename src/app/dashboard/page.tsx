// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { UserProfile } from "@/types/supabase";
import TodayWidget from "@/components/dashboard/TodayWidget";
import StreakWidget from "@/components/dashboard/StreakWidget";
import QuickActions from "@/components/dashboard/QuickActions";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

export default function DashboardPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        (async () => {
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser(user)

            const { data } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            setProfile(data);
        })();
    }, []);

    // if (!profile) {
    //     return (
    //         <div className="flex h-screen items-center justify-center">
    //             <div className="text-gray-500">Loading…</div>
    //         </div>
    //     );
    // }

    return (
        <main className="w-full p-4 md:p-6">
            <header className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back
                </h1>
                <Image
                    src={user?.user_metadata?.avatar_url || "/assets/favicon-32x32.png"}
                    alt="profile image"
                    width={32}
                    height={32}
                    className="h-10 w-10 rounded-full"
                />
            </header>

            <section className="grid max-w-7xl gap-6 md:grid-cols-3">
                <TodayWidget />
                <StreakWidget />
                <QuickActions />
            </section>
        </main>
    );
}