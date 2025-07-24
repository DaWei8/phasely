import { HistoryCalendar } from "@/app/types/types";
import { getApiBase } from "../action/getApiBase";

// Load history from backend
export async function loadHistory(): Promise<void> {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  historyList.innerHTML = `<div class="text-gray-500">Loading history...</div>`;
  const API_BASE = getApiBase();

  try {
    const res = await fetch(`${API_BASE}/api/history`);
    if (!res.ok) throw new Error(await res.text());

    const data: HistoryCalendar[] = await res.json();
    if (!data.length) {
      historyList.innerHTML = `<div class="text-gray-500">Coming soon!</div>`;
      return;
    }

    historyList.innerHTML = "";
    data.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "bg-white rounded-lg shadow p-4 border-l-4 border-blue-500";
      div.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <div>
            <div class="font-semibold text-gray-900">"${item.title || item.prompt || "Untitled"}"</div>
            <div class="text-xs text-gray-500">Generated: ${item.createdAt ? new Date(item.createdAt).toLocaleString() : "Unknown"}</div>
            <div class="text-xs text-gray-400">Days: ${item.duration || (item.calendar?.length ?? "N/A")}</div>
          </div>
          <button class="text-blue-600 hover:text-blue-800 px-3 py-1 rounded" onclick="loadHistoryCalendar(${idx})">
            <i class="fas fa-eye"></i> View
          </button>
        </div>`;
      historyList.appendChild(div);
    });

    window._historyCalendars = data;
  } catch (err) {
    historyList.innerHTML = `<div class="text-red-500">Failed to load history.<br>${(err as Error).message}</div>`;
  }
}