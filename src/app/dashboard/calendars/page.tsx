// app/dashboard/calendar/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AICalendarSection from "@/components/dashboard/AICalendarSection";


export default function CalendarPage() {
    const [calendars, setCalendars] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("learning_calendars")
                .select("*, user_profiles(*)")
                .eq("user_id", user.id)
                .eq("status", "active")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching calendars:", error);
            } else {
                setCalendars(data || []);
                setLoading(false);
            }
        })();
    }, []);

    const handleCalendarStatusUpdate = async (id: string, status: string) => {
        try {
            await supabase
                .from("learning_calendars")
                .update({ status })
                .eq("id", id);
        } catch (error) {
            console.error("Error updating calendar status:", error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Learning Calendars</h1>

            {calendars.length ? (<div className="mb-6">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    onClick={() => setShowCreateModal(true)}
                >
                    Create New Calendar
                </button>
            </div>): (
                <div></div>
            ) }

            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : calendars.length ? (
                <div className="space-y-6">
                    {calendars.map((calendar) => (
                        <div key={calendar.id} className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">{calendar.title}</h2>
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleCalendarStatusUpdate(calendar.id, "paused")}
                                        className="text-yellow-600 hover:text-yellow-800"
                                    >
                                        Pause
                                    </button>
                                    <button
                                        onClick={() => handleCalendarStatusUpdate(calendar.id, "completed")}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        Complete
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-4">{calendar.description}</p>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p>{calendar.duration_days} days · {calendar.daily_hours} hours/day</p>
                                    <p className="text-sm text-gray-500">
                                        Created: {new Date(calendar.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-gray-400">
                                    Progress: {calendar.progress_percentage}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow">
                    <p className="text-gray-500">You don't have any active calendars yet.</p>
                    <button onClick={() => setShowCreateModal(true)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Create Your First Calendar
                    </button>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="w-full max-w-2xl bg-white rounded-lg p-6">
                        <AICalendarSection
                            onCancel={() => setShowCreateModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}