'use client'

import { motion } from 'framer-motion'
import { Star, Users } from 'lucide-react'

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Developer",
      image: "/api/placeholder/60/60",
      content: "Phasely helped me learn React in just 6 weeks. The AI-generated schedule was perfectly paced for my busy lifestyle.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez", 
      role: "Medical Student",
      image: "/api/placeholder/60/60",
      content: "The progress tracking and Telegram reminders kept me consistent. I've completed 3 certification courses already!",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Marketing Manager",
      image: "/api/placeholder/60/60", 
      content: "Finally, a learning planner that actually works. The Google Calendar integration is a game-changer.",
      rating: 5
    },
    {
      name: "Ema Johnson",
      role: "Marketing Manager",
      image: "/api/placeholder/60/60", 
      content: "Finally, a learning planner that actually works. The Google Calendar integration is a game-changer.",
      rating: 5
    },
    {
      name: "Emily John",
      role: "Marketing Manager",
      image: "/api/placeholder/60/60", 
      content: "Finally, a learning planner that actually works. The Google Calendar integration is a game-changer.",
      rating: 5
    },
  ]

  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-gray-900 dark:text-white">
              Loved by <span className="text-blue-600 dark:text-blue-600">50,000+ Learners</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how Phasely has transformed learning journeys worldwide.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800/30 rounded-xl p-6 shadow-lg hover:shadow-xl dark:shadow-gray-900/30 transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed text-md">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-3 flex items-center justify-center ring-2 ring-blue-200 dark:ring-blue-700">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white text-md">
                    {testimonial.name}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}