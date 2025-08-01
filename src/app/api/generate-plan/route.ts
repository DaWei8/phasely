import { NextRequest, NextResponse } from 'next/server'
import { callGemini } from '@/components/callGemini'
import { createClient } from '@/lib/supabase-server'

// Type definitions
interface GeneratePlanRequest {
  prompt: string
  duration: number
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  error?: any
  modelVersion?: string
  usageMetadata?: any
}

interface PlanPhase {
  phase: number
  days: string
  focus: string
  activities: string[]
}

interface CalendarEntry {
  day: number
  taskName: string
  taskDescription: string
  timeCommitment: string
  learningStyle: string
  phaseNumber: number
  resources: Array<{ name: string; link: string }>
}

interface GeneratedPlan {
  introduction: { description: string }
  plan: PlanPhase[]
  calendar: CalendarEntry[]
}

interface DatabaseRow {
  id?: string
  user_id: string
  title: string
  description: string | null
  prompt_used: string
  duration_days: number
  daily_hours: number
  learning_style: string
  status: string
  start_date: string | null
  expected_end_date: string | null
  actual_completion_date?: string | null
  progress_percentage: number
  created_at?: string
  updated_at?: string
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ensure the user exists in user_profiles
  const { error: upsertError } = await supabase
    .from('user_profiles')
    .upsert({ id: user.id }, { onConflict: 'id' })

  if (upsertError) {
    console.error('Could not upsert user profile:', upsertError)
    return NextResponse.json(
      { message: 'Could not upsert user profile', error: upsertError.message },
      { status: 500 }
    )
  }

