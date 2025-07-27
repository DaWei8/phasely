import axios from "axios"; // Import AxiosError

const GEMINI_KEYS = [
    process.env.GEMINI_API_KEY1,
    process.env.GEMINI_API_KEY2,
    process.env.GEMINI_API_KEY3,
    process.env.GEMINI_API_KEY4,
].filter(Boolean);

function shuffleKeys(keys: typeof GEMINI_KEYS) {
    return keys.sort(() => Math.random() - 0.5);
}

export async function callGemini(prompt: string) {
    const keys = shuffleKeys(GEMINI_KEYS);
    for (const key of keys) {
        try {
            const res = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
                {
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        topP: 0.95,
                        topK: 40,
                    },
                }
            );
            return res;
        } catch (err) { // Remove 'any' type here
            if (axios.isAxiosError(err)) { // Check if it's an AxiosError
                if (err.response?.status === 429 || err.response?.status === 503) {
                    console.warn(`Key failed due to rate limit or service unavailable: ${key}`);
                    continue;
                }
            }
            // If it's not an AxiosError or not a 429/503, re-throw the error
            throw err;
        }
    }

    throw new Error("All Gemini API keys failed.");
}