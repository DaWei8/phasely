import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { callGemini } from '@/components/callGemini';

// Type definitions
interface GeneratePlanRequest {
  prompt: string;
  duration: number;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: any;
  modelVersion?: string;
  usageMetadata?: any;
}

interface PlanPhase {
  phase: number;
  days: string;
  focus: string;
  activities: string[];
}

interface CalendarEntry {
  day: number;
  taskName: string;
  taskDescription: string;
  timeCommitment: string;
  learningStyle: string;
  phaseNumber: number;
  resources: Array<{
    name: string;
    link: string;
  }>;
}

interface GeneratedPlan {
  introduction: {
    description: string;
  };
  plan: PlanPhase[];
  calendar: CalendarEntry[];
}

interface DatabaseRow {
  id?: number;
  user_goal: string;
  duration: number;
  generated_plan: PlanPhase[];
  content_calendar: CalendarEntry[];
  created_at?: string;
  user_id?: string;
}

// Database types for Supabase
interface Database {
  public: {
    Tables: {
      generated_plans: {
        Row: DatabaseRow;
        Insert: Omit<DatabaseRow, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseRow, 'id' | 'created_at'>>;
      };
    };
  };
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
const { data: { user } } = await supabase.auth.getUser();
const { data } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", user.id)
                .single();


export async function POST(request: NextRequest) {
  try {
    const body: GeneratePlanRequest = await request.json();
    const { prompt: userGoal, duration } = body;

    console.log("Received request to /api/generate-plan with body:", body);

    // Input validation
    if (!userGoal || typeof userGoal !== "string" || userGoal.trim() === "") {
      console.log("Validation failed: Prompt missing or invalid.");
      return NextResponse.json(
        { message: "Prompt is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      console.log("Validation failed: Duration missing or invalid.");
      return NextResponse.json(
        { message: "Duration is required and must be a positive integer." },
        { status: 400 }
      );
    }

    const fullPrompt = `
      Generate a ${duration}-day plan and a corresponding content calendar for the goal: "${userGoal}".

      The overall response MUST be a single JSON object with three top-level keys:
      - "introduction": (object) Contains an introductory description and a disclaimer.
      - "plan": (array of objects) Represents the 7-phase plan.
      - "calendar": (array of objects) Represents the detailed content calendar.

      The "introduction" object MUST have the following keys:
      - "description": (string) A brief summary explaining what the generated plan and calendar are about. This should introduce the goal and the duration.

      The "plan" array should consist of exactly 7 distinct phase objects.
      Each phase object MUST have the following keys:
      - "phase": (integer) The phase number (1 to 7).
      - "days": (string) The range of days for this phase (e.g., "1-3", "4-7").
      - "focus": (string) The main objective or theme of the phase.
      - "activities": (array of strings) A list of specific activities or tasks for this phase.

      The "calendar" array should contain entries for *each day* within the ${duration}-day period, starting from Day 1.
      Each calendar entry object MUST have the following keys:
      - "day": (integer) The specific day number (e.g., 1, 2, 3, up to ${duration}).
      - "taskName": (string) A concise name for the day's main task.
      - "taskDescription": (string) A detailed description of what needs to be done.
      - "timeCommitment": (string) The estimated time required based on the average time required for the entire duration (e.g., "30 mins", "1 hour", "2-3 hours").
      - "learningStyle": (string) The preferred learning style for the task (e.g., "visual", "auditory", "kinesthetic").
      - "phaseNumber": (integer) The phase number this task belongs to.
      - "resources": (array of objects) A list of exactly two online resources.
          Each resource object MUST have "name" (string) and "link" (string, a valid URL) keys.

      Ensure the "calendar" entries logically align with the "plan" phases and activities.
      Do NOT include any additional text, markdown formatting (like '''json), or explanations outside the JSON object itself.
    `.trim();

    console.log("Sending prompt to Gemini API:", fullPrompt.slice(0, 300) + "...");

    // Call Gemini API
    const response = await callGemini(fullPrompt.replace(/\s+/g, " ").trim())

    if (!response.data) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const geminiData: GeminiResponse = response.data
    // Check for Gemini API errors
    if (geminiData.error) {
      console.error("Gemini API error:", geminiData.error);
      return NextResponse.json(
        { message: "Gemini API error", error: geminiData.error },
        { status: 500 }
      );
    }

    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("Raw Gemini API response text:", generatedText ? generatedText.slice(0, 300) + "..." : "No text");

    if (!generatedText) {
      console.error("No text content in Gemini API response:", geminiData);
      return NextResponse.json(
        { message: "Gemini did not generate a plan.", error: "No text content in response." },
        { status: 500 }
      );
    }

    // Clean and parse the JSON data
    const cleanedText = generatedText
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsedPlan: GeneratedPlan;
    try {
      parsedPlan = JSON.parse(cleanedText);

      // Ensure the response contains both "plan" and "calendar"
      if (!parsedPlan.plan || !parsedPlan.calendar) {
        console.error("Parsed JSON missing 'plan' or 'calendar' keys:", parsedPlan);
        throw new Error('Parsed content must contain "plan" and "calendar" keys.');
      }
    } catch (jsonError: any) {
      console.error("Failed to parse Gemini's response:", cleanedText);
      return NextResponse.json(
        {
          message: "Failed to parse Gemini's response. It might not be valid JSON.",
          error: jsonError.message,
          rawResponse: cleanedText,
        },
        { status: 500 }
      );
    }

    // Save to Supabase
    try {
      const { data, error } = await supabase
        .from("learning_calendars")
        .insert([
          {
            user_goal: userGoal,
            duration: Number(duration),
            generated_plan: parsedPlan.plan,
            content_calendar: parsedPlan.calendar,
            user_id: user.id
          },
        ]);

      if (error) {
        console.error("Error saving plan to Supabase:", error);
        // Continue anyway - we can still return the plan
      } else {
        console.log("Plan successfully saved to Supabase");
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      // Continue anyway - we can still return the plan
    }

    // Send successful response
    console.log("Successfully parsed plan, sending response to frontend.");
    return NextResponse.json({
      plan: parsedPlan,
      modelVersion: geminiData.modelVersion,
      usageMetadata: geminiData.usageMetadata,
    });

  } catch (error: any) {
    console.error("Error in /api/generate-plan:", error);
    return NextResponse.json(
      {
        message: "Error generating plan",
        error: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}