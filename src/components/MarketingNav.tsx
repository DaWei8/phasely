'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function MarketingNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/20 dark:border-gray-700/20 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 mx-auto flex justify-between items-center max-w-7xl">
        {/* Logo */}
        <div className="flex-shrink-0">
          {isDarkMode ? (
            <Image
              src={"/assets/phasely-logo.svg"}
              alt="Phasely Logo"
              width={96}
              height={32}
              className="h-7 sm:h-8 w-auto"
            />
          ) : (
            <Image
              src={"/assets/phasely-logo-2.svg"}
              alt="Phasely Logo"
              width={96}
              height={32}
              className="h-7 sm:h-8 w-auto"
            />
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            How It Works
          </a>
          <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            Reviews
          </a>
          <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
            Pricing
          </a>
        </div>

        {/* Desktop CTA & Theme Toggle */}
        <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <Link 
            href={"/dashboard"} 
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm sm:text-base"
          >
            Sign In
          </Link>
          
          <motion.a
            href={"/dashboard"}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Free
          </motion.a>
        </div>

        {/* Mobile Menu Button & Theme Toggle */}
        <div className="flex items-center space-x-2 sm:hidden">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        className={`lg:hidden border-t border-gray-200/20 dark:border-gray-700/20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md ${
          isMenuOpen ? 'block' : 'hidden'
        }`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isMenuOpen ? 1 : 0, y: isMenuOpen ? 0 : -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="px-4 py-6 space-y-4">
          <a 
            href="#features" 
            onClick={closeMenu}
            className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={closeMenu}
            className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
          >
            How It Works
          </a>
          <a 
            href="#testimonials" 
            onClick={closeMenu}
            className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
          >
            Reviews
          </a>
          <a 
            href="#pricing" 
            onClick={closeMenu}
            className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
          >
            Pricing
          </a>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <Link 
              href={"/dashboard"}
              onClick={closeMenu}
              className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium py-2"
            >
              Sign In
            </Link>
            
            <motion.a
              href={"/dashboard"}
              onClick={closeMenu}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Free
            </motion.a>
          </div>
        </div>
      </motion.div>
    </nav>
  )
}