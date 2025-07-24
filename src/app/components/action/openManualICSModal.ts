import { renderManualICSResources } from "../render/ManualICSResources";

export function openManualICSModal() {
  const modal = document.getElementById("manualICSModal");
  const taskName = document.getElementById("manualTaskName") as HTMLInputElement | null;
  const taskDescription = document.getElementById("manualTaskDescription") as HTMLInputElement | null;
  const timeCommitment = document.getElementById("manualTimeCommitment") as HTMLInputElement | null;
  const learningStyle = document.getElementById("manualLearningStyle") as HTMLInputElement | null;
  const phaseNumber = document.getElementById("manualPhaseNumber") as HTMLInputElement | null;

  modal?.classList.remove("hidden");
  if (taskName) taskName.value = "";
  if (taskDescription) taskDescription.value = "";
  if (timeCommitment) timeCommitment.value = "2 hours/day";
  if (learningStyle) learningStyle.value = "balanced";
  if (phaseNumber) phaseNumber.value = "1";

  renderManualICSResources();
}
