'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  BookOpen, 
  Target, 
  Star,
  TrendingUp,
  Award,
  Clock,
  Globe
} from 'lucide-react'

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [counts, setCounts] = useState({ stat0: 0, stat1: 0, stat2: 0, stat3: 0 })
  const sectionRef = useRef<HTMLDivElement>(null)

  const stats = [
    { 
      number: "50K+", 
      label: "Active Learners",
      icon: <Users className="w-6 h-6" />,
      description: "Students worldwide",
      targetValue: 50000,
      suffix: "K+"
    },
    { 
      number: "1M+", 
      label: "Study Sessions",
      icon: <BookOpen className="w-6 h-6" />,
      description: "Completed sessions",
      targetValue: 1000000,
      suffix: "M+"
    },
    { 
      number: "95%", 
      label: "Goal Completion",
      icon: <Target className="w-6 h-6" />,
      description: "Success rate",
      targetValue: 95,
      suffix: "%"
    },
    { 
      number: "4.9/5", 
      label: "User Rating",
      icon: <Star className="w-6 h-6" />,
      description: "Average rating",
      targetValue: 4.9,
      suffix: "/5"
    }
  ]

  const additionalStats = [
    { icon: <TrendingUp className="w-5 h-5" />, value: "10x", label: "Faster Learning" },
    { icon: <Award className="w-5 h-5" />, value: "500+", label: "Courses Created" },
    { icon: <Clock className="w-5 h-5" />, value: "24/7", label: "AI Support" },
    { icon: <Globe className="w-5 h-5" />, value: "150+", label: "Countries" }
  ]

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Counter animation
  useEffect(() => {
    if (!isVisible) return

    const animateCount = (statIndex: number, targetValue: number, duration: number = 2000) => {
      const startTime = Date.now()
      const countKey = `stat${statIndex}` as keyof typeof counts

      const updateCount = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = Math.floor(easeOutQuart * targetValue)

        setCounts(prev => ({ ...prev, [countKey]: currentValue }))

        if (progress < 1) {
          requestAnimationFrame(updateCount)
        }
      }

      updateCount()
    }

    // Start animations with staggered delays
    stats.forEach((stat, index) => {
      setTimeout(() => {
        if (stat.suffix === "K+") {
          animateCount(index, 50, 2000)
        } else if (stat.suffix === "M+") {
          animateCount(index, 1000, 2000)
        } else if (stat.suffix === "%") {
          animateCount(index, 95, 2000)
        } else if (stat.suffix === "/5") {
          animateCount(index, 49, 2000) // 4.9 * 10 for decimal handling
        }
      }, index * 200)
    })
  }, [isVisible])

  const formatNumber = (value: number, suffix: string) => {
    if (suffix === "/5") {
      return (value / 10).toFixed(1) + suffix
    }
    return value + suffix
  }

  return (
    <section 
      ref={sectionRef}
      className="relative pt-20 pb-32 min-h-screen flex items-center"
    >

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex text-sm font-medium text-slate-600 dark:text-slate-300 items-center bg-blue-100 dark:bg-blue-900/50 px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-blue-200 dark:border-blue-800">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trusted by Learners Worldwide
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-gray-900 dark:text-white">
            Join Our Growing 
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Community</span>
          </h2>
          <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed text-gray-600 dark:text-slate-300">
            See why thousands of learners choose Phasely to accelerate their learning journey
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const countKey = `stat${index}` as keyof typeof counts
            const currentCount = counts[countKey]
            
            return (
              <div
                key={stat.label}
                className="group overflow-hidden relative p-8 bg-white/70 dark:bg-blue-700/10 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 text-center transform hover:scale-105"
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>

                {/* Number */}
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent mb-3 leading-tight">
                  {isVisible ? formatNumber(currentCount, stat.suffix) : "0"}
                </div>

                {/* Label */}
                <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  {stat.description}
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {additionalStats.map((stat, index) => (
            <div
              key={stat.label}
              className="flex items-center justify-start gap-3 p-6 bg-white/50 dark:bg-blue-500/10 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-slate-700/20 hover:bg-white/70 dark:hover:bg-slate-700/70 transition-all duration-300 group"
              style={{
                animationDelay: `${(index + 4) * 100}ms`
              }}
            >
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <div className="text-blue-600 dark:text-blue-400">
                  {stat.icon}
                </div>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group cursor-pointer">
            <div className="text-left">
              <div className="text-lg font-semibold">Ready to join them?</div>
              <div className="text-blue-100">Start your learning journey today</div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float 8s ease-in-out infinite reverse;
        }
      `}</style>
    </section>
  )
}