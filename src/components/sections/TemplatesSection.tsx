import { useState } from 'react'

interface Template {
  id: string
  name: string
  description: string
  icon: string
  color: string
  duration: number
  prompt: string
}

// interface TemplatesSectionProps {
//   onTemplateLoad: (prompt: string, duration: number) => void
// }

export default function TemplatesSection(
    // { onTemplateLoad }: TemplatesSectionProps
) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const templates: Template[] = [
    {
      id: 'webdev',
      name: 'Full-Stack Web Development',
      description: 'HTML, CSS, JavaScript, React, Node.js',
      icon: 'fas fa-code',
      color: 'blue',
      duration: 60,
      prompt: "I want to learn full-stack web development in 60 days. I'm a complete beginner and want to focus on React, Node.js, and MongoDB. I can dedicate 2-3 hours per day and prefer hands-on projects over theory. Include some portfolio projects I can build to showcase my skills."
    },
    {
      id: 'datascience',
      name: 'Data Science & ML',
      description: 'Python, Pandas, ML, Visualization',
      icon: 'fas fa-database',
      color: 'green',
      duration: 60,
      prompt: "I want to become proficient in data science and machine learning in 60 days. I have basic Python knowledge but no ML experience. Focus on pandas, scikit-learn, and TensorFlow. I prefer a mix of theory and practical projects with real datasets."
    },
    {
      id: 'mobile',
      name: 'Mobile App Development',
      description: 'React Native, iOS, Android',
      icon: 'fas fa-mobile-alt',
      color: 'purple',
      duration: 45,
      prompt: "I want to learn React Native mobile app development in 45 days. I have some JavaScript experience. Include building 3-4 complete apps for both iOS and Android, with focus on navigation, state management, and API integration."
    },
    {
      id: 'marketing',
      name: 'Digital Marketing',
      description: 'SEO, Social Media, Google Ads',
      icon: 'fas fa-bullhorn',
      color: 'yellow',
      duration: 30,
      prompt: "I want to master digital marketing in 30 days. Focus on SEO, social media marketing, Google Ads, and content marketing. I prefer practical exercises and real campaign creation over theory."
    },
    {
      id: 'productivity',
      name: 'Productivity & Habits',
      description: 'Time Management, Focus, Routines',
      icon: 'fas fa-tasks',
      color: 'orange',
      duration: 30,
      prompt: "I want to improve my productivity and build better habits in 30 days. Focus on time management, daily routines, and focus techniques. Include practical exercises and habit tracking."
    },
    {
      id: 'language',
      name: 'Language Learning',
      description: 'Spanish, French, Mandarin, etc.',
      icon: 'fas fa-language',
      color: 'pink',
      duration: 45,
      prompt: "I want to learn conversational Spanish in 45 days. I'm a beginner and want to focus on speaking, listening, and basic grammar. Include daily practice and useful resources."
    }
  ]

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template.id)
    // onTemplateLoad(template.prompt, template.duration)
    
    // Show success message
    const message = document.createElement('div')
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    message.innerHTML = `
      <div class="flex items-center space-x-2">
        <i class="fas fa-check"></i>
        <span>Template loaded! You can now customize and generate your plan.</span>
      </div>
    `
    document.body.appendChild(message)
    
    setTimeout(() => {
      message.remove()
    }, 3000)
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700',
      green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
      yellow: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700',
      orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700',
      pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg mb-8">
      <h2 className="text-lg lg:text-xl font-semibold mb-4 flex items-center">
        <i className="fas fa-layer-group text-purple-600 mr-2"></i>
        Prebuilt Templates
      </h2>
      
      <p className="text-gray-600 mb-6">
        Choose a popular learning template to get started quickly. You can fully customize the plan after loading it.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className={`${getColorClasses(template.color)} border rounded-lg p-4 text-left transition-all duration-200 transform hover:scale-105 ${
              selectedTemplate === template.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-semibold mb-1 flex items-center">
                  <i className={`${template.icon} mr-2`}></i>
                  {template.name}
                </div>
                <div className="text-xs opacity-75 mb-2">
                  {template.description}
                </div>
                <div className="text-xs opacity-60">
                  Duration: {template.duration} days
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-xs opacity-80">
              Click to load this template
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
        <div className="flex items-center mb-2">
          <i className="fas fa-magic text-purple-600 mr-2"></i>
          <span className="font-medium text-purple-900">Template Benefits</span>
        </div>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Pre-configured learning paths created by experts</li>
          <li>• Optimized duration and daily time commitments</li>
          <li>• Curated resources and project suggestions</li>
          <li>• Fully customizable after loading</li>
        </ul>
      </div>
    </div>
  )
}