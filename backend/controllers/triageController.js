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
- DO NOT provide a definitive diagnosis of diseases.
- DO NOT suggest specific medicines or treatment.
- Recommend the most suitable doctor speciality from: Dermatologist, Gynecologist, Neurologist, Pediatrician, Gastroenterologist, General physician. If unsure, use General physician.
- Assess symptom severity as "Low", "Medium", or "High".
- List 1-3 possible general conditions or symptom causes (general, non-definitive).
- Provide a suggested action.
- If severity is High or life-threatening, provide an explicit Emergency Warning. Otherwise, leave it empty or provide standard precautions.

Return ONLY valid JSON in this exact format:
{
  "speciality": "Speciality Name",
  "reason": "Short explanation in one line",
  "severity": "Low | Medium | High",
  "possibleConditions": ["Condition A", "Condition B"],
  "suggestedAction": "Suggested action",
  "emergencyWarning": "Emergency warning text or empty string",
  "disclaimer": "This is not a medical diagnosis. Please consult a qualified doctor."
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

    const result = JSON.parse(response.text);

    res.json({
      success: true,
      recommendation: result.speciality,
      reason: result.reason,
      severity: result.severity || "Medium",
      possibleConditions: result.possibleConditions || [],
      suggestedAction: result.suggestedAction || "",
      emergencyWarning: result.emergencyWarning || "",
      disclaimer: result.disclaimer || "This is not a medical diagnosis. Please consult a qualified doctor.",
    });

  } catch (error) {
    console.error("Triage error:", error);
    res.json({ success: false, message: "Triage failed" });
  }
};

export { triageUser };
