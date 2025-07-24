// import { CalendarEntry } from "@/app/types/types";
import { loadCalendarPreview } from "../loaders/loadCalendarPreview";

export function loadCalendarFromLocalStorage(): void {
  try {
    const data = localStorage.getItem("aiCalendarData");
    if (data) {
    //   const currentCalendarData: CalendarEntry[] = JSON.parse(data);
      loadCalendarPreview();
    }
  } catch (e) {
    console.warn("Could not load from localStorage:", e);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const startDateInput = document.getElementById("startDate") as HTMLInputElement;
  if (startDateInput) startDateInput.valueAsDate = new Date();

  loadCalendarFromLocalStorage();
});
