"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { CalendarItem } from "@/types/supabase";

export default function TodayWidget() {
    const [tasks, setTasks] = useState<CalendarItem[]>([]);

    useEffect(() => {
        (async () => {
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date();
            const start = today.toISOString().split("T")[0];
            const { data } = await supabase
                .from("calendar_items")
                .select("*")
                .eq("is_completed", false)
                .order("day_number", { ascending: true })
                .limit(3);

            setTasks(data ?? []);
        })();
    }, []);

    return (

        <div className="relative rounded-xl w-full bg-white p-4 shadow">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl" />
            <h2 className="mb-2 text-lg font-semibold text-gray-600">Today</h2>
            {tasks.length ? (
                <ul className="space-y-2 text-sm">
                    {tasks.map((t) => (
                        <li key={t.id}>{t.title}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-400">Nothing scheduled</p>
            )}
            <div className={`
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20
        opacity-0 group-hover:opacity-100
        transition-opacity duration-500
        blur-sm -z-10
        transform scale-105
      `} />
        </div>
    );
}