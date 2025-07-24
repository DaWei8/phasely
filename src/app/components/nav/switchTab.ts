import { loadHistory } from "../loaders/loadHistory";
import { renderProgressTracker } from "../render/ProgressTracker";
import { renderTemplates } from "../render/Templates";

export function switchTab(tab: "custom" | "history" | "progress" | "template") {
  const tabMap: Record<string, { tab: string; section: string; callback?: () => void }> = {
    custom: { tab: "customTab", section: "customSection" },
    history: { tab: "historyTab", section: "historySection", callback: loadHistory },
    progress: { tab: "progressTracker", section: "progressSection", callback: renderProgressTracker },
    template: { tab: "templateTab", section: "templatesSection", callback: renderTemplates },
  };

  const allTabs = ["customTab", "historyTab", "progressTracker", "templateTab"];
  const allSections = ["customSection", "historySection", "progressSection", "templatesSection"];

  allTabs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("tab-active");
  });

  allSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });

  const activeTab = tabMap[tab];
  const tabEl = document.getElementById(activeTab.tab);
  const sectionEl = document.getElementById(activeTab.section);

  if (tabEl) tabEl.classList.add("tab-active");
  if (sectionEl) sectionEl.classList.remove("hidden");
  if (activeTab.callback) activeTab.callback();
}