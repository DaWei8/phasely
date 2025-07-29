"use client";
import { useState, useEffect, useCallback } from "react";
import {
  User,
  Bell,
  Lock,
  Save,
  Check,
  X,
  Settings,
  Clock,
  Brain,
  Target,
  Calendar,
  Globe,
  Camera,
  Mail,
  Smartphone,
  Info,
  Plus
} from "lucide-react";

// Supabase Imports
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// IMPORTANT: Replace with your actual Supabase URL and Anon Key
// For production, use environment variables (e.g., process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  timezone: string;
  preferred_learning_time: string;
  learning_style: string;
  skill_interests: string[] | null;
  experience_level: string;
  weekly_commitment_hours: number;
  created_at?: string; // Optional, as it's auto-generated
  updated_at?: string; // Optional, as it's auto-generated
}

interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  whatsapp_number: string | null;
  push_enabled: boolean;
  daily_reminder_time: string;
  weekly_review_day: number; // Changed to number for Supabase schema
  streak_warning_enabled: boolean;
  achievement_notifications: boolean;
  updated_at?: string; // Optional, as it's auto-generated
}

interface SkillOption {
  id: string;
  skill_name: string;
  created_at?: string; // Optional
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState({
    profile: false,
    notifications: false,
    password: false
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [saveStatus, setSaveStatus] = useState<{
    [key: string]: "success" | "error" | null;
  }>({});

  // Supabase specific state
  const [userId, setUserId] = useState<string | null>(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  // New state for dynamic skill options
  const [availableSkills, setAvailableSkills] = useState<SkillOption[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillError, setNewSkillError] = useState<string | null>(null);

  const timezones = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney"
  ];

  const weeklyReviewDays = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  // Supabase Initialization and User ID handling
  useEffect(() => {
    // In a real application, userId would come from Supabase Auth session
    // For this demo, we'll use a placeholder or a random UUID
    const getOrCreateUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // Fallback for demo if no auth session
        let storedUserId = localStorage.getItem('demo_user_id');
        if (!storedUserId) {
          storedUserId = crypto.randomUUID();
          localStorage.setItem('demo_user_id', storedUserId);
        }
        setUserId(storedUserId);
      }
      const currentUserId = crypto.randomUUID();
      setUserId(currentUserId);
      setIsSupabaseReady(true);
    };

    getOrCreateUserId();
  }, []);

  // Fetch user profile data
  useEffect(() => {
    if (!userId || !isSupabaseReady) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setProfile(data);
      } else {
        // If profile doesn't exist, create a default one
        const defaultProfile: Profile = {
          id: userId,
          display_name: `User ${userId.substring(0, 8)}`,
          avatar_url: `https://placehold.co/100x100/aabbcc/ffffff?text=${userId.substring(0, 1)}`,
          timezone: "UTC",
          preferred_learning_time: "morning",
          learning_style: "balanced",
          skill_interests: [],
          experience_level: "beginner",
          weekly_commitment_hours: 10,
        };
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(defaultProfile);

        if (insertError) {
          console.error("Error creating default profile:", insertError);
        } else {
          setProfile(defaultProfile);
        }
      }
    };

    fetchProfile();

