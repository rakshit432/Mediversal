import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    reportType: { type: String, default: "Other" },
    reportDate: { type: Date, index: true },
    uploadedAt: { type: Date, default: Date.now },
    processingStatus: {
      type: String,
      enum: ["UPLOADED", "PENDING", "PROCESSING", "READY", "FAILED"],
      default: "UPLOADED",
      index: true,
    },
    embeddingStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "DEGRADED", "SKIPPED"],
      default: "PENDING",
      index: true,
    },
    isDegraded: { type: Boolean, default: false },
    chunkCount: { type: Number, default: 0 },
    labResultCount: { type: Number, default: 0 },
    errorMessage: { type: String, default: "" },
    processingNotes: { type: String, default: "" },
    docType: { type: String, default: "" },
    summary: { type: String, default: "" },
    metadata: {
      cloudinaryPublicId: String,
      sizeBytes: Number,
    },
  },
  { timestamps: true }
);

medicalReportSchema.index({ patientId: 1, processingStatus: 1 });
medicalReportSchema.index({ patientId: 1, reportDate: -1 });

export default mongoose.models.medicalReport || mongoose.model("medicalReport", medicalReportSchema);
