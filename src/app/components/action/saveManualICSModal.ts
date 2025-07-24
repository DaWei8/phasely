import { manualICSResourceLinks } from "@/app/constants/constants";
import { loadCalendarPreview } from "../loaders/loadCalendarPreview";
import { saveCalendarToLocalStorage } from "../local-storage/saveCalendar";
import { showCustomModal } from "../modals/showModal";

import { CalendarItem } from "@/app/types/types";
import { closeManualICSModal } from "./closeManualICSModal";

const currentCalendarData: CalendarItem[] = [];

// Save manual ICS task
export function saveManualICSModal(): void {
  const taskName = (document.getElementById("manualTaskName") as HTMLInputElement)?.value.trim();
  const taskDescription = (document.getElementById("manualTaskDescription") as HTMLTextAreaElement)?.value.trim();
  const timeDropdown = document.getElementById("manualTimeCommitment") as HTMLSelectElement;
  const timeCommitment = timeDropdown.options[timeDropdown.selectedIndex].text;
  const learningStyle = (document.getElementById("manualLearningStyle") as HTMLInputElement)?.value;
  const phaseNumber = parseInt((document.getElementById("manualPhaseNumber") as HTMLInputElement)?.value);

  if (!taskName || !taskDescription || !timeCommitment || !learningStyle || !phaseNumber) {
    showCustomModal("Alert", "Please fill in all fields.");
    return;
  }

  const validResources = manualICSResourceLinks.filter(
    (r) => r.name.trim() && /^https?:\/\/.+\..+/.test(r.link.trim())
  );

  if (validResources.length < 2) {
    showCustomModal("Alert", "Please provide at least 2 valid resources.");
    return;
  }

  if (validResources.length > 5) {
    showCustomModal("Alert", "Maximum 5 resources allowed.");
    return;
  }

  currentCalendarData.push({
    day: currentCalendarData.length + 1,
    phase: phaseNumber,
    title: taskName,
    time: timeCommitment,
    description: taskDescription,
    learningStyle,
    resources: validResources,
  });

  loadCalendarPreview();
  saveCalendarToLocalStorage();
  closeManualICSModal();
}