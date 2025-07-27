// app/dashboard/layout 
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import { CalendarCheck, HeartPulse, History, LayoutDashboard, Medal, MessageCircle, Settings, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/types/supabase";
import clsx from 'clsx';

const nav = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5 text-blue-600" /> },
    { name: "My Calendars", href: "/dashboard/calendars", icon: <CalendarCheck className="w-5 h-5 text-blue-600" /> },
    { name: "Progress", href: "/dashboard/progress", icon: <TrendingUp className="w-5 h-5 text-blue-600" /> },
    { name: "Achievements", href: "/dashboard/achievements", icon: <Medal className="w-5 h-5 text-blue-600" /> },
    { name: "Habits", href: "/dashboard/habits", icon: <HeartPulse className="w-5 h-5 text-blue-600" /> },
    { name: "Notifications", href: "/dashboard/notifications", icon: <MessageCircle className="w-5 h-5 text-blue-600" /> },
    { name: "History", href: "/dashboard/history", icon: <History className="w-5 h-5 text-blue-600" /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings className="w-5 h-5 text-blue-600" /> },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    const pathname = usePathname();
    const router = useRouter();
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

    const signOut = async () => {
        const supabase = await createClient()
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="flex w-screen h-screen bg-gray-50">
            <aside className="w-64 h-full flex flex-col items-start gap-10 shrink-0 bg-white p-4 shadow">
                <Link href={"/dashboard/"}>
                    <Image
                        src="/assets/phasely-logo-2.svg"
                        alt="Phasely Logo"
                        width={96}
                        height={32}
                        className="h-6 ml-3 w-auto"
                    />
                </Link>
                <nav className="space-y-2 w-full flex flex-col mb-auto">
                    {nav.map((item) => {
                        const currentPath = pathname.endsWith('/')
                            ? pathname.slice(0, -1)
                            : pathname;
                        const itemPath = item.href.endsWith('/')
                            ? item.href.slice(0, -1)
                            : item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "flex gap-2 items-center rounded-md px-3 py-4 text-sm font-medium hover:bg-blue-100",
                                    pathname === item.href ? "bg-blue-50 text-gray-800" : "text-gray-600"
                                )}
                            >
                                {item.icon} <p>{item.name}</p>
                            </Link>
                        )

                    })}
                </nav>
                <button
                    onClick={signOut}
                    className="mt-8 w-full float-end font-medium rounded-md bg-gray-200 px-3 py-4 text-sm"
                >
                    Sign out
                </button>
            </aside>

            {/* Main */}
            <main className="flex-1 w-full flex-col overflow-y-auto">
                <header className="flex rounded-2xl bg-white fixed right-4 z-10 items-center justify-end pt-6 p-2">
                    <Link title="View Profile" href="/dashboard/profile">
                        <Image
                            src={user?.user_metadata?.avatar_url || "/assets/favicon-32x32.png"}
                            alt="profile image"
                            width={32}
                            height={32}
                            className="h-10 w-10 rounded-full"
                        />
                    </Link>
                </header>
                {children}
            </main>
        </div>
    );
}