import { useState, useEffect } from 'react'
import { CalendarItem, Resources, useCalendarStore } from '@/lib/store/calendar-store'
import { Info } from 'lucide-react'

export interface HistoryItem {
    id: string
    title: string
    prompt: string
    duration: number
    createdAt: string
    calendar: CalendarItem[]
}

export default function HistorySection() {
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { setCalendarData } = useCalendarStore()

    const loadHistory = async () => {
        setIsLoading(true)
        try {
            // For now, show a coming soon message since the backend isn't fully implemented
            // In a real implementation, you would fetch from your API
            const response = await fetch('/api/history')
            if (response.ok) {
                const data = await response.json()
                setHistoryItems(data)
            } else {
                setHistoryItems([])
            }
        } catch (error) {
            console.error('Failed to load history:', error)
            setHistoryItems([])
        } finally {
            setIsLoading(false)
        }
    }

    const loadHistoryCalendar = (item: HistoryItem) => {
        if (item.calendar) {
            const mappedData = item.calendar.map((entry: CalendarItem, i: number) => ({
                day: entry.day || i + 1,
                phase: entry.phase || 1,
                title: entry.title || entry.title || 'Untitled Task',
                time: entry.time || '2 hours',
                description: entry.description || entry.description || '',
                resources: entry.resources.map((r: Resources) =>
                    r
                ).filter(Boolean)


            }))
            setCalendarData(mappedData)

            // Scroll to calendar preview
            const calendarSection = document.getElementById('calendarPreviewSection')
            if (calendarSection) {
                calendarSection.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }

    useEffect(() => {
        loadHistory()
    }, [])

    return (
        <div className="p-4 bg-white rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-history text-blue-600 mr-2"></i>
                Previously Generated Calendars
            </h2>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-8">
                        <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
                        <div className="text-gray-500">Loading history...</div>
                    </div>
                ) : historyItems.length === 0 ? (
                    <div className="text-center py-8">
                        <i className="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
                        <div className="text-gray-500 mb-2">No previous calendars found</div>
                        <div className="text-sm text-gray-400">
                            Generate your first AI calendar to see it appear here
                        </div>
                    </div>
                ) : (
                    historyItems.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            className="bg-white rounded-lg shadow border-l-4 border-blue-500 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900 mb-1">
                                        {item.title || item.prompt?.slice(0, 50) || 'Untitled Calendar'}...
                                    </div>
                                    <div className="text-xs text-gray-500 mb-1">
                                        Generated: {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Duration: {item.duration || (item.calendar ? item.calendar.length : 'N/A')} days
                                    </div>
                                </div>
                                <button
                                    onClick={() => loadHistoryCalendar(item)}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
                                >
                                    <i className="fas fa-eye"></i>
                                    <span>Load</span>
                                </button>
                            </div>

                            {item.prompt && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <strong>Original prompt:</strong> {item.prompt.slice(0, 150)}
                                    {item.prompt.length > 150 && '...'}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                    <Info className='text-blue-800 mr-1 w-4 h-4 ' />
                    <span className="font-medium text-blue-900">History Feature</span>
                </div>
                <p className="text-sm text-blue-800">
                    Your generated calendars will be saved automatically and appear here for easy access.
                    You can reload any previous calendar and continue editing or export it again.
                </p>
            </div>
        </div>
    )
}