import { manualICSResourceLinks } from "@/app/constants/constants";

// Render ICS Resources
export function renderManualICSResources(): void {
  const container = document.getElementById("manualICSResources");
  if (!container) return;
  container.innerHTML = "";

  manualICSResourceLinks.forEach((res, i) => {
    container.innerHTML += `
      <div class="flex items-center space-x-2 mb-1">
        <input type="text" placeholder="Resource Name" value="${res.name || ""}"
          class="manual-ics-resource-name w-1/3 px-2 py-1 border border-gray-300 rounded" data-index="${i}" />
        <input type="url" placeholder="https://link.com" value="${res.link || ""}"
          class="manual-ics-resource-link w-2/3 px-2 py-1 border border-gray-300 rounded" data-index="${i}" />
        <button type="button" onclick="removeManualICSResource(${i})" class="text-red-600 hover:text-red-800">
          <i class="fas fa-times"></i>
        </button>
      </div>`;
  });

  const addBtn = document.querySelector<HTMLButtonElement>(
    '[onclick="addManualICSResource()"]'
  );
  if (addBtn) addBtn.disabled = manualICSResourceLinks.length >= 5;
}