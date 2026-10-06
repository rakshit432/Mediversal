// scripts/reembedChunks.js
// One-time migration: re-embed chunks that were embedded with an older model (e.g. text-embedding-004)
// using the current EMBEDDING_MODEL. Vectors from different models are NOT comparable, so until this
// runs (or the report is re-ingested) those chunks are searched by keyword only.
//
//   MONGODB_URI=... GEMINI_API_KEY=... node scripts/reembedChunks.js [--dry-run]
//
// Safe to re-run: it only touches chunks whose `embeddingModel` differs from the current tag.
import "dotenv/config";
import mongoose from "mongoose";
import reportChunkModel from "../models/reportChunkModel.js";
import { embedDocuments, isValidVector } from "./rag/embeddingService.js";
import { embeddingTag } from "./rag/config.js";

const BATCH = 100;
const dry = process.argv.includes("--dry-run");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const tag = embeddingTag();
  const filter = { embeddingModel: { $ne: tag } };
  const pending = await reportChunkModel.countDocuments(filter);
  console.log(`[reembed] ${pending} chunk(s) need embedding with ${tag}${dry ? " (dry run)" : ""}`);
  if (dry || !pending) return;

  let done = 0;
  for (;;) {
    const batch = await reportChunkModel.find(filter).limit(BATCH).select("chunkText section metadata.fileName").lean();
    if (!batch.length) break;
    const vectors = await embedDocuments(
      batch.map((c) => ({ title: c.section || c.metadata?.fileName, text: c.chunkText }))
    );
    const updates = batch
      .map((c, i) => {
        const vec = vectors[i];
        if (!isValidVector(vec)) return null;
        return {
          updateOne: {
            filter: { _id: c._id },
            update: { $set: { embedding: vec, embeddingModel: tag, embeddingStatus: "VALID", embeddingError: "" } },
          },
        };
      })
      .filter(Boolean);

    if (updates.length) {
      const res = await reportChunkModel.bulkWrite(updates);
      if (!res.modifiedCount) throw new Error("Nothing was updated - does reportChunkModel have the embeddingModel field?");
    }
    done += batch.length;
    console.log(`[reembed] ${done}/${pending}`);
  }
  console.log("[reembed] done");
}

main()
  .catch((e) => {
    console.error("[reembed] failed:", e);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());