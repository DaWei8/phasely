import { manualICSResourceLinks } from "@/app/constants/constants";
import { renderManualICSResources } from "../render/ManualICSResources";

export function removeManualICSResource(idx: number): void {
  if (manualICSResourceLinks.length > 2) {
    manualICSResourceLinks.splice(idx, 1);
    renderManualICSResources();
  }
}
