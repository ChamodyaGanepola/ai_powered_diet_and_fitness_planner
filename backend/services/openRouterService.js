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
        temperature: 0.5,
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

     let content = response.data.choices[0].message.content || "{}";

    // Clean AI response
    content = content.trim()
      .replace(/^```json\s*/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .replace(/\bNaN\b/g, "0");

    // Parse safely
    try {
      return JSON.parse(content);
    } catch {
      const lastBrace = content.lastIndexOf("}");
      content = content.slice(0, lastBrace + 1);
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("OpenRouter Meal API error:", err.response?.data || err.message);
    throw new Error("Meal AI generation failed");
  }
};