import { loadCalendarPreview } from "../loaders/loadCalendarPreview";
import { CalendarItem } from "@/app/types/types";

const currentCalendarData: CalendarItem[] = [];

// Edit an item
export function editItem(index: number): void {
  const item = currentCalendarData[index];
  const newTitle = prompt("Edit title:", item.title);
  if (newTitle !== null) {
    currentCalendarData[index].title = newTitle;
    const newDescription = prompt("Edit description:", item.description);
    if (newDescription !== null) {
      currentCalendarData[index].description = newDescription;
      loadCalendarPreview();
    }
  }
}
