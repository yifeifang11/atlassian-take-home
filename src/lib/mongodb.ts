import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: CachedConnection | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
const cached: CachedConnection = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  console.log("dbConnect called");
  
  if (cached.conn) {
    console.log("Using cached connection");
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined");
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (!cached.promise) {
    console.log("Creating new database connection");
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("Database connected successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("Database connection established");
  } catch (e) {
    console.error("Database connection failed:", e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
