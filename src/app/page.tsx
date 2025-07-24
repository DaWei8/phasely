import Image from "next/image";
import { validateDurationInput } from "./components/action/validateDurationInput";
import { setExamplePrompt } from "./components/action/setExamplePrompt";
import { switchTab } from "./components/nav/switchTab";
import { saveManualICSModal } from "./components/action/saveManualICSModal";
import { closeManualICSModal } from "./components/action/closeManualICSModal";
import { addManualICSResource } from "./components/action/addManualICSResources";
import { saveEditModal } from "./components/modals/saveEditModal";
import { closeEditModal } from "./components/modals/closeEditModal";
import { generateAICalendar } from "./components/action/generateAICalendar";
import { loadTemplate } from "./components/render/Templates";
import { editCalendar } from "./components/action/editCalendar";
import { exportCalendar } from "./components/action/exportCalendar";
import { openManualICSModal } from "./components/action/openManualICSModal";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>
          <div
            className="relative z-0 flex gradient-bg text-white pb-14 pt-32 bg-cover bg-center overflow-hidden"
          >
            <Image
              src="assets/bg-image.png"
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-10 pointer-events-none select-none"
            />
            <div
              className="container mx-auto px-4 text-center flex flex-col items-center relative z-20"
            >
              <h1
                className="text-3xl md:text-3xl lg:text-4xl flex flex-wrap items-center justify-center space-x-1 space-y-2 font-bold mb-4"
              >
                <Image
                  src="assets/phasely-logo.svg"
                  alt="Company Logo"
                  className="w-56"
                  width={56}
                  height={56}
                />
              </h1>
              <p className="text-lg w-84">
                Create personalized learning schedules with AI assistance
              </p>
              <div
                className="mt-6 flex justify-center flex-wrap items-center gap-3 text-sm opacity-80"
              >
                <span className="px-3 py-2 bg-white bg-opacity-20 rounded-md"
                ><i className="fas fa-brain mr-2"></i>AI-Generated</span>
                <span className="px-3 py-2 bg-white bg-opacity-20 rounded-md"><i className="fas fa-edit mr-2"></i>Editable</span>
                <span className="px-3 py-2 bg-white bg-opacity-20 rounded-md"
                ><i className="fas fa-calendar-alt mr-2"></i>ICS Export</span>
                <span className="px-3 py-2 bg-white bg-opacity-20 rounded-md"
                ><i className="fas fa-video mr-2"></i>Resource Links</span>
              </div>
            </div>
          </div>
        </div>

        <div id="message" className="mt-4 text-center text-gray-600"></div>

        {/* <!-- Main Content --> */}
        <div className="container max-w-6xl mx-auto px-2 md:px-4 lg:px-6 py-8">
          {/* <!-- Tab Navigation --> */}
          <div className="bg-white rounded-lg shadow-lg mb-8">
            <div className="flex w-full border-b">
              <button
                id="customTab"
                className="px-3 py-3 font-medium text-gray-600 hover:text-blue-600 tab-active"
                onClick={() => switchTab('custom')}
              >
                <i className="fas fa-wand-magic-sparkles mr-2"></i>AI Calendar
              </button>
              <button
                id="progressTracker"
                className="px-3 py-3 font-medium text-gray-600 hover:text-blue-600"
                onClick={() => switchTab('progress')}
              >
                <i className="fas fa-bolt mr-2"></i>Progress Tracker
              </button>
            </div>

            {/* <!-- Custom AI Calendar Section --> */}
            <div id="customSection" className="p-4 py-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-4">
                <i className="fas fa-wand-magic-sparkles text-green-500 mr-2"></i>Create
                Your Custom Learning Plan
              </h2>
              <p className="text-gray-600 mb-6">
                Describe what you want to learn and we&lsquo;ll generate a structured
                calendar with resources, timelines, and actionable tasks.
              </p>
              {/* <!-- Prompt Input --> */}
              <div className="mb-6">
                <label className="block text-md font-medium text-gray-700 mb-3">
                  <i className="fas fa-comment-dots mr-2"></i>Describe Your Learning
                  Goals
                </label>
                <textarea
                  id="learningPrompt"
                  rows={6}
                  className="w-full px-2 py-2 h-52 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Example: I want to learn full-stack web development in 60 days. I'm a complete beginner and want to focus on React, Node.js, and MongoDB. I can dedicate 2-3 hours per day and prefer hands-on projects over theory. Include some portfolio projects I can build to showcase my skills."
                ></textarea>

                {/* <!-- Example Prompts --> */}
                <div className="mt-4">
                  <p className="text-md font-medium text-gray-700 mb-3">
                    Quick Examples:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setExamplePrompt('webdev')}
                      className="text-sm md:text-md bg-blue-50 text-blue-800 px-3 py-2 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      Full-Stack Web Dev
                    </button>
                    <button
                      onClick={() => setExamplePrompt('datascience')}
                      className="text-sm md:text-md bg-green-50 text-green-800 px-3 py-2 rounded-full hover:bg-green-200 transition-colors"
                    >
                      Data Science
                    </button>
                    <button
                      onClick={() => setExamplePrompt('mobile')}
                      className="text-sm md:text-md bg-purple-50 text-purple-800 px-3 py-2 rounded-full hover:bg-purple-200 transition-colors"
                    >
                      Mobile App Dev
                    </button>
                    <button
                      onClick={() => setExamplePrompt('marketing')}
                      className="text-sm md:text-md bg-red-50 text-orange-800 px-3 py-2 rounded-full hover:bg-orange-200 transition-colors"
                    >
                      Digital Marketing
                    </button>
                  </div>
                </div>
              </div>
              {/* <!-- Advanced Options --> */}
              <div className="flex flex-col md:grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"
                  >Total Duration (days)</label>
                  <input
                    title="duration"
                    id="duration"
                    type="number"
                    min="3"
                    max="120"
                    value="14"
                    pattern="^(?:[3-9]|[1-9][0-9]|1[01][0-9]|120)$"
                    className="w-full px-3 py-3 h-12 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    // oninput={() => validateDurationInput(this)}
                    required
                  />
                  <span id="durationError" className="text-xs text-red-600 hidden"
                  >Please enter a number between 3 and 120.</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"
                  >Daily Time Commitment</label>
                  <select
                    title="timeCommitment"
                    id="timeCommitment"
                    className="w-full px-3 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 hour/day</option>
                    <option value="2" selected>2 hours/day</option>
                    <option value="3">3 hours/day</option>
                    <option value="4">4 hours/day</option>
                    <option value="5">5 hours/day</option>
                    <option value="6">6+ hours/day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"
                  >Learning Style</label>
                  <select
                    title="learningStyle"
                    id="learningStyle"
                    className="w-full px-3 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="balanced" selected>
                      Balanced (Theory + Practice)
                    </option>
                    <option value="hands-on">Hands-on (Project-based)</option>
                    <option value="theoretical">
                      Theoretical (Concept-focused)
                    </option>
                  </select>
                </div>
              </div>
              {/* <!-- Calendar Configuration --> */}
              <div className="mb-8 w-full">
                <h2 className="text-lg lg:text-xl font-semibold mb-4">
                  <i className="fas fa-cog text-blue-600 mr-2"></i>Calendar Settings
                </h2>

                <div className="flex flex-col md:grid md:grid-cols-3 gap-3.5">
                  <div className="w-full flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700"
                    >Start Date</label>
                    <input
                      title="startDate"
                      type="date"
                      id="startDate"
                      className="w-full px-3 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="w-full flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700"
                    >Daily Start Time</label>
                    <input
                      title="startTime"
                      type="time"
                      id="startTime"
                      value="09:00"
                      className="w-full px-3 h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center md:mt-6">
                      <input type="checkbox" id="skipWeekends" className="mr-2" />
                      <span className="text-gray-700">Skip weekends</span>
                    </label>
                  </div>
                </div>
              </div>
              {/* <!-- Generate Button --> */}
              <div className="text-center">
                <button
                  id="generateAICalendar"
                  onClick={() => generateAICalendar()}
                  className="gradient-bg hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                >
                  <i className="fas fa-wand-magic-sparkles mr-2"></i>Generate AI
                  Calendar
                </button>
              </div>
            </div>

            {/* <!-- Progress Section --> */}
            <div
              id="progressSection"
              className="p-4 py-6 flex flex-col min-h-64"
            >
              <h2 className="text-lg lg:text-xl font-semibold mb-4">
                <i className="fas fa-bolt text-yellow-500 mr-2"></i>Progress Tracker
              </h2>
              <p className="text-gray-600 mb-4">
                Track your daily progress as you complete your learning plan.
              </p>
              <div className="w-full mx-auto mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-700">Progress</span>
                  <span
                    id="progressPercent"
                    className="text-sm font-semibold text-blue-700"
                  >0%</span>
                </div>
                {/* <!-- Progress bar --> */}
                <div className="w-full bg-blue-100 rounded-full h-4">
                  <div
                    id="progressBarTracker"
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: 0 }}
                  ></div>
                </div>
              </div>
              <div id="progressTrackerList" className="space-y-3">
                {/* <!-- Progress items will be generated here --> */}
              </div>
            </div>
          </div>

          {/* <!-- History Section --> */}
          <div
            id="historySection"
            className="bg-white rounded-lg shadow-lg p-4 mb-8 mt-8 hidden"
          >
            <h2 className="text-xl font-semibold mb-4">
              Previously Generated Calendars
            </h2>
            <div id="historyList" className="space-y-4">
              {/* <!-- History items will be loaded here --> */}
            </div>
          </div>

          {/* <!-- Templates Section --> */}
          <div
            id="templatesSection"
            className="bg-white rounded-lg shadow-lg p-4 mb-8 mt-8 hidden"
          >
            <h2 className="text-lg lg:text-xl font-semibold mb-4">
              <i className="fas fa-layer-group text-purple-600 mr-2"></i>Prebuilt
              Templates
            </h2>
            <p className="text-gray-600 mb-4">
              Choose a popular learning template to get started quickly. You can
              fully customize the plan after loading it.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => loadTemplate('webdev')}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 flex flex-col items-start transition"
              >
                <span className="font-semibold text-blue-700 mb-1"
                ><i className="fas fa-code mr-2"></i>Full-Stack Web Development</span>
                <span className="text-xs text-gray-500"
                >HTML, CSS, JavaScript, React, Node.js</span>
              </button>
              <button
                onClick={() => loadTemplate('datascience')}
                className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 flex flex-col items-start transition"
              >
                <span className="font-semibold text-green-700 mb-1"
                ><i className="fas fa-database mr-2"></i>Data Science & ML</span>
                <span className="text-xs text-gray-500"
                >Python, Pandas, ML, Visualization</span>
              </button>
              <button
                onClick={() => loadTemplate('mobile')}
                className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 flex flex-col items-start transition"
              >
                <span className="font-semibold text-purple-700 mb-1"
                ><i className="fas fa-mobile-alt mr-2"></i>Mobile App
                  Development</span>
                <span className="text-xs text-gray-500"
                >React Native, iOS, Android</span>
              </button>
              <button
                onClick={() => loadTemplate('marketing')}
                className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-4 flex flex-col items-start transition"
              >
                <span className="font-semibold text-yellow-700 mb-1"
                ><i className="fas fa-bullhorn mr-2"></i>Digital Marketing</span>
                <span className="text-xs text-gray-500"
                >SEO, Social Media, Google Ads</span>
              </button>
              <button
                onClick={() => loadTemplate('productivity')}
                className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 flex flex-col items-start transition"
              >
                <span className="font-semibold text-orange-700 mb-1"
                ><i className="fas fa-tasks mr-2"></i>Productivity & Habits</span
                >
                <span className="text-xs text-gray-500"
                >Time Management, Focus, Routines</span
                >
              </button>
              <button
                onClick={() => loadTemplate('language')}
                className="bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg p-4 flex flex-col items-start transition"
              >
                <span className="font-semibold text-pink-700 mb-1"
                ><i className="fas fa-language mr-2"></i>Language Learning</span>
                <span className="text-xs text-gray-500"
                >Spanish, French, Mandarin, etc.</span>
              </button>
            </div>
          </div>

          {/* <!-- Calendar Preview & Editor --> */}
          <div
            id="calendarPreviewSection"
            className="bg-white rounded-lg flex flex-col items-center shadow-lg p-4 "
          >
            <div
              className="flex justify-between w-full items-center gap-y-2 flex-wrap mb-6"
            >
              <h2 className="text-lg lg:text-xl font-semibold">
                <i className="fas fa-calendar-check text-green-600 mr-2"></i>Calendar
                Preview & Editor
              </h2>
              <div className="md:flex space-x-2 w-full md:w-96 hidden">
                <button
                  title="addManualICS"
                  onClick={() => openManualICSModal()}
                  className="text-blue-700 px-5 border border-blue-700 py-3 h-12 rounded-md font-medium transition-colors"
                >
                  <i className="fas fa-plus"></i>
                </button>
                <button
                  onClick={() => editCalendar()}
                  className="bg-blue-100 w-full h-fit hover:bg-blue-700 text-blue-600 hover:text-white px-2 md:px-4 py-3 rounded-md font-medium transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>Edit
                </button>
                <button
                  onClick={() => exportCalendar()}
                  className="gradient-bg w-full h-fit hover:bg-blue-700 text-white px-2 md:px-4 py-3 rounded-md transition-colors"
                >
                  <i className="fas fa-download mr-2"></i>Export ICS
                </button>
              </div>
            </div>

            {/* <!-- Calendar Stats --> */}
            <div id="calendarStats" className="grid md:grid-cols-4 w-full gap-4 mb-6">
              {/* <!-- Stats will be populated here --> */}
            </div>

            {/* <!-- Calendar Items --> */}
            <div
              id="calendarPreview"
              className="space-y-4 lg:max-h-96 calendar-item-preview overflow-y-auto"
            >
              {/* <!-- Calendar items will be generated here --> */}
            </div>
            <div className="md:hidden space-x-2 w-full md:w-96 flex mt-4">
              <button
                title="addManualICS"
                onClick={() => openManualICSModal()}
                className="text-blue-700 px-5 border border-blue-700 py-3 h-12 rounded-md font-medium transition-colors"
              >
                <i className="fas fa-plus"></i>
              </button>
              <button
                onClick={() => editCalendar()}
                className="bg-blue-100 w-full h-full hover:bg-blue-700 text-blue-600 hover:text-white px-2 md:px-4 py-3 rounded-md font-medium transition-colors"
              >
                <i className="fas fa-edit mr-2"></i>Edit
              </button>
              <button
                onClick={() => exportCalendar()}
                className="gradient-bg w-full h-fit hover:bg-blue-700 text-white px-2 md:px-4 py-3 rounded-md transition-colors"
              >
                <i className="fas fa-download mr-2"></i>Export
              </button>
            </div>
          </div>
          {/* <!-- Instructions --> */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">
              <i className="fas fa-info-circle mr-2"></i>How to Use Phasely
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">
                  Custom AI Calendar:
                </h4>
                <ol
                  className="list-decimal list-inside text-blue-700 space-y-1 text-sm"
                >
                  <li>Describe your learning goals in detail</li>
                  <li>Set your duration and time commitment</li>
                  <li>Click &quot;Generate AI Calendar&quot;</li>
                  <li>Preview and edit the generated plan</li>
                  <li>Export as ICS file for import</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-blue-700 mb-2">
                  Import to Google Calendar:
                </h4>
                <ol
                  className="list-decimal list-inside text-blue-700 space-y-1 text-sm"
                >
                  <li>Download the generated ICS file</li>
                  <li>Open Google Calendar</li>
                  <li>Click &quot;+&quot; next to &quot;Other calendars&quot;</li>
                  <li>Select &quot;Import&quot; and choose your file</li>
                  <li>All events will be added automatically</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* /* <!-- Edit Modal --> */}
        <div
          id="editModal"
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center "
        >
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Calendar Item</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2"
            >Title</label>
            <input
              title="editTitle"
              id="editTitle"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2"
            >Description</label>
            <textarea
              title="editDescription"
              id="editDescription"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            ></textarea>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => closeEditModal()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => saveEditModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* <!-- Manual ICS Event Modal (new) --> */}
        <div
          id="manualICSModal"
          className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center hidden z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Add New ICS Event</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2"
            >Task Name</label>
            <input
              id="manualTaskName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Main task name"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2"
            >Task Description</label>
            <textarea
              id="manualTaskDescription"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Detailed description"
            ></textarea>

            <label className="block text-sm font-medium text-gray-700 mb-2">Time Commitment</label>
            <select
              title="manualTimeCommitment"
              id="manualTimeCommitment"
              className="w-full px-3 py-3 border border-gray-300 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="1">1 hour/day</option>
              <option value="2" selected>2 hours/day</option>
              <option value="3">3 hours/day</option>
              <option value="4">4 hours/day</option>
              <option value="5">5 hours/day</option>
              <option value="6">6+ hours/day</option>
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-2"
            >Learning Style</label>
            <select
              title="manualLearningStyle"
              id="manualLearningStyle"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="balanced" selected>
                Balanced (Theory + Practice)
              </option>
              <option value="hands-on">Hands-on (Project-based)</option>
              <option value="theoretical">Theoretical (Concept-focused)</option>
            </select>
            <label className="block text-sm font-medium text-gray-700 mb-2"
            >Phase Number</label>
            <input
              title="manualPhaseNumber"
              id="manualPhaseNumber"
              type="number"
              min="1"
              max="7"
              value="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2"
            >Resources (2 to 5)</label>
            <div id="manualICSResources" className="space-y-2 mb-4"></div>
            <button
              type="button"
              onClick={() => addManualICSResource()}
              className="text-blue-600 hover:underline text-sm mb-4"
            >
              + Add Resource
            </button>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => closeManualICSModal()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => saveManualICSModal()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>

        {/* <!-- Loading Overlay  --> */}
        <div
          id="loadingOverlay"
          className="fixed inset-0 bg-gray-900 bg-opacity-60 flex flex-col items-center justify-center z-50 "
        >
          <div
            className="bg-white rounded-lg shadow-lg px-8 py-6 flex flex-col items-center"
          >
            <div className="mb-4">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
            </div>
            <div
              id="loadingStepText"
              className="text-lg font-semibold text-gray-800 mb-2"
            >
              Processing Request...
            </div>
            <div
              className="w-full max-w-xl bg-gray-200 rounded-full h-3 relative shadow-inner"
            >
              <div
                id="progressBarFill"
                className="progress-bar-fill h-full bg-blue-700 rounded-full absolute top-0 left-0"
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span id="progressText" className="text-sm font-bold text-gray-400"
                >0%</span
                >
              </div>
            </div>
          </div>
        </div>
      </main >
    </div >
  );
}
