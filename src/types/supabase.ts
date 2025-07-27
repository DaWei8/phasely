export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: "learning" | "health" | "productivity" | "personal";
  frequency: "daily" | "weekly" | "custom";
  target_frequency: number | null;
  target_duration_minutes: number | null;
  reminder_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  habit_entries: HabitEntry[]; // Add this line
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          timezone: string
          preferred_learning_time: string
          learning_style: string
          skill_interests: string[]
          experience_level: string
          weekly_commitment_hours: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      notification_preferences: {
        Row: {
          user_id: string
          email_enabled: boolean
          whatsapp_enabled: boolean
          whatsapp_number: string | null
          push_enabled: boolean
          daily_reminder_time: string
          weekly_review_day: number
          streak_warning_enabled: boolean
          achievement_notifications: boolean
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notification_preferences']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['notification_preferences']['Insert']>
      }
      learning_calendars: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          prompt_used: string
          duration_days: number
          daily_hours: number
          learning_style: string
          status: 'active' | 'completed' | 'paused' | 'archived'
          start_date: string | null
          expected_end_date: string | null
          actual_completion_date: string | null
          progress_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['learning_calendars']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['learning_calendars']['Insert']>
      }
      calendar_items: {
        Row: {
          id: string
          calendar_id: string
          day_number: number
          phase_number: number
          title: string
          description: string
          estimated_hours: number
          is_completed: boolean
          completed_at: string | null
          actual_hours_spent: number | null
          difficulty_rating: number | null
          satisfaction_rating: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['calendar_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['calendar_items']['Insert']>
      }
      resources: {
        Row: {
          id: string
          calendar_item_id: string
          name: string
          url: string
          type: 'video' | 'article' | 'book' | 'course' | 'exercise' | 'other'
          is_completed: boolean
          rating: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['resources']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['resources']['Insert']>
      }
      progress_entries: {
        Row: {
          id: string
          user_id: string
          calendar_id: string
          calendar_item_id: string
          date: string
          hours_spent: number
          completion_status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
          difficulty_rating: number | null
          satisfaction_rating: number | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['progress_entries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['progress_entries']['Insert']>
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon_url: string | null
          category: 'consistency' | 'completion' | 'exploration' | 'mastery'
          criteria: Json
          points: number
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
          progress_snapshot: Json | null
        }
        Insert: Omit<Database['public']['Tables']['user_achievements']['Row'], 'id' | 'earned_at'>
        Update: Partial<Database['public']['Tables']['user_achievements']['Insert']>
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: 'learning' | 'health' | 'productivity' | 'personal'
          frequency: 'daily' | 'weekly' | 'custom'
          target_frequency: number | null
          target_duration_minutes: number | null
          reminder_time: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['habits']['Insert']>
      }
      habit_entries: {
        Row: {
          id: string
          habit_id: string
          date: string
          completed: boolean
          duration_minutes: number | null
          notes: string | null
          mood_rating: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['habit_entries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['habit_entries']['Insert']>
      }
      scheduled_notifications: {
        Row: {
          id: string
          user_id: string
          type: 'daily_reminder' | 'task_reminder' | 'streak_warning' | 'weekly_review' | 'achievement'
          channel: 'email' | 'whatsapp' | 'push' | 'sms'
          scheduled_for: string
          status: 'pending' | 'sent' | 'failed'
          content: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['scheduled_notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['scheduled_notifications']['Insert']>
      }
      templates: {
        Row: {
          id: string
          slug: string | null
          title: string
          prompt: string
          duration_days: number
          calendar: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['templates']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['templates']['Insert']>
      }
    }
  }
}

/* Convenience aliases */
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type LearningCalendar = Database['public']['Tables']['learning_calendars']['Row']
export type CalendarItem = Database['public']['Tables']['calendar_items']['Row']
export type Resource = Database['public']['Tables']['resources']['Row']
export type ProgressEntry = Database['public']['Tables']['progress_entries']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']
export type HabitEntry = Database['public']['Tables']['habit_entries']['Row']
export type ScheduledNotification = Database['public']['Tables']['scheduled_notifications']['Row']
export type Template = Database['public']['Tables']['templates']['Row']