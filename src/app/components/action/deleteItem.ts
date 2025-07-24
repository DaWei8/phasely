import { loadCalendarPreview } from "../loaders/loadCalendarPreview";
import { saveCalendarToLocalStorage } from "../local-storage/saveCalendar";

import { CalendarItem } from "@/app/types/types";

const currentCalendarData: CalendarItem[] = [];

// Delete an item
export function deleteItem(index: number): void {
  if (confirm("Are you sure you want to delete this item?")) {
    currentCalendarData.splice(index, 1);
    currentCalendarData.forEach((item, idx) => {
      item.day = idx + 1;
    });
    loadCalendarPreview();
    saveCalendarToLocalStorage();
  }
}
