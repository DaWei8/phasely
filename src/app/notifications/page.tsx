// app/dashboard/notifications/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("scheduled_notifications")
                .select("*")
                .eq("user_id", user.id)
                .order("scheduled_for", { ascending: false });

            if (error) {
                console.error("Error fetching notifications:", error);
            } else {
                setNotifications(data || []);
                setLoading(false);
            }
        })();
    }, []);

    return (
        // <DashboardLayout>
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : notifications.length ? (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div key={notification.id} className="bg-white p-4 rounded-lg shadow">
                            <p className="font-medium">
                                {notification.type.replace("_", " ")}
                            </p>
                            <p className="text-sm text-gray-600">
                                {new Date(notification.scheduled_for).toLocaleString()}
                            </p>
                            <div className="mt-2">
                                {/* Display notification content based on type */}
                                {notification.content && (
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {JSON.stringify(notification.content, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No notifications found</p>
            )}
        </div>
    );
}