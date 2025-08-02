// components/dashboard/AICalendarSection.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'
import { SparklesIcon, AcademicCapIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { generateAICalendar } from '@/lib/api/calendar-api'
import toast from 'react-hot-toast'
import LoadingOverlay from '@/components/LoadingOverlay'
import { useCalendarStore } from '@/lib/store/calendar-store'
import { X } from 'lucide-react'

const examplePrompts = {
  webdev: "I want to learn full-stack web development in 60 days. I'm a complete beginner and want to focus on React, Node.js, and MongoDB. I can dedicate 2-3 hours per day and prefer hands-on projects over theory. Include some portfolio projects I can build to showcase my skills.",
  datascience: "I want to become proficient in data science and machine learning in 45 days. I have basic Python knowledge but no ML experience. Focus on pandas, scikit-learn, and TensorFlow. I prefer a mix of theory and practical projects with real datasets.",
  mobile: "I want to learn React Native mobile app development in 30 days. I have some JavaScript experience. Include building 3-4 complete apps for both iOS and Android, with focus on navigation, state management, and API integration.",
  marketing: "I want to master digital marketing in 21 days. Focus on SEO, social media marketing, Google Ads, and content marketing. I prefer practical exercises and real campaign creation over theory."
}

export default function AICalendarSection({ onCancel }: { onCancel?: () => void }) {
  const [prompt, setPrompt] = useState('')
  const router = useRouter();
  const {
    calendarSettings,
    updateSettings,
    // currentCalendarData,
    setCalendarData,
    setGenerating,
    isGenerating,
    saveToHistory
  } = useCalendarStore()

   function handleReload() {
    window.location.reload();
    router.refresh(); // re-fetches server components & data
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your learning goals first.')
      return
    }

    if (calendarSettings.duration < 3 || calendarSettings.duration > 120) {
      toast.error('Duration must be between 3 and 120 days.')
      return
    }

    try {
      setGenerating(true)
      const data = await generateAICalendar(prompt, calendarSettings)
      setCalendarData(data)
       //console.log("data received from api", data)
      saveToHistory()
      toast.success('Calendar generated successfully!')
      handleReload()
      onCancel?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate calendar')
    } finally {
      setGenerating(false)
    }
  }

  const setExamplePrompt = (type: keyof typeof examplePrompts) => {
    setPrompt(examplePrompts[type])
    toast.success('Example loaded! Customize and generate.')
  }

  return (
    <div className='relative flex flex-col w-full'>
      <div className=' w-full sticky z-30 top-0 flex justify-end' >
        <X className='w-7 h-7 cursor-pointer text-red-700' onClick={onCancel} />
      </div>
      {isGenerating && <LoadingOverlay />}
      <div className="space-y-8 relative">
        {/* Header */}
        {/* Prompt Input */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="flex text-xl font-semibold text-gray-700 dark:text-gray-200">
            <AcademicCapIcon className="inline text-blue-600 h-6 w-6 mr-2 " />
            <p className='w-full' >
              Describe Your Learning Goals
            </p>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="input-field h-40 resize-none w-full "
            placeholder="Example: I want to learn full-stack web development in 60 days. I'm a complete beginner and want to focus on React, Node.js, and MongoDB. I can dedicate 2-3 hours per day and prefer hands-on projects over theory. Include some portfolio projects I can build to showcase my skills."
          />

          {/* Example Prompts */}
          <div className="space-y-3">
            <p className="font-medium text-gray-700 dark:text-gray-200">Quick Examples:</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries({
                webdev: 'Full-Stack Web Dev',
                datascience: 'Data Science',
                mobile: 'Mobile App Dev',
                marketing: 'Digital Marketing'
              }).map(([key, label]) => (
                <motion.button
                  key={key}
                  onClick={() => setExamplePrompt(key as keyof typeof examplePrompts)}
                  className="px-4 py-2 text-sm bg-blue-50 dark:bg-opacity-15 text-blue-700 dark:text-gray-200 rounded-full hover:bg-blue-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
        {/* Settings Grid */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl flex items-center font-semibold text-gray-700 dark:text-gray-200 ">
            <CalendarIcon className="inline h-6 w-6 text-blue-600 mr-2" />
            Calendar Settings
          </h3>

          <div className="grid md:grid-cols-3 w-full gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={calendarSettings.startDate}
                onChange={(e) => updateSettings({ startDate: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Daily Start Time
              </label>
              <input
                type="time"
                value={calendarSettings.startTime}
                onChange={(e) => updateSettings({ startTime: e.target.value })}
                className="input-field w-full"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calendarSettings.skipWeekends}
                  onChange={(e) => updateSettings({ skipWeekends: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Skip weekends</span>
              </label>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Duration (days)
            </label>
            <input
              type="number"
              min="3"
              max="120"
              value={calendarSettings.duration}
              onChange={(e) => updateSettings({ duration: parseInt(e.target.value) || 14 })}
              className="input-field w-full"
            />
            <p className="text-xs text-gray-500">Between 3 and 120 days</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Daily Time Commitment
            </label>
            <select
              value={calendarSettings.timeCommitment}
              onChange={(e) => updateSettings({ timeCommitment: e.target.value })}
              className="select-field w-full"
            >
              <option value="1">1 hour/day</option>
              <option value="2">2 hours/day</option>
              <option value="3">3 hours/day</option>
              <option value="4">4 hours/day</option>
              <option value="5">5 hours/day</option>
              <option value="6">6+ hours/day</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Learning Style
            </label>
            <select
              value={calendarSettings.learningStyle}
              onChange={(e) => updateSettings({ learningStyle: e.target.value })}
              className="select-field w-full "
            >
              <option value="balanced">Balanced (Theory + Practice)</option>
              <option value="hands-on">Hands-on (Project-based)</option>
              <option value="theoretical">Theoretical (Concept-focused)</option>
            </select>
          </div>
        </motion.div>



        {/* Generate Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`btn-primary text-lg px-8 py-4 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isGenerating ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2" />
                Generating Calendar...
              </>
            ) : (
              <>
                <SparklesIcon className="inline h-5 w-5 mr-2" />
                Generate AI Calendar
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  )
}