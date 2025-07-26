'use client'

import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  BoltIcon, 
  ClockIcon, 
  SquaresPlusIcon 
} from '@heroicons/react/24/outline'
import { TabType } from '@/app/page'

interface TabNavigationProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

const tabs = [
  {
    id: 'custom' as TabType,
    label: 'AI Calendar',
    icon: SparklesIcon,
    description: 'Generate with AI'
  },
  {
    id: 'progress' as TabType,
    label: 'Progress',
    icon: BoltIcon,
    description: 'Track learning'
  },
  {
    id: 'history' as TabType,
    label: 'History',
    icon: ClockIcon,
    description: 'Past calendars'
  },
  {
    id: 'templates' as TabType,
    label: 'Templates',
    icon: SquaresPlusIcon,
    description: 'Quick start'
  }
]

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex overflow-hidden overflow-x-auto border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const Icon = tab.icon
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex-1 px-2 py-4 text-sm font-medium transition-all duration-200
              ${isActive 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start justify-center gap-1">
              <Icon className="h-8 w-8 p-2 rounded-md bg-blue-50" />
              <div className="hidden text-nowrap sm:block">
                <div className="font-semibold text-nowrap ">{tab.label}</div>
                <div className="text-xs text-nowrap text-gray-400">{tab.description}</div>
              </div>
              <div className="sm:hidden text-nowrap font-semibold">{tab.label}</div>
            </div>
            
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}