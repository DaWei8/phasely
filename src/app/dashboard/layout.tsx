"use client";
// import { Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";
import { CalendarCheck, HeartPulse, History, LayoutDashboard, Medal, MessageCircle, Settings, TrendingUp } from "lucide-react";

const nav = [
    { name: "Dashboard", href: "/dashboard/", icon: <LayoutDashboard className="w-5 h-5 text-blue-600" /> },
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

    const router = useRouter();

    const signOut = async () => {
        const supabase = await createClient()
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 h-full flex flex-col items-start gap-10 shrink-0 bg-white p-4 shadow">
                <Link href={"/dashboard/profile/"}>
                    <Image
                        src="/assets/phasely-logo-2.svg"
                        alt="Phasely Logo"
                        width={96}
                        height={32}
                        className="h-6 ml-3 w-auto"
                    />
                </Link>
                <nav className="space-y-2 w-full flex flex-col mb-auto ">
                    {nav.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex gap-2 items-center rounded-md px-3 py-4 text-sm font-medium hover:bg-blue-100"
                        >
                            {item.icon} <p>{item.name}</p>
                        </Link>
                    ))}
                </nav>
                <button
                    onClick={signOut}
                    className="mt-8 w-full float-end font-medium rounded-md bg-red-200 px-3 py-4 text-sm"
                >
                    Sign out
                </button>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}