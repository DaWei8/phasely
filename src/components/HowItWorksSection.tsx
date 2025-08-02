'use client'

import { Target, BrainCircuit, TrendingUp, ArrowRight, Rocket } from 'lucide-react'

export default function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Describe Your Goals",
      description: "Tell our AI what you want to learn, your current level, and your available time. Be as specific as possible for better results.",
      icon: <Target className="w-8 h-8" />
    },
    {
      step: "2", 
      title: "Get Your AI Plan",
      description: "Receive a personalized learning schedule with tasks, resources, and timelines tailored to your goals and lifestyle.",
      icon: <BrainCircuit className="w-8 h-8" />
    },
    {
      step: "3",
      title: "Track & Achieve",
      description: "Follow your schedule, track progress, build habits, and get notifications. Sync with Google Calendar for seamless integration.",
      icon: <TrendingUp className="w-8 h-8" />
    }
  ]

  return (
    <section id="how-it-works" className="py-20 ">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-gray-900 dark:text-white">
            Get Started in <span className="text-blue-600 dark:text-blue-600">3 Simple Steps</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
            From setup to success, here's how Phasely helps you achieve your learning goals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="text-center relative p-8 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-slate-700/50 hover:bg-white/90 dark:hover:bg-slate-700/50 transition-all duration-300 group"
            >
              <div className="relative">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {step.step}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>
              
              {index < 2 && (
                <div className="hidden md:block absolute top-10 left-full w-full z-10">
                  <ArrowRight className="w-6 h-6 text-blue-300 dark:text-blue-500 mx-auto" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center mx-auto group shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            Start Your Learning Journey
            <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  )
}