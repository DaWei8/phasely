import { HistoryCalendar, Resource } from "../types/types";

export const progressBarFill = document.getElementById("progressBarFill") as HTMLElement;
export const messageDiv = document.getElementById("message") as HTMLElement;
export const progressText = document.getElementById("progressText") as HTMLElement;

export const MIN_DURATION: number = 5;
export const MAX_DURATION: number = 30;

export const examplePrompts: { [key: string]: string } = {
  webdev:
    "I want to learn full-stack web development in. I'm a complete beginner and want to focus on React, Node.js, and MongoDB. I can dedicate 2-3 hours per day and prefer hands-on projects over theory. Include some portfolio projects I can build to showcase my skills.",
  datascience:
    "I want to become proficient in data science and machine learning in. I have basic Python knowledge but no ML experience. Focus on pandas, scikit-learn, and TensorFlow. I prefer a mix of theory and practical projects with real datasets.",
  mobile:
    "I want to learn React Native mobile app development in. I have some JavaScript experience. Include building 3-4 complete apps for both iOS and Android, with focus on navigation, state management, and API integration.",
  marketing:
    "I want to master digital marketing in. Focus on SEO, social media marketing, Google Ads, and content marketing. I prefer practical exercises and real campaign creation over theory.",
};

export const manualICSResourceLinks: Resource[] = [
  { name: "", link: "" },
  { name: "", link: "" },
];

declare global {
  interface Window {
    _historyCalendars?: HistoryCalendar[];
  }
}
  // Use the same examplePrompts as your quick examples
export const promptMap = {
    webdev: examplePrompts.webdev.replace("in.", "in 60 days."),
    datascience: examplePrompts.datascience.replace("in.", "in 60 days."),
    mobile: examplePrompts.mobile.replace("in.", "in 60 days."),
    marketing: examplePrompts.marketing.replace("in.", "in 60 days."),
    productivity:
      "I want to improve my productivity and build better habits in 30 days. Focus on time management, daily routines, and focus techniques. Include practical exercises and habit tracking.",
    language:
      "I want to learn conversational Spanish in 45 days. I'm a beginner and want to focus on speaking, listening, and basic grammar. Include daily practice and useful resources.",
  };

export type ErrorType = {
    message: string
}

// Example Prompt Setter
// let isEditMode = false;
// let editIndex = 0;

// Keep resource array synced with inputs
document.addEventListener("input", (e) => {
  const target = e.target as HTMLElement;
  const index = parseInt(target.getAttribute("data-index") || "");
  const value = (target as HTMLInputElement).value;

  if (target.classList.contains("manual-ics-resource-name")) {
    manualICSResourceLinks[index].name = value;
  }

  if (target.classList.contains("manual-ics-resource-link")) {
    manualICSResourceLinks[index].link = value;
  }
});

