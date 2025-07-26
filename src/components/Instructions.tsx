export default function Instructions() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
      <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
        <i className="fas fa-info-circle mr-2"></i>
        How to Use Phasely
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-blue-700 mb-2">
            Custom AI Calendar:
          </h4>
          <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
            <li>Describe your learning goals in detail</li>
            <li>Set your duration and time commitment</li>
            <li>Click &apos;Generate AI Calendar&apos;</li>
            <li>Preview and edit the generated plan</li>
            <li>Export as ICS file for import</li>
          </ol>
        </div>

        <div>
          <h4 className="font-semibold text-blue-700 mb-2">
            Import to Google Calendar:
          </h4>
          <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
            <li>Download the generated ICS file</li>
            <li>Open Google Calendar</li>
            <li>Click &apos;+&apos; next to &apos;Other calendars&apos;</li>
            <li>Select &apos;Import&apos; and choose your file</li>
            <li>All events will be added automatically</li>
          </ol>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
          <i className="fas fa-lightbulb mr-2"></i>
          Pro Tips
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h5 className="font-medium mb-2">For Better Results:</h5>
            <ul className="space-y-1">
              <li>• Be specific about your current skill level</li>
              <li>• Mention preferred learning resources (videos, books, etc.)</li>
              <li>• Include any time constraints or deadlines</li>
              <li>• Specify if you want project-based learning</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-2">Calendar Features:</h5>
            <ul className="space-y-1">
              <li>• Edit any generated task or description</li>
              <li>• Add your own custom learning tasks</li>
              <li>• Track progress with the progress tracker</li>
              <li>• Export works with Google Calendar, Outlook, Apple Calendar</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200">
        <div className="flex items-center text-green-800">
          <i className="fas fa-rocket mr-2 text-green-600"></i>
          <span className="font-medium">Ready to start your learning journey?</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Choose a template above or describe your custom learning goals to get started!
        </p>
      </div>
    </div>
  )
}