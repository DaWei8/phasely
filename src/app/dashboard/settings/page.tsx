// app/dashboard/settings/page.tsx
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
    const [profile, setProfile] = useState<any>(null);
    const [notificationPreferences, setNotificationPreferences] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    useEffect(() => {
        const fetchSettings = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch user profile
            const { data: profileData } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            // Fetch notification preferences
            const { data: preferencesData } = await supabase
                .from("notification_preferences")
                .select("*")
                .eq("user_id", user.id)
                .single();

            setProfile(profileData);
            setNotificationPreferences(preferencesData);
            setLoading(false);
        };

        fetchSettings();
    }, []);

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormErrors({});

        if (!profile) return;

        try {
            await supabase
                .from("user_profiles")
                .update({
                    display_name: profile.display_name,
                    avatar_url: profile.avatar_url,
                    timezone: profile.timezone,
                    preferred_learning_time: profile.preferred_learning_time,
                    learning_style: profile.learning_style,
                })
                .eq("id", profile.id);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateNotificationPreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!notificationPreferences) return;

        try {
            await supabase
                .from("notification_preferences")
                .update({
                    email_enabled: notificationPreferences.email_enabled,
                    whatsapp_enabled: notificationPreferences.whatsapp_enabled,
                    push_enabled: notificationPreferences.push_enabled,
                    daily_reminder_time: notificationPreferences.daily_reminder_time,
                    weekly_review_day: notificationPreferences.weekly_review_day,
                })
                .eq("user_id", notificationPreferences.user_id);
        } catch (error) {
            console.error("Error updating notification preferences:", error);
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormErrors({});

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (newPassword !== newPasswordConfirmation) {
            setFormErrors({ password: "Passwords do not match" });
            setLoading(false);
            return;
        }

        try {
            await supabase.auth.updateUser({
                password: newPassword,
                // currentPassword: currentPassword,
            });
        } catch (error) {
            console.error("Password update failed:", error);
            setFormErrors({ password: "Password update failed" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-gray-500">Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-8">Settings</h1>

            <div className="space-y-6">
                <form onSubmit={updateProfile} className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Profile Settings</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={profile?.display_name || ""}
                                onChange={(e) =>
                                    setProfile({ ...profile, display_name: e.target.value })
                                }
                                className="w-full border-gray-300 rounded-md py-2 px-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Timezone
                            </label>
                            <input
                                type="text"
                                value={profile?.timezone || ""}
                                onChange={(e) =>
                                    setProfile({ ...profile, timezone: e.target.value })
                                }
                                className="w-full border-gray-300 rounded-md py-2 px-3"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                        >
                            Save Profile
                        </button>
                    </div>
                </form>

                {notificationPreferences && (
                    <form
                        onSubmit={updateNotificationPreferences}
                        className="bg-white p-4 rounded-lg shadow"
                    >
                        <h2 className="text-lg font-semibold mb-4">
                            Notification Preferences
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.email_enabled}
                                    onChange={() =>
                                        setNotificationPreferences({
                                            ...notificationPreferences,
                                            email_enabled: !notificationPreferences.email_enabled,
                                        })
                                    }
                                    className="mr-2"
                                />
                                <label>Email Notifications</label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={notificationPreferences.push_enabled}
                                    onChange={() =>
                                        setNotificationPreferences({
                                            ...notificationPreferences,
                                            push_enabled: !notificationPreferences.push_enabled,
                                        })
                                    }
                                    className="mr-2"
                                />
                                <label>Push Notifications</label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </form>
                )}

                <form onSubmit={updatePassword} className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Password Settings</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full border-gray-300 rounded-md py-2 px-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full border-gray-300 rounded-md py-2 px-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={newPasswordConfirmation}
                                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                className="w-full border-gray-300 rounded-md py-2 px-3"
                            />
                        </div>
                        {formErrors.password && (
                            <p className="text-red-500 text-sm">{formErrors.password}</p>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
}