import { loadCalendarPreview } from "./loadCalendarPreview";

export function loadHistoryCalendar(idx: number): void {
  const history = window._historyCalendars || [];
  const selected = history[idx];
  if (!selected?.calendar) return;

//   const currentCalendarData = selected.calendar.map((entry, i) => ({
//     day: entry.day,
//     phase: entry.phaseNumber,
//     title: entry.taskName,
//     time: entry.timeCommitment,
//     description: entry.taskDescription,
//     resources: Array.isArray(entry.resources)
//       ? entry.resources.map((r: any) =>
//         typeof r === "string" ? r : r.link || ""
//       )
//       : [],
//   }));
  loadCalendarPreview();
  document.getElementById("calendarPreviewSection")?.scrollIntoView({ behavior: "smooth" });
}