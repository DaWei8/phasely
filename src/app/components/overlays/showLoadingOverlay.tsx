export function showLoadingOverlay(stepText = "Processing Request...", result : string): void {
  document.getElementById("loadingOverlay")?.classList.remove("hidden");
  const stepElem = document.getElementById("loadingStepText");
  if (stepElem) stepElem.textContent = stepText;
  stepElem!.textContent = result
}
