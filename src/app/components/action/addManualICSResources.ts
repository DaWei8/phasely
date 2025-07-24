import { manualICSResourceLinks } from "@/app/constants/constants";
import { renderManualICSResources } from "../render/ManualICSResources";

export function addManualICSResource(): void {
  if (manualICSResourceLinks.length < 5) {
    manualICSResourceLinks.push({ name: "", link: "" });
    renderManualICSResources();
  }
}
