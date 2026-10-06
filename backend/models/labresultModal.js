import mongoose from "mongoose";

// One document per lab result row. This is what answers "what was my LDL in March?"
// and "is my HbA1c improving?" with exact values instead of fuzzy vector matches.
const labResultSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    ingestRunId: { type: String, index: true },

    testName: { type: String, required: true }, // as printed on the report
    canonicalName: String, // standard name (LLM), e.g. "LDL Cholesterol"
    testKey: { type: String, required: true }, // normalised + alias-merged, used for grouping/trends
    panel: String,

    value: { type: Number, default: null }, // numeric only when the printed value was a plain number
    valueText: String, // exactly as printed ("13.2", "<0.5", "Positive")
    unit: String,
    refText: String,
    refLow: { type: Number, default: null },
    refHigh: { type: Number, default: null },
    flag: { type: String, enum: ["LOW", "HIGH", "NORMAL", "CRITICAL", "UNKNOWN"], default: "UNKNOWN" },

    collectedAt: { type: Date, index: true },
    dateSource: { type: String, enum: ["user", "document", "upload"] },

    pageNumber: Number,
    sourceText: String, // verbatim row, lets the UI show the original next to the value
    verified: { type: Boolean, default: false }, // row + value literally found in the document text
  },
  { timestamps: true }
);

labResultSchema.index({ patientId: 1, testKey: 1, collectedAt: -1 });

export default mongoose.models.labResult || mongoose.model("labResult", labResultSchema);