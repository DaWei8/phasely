// types/calendar.ts
export interface CalendarData {
  id: string;
  title: string;
  description: string;
  daily_hours: number;
  duration_days: number;
  progress_percentage: number;
  status: string;
  created_at: string;
}

export interface CalendarItem {
  id: string;
  calendar_id: string;
  day_number: number;
  phase_number: number;
  title: string;
  description: string;
  estimated_hours: number;
  is_completed: boolean;
  completed_at: string | null;
  actual_hours_spent: number | null;
  difficulty_rating: number | null;
  satisfaction_rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}