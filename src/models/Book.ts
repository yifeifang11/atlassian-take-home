import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  coverUrl?: string;
  embedding?: number[];
  openLibraryId?: string;
}

const BookSchema = new Schema<IBook>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    genres: [{ type: String }],
    description: { type: String, required: true },
    coverUrl: { type: String },
    embedding: [{ type: Number }],
    openLibraryId: { type: String },
  },
  {
    timestamps: true,
  }
);

BookSchema.index({ title: "text", author: "text", description: "text" });

export const Book =
  mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);
