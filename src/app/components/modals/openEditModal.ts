// Open edit modal

import { CalendarItem } from "@/app/types/types";

const currentCalendarData: CalendarItem[] = [];

export function openEditModal(index: number): void {
  const item = currentCalendarData[index];
  (document.getElementById("editTitle") as HTMLInputElement).value =
    item.title;
  (document.getElementById("editDescription") as HTMLTextAreaElement).value =
    item.description;
  document.getElementById("editModal")?.classList.remove("hidden");
}