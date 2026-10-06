import mongoose from "mongoose";

// REPLACES the previous reportChunkModel (merge if yours has extra fields).
// New vs. before: chunkType, sectionId, section, reportDate, ingestRunId, embeddingModel.
const reportChunkSchema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ingestRunId: { type: String, index: true },

    chunkType: {
      type: String,
      enum: ["narrative", "lab_summary", "section_summary", "report_summary"],
      default: "narrative",
    },
    chunkText: { type: String, required: true }, // raw text shown to the doctor / LLM
    embedding: { type: [Number] },
    // "<model>:<dimensions>". Vectors are only compared with vectors carrying the SAME tag.
    embeddingModel: { type: String, index: true },
    embeddingStatus: {
      type: String,
      enum: ["VALID", "FAILED", "PENDING", "SKIPPED"],
      default: "VALID",
    },
    embeddingError: { type: String, default: "" },

    section: { type: String, default: "" },
    pageNumber: { type: Number, default: 1 },
    chunkIndex: { type: Number, default: 0 },
    reportDate: { type: Date },

    metadata: {
      fileName: String,
      reportType: String,
      fileUrl: String,
      docType: String,
    },
  },
  { timestamps: true }
);

reportChunkSchema.index({ patientId: 1, reportDate: -1 });

export default mongoose.models.reportChunk || mongoose.model("reportChunk", reportChunkSchema);