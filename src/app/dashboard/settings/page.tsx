"use client";
import { useState, useEffect } from "react";
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
  Smartphone
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

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
}

interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  push_enabled: boolean;
  daily_reminder_time: string;
  weekly_review_day: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<Profile | null>();
  const [userId, setUserId] = useState<string>()
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>();
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

    useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // console.log("user id found", user?.id)
      if (!user) return;
      setUserId(user.id);

      /* ---- Profile ---- */
      const { data: p, error: pError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!p) {
        const { data: p, error: pError } = await supabase
          .from("user_profiles")
          .upsert({ id: userId })
          .select()
          .single();
        console.log("profile not found", pError)
      }
      setProfile(p as Profile);

      /* ---- Notifications ---- */
      let { data: n, error: nError } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (!n) {
        ({ data: n, error: nError } = await supabase
          .from("notification_preferences")
          .upsert({ user_id: user.id })
          .select()
          .single());
        console.log("notifications not found", nError)
      }
      setNotificationPreferences(n as NotificationPreferences);
      setLoading({ profile: true, notifications: true, password: true });
    })();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(p => ({ ...p, profile: true }));
    await supabase
      .from("user_profiles")
      .update(profile!)
      .eq("id", userId);
    setLoading(p => ({ ...p, profile: false }));
    setSaveStatus(s => ({ ...s, profile: "success" }));
    setTimeout(() => setSaveStatus(s => ({ ...s, profile: null })), 3000);
  };

  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(p => ({ ...p, notifications: true }));
    await supabase
      .from("notification_preferences")
      .update(notificationPreferences!)
      .eq("user_id", userId);
    setLoading(p => ({ ...p, notifications: false }));
    setSaveStatus(s => ({ ...s, notifications: "success" }));
    setTimeout(() => setSaveStatus(s => ({ ...s, notifications: null })), 3000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(p => ({ ...p, password: true }));
    setFormErrors({});
    if (newPassword !== newPasswordConfirmation) {
      setFormErrors({ password: "Passwords do not match" });
      setLoading(p => ({ ...p, password: false }));
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(p => ({ ...p, password: false }));
    if (error) {
      setFormErrors({ password: error.message });
    } else {
      setSaveStatus(s => ({ ...s, password: "success" }));
      setCurrentPassword(""); setNewPassword(""); setNewPasswordConfirmation("");
      setTimeout(() => setSaveStatus(s => ({ ...s, password: null })), 3000);
    }
  };
  
  const skillInterestsOptions = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Python",
    "Django",
    "Java",
    "C++",
    "Go",
    "Rust",
    "Node.js",
    "Vue.js",
    "Angular",
    "PHP"
  ];

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
        className={`flex w-full items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${isActive
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
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${status === "success"
        ? "bg-green-600 text-white"
        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : status === "success" ? (
        <Check size={20} />
      ) : (
        <Save size={20} />
      )}
      {isLoading
        ? "Saving..."
        : status === "success"
          ? "Saved!"
          : children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
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

                <div className="p-8">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="relative">
                      <img
                        src={profile?.avatar_url || "/assets/favicon-32x32.png"}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-500"
                      />
                      <button
                        type="button"
                        className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
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
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profile?.display_name || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, display_name: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Enter your display name"
                      />
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Globe size={16} />
                        Timezone
                      </label>
                      <select
                        value={profile?.timezone || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, timezone: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
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
                      <label className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Clock size={16} />
                        Preferred Learning Time
                      </label>
                      <select
                        value={profile?.preferred_learning_time || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, preferred_learning_time: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                      >
                        <option value="morning">🌅 Morning (6AM - 12PM)</option>
                        <option value="afternoon">☀️ Afternoon (12PM - 6PM)</option>
                        <option value="evening">🌙 Evening (6PM - 11PM)</option>
                      </select>
                    </div>

                    {/* Learning Style */}
                    <div>
                      <label className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Brain size={16} />
                        Learning Style
                      </label>
                      <select
                        value={profile?.learning_style || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, learning_style: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                      >
                        <option value="balanced">⚖️ Balanced</option>
                        <option value="visual">👁️ Visual</option>
                        <option value="auditory">👂 Auditory</option>
                        <option value="kinesthetic">🤲 Kinesthetic</option>
                      </select>
                    </div>

                    {/* Experience Level */}
                    <div>
                      <label className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Target size={16} />
                        Experience Level
                      </label>
                      <select
                        value={profile?.experience_level || ""}
                        onChange={(e) =>
                          setProfile({ ...profile!, experience_level: e.target.value })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
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
                    <label className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Calendar size={16} />
                      Weekly Commitment Hours
                    </label>
                    <div className="flex items-center gap-4">
                      <input
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
                      {skillInterestsOptions.map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center gap-2 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={profile?.skill_interests?.includes(skill) || false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setProfile({
                                  ...profile!,
                                  skill_interests: [...(profile?.skill_interests || []), skill]
                                });
                              } else {
                                setProfile({
                                  ...profile!,
                                  skill_interests: profile?.skill_interests?.filter((s) => s !== skill) || []
                                });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {skill}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <div onClick={handleProfileUpdate}>
                      <SaveButton isLoading={loading.profile} status={saveStatus.profile!}>
                        Save Profile
                      </SaveButton>
                    </div>
                  </div>
                </div>
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

                <div className="p-8">
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
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                          <Smartphone className="w-6 h-6 text-green-600 dark:text-green-300" />
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
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:bg-green-600 peer-focus:ring-4 peer-focus:ring-green-300 transition-colors peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>

                    {/* Daily Reminder Time */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <label className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Clock size={16} />
                        Daily Reminder Time
                      </label>
                      <input
                        type="time"
                        value={notificationPreferences.daily_reminder_time}
                        onChange={(e) =>
                          setNotificationPreferences({
                            ...notificationPreferences,
                            daily_reminder_time: e.target.value
                          })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                      />
                    </div>

                    {/* Weekly Review Day */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <label className=" text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        Weekly Review Day
                      </label>
                      <select
                        value={notificationPreferences.weekly_review_day}
                        onChange={(e) =>
                          setNotificationPreferences({
                            ...notificationPreferences,
                            weekly_review_day: e.target.value
                          })
                        }
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                      >
                        <option value="sunday">Sunday</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <div onClick={handleNotificationUpdate}>
                      <SaveButton isLoading={loading.notifications} status={saveStatus.notifications!}>
                        Save Preferences
                      </SaveButton>
                    </div>
                  </div>
                </div>
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
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Enter current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={newPasswordConfirmation}
                        onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-3 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
                        placeholder="Confirm new password"
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
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <SaveButton isLoading={loading.password} status={saveStatus.password!}>
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
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          box-shadow: 0 0 2px 0 #555;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}