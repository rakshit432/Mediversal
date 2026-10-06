import mongoose from "mongoose";

const labResultSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    ingestRunId: { type: String, index: true },

    testName: { type: String, required: true },
    canonicalName: String,
    testKey: { type: String, required: true },
    panel: String,

    value: { type: Number, default: null },
    valueText: String,
    unit: String,
    refText: String,
    refLow: { type: Number, default: null },
    refHigh: { type: Number, default: null },
    flag: { type: String, enum: ["LOW", "HIGH", "NORMAL", "CRITICAL", "UNKNOWN"], default: "UNKNOWN" },

    collectedAt: { type: Date, index: true },
    dateSource: { type: String, enum: ["user", "document", "upload"] },

    pageNumber: Number,
    sourceText: String,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

labResultSchema.index({ patientId: 1, testKey: 1, collectedAt: -1 });

export default mongoose.models.labResult || mongoose.model("labResult", labResultSchema);
