export type Resource = { name: string; link: string };
export type HistoryCalendar = {
  title?: string;
  prompt?: string;
  createdAt?: string;
  duration?: number;
  calendar?: CalendarItem[];
};

export type CalendarItem = {
  day: number;
  phase: number;
  title: string;
  time: string;
  description: string;
  resources?: (string | { link?: string })[];
  learningStyle: string;
};


// Utility Types
export type CalendarEntry = {
  day: number;
  phaseNumber: number;
  taskName: string;
  timeCommitment: string;
  taskDescription: string;
  resources?: (string | { link?: string })[];
};

export type ChunkedCalendarEntry = {
  day: number;
  phase: number;
  title: string;
  time: string;
  description: string;
  resources: string[];
};