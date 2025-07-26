'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { SparklesIcon, AcademicCapIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface LoadingOverlayProps {
  isVisible?: boolean
}

const loadingSteps = [
  { icon: AcademicCapIcon, text: "Analyzing your learning goals...", color: "text-blue-500" },
  { icon: CalendarIcon, text: "Creating personalized timeline...", color: "text-green-500" },
  { icon: SparklesIcon, text: "Curating the best resources...", color: "text-purple-500" },
]

export default function LoadingOverlay({ isVisible = true }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <SparklesIcon className="h-8 w-8 text-white" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Creating Your Learning Plan
              </h3>
              <p className="text-gray-600 text-sm">
                Our AI is crafting a personalized curriculum just for you
              </p>
            </div>

            {/* Loading Steps */}
            <div className="space-y-4 mb-6">
              {loadingSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                  }}
                  transition={{ 
                    delay: index * 0.5,
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 2
                  }}
                >
                  <div className={`flex-shrink-0 ${step.color}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-gray-700 text-sm font-medium">
                    {step.text}
                  </span>
                  <motion.div
                    className={`ml-auto w-2 h-2 rounded-full ${step.color.replace('text-', 'bg-')}`}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-700">Progress</span>
                <span className="text-xs text-gray-500">This may take a minute...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [-20, -40, -20],
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}