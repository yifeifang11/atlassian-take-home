import OpenAI from "openai";
import { BookData } from "./openLibrary";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RecommendationWithExplanation {
  book: BookData;
  explanation: string;
  similarity?: number;
}

export class OpenAIService {
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }

  async generateBookEmbedding(book: BookData): Promise<number[]> {
    // Combine book metadata for embedding
    const text = `${book.title} by ${book.author}. ${
      book.description
    }. Genres: ${book.genres.join(", ")}`;
    return this.generateEmbedding(text);
  }

  async generateExplanation(
    userQuery: string,
    book: BookData
  ): Promise<string> {
    try {
      const prompt = `You are a helpful book recommendation assistant. 
      
User query: "${userQuery}"

Recommended book:
Title: ${book.title}
Author: ${book.author}
Description: ${book.description}
Genres: ${book.genres.join(", ")}

Generate a brief, friendly explanation (2-3 sentences) of why this book matches the user's request. Focus on the specific elements that align with their query. Start with "We recommended this because..."`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return (
        response.choices[0]?.message?.content ||
        "This book matches your interests based on similar themes and style."
      );
    } catch (error) {
      console.error("Error generating explanation:", error);
      return "This book was recommended based on its similarity to your preferences.";
    }
  }

  // Calculate cosine similarity between two embeddings
  calculateCosineSimilarity(
    embedding1: number[],
    embedding2: number[]
  ): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error("Embeddings must have the same length");
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  async findSimilarBooks(
    queryEmbedding: number[],
    books: Array<{ book: BookData; embedding: number[] }>,
    limit: number = 10
  ): Promise<Array<{ book: BookData; similarity: number }>> {
    const similarities = books.map(({ book, embedding }) => ({
      book,
      similarity: this.calculateCosineSimilarity(queryEmbedding, embedding),
    }));

    // Sort by similarity (descending) and limit results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async generateRecommendationsWithExplanations(
    userQuery: string,
    similarBooks: Array<{ book: BookData; similarity: number }>
  ): Promise<RecommendationWithExplanation[]> {
    const explanationPromises = similarBooks.map(
      async ({ book, similarity }) => {
        const explanation = await this.generateExplanation(userQuery, book);
        return {
          book,
          explanation,
          similarity,
        };
      }
    );

    return Promise.all(explanationPromises);
  }
}

export const openaiService = new OpenAIService();
