import { CalendarEntry } from "@/app/types/types";
import { showCustomModal } from "../modals/showModal";
import { getApiBase } from "./getApiBase";
import { showLoadingOverlay } from "../overlays/showLoadingOverlay";
import { loadCalendarPreview } from "../loaders/loadCalendarPreview";
import { saveCalendarToLocalStorage } from "../local-storage/saveCalendar";
import { hideLoadingOverlay } from "../overlays/hideLoadingOverlay";
import { startProgressBar } from "./startProgressBar";
// import { CalendarItem } from "@/app/types/types";

// Generate AI Calendar
export async function generateAICalendar(): Promise<void> {
  const promptBox = document.getElementById("learningPrompt") as HTMLTextAreaElement;
  const durationBox = document.getElementById("duration") as HTMLInputElement;
  const button = document.getElementById("generateAICalendar") as HTMLButtonElement;

  const prompt = promptBox?.value.trim();
  const duration = parseInt(durationBox?.value);

  if (!prompt) {
    showCustomModal("Alert", "Please describe your learning goals first.");
    return;
  }

  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner loading-spinner mr-2"></i>Generating Calendar...';
  button.disabled = true;

  try {
    let allCalendar: CalendarEntry[] = [];
    // let allPhases = [];
    // let introduction: string = "";
    const chunkSize = 30;
    const numChunks = Math.ceil(duration / chunkSize);
    const API_BASE = getApiBase();

    for (let i = 0; i < numChunks; i++) {
      const startDay = i * chunkSize + 1;
      const endDay = Math.min((i + 1) * chunkSize, duration);
      const chunkDuration = endDay - startDay + 1;

      showLoadingOverlay(
        i === 0 ? "Researching for suitable learning materials" : "Compiling results",
        `Generating days ${startDay} to ${endDay} of ${duration}...`
      );
      startProgressBar(14);

      const chunkPrompt = `For a total learning plan of ${duration} days, generate ONLY the content calendar for days ${startDay} to ${endDay} (inclusive) for the goal: "${prompt}". 
        If this is the first chunk (days 1-${chunkSize}), also include the introduction and the 7-phase plan.
        Response must be a JSON object with:
        - "introduction" (object, only in first chunk)
        - "plan" (array, only in first chunk)
        - "calendar" (array, always included)`;

      const response = await fetch(`${API_BASE}/api/generate-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: chunkPrompt, duration: chunkDuration }),
      });

      if (!response.ok) {
        hideLoadingOverlay();
        const errText = await response.text();
        throw new Error(`Failed to fetch from server: ${errText}`);
      }

      const data = await response.json();

    //   if (i === 0) {
    //     if (data.plan?.introduction) introduction = data.plan.introduction;
    //     if (data.plan?.plan) allPhases = data.plan.plan;
    //   }

      if (Array.isArray(data.plan?.calendar)) {
        const offset = startDay - 1;
        const chunkCalendar = data.plan.calendar.map((entry: CalendarEntry) => ({
          day: entry.day + offset,
          phase: entry.phaseNumber,
          title: entry.taskName,
          time: entry.timeCommitment,
          description: entry.taskDescription,
          resources: Array.isArray(entry.resources)
            ? entry.resources.map((r) => (typeof r === "string" ? r : r?.link || ""))
            : [],
        }));
        allCalendar = allCalendar.concat(chunkCalendar);
      }
    }

    // const currentCalendarData: CalendarItem[] = allCalendar;
    loadCalendarPreview();
    saveCalendarToLocalStorage();
    hideLoadingOverlay();
  } catch (error: unknown) {
    hideLoadingOverlay();
    console.error("Error:", error);
    alert("An error occurred: " + error);
  } finally {
    button.innerHTML = originalText;
    button.disabled = false;
  }
}
