// import { CalendarItem, CalendarSettings } from '@/lib/store/calendar-store'

import { HistoryItem } from "@/components/sections/HistorySection"
import { CalendarItem, CalendarSettings, Resources } from "../store/calendar-store"

// Use correct API base for local and production
function getApiBase(): string {
  if (typeof window !== 'undefined') {
    // Client-side
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5501'
    }
  }
  return 'https://phaseplanner-v2.onrender.com'
}

export async function generateAICalendar(
  prompt: string, 
  settings: CalendarSettings
): Promise<CalendarItem[]> {
  const API_BASE = getApiBase()
  
  try {
    let allCalendar: CalendarItem[] = []
    // const allPhases: any[] = []
    // const introduction: string = ""
    const chunkSize = 30
    const numChunks = Math.ceil(settings.duration / chunkSize)

    for (let i = 0; i < numChunks; i++) {
      const startDay = i * chunkSize + 1
      const endDay = Math.min((i + 1) * chunkSize, settings.duration)
      const chunkDuration = endDay - startDay + 1

      // Compose a chunked prompt
      const chunkRequestPrompt = `For a total learning plan of ${settings.duration} days, generate ONLY the content calendar for days ${startDay} to ${endDay} (inclusive) for the goal: "${prompt}". 
        If this is the first chunk (days 1-${chunkSize}), also include the introduction and the 7-phase plan as described below. 
        The response MUST be a single JSON object with these keys:
        - "introduction" (object, only in the first chunk)
        - "plan" (array, only in the first chunk)
        - "calendar" (array, for days ${startDay} to ${endDay} only, each entry as described previously)
        Do NOT include any extra text or markdown.`

      const response = await fetch(`${API_BASE}/api/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chunkRequestPrompt,
          duration: chunkDuration,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Failed to fetch data from the server (status ${response.status}): ${errText}`)
      }

      const data = await response.json()

      // First chunk: get intro and plan
      // if (i === 0) {
      //   if (data.plan && data.plan.introduction) introduction = data.plan.introduction
      //   if (data.plan && data.plan.plan) allPhases = data.plan.plan
      // }
      
      // Always append calendar
      if (data.plan && data.plan.calendar) {
        // Adjust day numbers to global
        const offset = startDay - 1
        const chunkCalendar = data.plan.calendar.map((entry: CalendarItem) => ({
          ...entry,
          day: entry.day + offset,
        }))
        allCalendar = allCalendar.concat(chunkCalendar)
      }
    }

    // Map Gemini API calendar format to frontend format
    const calendarData = allCalendar.map((entry : CalendarItem) => ({
      day: entry.day,
      phase: entry.phase,
      title: entry.title,
      time: entry.time,
      description: entry.description,
      resources: entry.resources.map((r: Resources) =>r
          ),
      completed: false
    }))

    return calendarData
  } catch (error) {
    console.error('Error generating calendar:', error)
    throw error
  }
}

export async function loadHistory(): Promise<CalendarItem[][]> {
  const API_BASE = getApiBase()
  
  try {
    const response = await fetch(`${API_BASE}/api/history`)
    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Failed to fetch history (status ${response.status}): ${errText}`)
    }
    
    const data = await response.json()
    
    if (!data || data.length === 0) {
      return []
    }

    // Map history data to frontend format
    return data.map((item: HistoryItem) => 
      item.calendar ? item.calendar.map((entry: CalendarItem) => ({
        day: entry.day,
        phase: entry.phase,
        title: entry.title,
        time: entry.time,
        description: entry.description,
        resources: Array.isArray(entry.resources)
          ? entry.resources.map((r: Resources) =>
              r.link ? r.link : typeof r === 'string' ? r : ''
            )
          : [],
        completed: false
      })) : []
    )
  } catch (error) {
    console.error('Error loading history:', error)
    throw error
  }
}

export function exportToICS(calendarData: CalendarItem[], settings: CalendarSettings): void {
  if (calendarData.length === 0) {
    throw new Error('No calendar data to export')
  }

  const startDate = new Date(settings.startDate)
  const [hours, minutes] = settings.startTime.split(':').map(Number)

  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Phasely Learning Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:AI Generated Learning Calendar
X-WR-CALDESC:Personalized learning schedule generated by AI
`

  calendarData.forEach((item) => {
    const eventDate = new Date(startDate)
    const daysToAdd = item.day - 1

    if (settings.skipWeekends) {
      // Calculate business days
      let businessDaysAdded = 0
      while (businessDaysAdded < daysToAdd) {
        eventDate.setDate(eventDate.getDate() + 1)
        if (eventDate.getDay() !== 0 && eventDate.getDay() !== 6) {
          businessDaysAdded++
        }
      }
    } else {
      eventDate.setDate(startDate.getDate() + daysToAdd)
    }

    eventDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(eventDate)

    // Parse duration from time string
    const durationMatch = item.time.match(/(\d+)/)
    const duration = durationMatch ? parseInt(durationMatch[1]) : 2
    endDate.setHours(eventDate.getHours() + duration)

    const dateStr = eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endDateStr = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const uid = `day${item.day}-${Date.now()}-${item.day}@phasely.com`

    const resourceLinks = item.resources && item.resources.length > 0
      ? item.resources.map((resource) => `• ${resource}`).join('\\n')
      : 'No specific resources provided'
    
    const description = `${item.description}\\n\\nTime Allocation: ${item.time}\\n\\nRecommended Resources:\\n${resourceLinks}\\n\\nDay ${item.day} of your learning journey`

    icsContent += `
BEGIN:VEVENT
UID:${uid}
DTSTART:${dateStr}
DTEND:${endDateStr}
SUMMARY:${item.title}
DESCRIPTION:${description}
CATEGORIES:Phase ${item.phase || 1}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT`
  })

  icsContent += '\nEND:VCALENDAR'

  // Create and download file
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'phasely-learning-calendar.ics'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}