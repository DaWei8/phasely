'use client'

import { useState } from 'react'
import { 
  BrainCircuit, 
  Calendar, 
  Send, 
  Globe, 
  BarChart3, 
  ArrowRight, 
  Play, 
  Sparkles,
  Star,
  Users,
  TrendingUp
} from 'lucide-react'

interface HeroSectionProps {
  onVideoOpen?: () => void
}

export default function HeroSection({ onVideoOpen }: HeroSectionProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    { 
      icon: <BrainCircuit className='w-4 h-4' />, 
      text: 'AI-Generated Plans',
      description: 'Smart learning paths'
    },
    { 
      icon: <Calendar className='w-4 h-4' />, 
      text: 'Smart Scheduling',
      description: 'Personalized timing'
    },
    { 
      icon: <Send className='w-4 h-4' />, 
      text: 'Telegram Alerts',
      description: 'Never miss a session'
    },
    { 
      icon: <Globe className='w-4 h-4' />, 
      text: 'Google Calendar Sync',
      description: 'Seamless integration'
    },
    { 
      icon: <BarChart3 className='w-4 h-4' />, 
      text: 'Progress Tracking',
      description: 'Visual insights'
    }
  ]

  const stats = [
    { icon: <Users className="w-5 h-5" />, value: '50K+', label: 'Active Learners' },
    { icon: <Star className="w-5 h-5" />, value: '4.9', label: 'Average Rating' },
    { icon: <TrendingUp className="w-5 h-5" />, value: '10x', label: 'Faster Learning' }
  ]

  return (
    <section className="relative pt-20 pb-32 min-h-screen flex items-center">

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-default">
              <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span className="flex items-center gap-2">
                #1 AI Learning Planner
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline font-bold">Trusted by 50K+ learners</span>
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r pb-4 from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent block mt-2">
                Learning Journey
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Create personalized learning schedules with AI, track your progress, and achieve your goals 
              <span className="font-semibold text-blue-600 dark:text-blue-400"> 10x faster</span>. 
              Join thousands of successful learners worldwide.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center group shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 min-w-[250px]">
              Start Learning for Free
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            
            <button
              onClick={onVideoOpen}
              className="flex items-center text-gray-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold group transition-all duration-300"
            >
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl mr-4 group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-300 group-hover:scale-110 border border-gray-200 dark:border-slate-700">
                <Play className="w-6 h-6 text-blue-600 dark:text-blue-400 ml-1 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">Watch Demo</div>
                <div className="text-sm opacity-70">2 min overview</div>
              </div>
            </button>
          </div>

          {/* Stats Section */}
          <div className="flex flex-wrap justify-center gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <div className="text-blue-600 dark:text-blue-400">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 text-sm max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.text}
                className="group relative p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl text-gray-700 dark:text-slate-300 flex items-center gap-3 shadow-lg border border-gray-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 cursor-default transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/70 transition-colors duration-300">
                  <div className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-semibold">{feature.text}</div>
                  <div className={`text-xs text-gray-500 dark:text-slate-400 transition-all duration-300 ${
                    hoveredFeature === index ? 'opacity-100 max-h-6' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}>
                    {feature.description}
                  </div>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          {/* <div className="mt-16 pt-8 border-t border-gray-200/50 dark:border-slate-700/50">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Trusted by learners from leading companies
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 dark:opacity-40">
              <div className="text-2xl font-bold text-gray-400 dark:text-slate-600">Google</div>
              <div className="text-2xl font-bold text-gray-400 dark:text-slate-600">Microsoft</div>
              <div className="text-2xl font-bold text-gray-400 dark:text-slate-600">Apple</div>
              <div className="text-2xl font-bold text-gray-400 dark:text-slate-600">Netflix</div>
              <div className="text-2xl font-bold text-gray-400 dark:text-slate-600">Tesla</div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float 10s ease-in-out infinite reverse;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        .dark .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
        }
      `}</style>
    </section>
  )
}