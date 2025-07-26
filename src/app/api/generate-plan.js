import {express} from "express";
import {bodyParser} from "body-parser";
import {cors} from "cors";
import {axios} from "axios";
import {dotenv} from "dotenv";
import { createClient } from "@supabase/supabase-js"; // Import Supabase client
const app = express();
const router = express.Router();
dotenv.config();
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Check your .env file."
  );
  process.exit(1); // Exit if essential env vars are missing
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use("/api", router);


router.post("/generate-plan", (req, res) => {
  geminiController.generatePlan(req, res);
});

// GET /api/history endpoint
router.get("/history", async (req, res) => {
  try {
    // In a real app, you might want to filter by user_id
    const { data, error } = await supabase
      .from("generated_plans")
      .select("*")
      .order("created_at", { ascending: false }) // Order by most recent
      .limit(10); // Limit the number of history items for performance

    if (error) {
      console.error("Error fetching history from Supabase:", error);
      return res.status(500).json({ message: "Error fetching history" });
    }

    res.json(data);
  } catch (error) {
    console.error("Unexpected error in /api/history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// The following fetch block was removed because fetch with a relative URL is not valid in a Node.js backend context.
// If you need to test your endpoint, use a tool like Postman, curl, or move this code to your frontend.

class GeminiController {
    constructor(apiClient = axios) {
    this.apiClient = apiClient;
    this.supabase = supabase;
  }

  async generatePlan(req, res) {

    const { prompt: userGoal, duration } = req.body;

    console.log("Received request to /generate-plan with body:", req.body);

    // Input validation
    if (!userGoal || typeof userGoal !== "string" || userGoal.trim() === "") {
      console.log("Validation failed: Prompt missing or invalid.");
      return res.status(400).json({
        message: "Prompt is required and must be a non-empty string.",
      });
    }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      console.log("Validation failed: Duration missing or invalid.");
      return res.status(400).json({
        message: "Duration is required and must be a positive integer.",
      });
    }

    try {
      const fullPrompt = `
        Generate a ${duration}-day plan and a corresponding content calendar for the goal: "${userGoal}".

        The overall response MUST be a single JSON object with three top-level keys:
        - "introduction": (object) Contains an introductory description and a disclaimer.
        - "plan": (array of objects) Represents the 7-phase plan.
        - "calendar": (array of objects) Represents the detailed content calendar.

        The "introduction" object MUST have the following keys:
        - "description": (string) A brief summary explaining what the generated plan and calendar are about. This should introduce the goal and the duration.

        The "plan" array should consist of exactly 7 distinct phase objects.
        Each phase object MUST have the following keys:
        - "phase": (integer) The phase number (1 to 7).
        - "days": (string) The range of days for this phase (e.g., "1-3", "4-7").
        - "focus": (string) The main objective or theme of the phase.
        - "activities": (array of strings) A list of specific activities or tasks for this phase.

        The "calendar" array should contain entries for *each day* within the ${duration}-day period, starting from Day 1.
        Each calendar entry object MUST have the following keys:
        - "day": (integer) The specific day number (e.g., 1, 2, 3, up to ${duration}).
        - "taskName": (string) A concise name for the day's main task.
        - "taskDescription": (string) A detailed description of what needs to be done.
        - "timeCommitment": (string) The estimated time required based on the average time required for the entire duration (e.g., "30 mins", "1 hour", "2-3 hours").
        - "learningStyle": (string) The preferred learning style for the task (e.g., "visual", "auditory", "kinesthetic").
        - "phaseNumber": (integer) The phase number this task belongs to.
        - "resources": (array of objects) A list of exactly two online resources.
            Each resource object MUST have "name" (string) and "link" (string, a valid URL) keys.

        Ensure the "calendar" entries logically align with the "plan" phases and activities.
        Do NOT include any additional text, markdown formatting (like '''json), or explanations outside the JSON object itself.
      `.trim();

      console.log("Sending prompt to Gemini API:", fullPrompt.slice(0, 300) + "...");

      // Check for missing Gemini API key

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "undefined") {
        console.error("GEMINI_API_KEY is missing or undefined in environment variables.");
        return res.status(500).json({
          message: "Gemini API key is missing or not set in the backend environment.",
        });

      }

      const response = await this.apiClient.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: fullPrompt.replace(/\s+/g, " ").trim(),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
          },
        }
      );

      // Defensive: check for Gemini API errors and log for debugging
      if (response.data && response.data.error) {
        console.error("Gemini API error:", response.data.error);
        return res.status(500).json({
          message: "Gemini API error",
          error: response.data.error,
        });
      }

      const generatedText =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      console.log("Raw Gemini API response text:", generatedText ? generatedText.slice(0, 300) + "..." : "No text");

      if (!generatedText) {
        console.error("No text content in Gemini API response:", response.data);
        return res.status(500).json({
          message: "Gemini did not generate a plan.",
          error: "No text content in response.",
        });
      }

      // Clean and parse the JSON data
      const cleanedText = generatedText
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      let parsedPlan;
      try {
        parsedPlan = JSON.parse(cleanedText);

        // Ensure the response contains both "plan" and "calendar"
        if (!parsedPlan.plan || !parsedPlan.calendar) {
          console.error("Parsed JSON missing 'plan' or 'calendar' keys:", parsedPlan);
          throw new Error(
            'Parsed content must contain "plan" and "calendar" keys.'
          );
        }
      } catch (jsonError) {
        console.error("Failed to parse Gemini's response:", cleanedText);
        return res.status(500).json({
          message:
            "Failed to parse Gemini's response. It might not be valid JSON.",
          error: jsonError.message,
          rawResponse: cleanedText,
        });
      }

      const { data, error } = await this.supabase
        .from("generated_plans")
        .insert([
          {
            user_goal: userGoal,
            duration: Number(duration), // Ensure duration is a number
            generated_plan: parsedPlan.plan, // Store only the 'plan' part
            content_calendar: parsedPlan.calendar, // Store only the 'calendar' part
            // user_id: req.user.id // Uncomment if you add authentication
          },
        ]);
              if (error) {
        console.error("Error saving plan to Supabase:", error);
        // You might still want to send the plan to the user even if DB save fails
        // but log the error
      } else {
        console.log("Plan successfully saved to Supabase:", data);
      }

      // Successfully parsed and structured, send it to the frontend
      console.log("Successfully parsed plan, sending response to frontend.");
      res.status(200).json({
        plan: parsedPlan,
        modelVersion: response.data.modelVersion,
        usageMetadata: response.data.usageMetadata,
      });
    } catch (error) {
      console.error("Error in generatePlan:", error);
      res.status(500).json({
        message: "Error generating plan",
        error: error.response?.data || error.message,
      });
    }
  }
}

const geminiController = new GeminiController();

// Add this to start the server
const PORT = process.env.PORT || 10000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Gemini API server running on http://${HOST}:${PORT}`);
});