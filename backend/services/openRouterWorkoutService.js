import axios from "axios";

/**
 * Calls OpenRouter API to generate workout plan JSON
 * RETURNS STRING ONLY (important)
 */
export const generateWorkoutPlan = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a certified fitness coach. Return STRICT VALID JSON only. No explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
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

    let content = response.data.choices[0].message.content || "{}";

    // CLEAN MARKDOWN
    content = content
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "");

    // CLEAN UNITS (IMPORTANT)
    content = content
      .replace(/(\d+)\s*kg\b/gi, "$1")
      .replace(/(\d+)\s*lbs\b/gi, "$1")
      .replace(/(\d+)\s*min\b/gi, "$1")
      .replace(/(\d+)\s*sec\b/gi, "$1")
      .replace(/(\d+)\s*reps\b/gi, "$1")
      .replace(/(\d+)\s*sets\b/gi, "$1");

    return content; // ✅ STRING ONLY
  } catch (err) {
    console.error(
      "OpenRouter Workout API error:",
      err.response?.data || err.message
    );
    throw new Error("Workout AI generation failed");
  }
};
