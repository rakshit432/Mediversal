import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';



const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // 🔐 REQUIRED
});

const triageUser = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.json({ success: false, message: "Symptoms are required" });
    }

    const prompt = `
You are a medical triage assistant.

Rules:
- DO NOT diagnose diseases
- DO NOT suggest medicines or treatment
- ONLY recommend the most suitable doctor speciality
- If unsure, return "General physician"

Return ONLY valid JSON in this exact format:
{
  "speciality": "Dermatologist | Gynecologist | Neurologist | Pediatrician | Gastroenterologist | General physician",
  "reason": "Short explanation in one line"
}

User symptoms:
"${symptoms}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // 🔒 disables chain-of-thought
        },
        responseMimeType: "application/json", // 🔥 forces JSON
      },
    });

    // Gemini already returns JSON when responseMimeType is set
    const result = JSON.parse(response.text);

    res.json({
      success: true,
      recommendation: result.speciality,
      reason: result.reason,
      disclaimer:
        "This is not a medical diagnosis. Please consult a qualified doctor.",
    });

  } catch (error) {
    console.error("Triage error:", error);
    res.json({ success: false, message: "Triage failed" });
  }
};

export { triageUser };
