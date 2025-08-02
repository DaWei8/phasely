'use client'

import { BrainCircuit, Shield, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function MarketingFooter() {
  return (
    <footer className="bg-gray-900  flex flex-col dark:bg-gray-950 w-full min-h-fit text-white p-6 pt-36">
      <div className="container h-fit mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {/* Brand Section */}
          <div className="md:col-span-2 gap-4">
            <motion.h1
              className="text-4xl lg:text-5xl max-w-md font-bold text-gray-300"
            >
              Transform Your <span className='text-blue-600' >Learning Journey</span>
            </motion.h1>
            <p className=" text-md lg:text-lg mt-4 text-gray-300 dark:text-gray-300 leading-relaxed max-w-lg ">
              Create personalized learning schedules with AI assistance. Transform your learning goals into structured, actionable calendars that fit your lifestyle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-2xl text-white">Quick Links</h4>
            <ul className="space-y-2 text-md">
              <li>
                <a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-blue-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-blue-300 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-blue-300 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-blue-300 transition-colors">
                  Templates
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-2xl text-white">Support</h4>
            <ul className="space-y-2 text-md">
              <li>
                <a href="/support/help-center" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-blue-300 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/support/contact-us" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-blue-300 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/support/privacy-policy" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-blue-300 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/support/terms-of-service" className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-blue-300 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

        </div>
        <div className='h-full flex-1' />
        {/* Bottom Section */}
        <div className="border-t border-gray-800 dark:border-gray-700 py-8">

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              &copy; 2025 Phasely. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 mt-4 md:mt-0">
              <div className="flex text-nowrap items-center space-x-2 text-sm text-gray-400 dark:text-gray-500">
                <Shield className="w-4 h-4 text-green-500 dark:text-green-400" />
                <span>Secure & Private</span>
              </div>
              <div className="flex  text-nowrap items-center space-x-2 text-sm text-gray-400 dark:text-gray-500">
                <BrainCircuit className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>AI-Powered</span>
              </div>
              <div className="flex text-nowrap items-center space-x-2 text-sm text-gray-400 dark:text-gray-500">
                <Smartphone className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Mobile Friendly</span>
              </div>
            </div>
          </div>
          {/* Version Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-600">
              Phasely V2.1 | Built for learners worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}