import axios from "axios";

export const generateMealPlan = async (prompt) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition assistant. Return STRICT VALID JSON only. No text. No explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 900
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Meal Planner"
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

    // -------------------------------
    // CLEAN UNITS (VERY IMPORTANT)
    // -------------------------------
    // Converts "5g" => 5, "20 kg" => 20, "250cal" => 250
    content = content
      .replace(/(\d+)\s*g\b/gi, "$1")
      .replace(/(\d+)\s*kg\b/gi, "$1")
      .replace(/(\d+)\s*cal\b/gi, "$1")
      .replace(/(\d+)\s*kcal\b/gi, "$1");

    return content;
  } catch (err) {
    console.error(
      "OpenRouter Meal API error:",
      err.response?.data || err.message
    );
    throw new Error("Meal AI generation failed");
  }
};
