import { CalendarItem } from "@/app/types/types";

const currentCalendarData: CalendarItem[] = [];

export function saveCalendarToLocalStorage(): void {
  try {
    localStorage.setItem("aiCalendarData", JSON.stringify(currentCalendarData));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}
