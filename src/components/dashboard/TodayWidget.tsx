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
        <div className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-2 text-sm font-semibold text-gray-600">Today</h2>
            {tasks.length ? (
                <ul className="space-y-2 text-sm">
                    {tasks.map((t) => (
                        <li key={t.id}>{t.title}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-400">Nothing scheduled</p>
            )}
        </div>
    );
}