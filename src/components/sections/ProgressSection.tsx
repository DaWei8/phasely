'use client'

import { motion } from 'framer-motion'
import { BoltIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'
import { useCalendarStore } from '@/lib/store/calendar-store'

export default function ProgressSection() {
  const { currentCalendarData, toggleItemCompletion, getProgressStats } = useCalendarStore()
  const stats = getProgressStats()

  if (currentCalendarData.length === 0) {
    return (
      <div className="text-center py-16">
        <BoltIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-400 mb-2">No Learning Plan Yet</h2>
        <p className="text-gray-500">Generate a calendar first to track your progress.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BoltIcon className="inline h-8 w-8 text-yellow-500 mr-2" />
          Progress Tracker
        </motion.h2>
        <p className="text-gray-600">
          Track your daily progress as you complete your learning plan.
        </p>
      </div>

      {/* Progress Stats */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {stats.percentage}%
          </div>
          <div className="text-gray-600">
            {stats.completed} of {stats.total} days completed
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white rounded-full h-4 shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stats.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Progress Items */}
      <div className="space-y-3">
        {currentCalendarData.map((item, index) => (
          <motion.div
            key={item.day}
            className={`
              flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
              ${item.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-md'
              }
            `}
            onClick={() => toggleItemCompletion(item.day)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex-shrink-0 pt-1">
              {item.completed ? (
                <CheckCircleIconSolid className="h-6 w-6 text-green-500" />
              ) : (
                <CheckCircleIcon className="h-6 w-6 text-gray-300" />
              )}
            </div>
            
            <div className="flex-grow">
              <div className={`
                font-semibold transition-colors
                ${item.completed ? 'text-green-800' : 'text-gray-900'}
              `}>
                {item.title}
              </div>
              <div className={`
                text-sm mt-1 transition-colors
                ${item.completed ? 'text-green-600' : 'text-gray-500'}
              `}>
                Day {item.day} • {item.time}
              </div>
              {item.completed && (
                <motion.div
                  className="text-xs text-green-600 mt-1 font-medium"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ✅ Completed
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivation Message */}
      {stats.percentage > 0 && (
        <motion.div
          className="text-center p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-lg font-semibold text-orange-800 mb-2">
            {stats.percentage < 25 && "🌱 Great start! Keep building momentum."}
            {stats.percentage >= 25 && stats.percentage < 50 && "🚀 You're making excellent progress!"}
            {stats.percentage >= 50 && stats.percentage < 75 && "💪 Over halfway there! You're doing amazing."}
            {stats.percentage >= 75 && stats.percentage < 100 && "🏆 Almost there! The finish line is in sight."}
            {stats.percentage === 100 && "🎉 Congratulations! You've completed your learning journey!"}
          </div>
          <div className="text-orange-600">
            {stats.percentage === 100 
              ? "Time to celebrate and plan your next learning adventure!"
              : "Consistency is key to mastering new skills. Keep going!"
            }
          </div>
        </motion.div>
      )}
    </div>
  )
}