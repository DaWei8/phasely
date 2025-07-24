import { loadCalendarPreview } from "./loadCalendarPreview";

// Load prebuilt calendar
export function loadPrebuiltCalendar(): void {
//   currentCalendarData = [...designSprintData];
  loadCalendarPreview();

  const section = document.getElementById("calendarPreviewSection");
  section?.classList.remove("hidden");
  section?.scrollIntoView({ behavior: "smooth" });
}
