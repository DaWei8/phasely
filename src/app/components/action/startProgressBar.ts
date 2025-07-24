import { MAX_DURATION, MIN_DURATION, progressBarFill, progressText } from "@/app/constants/constants";

let progressInterval: NodeJS.Timeout | null;

export function startProgressBar(rawDuration: number): void {
  const clampedDuration: number = Math.min(
    Math.max(rawDuration, MIN_DURATION),
    MAX_DURATION
  );

  if (progressInterval) {
    clearInterval(progressInterval);
  }
  if (progressText) progressText.textContent = "0%";

  if (progressBarFill) {
    progressBarFill.style.animation = "none";
    void progressBarFill.offsetWidth;
    progressBarFill.style.animation = "";
    progressBarFill.style.setProperty(
      "--load-duration",
      `${clampedDuration}s`
    );
  }

  const startTime: number = Date.now();
  const totalDurationMs: number = clampedDuration * 1000;

  progressInterval = setInterval(() => {
    const elapsedTime: number = Date.now() - startTime;
    let progress: number = (elapsedTime / totalDurationMs) * 100;
    if (progress >= 99) {
      progress = 99;
      if (progressInterval) clearInterval(progressInterval);
    }
    if (progressText) progressText.textContent = `${Math.floor(progress)}%`;
  }, 50);
  
}