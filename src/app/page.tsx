'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import TabNavigation from '@/components/TabNavigation'
import AICalendarSection from '@/components/sections/AICalendarSection'
import ProgressSection from '@/components/sections/ProgressSection'
import HistorySection from '@/components/sections/HistorySection'
import TemplatesSection from '@/components/sections/TemplatesSection'
import CalendarPreview from '@/components/CalendarPreview'
import Instructions from '@/components/Instructions'
import Footer from '@/components/Footer'
import { useCalendarStore } from '@/lib/store/calendar-store'

export type TabType = 'custom' | 'progress' | 'history' | 'templates'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('custom')
  const { currentCalendarData } = useCalendarStore()

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />  
      <div className="container max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Tab Content */}
          <div className="p-4 lg:p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'custom' && (
                <motion.div key="custom" {...fadeInUp}>
                  <AICalendarSection />
                </motion.div>
              )}
              
              {activeTab === 'progress' && (
                <motion.div key="progress" {...fadeInUp}>
                  <ProgressSection />
                </motion.div>
              )}
              
              {activeTab === 'history' && (
                <motion.div key="history" {...fadeInUp}>
                  <HistorySection />
                </motion.div>
              )}
              
              {activeTab === 'templates' && (
                <motion.div key="templates" {...fadeInUp}>
                  <TemplatesSection />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Calendar Preview */}
        <AnimatePresence>
          {currentCalendarData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <CalendarPreview />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Instructions />
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}