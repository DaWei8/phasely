'use client'

import { useEffect, useRef, useState } from 'react'
import {
  BrainCircuit,
  Calendar,
  Target,
  BarChart3,
  Send,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap
} from 'lucide-react'
import { useAnimation, useInView } from 'framer-motion'

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(0)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "AI-Powered Calendar Creation",
      description: "Describe your learning goals and let our AI create a personalized study schedule that fits your lifestyle and pace.",
      highlight: "Smart AI",
      benefits: ["Personalized schedules", "Adaptive learning paths", "Goal-oriented planning"],
      gradient: "from-blue-700/20 to-blue-600/20 dark:from-blue-700 dark:to-blue-600"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Calendar Management",
      description: "Organize, edit, and optimize your learning schedules with intuitive drag-and-drop functionality.",
      highlight: "Drag & Drop",
      benefits: ["Intuitive interface", "Real-time sync", "Flexible scheduling"],
      gradient: "from-blue-700/20 to-blue-600/20 dark:from-blue-700 dark:to-blue-600"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Habit Formation & Tracking",
      description: "Build lasting learning habits with streak tracking, milestone celebrations, and behavioral insights.",
      highlight: "Streak System",
      benefits: ["Habit building", "Progress tracking", "Milestone rewards"],
      gradient: "from-blue-700/20 to-blue-600/20 dark:from-blue-700 dark:to-blue-600"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Progress Analytics",
      description: "Visualize your learning journey with detailed progress reports, completion rates, and achievement metrics.",
      highlight: "Data Insights",
      benefits: ["Visual analytics", "Performance metrics", "Achievement tracking"],
      gradient: "from-blue-700/20 to-blue-600/20 dark:from-blue-700 dark:to-blue-600"
    },
    {
      icon: <Send className="w-6 h-6" />,
      title: "Telegram Notifications",
      description: "Stay on track with smart reminders and motivational messages delivered directly to your Telegram.",
      highlight: "Smart Alerts",
      benefits: ["Instant notifications", "Motivational messages", "Custom reminders"],
      gradient: "from-blue-700/20 to-blue-600/20 dark:from-blue-700 dark:to-blue-600"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Google Calendar Integration",
      description: "Seamlessly sync your learning schedule with Google Calendar for unified time management.",
      highlight: "Seamless Sync",
      benefits: ["Google integration", "Unified calendar", "Cross-platform sync"],
      gradient: "from-blue-700/20 to-blue-600/20 dark:from-blue-700 dark:to-blue-600"
    }
  ]



  useEffect(() => {
    if (isInView) {
      controls.start('visible')
    }
  }, [controls, isInView])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const currentFeature = features[activeFeature]

  return (
    <div className="min-h-screen transition-all duration-500 ">
      <section id="features" className="py-20 px-4 md:px-6 lg:px-8 relative overflow-hidden">

        <div className="max-w-7xl mx-auto relative">
          {/* Header Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-sm border transition-all duration-300 bg-white/50 border-white/20 dark:bg-slate-800/50 dark:border-slate-700">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Powered by Advanced AI
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-gray-900 dark:text-white">
              Everything You Need to <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Learn Smarter
              </span>
            </h2>

            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed text-gray-600 dark:text-slate-300">
              From AI-powered planning to progress tracking, Phasely provides all the tools you need to achieve your learning goals efficiently.
            </p>
          </div>

          {/* Mobile-First Design */}
          <div className="lg:hidden max-w-2xl mx-auto mb-12">
            {/* Mobile Feature Cards */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`relative p-6 rounded-2xl border backdrop-blur-sm transition-all duration-500 cursor-pointer transform ${activeFeature === index
                    ? `bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-2xl scale-[1.02] border-transparent`
                    : 'bg-white/70 border-white/30 text-slate-700 hover:bg-white/90 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                    }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${activeFeature === index
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'bg-blue-100 dark:bg-blue-500/20'
                      }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{feature.title}</h3>
                        <span className={`px-2 py-1 text-nowrap text-xs rounded-full font-medium ${activeFeature === index
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {feature.highlight}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${activeFeature === index
                        ? 'text-blue-100'
                        : 'text-slate-600 dark:text-slate-400'
                        }`}>
                        {feature.description}
                      </p>
                    </div>
                    <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${activeFeature === index ? 'rotate-90' : ''
                      }`} />
                  </div>

                  {activeFeature === index && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="flex flex-wrap gap-2">
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Feature Preview */}
            <div className="rounded-3xl p-5 py-7 backdrop-blur-md border transition-all duration-500 bg-white/70 border-white/30 dark:bg-slate-800/50 dark:border-slate-700/50">
              <div className={`bg-gradient-to-br from-blue-700 to-blue-600 rounded-2xl h-64 flex items-center justify-center mb-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="text-center text-white relative z-10">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <div className="scale-150">
                      {currentFeature.icon}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{currentFeature.title}</h4>
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Interactive Demo</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full">
                  Try This Feature
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-start">
            {/* Feature List */}
            <div className="space-y-4 relative ">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group sticky top-0 p-8 rounded-2xl cursor-pointer transition-all duration-500 border backdrop-blur-sm ${activeFeature === index
                    ? `bg-gradient-to-r ${feature.gradient} text-white shadow-2xl transform scale-[1.02] border-transparent`
                    : 'bg-white/70 border-white/30 text-slate-700 hover:bg-white/90 hover:border-white/50 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:border-slate-600/50'
                    }`}
                  onClick={() => setActiveFeature(index)}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-xl transition-all duration-300 ${activeFeature === index
                      ? 'bg-white/20 backdrop-blur-sm scale-110'
                      : 'bg-blue-100 group-hover:bg-blue-200 dark:bg-blue-500/20 dark:group-hover:bg-blue-500/30'
                      }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <h3 className="text-2xl font-bold">{feature.title}</h3>
                        <span className={`px-3 py-1 text-nowrap text-sm rounded-full font-medium transition-all duration-300 ${activeFeature === index
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {feature.highlight}
                        </span>
                      </div>
                      <p className={`text-lg leading-relaxed mb-4 ${activeFeature === index
                        ? 'text-blue-100'
                        : 'text-slate-600 dark:text-slate-400'
                        }`}>
                        {feature.description}
                      </p>

                      {(activeFeature === index || hoveredFeature === index) && (
                        <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
                          {feature.benefits.map((benefit, idx) => (
                            <div key={idx} className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${activeFeature === index
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-100 text-blue-700'
                              }`}>
                              <CheckCircle2 className="w-4 h-4" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className={`w-6 h-6 transition-all duration-300 ${activeFeature === index
                      ? 'rotate-90 scale-110'
                      : 'group-hover:translate-x-1'
                      }`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Feature Preview */}
            <div className="rounded-3xl p-5 backdrop-blur-md border transition-all duration-500 sticky top-0 bg-white/70 border-white/30 dark:bg-slate-800/50 dark:border-slate-700/50">
              <div className={`bg-gradient-to-br ${currentFeature.gradient} rounded-2xl h-96 flex items-center justify-center mb-8 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="w-3 h-3 bg-white/30 rounded-full" />
                  <div className="w-3 h-3 bg-white/30 rounded-full" />
                  <div className="w-3 h-3 bg-white/30 rounded-full" />
                </div>
                <div className="text-center text-white relative z-10">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                    <div className="scale-[2]">
                      {currentFeature.icon}
                    </div>
                  </div>
                  <h4 className="text-2xl font-bold mb-4">{currentFeature.title}</h4>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Zap className="w-5 h-5" />
                    <span>Interactive Demo Available</span>
                  </div>
                  <div className="flex justify-center gap-2">
                    {currentFeature.benefits.map((_, idx) => (
                      <div key={idx} className="w-2 h-2 bg-white/50 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full">
                  Try This Feature
                </button>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Feature {activeFeature + 1} of {features.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float 8s ease-in-out infinite reverse;
        }
        
        @keyframes animate-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-in {
          animation: animate-in 0.3s ease-out;
        }
        
        .slide-in-from-top-2 {
          animation: slide-in-from-top 0.3s ease-out;
        }
        
        @keyframes slide-in-from-top {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}