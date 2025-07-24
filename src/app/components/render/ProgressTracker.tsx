import { CalendarItem } from "@/app/types/types";

const currentCalendarData: CalendarItem[] = [];

export function renderProgressTracker(): void {
    const list = document.getElementById("progressTrackerList");
    const progressBar = document.getElementById("progressBarTracker");
    const percentText = document.getElementById("progressPercent");

    if (!currentCalendarData.length) {
        if (list) list.innerHTML = `<div class="text-gray-500">Generate a calendar first to track your progress.</div>`;
        if (progressBar) progressBar.style.width = "0%";
        if (percentText) percentText.textContent = "0%";
        return;
    }
    if (list) list.innerHTML = "";
    let completed = 0;
    currentCalendarData.forEach((item) => {
        const checked =
            localStorage.getItem(`progress_day_${item.day}`) === "1";
        if (checked) {
            completed++;
        }
        const div = document.createElement("div");
        div.className =
            "flex items-center h-24 py-6 px-3 rounded-xl bg-gray-50 space-x-3";
        div.innerHTML = `
      <input type="checkbox" id="progressCheck${item.day}" ${checked ? "checked" : ""
            } onchange="toggleProgress(${item.day
            })" class="form-checkbox h-6 w-6 text-blue-600">
      <label for="progressCheck${item.day
            }" class="flex flex-col text-gray-800">
        ${item.title}
        <span class="text-xs text-gray-400">
          Day ${item.day}
        </span>
      </label>
  `;
        if (list) list.appendChild(div);
    });
    const percent =
        currentCalendarData.length > 0
            ? Math.round((completed / currentCalendarData.length) * 100)
            : 0;
    if (progressBar) progressBar.style.width = percent + "%";
    if (percentText) percentText.textContent = percent + "%";
}


export function toggleProgress(day: number): void {
    const key = `progress_day_${day}`;
    const el = document.getElementById(`progressCheck${day}`);
    const checked = el instanceof HTMLInputElement ? el.checked : false;

    localStorage.setItem(key, checked ? "1" : "0");
    renderProgressTracker();
}