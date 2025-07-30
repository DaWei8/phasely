// app/dashboard/habits/create/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  BookOpen,
  Dumbbell,
  Target,
  User,
  Clock,
  Calendar,
  Bell,
  Save,
  Sparkles
} from "lucide-react";

interface HabitForm {
  name: string;
  description: string;
  category: 'learning' | 'health' | 'productivity' | 'personal';
  frequency: 'daily' | 'weekly' | 'custom';
  target_frequency: number;
  target_duration_minutes: number;
  reminder_time: string;
}

const categories = [
  { 
    value: 'learning' as const, 
    label: 'Learning', 
    icon: BookOpen, 
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    description: 'Reading, studying, skill development'
  },
  { 
    value: 'health' as const, 
    label: 'Health', 
    icon: Dumbbell, 
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    description: 'Exercise, nutrition, wellness'
  },
  { 
    value: 'productivity' as const, 
    label: 'Productivity', 
    icon: Target, 
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    description: 'Work, organization, goals'
  },
  { 
    value: 'personal' as const, 
    label: 'Personal', 
    icon: User, 
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300',
    description: 'Relationships, hobbies, self-care'
  }
];

const frequencies = [
  { value: 'daily' as const, label: 'Daily', description: 'Every day' },
  { value: 'weekly' as const, label: 'Weekly', description: 'Once a week' },
  { value: 'custom' as const, label: 'Custom', description: 'Set your own frequency' }
];

const habitSuggestions = {
  learning: [
    'Read for 30 minutes',
    'Practice coding',
    'Study a new language',
    'Watch educational videos',
    'Take online courses'
  ],
  health: [
    'Morning workout',
    'Drink 8 glasses of water',
    'Take a 30-minute walk',
    'Meditate for 10 minutes',
    'Do yoga'
  ],
  productivity: [
    'Plan tomorrow today',
    'Clean workspace',
    'Review daily goals',
    'Time-block calendar',
    'Process inbox to zero'
  ],
  personal: [
    'Journal thoughts',
    'Call family/friends',
    'Practice gratitude',
    'Spend time in nature',
    'Pursue a hobby'
  ]
};

export default function CreateHabitPage() {
  const [form, setForm] = useState<HabitForm>({
    name: '',
    description: '',
    category: 'learning',
    frequency: 'daily',
    target_frequency: 1,
    target_duration_minutes: 30,
    reminder_time: '09:00'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      setError('Habit name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to create a habit');
        return;
      }

      const { error: insertError } = await supabase
        .from('habits')
        .insert([{
          user_id: user.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          category: form.category,
          frequency: form.frequency,
          target_frequency: form.target_frequency,
          target_duration_minutes: form.target_duration_minutes,
          reminder_time: form.reminder_time || null,
          is_active: true
        }]);

      if (insertError) {
        console.error('Error creating habit:', insertError);
        setError('Failed to create habit. Please try again.');
        return;
      }

      router.push('/dashboard/habits');
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setForm(prev => ({ ...prev, name: suggestion }));
    setShowSuggestions(false);
  };

  const updateForm = (field: keyof HabitForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Create New Habit
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Start building a better you today
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-8">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-xl">
                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Habit Name */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Habit Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="e.g., Read for 30 minutes"
                  className="w-full px-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
                  required
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                    <div className="p-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Popular {categories.find(c => c.value === form.category)?.label} habits:
                      </p>
                      <div className="space-y-2">
                        {habitSuggestions[form.category].map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                {showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
              </button>
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Category
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => updateForm('category', category.value)}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                        form.category === category.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`p-3 rounded-xl ${category.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {category.label}
                          </h3>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {category.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder="What does this habit involve? Why is it important to you?"
                rows={4}
                className="w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-200"
              />
            </div>

            {/* Frequency and Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Frequency */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Frequency
                </label>
                <div className="space-y-3">
                  {frequencies.map((freq) => (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => updateForm('frequency', freq.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        form.frequency === freq.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {freq.label}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {freq.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {form.frequency === 'custom' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Times per week
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={form.target_frequency}
                      onChange={(e) => updateForm('target_frequency', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                )}
              </div>

              {/* Duration and Reminder */}
              <div className="space-y-6">
                {/* Target Duration */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Target Duration
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      value={form.target_duration_minutes}
                      onChange={(e) => updateForm('target_duration_minutes', parseInt(e.target.value))}
                      className="w-full pl-12 pr-20 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                      minutes
                    </span>
                  </div>
                </div>

                {/* Reminder Time */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Reminder Time
                  </label>
                  <div className="relative">
                    <Bell className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="time"
                      value={form.reminder_time}
                      onChange={(e) => updateForm('reminder_time', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    We'll send you a gentle reminder at this time
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/habits")}
              className="flex-1 px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Create Habit
                </>
              )}
            </button>
          </div>
        </form>

        {/* Tips Card */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Tips for Building Great Habits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Start small:</strong> Begin with just 5-10 minutes to build consistency
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Be specific:</strong> "Read 20 pages" is better than "read more"
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Stack habits:</strong> Link new habits to existing routines
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Track progress:</strong> Use this app to monitor your streaks
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}