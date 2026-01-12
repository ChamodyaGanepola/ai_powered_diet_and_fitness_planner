import axios from "axios";

/**
 * Calls OpenRouter API to generate meal plan text (JSON)
 * @param {string} prompt - Prepared prompt from controller
 * @returns {string} AI response content (JSON string)
 */
export const generateMealPlan = async (prompt) => {
 console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct", // best free-friendly model
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition assistant. Generate meal plans in VALID JSON only. No explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          // optional but recommended by OpenRouter
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Meal Planner"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "OpenRouter Error:",
      error.response?.data || error.message
    );
    throw new Error("OpenRouter API call failed");
  }
};
