import mongoose from "mongoose";

const globalWithMongoose = globalThis;

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * A cached Mongoose connection shared across hot-reloads in dev.
 *
 * In Next.js dev, modules can be reloaded while the process stays alive,
 * which would otherwise create duplicate connections. Storing the
 * connection (or an in-flight promise) on `globalThis` prevents that.
 */
export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined. Add it to your environment variables (e.g. in .env.local or .env.example)."
    );
  }

  if (globalWithMongoose.mongooseCache) {
    return globalWithMongoose.mongooseCache;
  }

  mongoose.set("strictQuery", true);

  globalWithMongoose.mongooseCache = mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    })
    .then(() => mongoose.connection);

  try {
    await globalWithMongoose.mongooseCache;
  } catch (error) {
    delete globalWithMongoose.mongooseCache;
    throw new Error(
      `Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`,
      {cause: error}
    );
  }

  return globalWithMongoose.mongooseCache;
}