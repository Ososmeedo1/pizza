import mongoose from "mongoose";
import {loadEnv} from "./load-env.mjs";
import {Admin, AddOn, Category, Product} from "../src/models/index.js";

/**
 * Creates (non-destructively) every index declared in the Mongoose schemas.
 * Schema declarations alone are not enough in production: mongoose
 * autoIndex is disabled in Next.js prod builds, so this script must be
 * run once per environment (local, Vercel/Atlas, ...) via `npm run db:indexes`.
 */
async function main() {
  loadEnv();

  if (!process.env.MONGODB_URI) {
    console.error(
      "MONGODB_URI is not defined. Load an .env.local or .env file with MONGODB_URI and try again."
    );
    process.exit(1);
  }

  try {
    const {connectDB} = await import("../src/lib/db.js");
    await connectDB();

    for (const [label, Model] of [
      ["Product", Product],
      ["Category", Category],
      ["AddOn", AddOn],
      ["Admin", Admin],
    ]) {
      await Model.ensureIndexes();
      const indexes = await Model.listIndexes();
      console.log(`\n=== ${label} indexes (${indexes.length}) ===`);
      for (const spec of indexes) {
        const unique = spec.unique ? " (unique)" : "";
        const keySpec = Object.entries(spec.key)
          .map(([field, order]) => `${field}:${order}`)
          .join(", ");
        console.log(`  [${spec.name}] { ${keySpec} }${unique}`);
      }
    }
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main().catch((error) => {
  console.error(`Index creation failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});