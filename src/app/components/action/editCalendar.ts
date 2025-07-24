import { loadCalendarPreview } from "../loaders/loadCalendarPreview";
let isEditMode = false;
// Edit calendar
export function editCalendar(): void {
  isEditMode = !isEditMode;
  loadCalendarPreview();
}
