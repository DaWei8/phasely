// Load calendar preview

import { CalendarItem } from "@/app/types/types";

const currentCalendarData: CalendarItem[] = [];

const isEditMode = false;

export function loadCalendarPreview(): void {
  const preview = document.getElementById("calendarPreview");
  const stats = document.getElementById("calendarStats");

  if (!preview || !stats) return;

  document.getElementById("calendarPreviewSection")?.classList.remove("hidden");

  const totalDays = currentCalendarData.length;
  const totalHours = currentCalendarData.reduce((sum, item) => {
    const match = item.time.match(/\d+/);
    return sum + (match ? parseFloat(match[0]) : 0);
  }, 0);
//   const phases = new Set(currentCalendarData.map((item) => item.phase)).size;
  const avgHoursPerDay = (totalHours / totalDays).toFixed(1);

  stats.innerHTML = `
    <div class="bg-blue-50 p-4 rounded-lg text-center">
      <div class="text-2xl font-bold text-blue-600">${totalDays}</div>
      <div class="text-sm text-gray-600">Total Days</div>
    </div>
    <div class="bg-green-50 p-4 rounded-lg text-center">
      <div class="text-2xl font-bold text-green-600">${totalHours}</div>
      <div class="text-sm text-gray-600">Total Hours</div>
    </div>
    <div class="bg-purple-50 p-4 rounded-lg text-center">
      <div class="text-2xl font-bold text-purple-600">${totalDays * 2}</div>
      <div class="text-sm text-gray-600">Resources</div>
    </div>
    <div class="bg-yellow-50 p-4 rounded-lg text-center">
      <div class="text-2xl font-bold text-orange-600">${isNaN(parseFloat(avgHoursPerDay)) ? 0 : avgHoursPerDay
    }</div>
      <div class="text-sm text-gray-600">Avg Hours/Day</div>
    </div>`;

  preview.innerHTML = "";
  const phaseColors: Record<number, string> = {
    1: "green",
    2: "blue",
    3: "purple",
    4: "yellow",
    5: "red",
  };

  currentCalendarData.slice(0, 20).forEach((item, index) => {
    const div = document.createElement("div");
    div.className = `calendar-item rounded-lg border-l-4 border-${phaseColors[item.phase] || "gray"
      }-500 bg-white p-4 rounded-r-lg shadow-sm ${isEditMode ? "edit-mode" : ""}`;

    div.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-semibold text-gray-900 ${isEditMode ? "cursor-pointer" : ""
      }" ${isEditMode ? `onclick="openEditModal(${index})"` : ""}>
          Day ${item.day}: ${item.title}
        </h3>
        <div class="flex items-center space-x-2">
          <span class="text-sm hidden md:flex text-gray-500">${item.time}</span>
          ${isEditMode
        ? `<button onclick="openEditModal(${index})" class="text-blue-600 hover:text-blue-800"><i class="fas fa-edit"></i></button>
                 <button onclick="deleteItem(${index})" class="text-red-600 hover:text-red-800"><i class="fas fa-trash-alt"></i></button>`
        : ""
      }
        </div>
      </div>
      <p class="text-gray-700 text-sm mb-2 ${isEditMode ? "cursor-pointer" : ""
      }" ${isEditMode ? `onclick="editItem(${index})"` : ""}>${item.description}</p>
      <div class="flex flex-wrap gap-2">
        ${item.resources!
        .map(
          (resource) => `
            <a href="${resource}" target="_blank" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors">
              <i class="fas fa-external-link-alt mr-1"></i>Resource
            </a>`
        )
        .join("") || ""
      }
        <span class="text-sm lg:hidden text-gray-500">${item.time}</span>
      </div>`;
    preview.appendChild(div);
  });

  if (currentCalendarData.length > 20) {
    const moreDiv = document.createElement("div");
    moreDiv.className = "text-center py-4 text-gray-500";
    moreDiv.innerHTML = `<i class="fas fa-ellipsis-h"></i> ${currentCalendarData.length - 20
      } more days will be included in your calendar`;
    preview.appendChild(moreDiv);
  }

  document.getElementById("calendarPreviewSection")?.scrollIntoView({
    behavior: "smooth",
  });
}