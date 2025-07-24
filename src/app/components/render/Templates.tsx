import { promptMap } from "@/app/constants/constants";
import { showCustomModal } from "../modals/showModal";

export function renderTemplates(): void {
  // The templates are hardcoded in the HTML.
  // This export function is a placeholder if they were to be loaded dynamically.
}

export function loadTemplate(type: "webdev" | "datascience" | "mobile" | "marketing" | "productivity" | "language"): void {

  const learningPrompt = document.getElementById("learningPrompt") as HTMLInputElement;
  const durationInput = document.getElementById("duration") as HTMLInputElement;

  if (learningPrompt) learningPrompt.value = promptMap[type] || "";
  // Optionally auto-fill duration and other fields
  if (durationInput) {
    if (type === "webdev" || type === "datascience" || type === "mobile") {
      durationInput.value = "60";
    } else if (type === "marketing") {
      durationInput.value = "30";
    } else if (type === "language") {
      durationInput.value = "45";
    } else if (type === "productivity") {
      durationInput.value = "30";
    }
  }
  // Scroll to the custom section for editing
  const customSection = document.getElementById("customSection");
  if (customSection) {
    customSection.scrollIntoView({ behavior: "smooth" });
  }
  showCustomModal(
    "Template loaded",
    "You can now customize and generate your plan."
  );
}