  try {
    const body: GeneratePlanRequest = await request.json()
    const { prompt: userGoal, duration } = body

    console.log('Received request to /api/generate-plan with body:', body)

    if (!userGoal || typeof userGoal !== 'string' || userGoal.trim() === '') {
      console.log('Validation failed: Prompt missing or invalid.')
      return NextResponse.json(
        { message: 'Prompt is required and must be a non-empty string.' },
        { status: 400 }
      )
    }

    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      console.log('Validation failed: Duration missing or invalid.')
      return NextResponse.json(
        { message: 'Duration is required and must be a positive integer.' },
        { status: 400 }
      )
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
    `.trim()

    console.log('Sending prompt to Gemini API:', fullPrompt.slice(0, 300) + '...')

    const response = await callGemini(fullPrompt.replace(/\s+/g, ' ').trim())

    if (!response.data) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const geminiData: GeminiResponse = response.data

    if (geminiData.error) {
      console.error('Gemini API error:', geminiData.error)
      return NextResponse.json(
        { message: 'Gemini API error', error: geminiData.error },
        { status: 500 }
      )
    }

    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    console.log(
      'Raw Gemini API response text:',
      generatedText ? generatedText.slice(0, 300) + '...' : 'No text'
    )

    if (!generatedText) {
      console.error('No text content in Gemini API response:', geminiData)
      return NextResponse.json(
        {
          message: 'Gemini did not generate a plan.',
          error: 'No text content in response.',
        },
        { status: 500 }
      )
    }

    const cleanedText = generatedText
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .trim()

    let parsedPlan: GeneratedPlan
    try {
      parsedPlan = JSON.parse(cleanedText)

      if (!parsedPlan.plan || !parsedPlan.calendar) {
        console.error(
          'Parsed JSON missing "plan" or "calendar" keys:',
          parsedPlan
        )
        throw new Error(
          'Parsed content must contain "plan" and "calendar" keys.'
        )
      }
    } catch (jsonError: any) {
      console.error('Failed to parse Gemini\'s response:', cleanedText)
      return NextResponse.json(
        {
          message: 'Failed to parse Gemini\'s response. It might not be valid JSON.',
          error: jsonError.message,
          rawResponse: cleanedText,
        },
        { status: 500 }
      )
    }

    const dailyHours = parsedPlan.calendar.reduce(
      (total, entry) => total + parseTimeCommitment(entry.timeCommitment),
      0
    ) / parsedPlan.calendar.length

    const learningStyles = parsedPlan.calendar.map(
      (entry) => entry.learningStyle.toLowerCase()
    )

    const styleCounts: { [key: string]: number } = {}
    learningStyles.forEach((style) => {
      styleCounts[style] = (styleCounts[style] || 0) + 1
    })

    const primaryStyle = Object.entries(styleCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0]

    // Start a database transaction
    const { data: calendarData, error: calendarError } = await supabase
      .from('learning_calendars')
      .insert([{
        user_id: user.id,
        title: userGoal,
        description: parsedPlan.introduction.description,
        prompt_used: fullPrompt,
        duration_days: duration,
        daily_hours: Math.round(dailyHours),
        learning_style: primaryStyle,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        expected_end_date: calculateEndDate(duration),
        progress_percentage: 0,
      }])
      .select('id')
      .single()

    if (calendarError) {
      console.error('Error saving learning calendar to Supabase:', calendarError)
      return NextResponse.json(
        { message: 'Failed to create learning calendar', error: calendarError.message },
        { status: 500 }
      )
    }

    const calendarId = calendarData.id

    // Insert calendar items
    const calendarItems = parsedPlan.calendar.map(entry => ({
      calendar_id: calendarId,
      day_number: entry.day,
      phase_number: entry.phaseNumber,
      title: entry.taskName,
      description: entry.taskDescription,
      resources: entry.resources,
      estimated_hours: parseTimeCommitment(entry.timeCommitment),
    }))

    const { data: calendarItemsData, error: calendarItemsError } = await supabase
      .from('calendar_items')
      .insert(calendarItems)
      .select('id, day_number')

    if (calendarItemsError) {
      console.error('Error saving calendar items to Supabase:', calendarItemsError)
      // Clean up the learning calendar if calendar items failed
      await supabase.from('learning_calendars').delete().eq('id', calendarId)
      return NextResponse.json(
        { message: 'Failed to create calendar items', error: calendarItemsError.message },
        { status: 500 }
      )
    }

    // Create initial progress entries for each calendar item
    const today = new Date().toISOString().split('T')[0]
    const progressEntries = calendarItemsData?.map((item, index) => ({
      user_id: user.id,
      calendar_id: calendarId,
      calendar_item_id: item.id,
      date: calculateDateForDay(item.day_number),
      hours_spent: 0,
      completion_status: 'not_started',
    })) || []

    const { error: progressError } = await supabase
      .from('progress_entries')
      .insert(progressEntries)

    if (progressError) {
      console.error('Error creating progress entries:', progressError)
      // Clean up the learning calendar and calendar items if progress entries failed
      await supabase.from('learning_calendars').delete().eq('id', calendarId)
      return NextResponse.json(
        { message: 'Failed to create progress entries', error: progressError.message },
        { status: 500 }
      )
    }

    // Update user profile with the primary learning style if it's different
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('learning_style')
      .eq('id', user.id)
      .single()

    if (currentProfile && currentProfile.learning_style !== primaryStyle) {
      await supabase
        .from('user_profiles')
        .update({ 
          learning_style: primaryStyle,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    console.log('Plan successfully saved to all tables')
    return NextResponse.json({
      plan: parsedPlan,
      calendarId,
      modelVersion: geminiData.modelVersion,
      usageMetadata: geminiData.usageMetadata,
    })

  } catch (error: any) {
    console.error('Error in /api/generate-plan:', error)
    return NextResponse.json(
      {
        message: 'Error generating plan',
        error: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

function parseTimeCommitment(time: string): number {
  if (time.includes('-')) {
    const [min, max] = time
      .split('-')
      .map((t) => parseFloat(t.trim().replace(/[^0-9.-]+/g, '')))
    return (min + max) / 2
  }
  return parseFloat(time.replace(/[^0-9.-]+/g, ''))
}

function calculateEndDate(duration: number): string {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + duration)
  return startDate.toISOString().split('T')[0]
}

function calculateDateForDay(dayNumber: number): string {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() + dayNumber - 1)
  return startDate.toISOString().split('T')[0]
}