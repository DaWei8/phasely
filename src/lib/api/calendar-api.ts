import { HistoryItem } from "@/components/sections/HistorySection"
import { CalendarItem, CalendarSettings, Resources } from "../store/calendar-store"

// Get correct API base URL for Next.js
// function getApiBase(): string {
//   // For Next.js API routes, use relative URLs
//   return (process.env.NEXT_PUBLIC_SITE_URL)
// }

export async function generateAICalendar(
  prompt: string, 
  settings: CalendarSettings
): Promise<CalendarItem[]> {
  const API_BASE = process.env.NEXT_PUBLIC_SITE_URL
  
  try {
    let allCalendar: CalendarItem[] = []
    const chunkSize = 30
    const numChunks = Math.ceil(settings.duration / chunkSize)

    for (let i = 0; i < numChunks; i++) {
      const startDay = i * chunkSize + 1
      const endDay = Math.min((i + 1) * chunkSize, settings.duration)
      const chunkDuration = endDay - startDay + 1

      console.log(`Processing chunk ${i + 1}/${numChunks}: days ${startDay}-${endDay}`);

      console.log("Sending request to Next.js API route...");

      const response = await fetch(`${API_BASE}/api/generate-plan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: chunkDuration,
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        console.error(`API Error (${response.status}):`, errText)
        throw new Error(`Failed to fetch data from the server (status ${response.status}): ${errText}`)
      }

      const data = await response.json()
      console.log("Received response from API:", data)

      
      // Handle the response structure from Next.js API
      if (data.plan && data.plan.calendar) {
        // Adjust day numbers to global sequence
        const offset = startDay - 1
        const chunkCalendar = data.plan.calendar.map((entry: any) => ({
          ...entry,
          day: entry.day + offset,
        }))
        allCalendar = allCalendar.concat(chunkCalendar)
      } else {
        console.warn("Unexpected response structure:", data)
      }
    }

    // Map API response format to frontend CalendarItem format
    const calendarData: CalendarItem[] = allCalendar.map((entry: any) => ({
      day: entry.day,
      phase: entry.phaseNumber || entry.phase || 1,
      title: entry.taskName || entry.title || 'Untitled Task',
      time: entry.timeCommitment || entry.time || '1 hour',
      description: entry.taskDescription || entry.description || 'No description provided',
      resources: Array.isArray(entry.resources) 
        ? entry.resources.map((r: any) => {
            if (typeof r === 'object' && r.link) {
              return r.link
            } else if (typeof r === 'string') {
              return r
            }
            return ''
          }).filter(Boolean)
        : [],
      completed: false
    }))

    console.log(`Successfully processed ${calendarData.length} calendar items`)
    return calendarData

  } catch (error) {
    console.error('Error generating calendar:', error)
    throw error
  }
}

export async function loadHistory(): Promise<HistoryItem[]> {
  const API_BASE = process.env.NEXT_PUBLIC_SITE_URL
  
  try {
    console.log("Loading history from Next.js API...")
    
    const response = await fetch(`${API_BASE}/api/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(`History API Error (${response.status}):`, errText)
      throw new Error(`Failed to fetch history (status ${response.status}): ${errText}`)
    }
    
    const data = await response.json()
    console.log("Received history data:", data)
    
    if (!data || data.length === 0) {
      return []
    }

    // Map history data to frontend format
    const historyItems: HistoryItem[] = data.map((item: any) => ({
      id: item.id,
      user_goal: item.user_goal,
      duration: item.duration,
      created_at: item.created_at,
      calendar: item.calendar ? item.calendar.map((entry: any) => ({
        day: entry.day,
        phase: entry.phaseNumber || entry.phase || 1,
        title: entry.taskName || entry.title || 'Untitled Task',
        time: entry.timeCommitment || entry.time || '1 hour',
        description: entry.taskDescription || entry.description || 'No description provided',
        resources: Array.isArray(entry.resources)
          ? entry.resources.map((r: any) => {
              if (typeof r === 'object' && r.link) {
                return r.link
              } else if (typeof r === 'string') {
                return r
              }
              return ''
            }).filter(Boolean)
          : [],
        completed: false
      })) : []
    }))

    return historyItems

  } catch (error) {
    console.error('Error loading history:', error)
    throw error
  }
}

export async function deleteHistoryItem(id: number): Promise<void> {
  const API_BASE = process.env.NEXT_PUBLIC_SITE_URL
  
  try {
    const response = await fetch(`${API_BASE}/api/history?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Failed to delete history item (status ${response.status}): ${errText}`)
    }

    console.log(`Successfully deleted history item ${id}`)

  } catch (error) {
    console.error('Error deleting history item:', error)
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