import axios from "axios";

/**
 * Calls OpenRouter API to generate workout plan JSON
 * @param {string} prompt
 * @returns {string}
 */
export const generateWorkoutPlan = async (prompt) => {
  console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a certified fitness coach. Generate workout plans in VALID JSON only. No explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Workout Planner"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenRouter Workout Error:", error.response?.data || error.message);
    throw new Error("Workout AI generation failed");
  }
};
