import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Type definitions
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

interface DatabaseRow {
  id: number;
  user_goal: string;
  duration: number;
  generated_plan: PlanPhase[];
  content_calendar: CalendarEntry[];
  created_at: string;
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
const supabaseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching history from Supabase...");

    // Get query parameters for pagination (optional)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch from Supabase
    const { data, error } = await supabase
      .from("generated_plans")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching history from Supabase:", error);
      return NextResponse.json(
        { message: "Error fetching history", error: error.message },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} history items`);

    // Transform data to match frontend expectations
    const formattedData = data?.map((item) => ({
      id: item.id,
      user_goal: item.user_goal,
      duration: item.duration,
      created_at: item.created_at,
      calendar: item.content_calendar,
      plan: item.generated_plan,
    })) || [];

    return NextResponse.json(formattedData);

  } catch (error: any) {
    console.error("Unexpected error in /api/history:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: "ID parameter is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("generated_plans")
      .delete()
      .eq('id', parseInt(id, 10));

    if (error) {
      console.error("Error deleting plan from Supabase:", error);
      return NextResponse.json(
        { message: "Error deleting plan", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Plan deleted successfully" });

  } catch (error: any) {
    console.error("Unexpected error in DELETE /api/history:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}