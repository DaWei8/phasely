"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Mail, 
  X, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  Settings,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { CalendarData, CalendarItem, GoogleCalendarIntegration } from '@/lib/googleCalendar';

interface UserProfile {
  calendar_email: string[] | null;
  timezone: string | null;
  preferred_learning_time: string | null;
  display_name: string | null;
}

interface GoogleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: CalendarData;
  calendarItems: CalendarItem[];
  // You'll need to set these in your environment variables
  googleApiKey: string;
  googleClientId: string;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
  isOpen,
  onClose,
  calendar,
  calendarItems,
  googleApiKey,
  googleClientId
}) => {
  const [step, setStep] = useState<'setup' | 'confirm' | 'processing' | 'success' | 'error'>('setup');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [useCustomEmail, setUseCustomEmail] = useState<boolean>(false);
  const [selectedTimezone, setSelectedTimezone] = useState<string>('UTC');
  const [selectedLearningTime, setSelectedLearningTime] = useState<string>('morning');
  const [processing, setProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<{ eventsCreated: number; errors: string[] } | null>(null);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState<boolean>(false);

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'Africa/Lagos', 'Asia/Dubai'
  ];

  const learningTimes = [
    { value: 'early-morning', label: 'Early Morning (6:00 AM)', hour: 6 },
    { value: 'morning', label: 'Morning (9:00 AM)', hour: 9 },
    { value: 'afternoon', label: 'Afternoon (2:00 PM)', hour: 14 },
    { value: 'evening', label: 'Evening (6:00 PM)', hour: 18 },
    { value: 'night', label: 'Night (8:00 PM)', hour: 20 }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
      initializeGoogleApi();
    }
  }, [isOpen]);

  const fetchUserProfile = async () => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('calendar_email, timezone, preferred_learning_time, display_name')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          setSelectedEmail(profile.calendar_email?.[0] || user.email || '');
          setSelectedTimezone(profile.timezone || 'UTC');
          setSelectedLearningTime(profile.preferred_learning_time || 'morning');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const initializeGoogleApi = async () => {
    try {
      const initialized = await GoogleCalendarIntegration.initializeGapi(googleApiKey, googleClientId);
      if (initialized) {
        setIsGoogleSignedIn(GoogleCalendarIntegration.isSignedIn());
      }
    } catch (error) {
      console.error('Error initializing Google API:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setProcessing(true);
      const signedIn = await GoogleCalendarIntegration.signIn();
      setIsGoogleSignedIn(signedIn);
      if (signedIn) {
        setStep('confirm');
      }
    } catch (error) {
      console.error('Error signing in to Google:', error);
      setStep('error');
      setResult({ eventsCreated: 0, errors: ['Failed to sign in to Google Calendar'] });
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateCalendar = async () => {
    setStep('processing');
    setProcessing(true);

    try {
      const emailToUse = useCustomEmail ? customEmail : selectedEmail;
      
      if (!emailToUse) {
        throw new Error('Please provide an email address');
      }

      const result = await GoogleCalendarIntegration.createCalendarEvents({
        calendar,
        calendarItems,
        userEmail: emailToUse,
        userTimezone: selectedTimezone,
        preferredLearningTime: selectedLearningTime
      });

      setResult(result);
      
      if (result.success) {
        // Update user profile with the calendar email if it's new
        if (useCustomEmail && customEmail) {
          await updateUserCalendarEmail(customEmail);
        }
        setStep('success');
      } else {
        setStep('error');
      }
    } catch (error) {
      console.error('Error creating calendar:', error);
      setResult({ eventsCreated: 0, errors: [error instanceof Error ? error.message : 'Unknown error occurred'] });
      setStep('error');
    } finally {
      setProcessing(false);
    }
  };

  const updateUserCalendarEmail = async (email: string) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const currentEmails = userProfile?.calendar_email || [];
        const updatedEmails = currentEmails.includes(email) ? currentEmails : [...currentEmails, email];
        
        await supabase
          .from('user_profiles')
          .update({ calendar_email: updatedEmails })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating user calendar email:', error);
    }
  };

  const resetModal = () => {
    setStep('setup');
    setResult(null);
    setProcessing(false);
    setUseCustomEmail(false);
    setCustomEmail('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Add to Google Calendar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {calendar.title}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content based on step */}
            {step === 'setup' && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    What will be added to your calendar?
                  </h4>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
                    <li>• {calendarItems.length} learning sessions over {calendar.duration_days} days</li>
                    <li>• Each session includes title, description, and learning resources</li>
                    <li>• Scheduled based on your preferred learning time</li>
                  </ul>
                </div>

                {/* Email Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Calendar Email
                  </label>
                  
                  {userProfile?.calendar_email && userProfile.calendar_email.length > 0 && !useCustomEmail ? (
                    <div className="space-y-2">
                      {userProfile.calendar_email.map((email, index) => (
                        <label key={index} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="email"
                            value={email}
                            checked={selectedEmail === email}
                            onChange={(e) => setSelectedEmail(e.target.value)}
                            className="text-blue-600"
                          />
                          <span className="text-gray-700 dark:text-gray-300">{email}</span>
                        </label>
                      ))}
                      <button
                        onClick={() => setUseCustomEmail(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + Use different email
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={useCustomEmail ? customEmail : selectedEmail}
                        onChange={(e) => useCustomEmail ? setCustomEmail(e.target.value) : setSelectedEmail(e.target.value)}
                        placeholder="Enter your Google account email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      {userProfile?.calendar_email && userProfile.calendar_email.length > 0 && (
                        <button
                          onClick={() => setUseCustomEmail(false)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Use saved email instead
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Timezone Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Settings className="w-4 h-4 inline mr-1" />
                    Timezone
                  </label>
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                {/* Learning Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Preferred Learning Time
                  </label>
                  <select
                    value={selectedLearningTime}
                    onChange={(e) => setSelectedLearningTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {learningTimes.map(time => (
                      <option key={time.value} value={time.value}>{time.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={isGoogleSignedIn ? () => setStep('confirm') : handleGoogleSignIn}
                    disabled={processing || (!useCustomEmail && !selectedEmail) || (useCustomEmail && !customEmail)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isGoogleSignedIn ? (
                      'Continue'
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        Sign in to Google
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Ready to create calendar events
                  </h4>
                  <div className="text-green-800 dark:text-green-200 space-y-1 text-sm">
                    <p><strong>Email:</strong> {useCustomEmail ? customEmail : selectedEmail}</p>
                    <p><strong>Timezone:</strong> {selectedTimezone}</p>
                    <p><strong>Learning Time:</strong> {learningTimes.find(t => t.value === selectedLearningTime)?.label}</p>
                    <p><strong>Events to create:</strong> {calendarItems.length}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('setup')}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateCalendar}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Create Calendar Events
                  </button>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Creating calendar events...
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    This may take a few moments. Please don't close this window.
                  </p>
                </div>
              </div>
            )}

            {step === 'success' && result && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Calendar events created successfully!
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {result.eventsCreated} events have been added to your Google Calendar.
                  </p>
                  {result.errors.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-left">
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                        Some events couldn't be created:
                      </p>
                      <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            )}

            {step === 'error' && result && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <AlertCircle className="w-12 h-12 text-red-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Failed to create calendar events
                  </h4>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-left">
                    <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('setup')}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for using the Google Calendar Modal
export const useGoogleCalendarModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    openModal,
    closeModal
  };
};