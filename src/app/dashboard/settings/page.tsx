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
  Smartphone,
  Plus,
  Trash2,
  RefreshCw
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

// Tab Button Component
interface TabButtonProps {
  tab: { id: string; label: string; icon: any };
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

// Fixed Save Button Component
interface SaveButtonProps {
  status: "idle" | "loading" | "success" | "error";
  isLoading?: boolean; // Keep for backward compatibility
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}

const SaveButton = ({ 
  status, 
  isLoading, // Deprecated but kept for compatibility
  children, 
  onClick,
  type = "submit"
}: SaveButtonProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Handle the success state timing
  useEffect(() => {
    if (status === "success") {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000); // Show success for 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Determine the current state (backward compatibility)
  const currentStatus = status || (isLoading ? "idle" : "idle");
  const isCurrentlyLoading = currentStatus === "loading";
  const isSuccess = showSuccess && currentStatus === "success";
  const isError = currentStatus === "error";

  return (
    <button
      type={type}
      disabled={isCurrentlyLoading}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 min-w-[120px] ${
        isSuccess
          ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
          : isError
          ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25"
          : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isCurrentlyLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Saving...</span>
        </>
      ) : isSuccess ? (
        <>
          <Check size={20} />
          <span>Saved!</span>
        </>
      ) : isError ? (
        <>
          <span>Try Again</span>
        </>
      ) : (
        <>
          <Save size={20} />
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

// Avatar Component with Random Image Support
interface AvatarSectionProps {
  profile: Profile;
  onAvatarChange: (url: string) => void;
}

const AvatarSection = ({ profile, onAvatarChange }: AvatarSectionProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate a random avatar URL using DiceBear API (free and reliable)
  const generateRandomAvatar = async () => {
    setIsGenerating(true);
    try {
      const styles = ['avataaars', 'big-smile', 'bottts', 'fun-emoji', 'identicon', 'initials', 'lorelei', 'micah', 'miniavs', 'open-peeps', 'personas', 'pixel-art'];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      const randomSeed = Math.random().toString(36).substring(7);
    
      const avatarUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
      
      onAvatarChange(avatarUrl);
    } catch (error) {
      console.error('Error generating avatar:', error);
      const fallbackUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`;
      onAvatarChange(fallbackUrl);
    } finally {
      setIsGenerating(false);
    }
  };

  // const handleFileUpload = () => {
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = 'image/*';
  //   input.onchange = (e) => {
  //     const file = (e.target as HTMLInputElement).files?.[0];
  //     if (file) {
  //       // Validate file size (max 5MB)
  //       if (file.size > 5 * 1024 * 1024) {
  //         alert('File size must be less than 5MB');
  //         return;
  //       }

  //       const reader = new FileReader();
  //       reader.onload = (e) => {
  //         onAvatarChange(e.target?.result as string);
  //       };
  //       reader.readAsDataURL(file);
  //     }
  //   };
  //   input.click();
  // };

  // Default avatar if none exists
  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    // Generate a default avatar based on user ID or email
    const seed = profile?.id || 'default';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=3B82F6`;
  };

  return (
    <div className="flex items-center gap-6 mb-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="relative">
        <img
          src={getAvatarUrl()}
          alt="Avatar"
          width={40}
          height={40}
          className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-500 bg-white"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=fallback&backgroundColor=6B7280`;
          }}
        />
        {/* <button
          type="button"
          onClick={handleFileUpload}
          className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors shadow-lg"
          title="Upload custom image"
        >
          <Camera size={16} />
        </button> */}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Profile Photo
          </h3>
          <button
            type="button"
            onClick={generateRandomAvatar}
            disabled={isGenerating}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
            title="Generate random avatar"
          >
            {isGenerating ? (
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            {isGenerating ? 'Generating...' : 'Random'}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Upload a custom image or generate a random avatar
        </p>
      </div>
    </div>
  );
};
// Skills Section Component
interface SkillsSectionProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

const SkillsSection = ({ skills, onSkillsChange }: SkillsSectionProps) => {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onSkillsChange([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="mt-6">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Skill Interests
      </label>
      
      {/* Add new skill */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new skill..."
          className="flex-1 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl py-2 px-4 focus:border-blue-500 focus:ring-0 transition-colors"
        />
        <button
          type="button"
          onClick={addSkill}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Display skills */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <div
            key={skill}
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg"
          >
            <span className="text-sm font-medium">{skill}</span>
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="text-blue-600 dark:text-blue-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile Tab Component
interface ProfileTabProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  onSave: (e: React.FormEvent) => void;
  loading: boolean;
  saveStatus: "success" | "error" | 'idle' | 'loading';
}

const ProfileTab = ({ profile, setProfile, onSave, loading, saveStatus }: ProfileTabProps) => {
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

  return (
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

      <form onSubmit={onSave} className="p-8">
        {/* Avatar Section */}
        <AvatarSection 
          profile={profile}
          onAvatarChange={(url) => setProfile({ ...profile, avatar_url: url })}
        />

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

        {/* Skills Section */}
        <SkillsSection
          skills={profile?.skill_interests || []}
          onSkillsChange={(skills) => setProfile({ ...profile!, skill_interests: skills })}
        />

        <div className="flex justify-end mt-8">
          <SaveButton isLoading={loading} status={saveStatus}>
            Save Profile
          </SaveButton>
        </div>
      </form>
    </div>
  );
};

// Notifications Tab Component
interface NotificationsTabProps {
  notificationPreferences: NotificationPreferences;
  setNotificationPreferences: (prefs: NotificationPreferences) => void;
  onSave: (e: React.FormEvent) => void;
  loading: boolean;
  saveStatus: "success" | "error" | 'idle' | 'loading';
}

const NotificationsTab = ({ 
  notificationPreferences, 
  setNotificationPreferences, 
  onSave, 
  loading, 
  saveStatus 
}: NotificationsTabProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 lg:px-6 py-6">
        <h2 className="text-2xl lg:text-2xl font-bold text-white flex items-center gap-3">
          <Bell size={24} />
          Notification Preferences
        </h2>
        <p className="text-blue-100 mt-1">
          Choose how you want to receive updates and reminders
        </p>
      </div>

      <form onSubmit={onSave} className="p-4">
        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex py-3 items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl">
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
          <div className="flex py-3 items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl">
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
          <div className="bg-gray-50 py-3 dark:bg-gray-800 rounded-xl">
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
          <div className="bg-gray-50 py-3 dark:bg-gray-800 rounded-xl">
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
          <SaveButton isLoading={loading} status={saveStatus}>
            Save Preferences
          </SaveButton>
        </div>
      </form>
    </div>
  );
};

// Security Tab Component
interface SecurityTabProps {
  onSave: (e: React.FormEvent) => void;
  loading: boolean;
  saveStatus: "success" | "error" | 'idle' | 'loading';
  formErrors: { [key: string]: string };
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  newPasswordConfirmation: string;
  setNewPasswordConfirmation: (value: string) => void;
}

const SecurityTab = ({
  onSave,
  loading,
  saveStatus,
  formErrors,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  newPasswordConfirmation,
  setNewPasswordConfirmation
}: SecurityTabProps) => {
  return (
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

      <form onSubmit={onSave} className="p-8">
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
          <SaveButton isLoading={loading} status={saveStatus}>
            Update Password
          </SaveButton>
        </div>
      </form>
    </div>
  );
};

// Main Settings Page Component
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string>();
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>(null);
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
      setFormErrors({ password: error.message});
    } else {
      setSaveStatus(s => ({ ...s, password: "success" }));
      setCurrentPassword(""); setNewPassword(""); setNewPasswordConfirmation("");
      setTimeout(() => setSaveStatus(s => ({ ...s, password: null })), 3000);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock }
  ];

  if (!profile || !notificationPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-4 lg:p-6">
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
              <ProfileTab
                profile={profile}
                setProfile={setProfile}
                onSave={handleProfileUpdate}
                loading={loading.profile}
                saveStatus={saveStatus.profile!}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsTab
                notificationPreferences={notificationPreferences}
                setNotificationPreferences={setNotificationPreferences}
                onSave={handleNotificationUpdate}
                loading={loading.notifications}
                saveStatus={saveStatus.notifications!}
              />
            )}

            {activeTab === "security" && (
              <SecurityTab
                onSave={handlePasswordUpdate}
                loading={loading.password}
                saveStatus={saveStatus.password!}
                formErrors={formErrors}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                newPasswordConfirmation={newPasswordConfirmation}
                setNewPasswordConfirmation={setNewPasswordConfirmation}
              />
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