import { examplePrompts } from "@/app/constants/constants";

export function setExamplePrompt(type: string): void {
  const promptBox = document.getElementById("learningPrompt") as HTMLTextAreaElement;
  if (promptBox && examplePrompts[type]) {
    promptBox.value = examplePrompts[type];
  }
}