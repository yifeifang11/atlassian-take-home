import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("=== TEST DB ROUTE START ===");
    console.log("Environment check:");
    console.log("- NODE_ENV:", process.env.NODE_ENV);
    console.log("- MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("- MONGODB_URI length:", process.env.MONGODB_URI?.length || 0);
    
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is missing!");
      return NextResponse.json(
        { 
          error: "MONGODB_URI environment variable is not set",
          env: process.env.NODE_ENV 
        },
        { status: 500 }
      );
    }

    console.log("Attempting to connect to database...");
    const connection = await dbConnect();
    console.log("Database connection successful!");
    console.log("Connection state:", connection.connection.readyState);
    console.log("Database name:", connection.connection.db?.databaseName);
    
    // Test a simple query
    console.log("Testing database query...");
    const collections = await connection.connection.db?.listCollections().toArray();
    console.log("Collections found:", collections?.map(c => c.name));

    console.log("=== TEST DB ROUTE SUCCESS ===");
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      connectionState: connection.connection.readyState,
      databaseName: connection.connection.db?.databaseName,
      collections: collections?.map(c => c.name) || [],
      env: process.env.NODE_ENV
    });

  } catch (error) {
    console.error("=== TEST DB ROUTE ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : undefined);
    
    return NextResponse.json(
      { 
        error: "Database connection failed",
        message: error instanceof Error ? error.message : "Unknown error",
        env: process.env.NODE_ENV
      },
      { status: 500 }
    );
  }
}