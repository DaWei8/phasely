// lib/googleCalendar.ts

// Google API type declarations
declare global {
  interface Window {
    gapi: any;
  }
}

// Type definitions matching your database schema
export interface CalendarData {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  prompt_used: string;
  duration_days: number;
  daily_hours: number;
  learning_style: string;
  status: "completed" | "active" | "paused" | "archived";
  progress_percentage: number;
  created_at: string;
  updated_at: string;
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

interface GoogleCalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{ email: string }>;
}

interface GoogleCalendarIntegrationProps {
  calendar: CalendarData;
  calendarItems: CalendarItem[];
  userEmail: string;
  userTimezone?: string;
  preferredLearningTime?: string;
}

export class GoogleCalendarIntegration {
  private static readonly DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  private static readonly SCOPES = 'https://www.googleapis.com/auth/calendar';

  static async initializeGapi(apiKey: string, clientId: string): Promise<boolean> {
    try {
      // Wait for gapi to be available
      if (typeof window !== 'undefined' && window.gapi) {
        await new Promise<void>((resolve) => {
          window.gapi.load('client:auth2', resolve);
        });
        
        await window.gapi.client.init({
          apiKey: apiKey,
          clientId: clientId,
          discoveryDocs: [this.DISCOVERY_DOC],
          scope: this.SCOPES
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error initializing Google API:', error);
      return false;
    }
  }

  static async signIn(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.gapi) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        const user = await authInstance.signIn();
        return user.isSignedIn();
      }
      return false;
    } catch (error) {
      console.error('Error signing in to Google:', error);
      return false;
    }
  }

  static async createCalendarEvents({
    calendar,
    calendarItems,
    userEmail,
    userTimezone = 'UTC',
    preferredLearningTime = 'morning'
  }: GoogleCalendarIntegrationProps): Promise<{ success: boolean; eventsCreated: number; errors: string[] }> {
    const errors: string[] = [];
    let eventsCreated = 0;

    try {
      // Parse preferred learning time to hour
      const getPreferredHour = (time: string): number => {
        switch (time) {
          case 'early-morning': return 6;
          case 'morning': return 9;
          case 'afternoon': return 14;
          case 'evening': return 18;
          case 'night': return 20;
          default: return 9;
        }
      };

      const startHour = getPreferredHour(preferredLearningTime);
      const startDate = new Date(calendar.created_at);

      for (const item of calendarItems) {
        try {
          // Calculate the date for this calendar item
          const itemDate = new Date(startDate.getTime() + (item.day_number - 1) * 24 * 60 * 60 * 1000);
          
          // Set the start time based on user preference
          itemDate.setHours(startHour, 0, 0, 0);
          
          // Calculate end time based on estimated hours
          const endDate = new Date(itemDate.getTime() + (item.estimated_hours * 60 * 60 * 1000));

          // Create event description with learning resources
          let description = `${item.description}\n\n`;
          description += `📚 Learning Phase: ${item.phase_number}\n`;
          description += `⏱️ Estimated Duration: ${item.estimated_hours} hours\n\n`;
          description += `📋 Learning Resources:\n`;
          description += `• Study Material: [Access Here](#)\n`;
          description += `• Video Tutorial: [Watch Here](#)\n`;
          description += `• Practice Exercises: [Practice Here](#)\n\n`;
          description += `💡 Tips: Take breaks every 25-30 minutes and track your progress!`;

          const event: GoogleCalendarEvent = {
            summary: `${calendar.title} - Day ${item.day_number}: ${item.title}`,
            description: description,
            start: {
              dateTime: itemDate.toISOString(),
              timeZone: userTimezone,
            },
            end: {
              dateTime: endDate.toISOString(),
              timeZone: userTimezone,
            },
            attendees: [{ email: userEmail }],
          };

          // @ts-ignore - Google Calendar API types
          const response = await window.gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event,
          });

          if (response.status === 200) {
            eventsCreated++;
          } else {
            errors.push(`Failed to create event for Day ${item.day_number}: ${item.title}`);
          }
        } catch (itemError) {
          console.error(`Error creating event for Day ${item.day_number}:`, itemError);
          errors.push(`Error creating event for Day ${item.day_number}: ${item.title}`);
        }
      }

      return {
        success: eventsCreated > 0,
        eventsCreated,
        errors
      };
    } catch (error) {
      console.error('Error creating calendar events:', error);
      return {
        success: false,
        eventsCreated: 0,
        errors: ['Failed to create calendar events. Please try again.']
      };
    }
  }

  static isSignedIn(): boolean {
    try {
      if (typeof window !== 'undefined' && window.gapi) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        return authInstance && authInstance.isSignedIn.get();
      }
      return false;
    } catch {
      return false;
    }
  }

  static async signOut(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.gapi) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}