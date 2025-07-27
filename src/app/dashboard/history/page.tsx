// app/dashboard/history/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HistoryPage() {
    const [calendars, setCalendars] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("learning_calendars")
                .select("*")
                .eq("user_id", user.id)
                .or("status.eq.completed, status.eq.archived")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching history:", error);
            } else {
                setCalendars(data || []);
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Learning History</h1>
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : calendars.length ? (
                <div className="space-y-4">
                    {calendars.map((calendar) => (
                        <div key={calendar.id} className="bg-white p-4 rounded-lg shadow">
                            <h2 className="text-lg font-semibold mb-2">{calendar.title}</h2>
                            <p className="text-sm text-gray-600">
                                {calendar.duration_days} days · Created on{" "}
                                {new Date(calendar.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-2">
                                Completed on{" "}
                                {calendar.actual_completion_date
                                    ? new Date(calendar.actual_completion_date).toLocaleDateString()
                                    : "Not yet completed"}
                            </p>
                            <div className="mt-4">
                                <button className="text-blue-600 hover:text-blue-800 font-medium">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No completed or archived calendars found</p>
            )}
        </div>
    );
}