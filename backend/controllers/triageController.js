import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const triageUser = async (req, res) => {
  try {
    const { symptoms, history } = req.body;

    if (!symptoms) {
      return res.json({ success: false, message: "Symptoms are required" });
    }

    // Build conversation history context
    const historyContext = history && history.length > 0
      ? `\nPrevious conversation context:\n${history.map(h => `${h.role}: ${h.text}`).join('\n')}\n`
      : '';

    const prompt = `
You are an expert medical triage assistant working for Mediversal, a healthcare platform.
${historyContext}
Rules:
- DO NOT provide a definitive diagnosis of specific diseases.
- DO NOT suggest specific medicines, dosages, or treatments.
- Be empathetic, clear, and professional.
- Recommend the SINGLE most suitable doctor speciality from ONLY these options:
  Dermatologist, Gynecologist, Neurologist, Pediatrician, Gastroenterologist, General physician.
  If symptoms involve children under 12, always consider Pediatrician.
  If unsure, use General physician.
- Assess symptom severity as exactly one of: "Low", "Medium", or "High".
  Low = minor, manageable at home with rest
  Medium = should see a doctor within 1-2 days
  High = urgent, seek care today or go to ER
- List 2-4 possible general symptom categories or conditions (NON-definitive, educational only).
- Provide a clear, actionable suggested action for the patient.
- If severity is High or symptoms suggest life-threatening conditions (chest pain with shortness of breath, stroke signs, severe bleeding, etc.), provide a specific Emergency Warning.
- Provide a list of exactly 3 relevant, follow-up questions or next queries/worries the patient might have based on the symptom profile. Keep these short (under 8 words each).
- Consider symptom duration, combination, and intensity in your assessment.
- Be conversational in the reason field — speak directly to the patient.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "speciality": "Speciality Name",
  "reason": "Conversational explanation addressing the patient directly, 1-2 sentences",
  "severity": "Low | Medium | High",
  "possibleConditions": ["Condition A", "Condition B", "Condition C"],
  "suggestedAction": "Clear actionable step for the patient",
  "emergencyWarning": "Specific emergency warning text, or empty string if not applicable",
  "suggestedFollowups": ["Question 1", "Question 2", "Question 3"],
  "disclaimer": "This is not a medical diagnosis. Always consult a qualified healthcare provider for proper evaluation and treatment."
}

Patient's symptoms:
"${symptoms}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
        responseMimeType: "application/json",
      },
    });

    let result;
    try {
      result = JSON.parse(response.text);
    } catch {
      // Fallback if JSON is malformed
      result = {
        speciality: "General physician",
        reason: "Based on your symptoms, I recommend consulting a general physician for proper evaluation.",
        severity: "Medium",
        possibleConditions: ["General health concern"],
        suggestedAction: "Schedule an appointment with a general physician within 1-2 days.",
        emergencyWarning: "",
        suggestedFollowups: [
          "What typical tests are done?",
          "When should I go to the ER?",
          "Are there home remedies?"
        ],
        disclaimer: "This is not a medical diagnosis. Always consult a qualified healthcare provider."
      };
    }

    res.json({
      success: true,
      recommendation: result.speciality || "General physician",
      reason: result.reason || "",
      severity: result.severity || "Medium",
      possibleConditions: result.possibleConditions || [],
      suggestedAction: result.suggestedAction || "",
      emergencyWarning: result.emergencyWarning || "",
      suggestedFollowups: result.suggestedFollowups || [
        "What typical tests are done?",
        "When should I go to the ER?",
        "Are there home remedies?"
      ],
      disclaimer: result.disclaimer || "This is not a medical diagnosis. Please consult a qualified doctor.",
    });

  } catch (error) {
    console.error("Triage error:", error);
    res.json({ success: false, message: "Triage analysis failed. Please try again." });
  }
};

export { triageUser };
