import mongoose from "mongoose";

// Parent documents for parent-child retrieval: small chunks are matched, the whole
// section (this document) is what gets handed to the LLM as context.
const reportSectionSchema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    ingestRunId: { type: String, index: true },

    order: { type: Number, required: true },
    title: { type: String, default: "" },
    sectionType: { type: String, enum: ["header", "lab", "narrative"], default: "narrative" },
    text: { type: String, default: "" },
    summary: { type: String, default: "" },
    pageStart: Number,
    pageEnd: Number,
  },
  { timestamps: true }
);

export default mongoose.models.reportSection || mongoose.model("reportSection", reportSectionSchema);