    // Set up real-time subscription for user_profiles
    const channel = supabase
      .channel(`user_profiles:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles', filter: `id=eq.${userId}` }, payload => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setProfile(payload.new as Profile);
        } else if (payload.eventType === 'DELETE') {
          setProfile(null); // Or handle as needed
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isSupabaseReady]);

  // Fetch notification preferences data
  useEffect(() => {
    if (!userId || !isSupabaseReady) return;

    const fetchNotificationPreferences = async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
        console.error("Error fetching notification preferences:", error);
      }

      if (data) {
        setNotificationPreferences(data);
      } else {
        // If notification preferences don't exist, create default ones
        const defaultNotificationPreferences: NotificationPreferences = {
          user_id: userId,
          email_enabled: true,
          whatsapp_enabled: false,
          whatsapp_number: null,
          push_enabled: true,
          daily_reminder_time: "09:00:00", // Supabase expects full time string
          weekly_review_day: 0, // Sunday
          streak_warning_enabled: true,
          achievement_notifications: true,
        };
        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert(defaultNotificationPreferences);

        if (insertError) {
          console.error("Error creating default notification preferences:", insertError);
        } else {
          setNotificationPreferences(defaultNotificationPreferences);
        }
      }
    };

    fetchNotificationPreferences();

    // Set up real-time subscription for notification_preferences
    const channel = supabase
      .channel(`notification_preferences:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notification_preferences', filter: `user_id=eq.${userId}` }, payload => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setNotificationPreferences(payload.new as NotificationPreferences);
        } else if (payload.eventType === 'DELETE') {
          setNotificationPreferences(null); // Or handle as needed
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isSupabaseReady]);

  // Fetch available skill options from a public collection
  useEffect(() => {
    if (!isSupabaseReady) return;

    const fetchSkills = async () => {
      const { data, error } = await supabase
        .from('skill_options') // Assuming a table named 'skill_options'
        .select('*');

      if (error) {
        console.error("Error fetching available skills:", error);
      } else {
        // Sort in-memory as orderBy is not used in query
        const sortedSkills = data.sort((a: SkillOption, b: SkillOption) => a.skill_name.localeCompare(b.skill_name));
        setAvailableSkills(sortedSkills);
      }
    };

    fetchSkills();

    // Set up real-time subscription for skill_options
    const channel = supabase
      .channel('skill_options_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_options' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
          fetchSkills(); // Re-fetch all skills to ensure sorted and up-to-date list
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSupabaseReady]);

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      setNewSkillError("Skill name cannot be empty.");
      return;
    }
    setNewSkillError(null);

    const skillExists = availableSkills.some(
      (skill) => skill.skill_name.toLowerCase() === newSkillName.trim().toLowerCase()
    );

    if (skillExists) {
      setNewSkillError("This skill already exists.");
      return;
    }

    try {
      const { error } = await supabase
        .from('skill_options')
        .insert({ skill_name: newSkillName.trim() });

      if (error) {
        console.error("Error adding new skill:", error);
        setNewSkillError("Failed to add skill. Please try again.");
      } else {
        setNewSkillName(""); // Clear input after adding
      }
    } catch (error) {
      console.error("Unexpected error adding new skill:", error);
      setNewSkillError("An unexpected error occurred.");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !profile) return;

    setLoading((prev) => ({ ...prev, profile: true }));
    setFormErrors({});
    setSaveStatus((prev) => ({ ...prev, profile: null }));

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          timezone: profile.timezone,
          preferred_learning_time: profile.preferred_learning_time,
          learning_style: profile.learning_style,
          skill_interests: profile.skill_interests,
          experience_level: profile.experience_level,
          weekly_commitment_hours: profile.weekly_commitment_hours,
          updated_at: new Date().toISOString(), // Supabase expects ISO string for timestamp with time zone
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      setSaveStatus((prev) => ({ ...prev, profile: "success" }));
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setFormErrors({ profile: `Failed to save profile: ${error.message || 'Unknown error'}` });
      setSaveStatus((prev) => ({ ...prev, profile: "error" }));
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
      setTimeout(() => setSaveStatus((prev) => ({ ...prev, profile: null })), 3000);
    }
  };

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !notificationPreferences) return;

    setLoading((prev) => ({ ...prev, notifications: true }));
    setSaveStatus((prev) => ({ ...prev, notifications: null }));

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: notificationPreferences.email_enabled,
          whatsapp_enabled: notificationPreferences.whatsapp_enabled,
          whatsapp_number: notificationPreferences.whatsapp_number,
          push_enabled: notificationPreferences.push_enabled,
          daily_reminder_time: notificationPreferences.daily_reminder_time,
          weekly_review_day: notificationPreferences.weekly_review_day,
          streak_warning_enabled: notificationPreferences.streak_warning_enabled,
          achievement_notifications: notificationPreferences.achievement_notifications,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      setSaveStatus((prev) => ({ ...prev, notifications: "success" }));
    } catch (error: any) {
      console.error("Error updating notification preferences:", error);
      setFormErrors({ notifications: `Failed to save preferences: ${error.message || 'Unknown error'}` });
      setSaveStatus((prev) => ({ ...prev, notifications: "error" }));
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }));
      setTimeout(() => setSaveStatus((prev) => ({ ...prev, notifications: null })), 3000);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, password: true }));
    setFormErrors({});
    setSaveStatus((prev) => ({ ...prev, password: null }));

    if (newPassword !== newPasswordConfirmation) {
      setFormErrors({ password: "New passwords do not match." });
      setLoading((prev) => ({ ...prev, password: false }));
      return;
    }

    if (newPassword.length < 8) {
      setFormErrors({ password: "New password must be at least 8 characters long." });
      setLoading((prev) => ({ ...prev, password: false }));
      return;
    }

    // --- IMPORTANT: This is a simulated password update for demonstration. ---
    // Actual Supabase password update requires handling through Supabase Auth.
    // Example: await supabase.auth.updateUser({ password: newPassword });
    // This typically requires a re-authentication flow for security.
    // This client-side code does NOT handle actual Supabase password changes securely.
    // For a real application, implement this securely using Supabase Auth methods.
    console.warn("Simulating password update. Actual Supabase password change requires re-authentication and secure handling.");

    setTimeout(() => {
      // Simulate success or failure
      if (newPassword === "password123!" && currentPassword === "oldpassword") { // Example condition
        setSaveStatus((prev) => ({ ...prev, password: "success" }));
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirmation("");
      } else {
        setFormErrors({ password: "Current password incorrect or new password too weak." });
        setSaveStatus((prev) => ({ ...prev, password: "error" }));
      }
      setLoading((prev) => ({ ...prev, password: false }));
      setTimeout(() => setSaveStatus((prev) => ({ ...prev, password: null })), 3000);
    }, 1500);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock }
  ];

  interface TabButtonProps {
    tab: typeof tabs[0];
    isActive: boolean;
    onClick: () => void;
  }

  const TabButton = ({ tab, isActive, onClick }: TabButtonProps) => {
    const Icon = tab.icon;
    return (
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
            : "text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"
        }`}
      >
        <Icon size={20} />
        {tab.label}
      </button>
    );
  };

  interface SaveButtonProps {
    status: "error" | "success" | null;
    isLoading: boolean;
    children: React.ReactNode;
  }

  const SaveButton = ({ isLoading, status, children }: SaveButtonProps) => (
    <button
      type="submit"
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
        status === "success"
          ? "bg-green-600 text-white"
          : status === "error"
          ? "bg-red-600 text-white"
          : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : status === "success" ? (
        <Check size={20} />
      ) : status === "error" ? (
        <X size={20} />
      ) : (
        <Save size={20} />
      )}
      {isLoading
        ? "Saving..."
        : status === "success"
        ? "Saved!"
        : status === "error"
        ? "Error!"
        : children}
    </button>
  );

  if (!isSupabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
        <div className="flex flex-col items-center text-gray-700 dark:text-gray-300">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6 font-inter">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account preferences and security settings
          </p>
          {userId && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Info size={16} />
              Your User ID: <span className="font-mono text-blue-600 dark:text-blue-300 break-all">{userId}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 p-2">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User size={24} />
                    Profile Settings
                  </h2>
                  <p className="text-blue-100 mt-1">
                    Update your personal information and learning preferences
                  </p>
                </div>

                <form onSubmit={handleProfileUpdate} className="p-8">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="relative">
                      <img
                        src={profile?.avatar_url || `https://placehold.co/100x100/aabbcc/ffffff?text=${profile?.display_name ? profile.display_name.substring(0,1) : 'U'}`}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-500"
                      />
                      {/* Avatar upload functionality would require more complex implementation (e.g., Supabase Storage) */}
                      <button
                        type="button"
                        className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                        title="Avatar upload not implemented in this demo"
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Profile Photo
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Update your avatar to personalize your profile
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Display Name */}
                    <div className="md:col-span-2">
                      <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Display Name
                      </label>
                      <input
                        id="displayName"
                        type="text"
                        value={profile?.display_name || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, display_name: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Enter your display name"
                        disabled={!profile}
                      />
                    </div>

                    {/* Timezone */}
                    <div>
                      <label htmlFor="timezone" className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Globe size={16} />
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        value={profile?.timezone || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, timezone: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        disabled={!profile}
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Preferred Learning Time */}
                    <div>
                      <label htmlFor="learningTime" className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Clock size={16} />
                        Preferred Learning Time
                      </label>
                      <select
                        id="learningTime"
                        value={profile?.preferred_learning_time || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, preferred_learning_time: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        disabled={!profile}
                      >
                        <option value="morning">🌅 Morning (6AM - 12PM)</option>
                        <option value="afternoon">☀️ Afternoon (12PM - 6PM)</option>
                        <option value="evening">🌙 Evening (6PM - 11PM)</option>
                      </select>
                    </div>

                    {/* Learning Style */}
                    <div>
                      <label htmlFor="learningStyle" className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Brain size={16} />
                        Learning Style
                      </label>
                      <select
                        id="learningStyle"
                        value={profile?.learning_style || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, learning_style: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        disabled={!profile}
                      >
                        <option value="balanced">⚖️ Balanced</option>
                        <option value="visual">👁️ Visual</option>
                        <option value="auditory">👂 Auditory</option>
                        <option value="kinesthetic">🤲 Kinesthetic</option>
                      </select>
                    </div>

                    {/* Experience Level */}
                    <div>
                      <label htmlFor="experienceLevel" className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Target size={16} />
                        Experience Level
                      </label>
                      <select
                        id="experienceLevel"
                        value={profile?.experience_level || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, experience_level: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        disabled={!profile}
                      >
                        <option value="beginner">🌱 Beginner</option>
                        <option value="intermediate">🚀 Intermediate</option>
                        <option value="advanced">⭐ Advanced</option>
                        <option value="expert">👑 Expert</option>
                      </select>
                    </div>
                  </div>

                  {/* Weekly Commitment */}
                  <div className="mt-6">
                    <label htmlFor="weeklyCommitment" className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Calendar size={16} />
                      Weekly Commitment Hours
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        id="weeklyCommitment"
                        type="range"
                        min="1"
                        max="40"
                        value={profile?.weekly_commitment_hours || 10}
                        onChange={(e) =>
                          setProfile({
                            ...profile!,
                            weekly_commitment_hours: parseInt(e.target.value)
                          })
                        }
                        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        disabled={!profile}
                      />
                      <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-xl font-semibold min-w-[80px] text-center">
                        {profile?.weekly_commitment_hours || 10}h
                      </div>
                    </div>
                  </div>

                  {/* Skill Interests */}
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Skill Interests
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {availableSkills.map((skill) => (
                        <label
                          key={skill.id}
                          className="flex items-center gap-2 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={profile?.skill_interests?.includes(skill.skill_name) || false}
                            onChange={(e) => {
                              if (!profile) return;
                              if (e.target.checked) {
                                setProfile({
                                  ...profile,
                                  skill_interests: [...(profile.skill_interests || []), skill.skill_name]
                                });
                              } else {
                                setProfile({
                                  ...profile,
                                  skill_interests: profile.skill_interests?.filter((s) => s !== skill.skill_name) || []
                                });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                            disabled={!profile}
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {skill.skill_name}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="text"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="flex-1 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-2 px-3 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Add new skill (e.g., 'WebAssembly')"
                        disabled={!supabase}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!supabase || !newSkillName.trim()}
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>
                    {newSkillError && (
                      <div className="flex items-center gap-2 p-2 mt-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-200 text-sm">
                        <X size={16} />
                        {newSkillError}
                      </div>
                    )}
                  </div>

                  {formErrors.profile && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-200 mt-6">
                      <X size={16} />
                      {formErrors.profile}
                    </div>
                  )}

                  <div className="flex justify-end mt-8">
                    <SaveButton isLoading={loading.profile} status={saveStatus.profile}>
                      Save Profile
                    </SaveButton>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "notifications" && notificationPreferences && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Bell size={24} />
                    Notification Preferences
                  </h2>
                  <p className="text-blue-100 mt-1">
                    Choose how you want to receive updates and reminders
                  </p>
                </div>

                <form onSubmit={handleNotificationUpdate} className="p-8">
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                          <Mail className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Email Notifications
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Receive updates and reminders via email
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPreferences.email_enabled}
                          onChange={() =>
                            setNotificationPreferences({
                              ...notificationPreferences,
                              email_enabled: !notificationPreferences.email_enabled
                            })
                          }
                          className="sr-only peer"
                          disabled={!notificationPreferences}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>

                    {/* WhatsApp Notifications */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                          <Smartphone className="w-6 h-6 text-green-600 dark:text-green-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            WhatsApp Notifications
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Receive updates and reminders via WhatsApp
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPreferences.whatsapp_enabled}
                          onChange={() =>
                            setNotificationPreferences({
                              ...notificationPreferences,
                              whatsapp_enabled: !notificationPreferences.whatsapp_enabled
                            })
                          }
                          className="sr-only peer"
                          disabled={!notificationPreferences}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>

                    {notificationPreferences.whatsapp_enabled && (
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <label htmlFor="whatsappNumber" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          WhatsApp Number
                        </label>
                        <input
                          id="whatsappNumber"
                          type="tel"
                          value={notificationPreferences.whatsapp_number || ""}
                          onChange={(e) =>
                            setNotificationPreferences({
                              ...notificationPreferences,
                              whatsapp_number: e.target.value
                            })
                          }
                          className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                          placeholder="e.g., +1234567890"
                          disabled={!notificationPreferences}
                        />
                      </div>
                    )}

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                          <Bell className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Push Notifications
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Get instant notifications on your device
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPreferences.push_enabled}
                          onChange={() =>
                            setNotificationPreferences({
                              ...notificationPreferences,
                              push_enabled: !notificationPreferences.push_enabled
                            })
                          }
                          className="sr-only peer"
                          disabled={!notificationPreferences}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-purple-600 peer-focus:ring-4 peer-focus:ring-purple-300 transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>

                    {/* Daily Reminder Time */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <label htmlFor="dailyReminderTime" className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Clock size={16} />
                        Daily Reminder Time
                      </label>
                      <input
                        id="dailyReminderTime"
                        type="time"
                        value={notificationPreferences.daily_reminder_time}
                        onChange={(e) =>
                          setNotificationPreferences({
                            ...notificationPreferences,
                            daily_reminder_time: e.target.value
                          })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        disabled={!notificationPreferences}
                      />
                    </div>

                    {/* Weekly Review Day */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <label htmlFor="weeklyReviewDay" className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        Weekly Review Day
                      </label>
                      <select
                        id="weeklyReviewDay"
                        value={notificationPreferences.weekly_review_day}
                        onChange={(e) =>
                          setNotificationPreferences({
                            ...notificationPreferences,
                            weekly_review_day: parseInt(e.target.value)
                          })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        disabled={!notificationPreferences}
                      >
                        {weeklyReviewDays.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Streak Warning Enabled */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                          <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Streak Warning Notifications
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Get notified when your learning streak is at risk
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPreferences.streak_warning_enabled}
                          onChange={() =>
                            setNotificationPreferences({
                              ...notificationPreferences,
                              streak_warning_enabled: !notificationPreferences.streak_warning_enabled
                            })
                          }
                          className="sr-only peer"
                          disabled={!notificationPreferences}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-yellow-600 peer-focus:ring-4 peer-focus:ring-yellow-300 transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>

                    {/* Achievement Notifications */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-xl">
                          <Check className="w-6 h-6 text-teal-600 dark:text-teal-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            Achievement Notifications
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Celebrate your milestones and achievements
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPreferences.achievement_notifications}
                          onChange={() =>
                            setNotificationPreferences({
                              ...notificationPreferences,
                              achievement_notifications: !notificationPreferences.achievement_notifications
                            })
                          }
                          className="sr-only peer"
                          disabled={!notificationPreferences}
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-teal-600 peer-focus:ring-4 peer-focus:ring-teal-300 transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>

                  </div>

                  {formErrors.notifications && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-200 mt-6">
                      <X size={16} />
                      {formErrors.notifications}
                    </div>
                  )}

                  <div className="flex justify-end mt-8">
                    <SaveButton isLoading={loading.notifications} status={saveStatus.notifications}>
                      Save Preferences
                    </SaveButton>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Lock size={24} />
                    Security Settings
                  </h2>
                  <p className="text-blue-100 mt-1">
                    Keep your account secure with a strong password
                  </p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="p-8">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Current Password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Enter current password"
                        disabled={!supabase}
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Enter new password"
                        disabled={!supabase}
                      />
                    </div>

                    <div>
                      <label htmlFor="newPasswordConfirmation" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Confirm New Password
                      </label>
                      <input
                        id="newPasswordConfirmation"
                        type="password"
                        value={newPasswordConfirmation}
                        onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Confirm new password"
                        disabled={!supabase}
                      />
                    </div>

                    {formErrors.password && (
                      <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-200">
                        <X size={16} />
                        {formErrors.password}
                      </div>
                    )}

                    <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Password Requirements:
                      </h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• At least 8 characters long</li>
                        <li>• Include uppercase and lowercase letters</li>
                        <li>• Include at least one number</li>
                        <li>• Include at least one special character</li>
                      </ul>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                        <Info size={14} className="inline-block mr-1" />
                        Note: For security, actual password changes in a real application usually require re-authentication and server-side handling. This is a simulated update.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <SaveButton isLoading={loading.password} status={saveStatus.password}>
                      Update Password
                    </SaveButton>
                  </div>
                </form>
              </div>
            )}
            
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          background-color: #3b82f6; /* blue-500 */
          border-radius: 9999px; /* full rounded */
          cursor: pointer;
          border: 2px solid #ffffff; /* white border */
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          margin-top: -8px; /* Adjust to center thumb vertically */
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          background-color: #3b82f6; /* blue-500 */
          border-radius: 9999px; /* full rounded */
          cursor: pointer;
          border: 2px solid #ffffff; /* white border */
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
