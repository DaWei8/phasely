import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 w-full text-white p-6 mt-8">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-6">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-calendar-alt text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold">Phasely</span>
            </div>
            <p className="text-gray-300 text-sm mb-4 max-w-md">
              Create personalized learning schedules with AI assistance. Transform your learning goals into structured, actionable calendars that fit your lifestyle.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter"></i>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-github"></i>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-linkedin"></i>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 Phasely. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <i className="fas fa-shield-alt text-green-500"></i>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <i className="fas fa-robot text-blue-500"></i>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <i className="fas fa-mobile-alt text-purple-500"></i>
                <span>Mobile Friendly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Phase Planner V2.0 | Built with ❤️ for learners worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}