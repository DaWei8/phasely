'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CTASection from '@/components/CTASection'
import FeaturesSection from '@/components/FeaturesSection'
import HeroSection from '@/components/HeroSection'
import HowItWorksSection from '@/components/HowItWorksSection'
import MarketingFooter from '@/components/MarketingFooter'
import MarketingNav from '@/components/MarketingNav'
import StatsSection from '@/components/StatsSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import VideoModal from '@/components/VideoModal'
import { Moon, Sun } from 'lucide-react'


export default function MarketingHomepage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  return (
    <motion.div
      className="min-h-screen relative bg-blue-50 dark:bg-gray-900 transition-colors duration-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <MarketingNav />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, staggerChildren: 0.2 }}
      >
        <HeroSection onVideoOpen={() => setIsVideoModalOpen(true)} />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
        <MarketingFooter />
      </motion.div>

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </motion.div>
  )
}
