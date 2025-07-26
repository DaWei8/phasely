import { create } from 'zustand'

export interface CalendarItem {
  day: number
  phase: number
  title: string
  time: string
  description: string
  resources: Resources[]
  completed?: boolean
}

export interface Resources {
  name: string
  link: string
}

export interface CalendarSettings {
  duration: number
  startDate: string 
  startTime: string
  skipWeekends: boolean
  timeCommitment: string
  learningStyle: string 
}

export interface CalendarStore {
  currentCalendarData: CalendarItem[]
  isEditMode: boolean
  editIndex: number | null
  isLoading: boolean
  calendarSettings: CalendarSettings 
  isGenerating: boolean

  // Actions
  toggleItemCompletion: (day: number) => void
  setCalendarData: (data: CalendarItem[]) => void
  addCalendarItem: (item: CalendarItem) => void
  updateCalendarItem: (index: number, item: Partial<CalendarItem>) => void
  deleteCalendarItem: (index: number) => void
  setEditMode: (mode: boolean) => void
  setEditIndex: (index: number | null) => void
  setLoading: (loading: boolean) => void
  clearCalendar: () => void
  updateSettings: (settings: Partial<CalendarSettings>) => void 
  saveToHistory: () => void 
  setGenerating: (state: boolean) => void

  // Progress tracking
  toggleProgress: (day: number) => void
  getProgressPercentage: () => number
  getProgressStats: () => { completed: number; total: number; percentage: number }
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentCalendarData: [],
  isEditMode: false,
  editIndex: null,
  isLoading: false,
  isGenerating: false,
  calendarSettings: {
    duration: 14,
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    skipWeekends: false,
    timeCommitment: '2',
    learningStyle: 'balanced'
  },

  setCalendarData: (data) => {
    set({ currentCalendarData: data })
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiCalendarData', JSON.stringify(data))
    }
  },

  addCalendarItem: (item) => {
    const { currentCalendarData } = get()
    const newData = [...currentCalendarData, { ...item, day: currentCalendarData.length + 1 }]
    set({ currentCalendarData: newData })
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiCalendarData', JSON.stringify(newData))
    }
  },

  updateCalendarItem: (index, updatedItem) => {
    const { currentCalendarData } = get()
    const newData = currentCalendarData.map((item, i) => 
      i === index ? { ...item, ...updatedItem } : item
    )
    set({ currentCalendarData: newData })
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiCalendarData', JSON.stringify(newData))
    }
  },

  deleteCalendarItem: (index) => {
    const { currentCalendarData } = get()
    const newData = currentCalendarData
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, day: i + 1 })) 
    set({ currentCalendarData: newData })
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiCalendarData', JSON.stringify(newData))
    }
  },

  updateSettings: (newSettings) => {
    const { calendarSettings } = get()
    const updatedSettings = { ...calendarSettings, ...newSettings }
    set({ calendarSettings: updatedSettings })
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendarSettings', JSON.stringify(updatedSettings))
    }
  },

  saveToHistory: () => {
    const { currentCalendarData } = get()
    if (typeof window !== 'undefined' && currentCalendarData.length > 0) {
      const history = JSON.parse(localStorage.getItem('calendarHistory') || '[]')
      const newEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        data: currentCalendarData
      }
      history.unshift(newEntry)
      // Keep only last 10 entries
      if (history.length > 10) {
        history.splice(10)
      }
      localStorage.setItem('calendarHistory', JSON.stringify(history))
    }
  },

  setGenerating: (state) => set({ isGenerating: state }),
  setEditMode: (mode) => set({ isEditMode: mode }),
  setEditIndex: (index) => set({ editIndex: index }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearCalendar: () => {
    set({ currentCalendarData: [] })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aiCalendarData')
    }
  },

  toggleProgress: (day) => {
    if (typeof window !== 'undefined') {
      const key = `progress_day_${day}`
      const current = localStorage.getItem(key) === '1'
      localStorage.setItem(key, current ? '0' : '1')
    }
  },

  getProgressPercentage: () => {
    const { currentCalendarData } = get()
    if (currentCalendarData.length === 0) return 0
    
    let completed = 0
    if (typeof window !== 'undefined') {
      currentCalendarData.forEach(item => {
        if (localStorage.getItem(`progress_day_${item.day}`) === '1') {
          completed++
        }
      })
    }
    return Math.round((completed / currentCalendarData.length) * 100)
  },

  toggleItemCompletion: (day) => {
  const { currentCalendarData } = get();
  const newData = currentCalendarData.map((item) =>
    item.day === day ? { ...item, completed: !item.completed } : item
  );
  set({ currentCalendarData: newData });
  if (typeof window !== 'undefined') {
    localStorage.setItem('aiCalendarData', JSON.stringify(newData));
  }
  },

  getProgressStats: () => {
    const { currentCalendarData } = get();
    const total = currentCalendarData.length;
    const completed = currentCalendarData.filter((item) => item.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  }
}))