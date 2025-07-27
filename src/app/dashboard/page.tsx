"use client";
import { motion } from 'framer-motion'
import TodayWidget from "@/components/dashboard/TodayWidget";
import StreakWidget from "@/components/dashboard/StreakWidget";
import QuickActions from "@/components/dashboard/QuickActions";
import AICalendarSection from "@/components/dashboard/AICalendarSection";
import { SparklesIcon } from 'lucide-react';

export default function DashboardPage() {
    return (
        <main className="w-full p-4 md:p-6">
                    {/* Header */}
        <div className="text-left mb-8">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SparklesIcon className="inline h-8 w-8 text-blue-600 mr-2" />
            Create Your Custom Learning Plan
          </motion.h2>
          <p className="text-gray-600 max-w-2xl">
            Describe what you want to learn and we&apos;ll generate a structured calendar with resources, 
            timelines, and actionable tasks tailored to your goals.
          </p>
        </div>
            <section className="grid max-w-7xl gap-6 md:grid-cols-3">
                <TodayWidget />
                <StreakWidget />
                <QuickActions />
            </section>

        </main>
    );
}