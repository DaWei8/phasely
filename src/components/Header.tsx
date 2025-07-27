'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Brain, BrainCircuit, Calendar, Edit, Edit2, Video } from 'lucide-react'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200/50">
        <div className="px-4 md:px-6 lg:px-8 py-4 mx-auto flex justify-between items-center">
          <motion.a
            href="#"
            className="text-2xl font-bold text-gray-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/assets/phasely-logo-2.svg"
              alt="Phasely Logo"
              width={96}
              height={32}
              className="h-8 w-auto"
            />
          </motion.a>
          <Link href="/dashboard" className="hidden lg:block border border-blue-600 bg-blue-50 rounded-md py-3 px-3 text-sm text-blue-600 hover:text-white hover:bg-blue-600">
            Go to Dashboard
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-2">
                <Link href="/dashboard" className="block py-2 text-gray-700 hover:text-blue-600">
                  Go to Dashboard
                </Link>
                <Link href="#features" className="block py-2 text-gray-700 hover:text-blue-600">
                  Features
                </Link>
                <Link href="#how-it-works" className="block py-2 text-gray-700 hover:text-blue-600">
                  How It Works
                </Link>
                <Link href="#templates" className="block py-2 text-gray-700 hover:text-blue-600">
                  Templates
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="gradient-bg text-white pb-16 pt-20 bg-cover bg-center overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20" />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="container mx-auto px-4 text-center flex flex-col items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="block">AI-Powered</span>
                <span className="">Learning Planner</span>
              </h1>

              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl">
                Create personalized learning schedules with AI assistance
              </p>
            </motion.div>

            <motion.div
              className="flex text-nowrap flex-wrap justify-center gap-4 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {[
                { icon: <BrainCircuit className='w-4 h-4' />, text: 'AI-Generated' },
                { icon: <Edit className='w-4 h-4' />, text: 'Fully Editable' },
                { icon: <Calendar className='w-4 h-4' />, text: 'ICS Export' },
                { icon: <Video className='w-4 h-4' />, text: 'Resource Links' }
              ].map((feature, index) => (
                <motion.span
                  key={feature.text}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-nowrap flex items-center gap-1 hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  {feature.icon}
                  {feature.text}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}