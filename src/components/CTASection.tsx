'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Heart, Award } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-white dark:text-white">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 max-w-3xl mx-auto mb-8">
            Join thousands of successful learners who have achieved their goals with Phasely. Start your journey today - it's completely free!
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center">
            <motion.button
              className="bg-white text-nowrap dark:bg-gray-100 text-blue-600 dark:text-blue-700 hover:bg-gray-100 dark:hover:bg-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center group shadow-lg hover:shadow-xl dark:shadow-blue-900/30 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free Today
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <p className="text-blue-100 dark:text-blue-200 text-sm">
              No credit card required • Free forever plan available
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-2 mt-12 text-blue-200 dark:text-blue-300">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-1" />
              <span className=" text-nowrap text-sm">Secure & Private</span>
            </div>
            <div className="flex items-center">
              <Heart className="w-5 h-5 mr-1" />
              <span className="text-nowrap text-sm">Loved by 50K+ users</span>
            </div>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-1" />
              <span className="text-nowrap text-sm">4.9/5 rating</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}