import { CalendarItem } from "@/app/types/types";
import { loadCalendarPreview } from "../loaders/loadCalendarPreview";
import { saveCalendarToLocalStorage } from "../local-storage/saveCalendar";
import { closeEditModal } from "./closeEditModal";
import { showCustomModal } from "./showModal";

const currentCalendarData: CalendarItem[] = [];
const editIndex = 0;

export function saveEditModal(): void {
  const newTitle = (
    document.getElementById("editTitle") as HTMLInputElement
  ).value.trim();
  const newDescription = (
    document.getElementById("editDescription") as HTMLTextAreaElement
  ).value.trim();

  if (newTitle && newDescription) {
    currentCalendarData[editIndex].title = newTitle;
    currentCalendarData[editIndex].description = newDescription;
    loadCalendarPreview();
    closeEditModal();
    saveCalendarToLocalStorage();
  } else {
    showCustomModal("Alert", "Both title and description are required.");
  }
}
