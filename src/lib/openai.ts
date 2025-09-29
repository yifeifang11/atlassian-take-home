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

  async expandQuerySemantics(userQuery: string): Promise<string> {
    try {
      const prompt = `You are a book recommendation expert. Transform the user's request into abstract themes and emotional concepts that would help find matching books. DO NOT repeat the user's exact words.

User request: "${userQuery}"

Convert this into underlying themes, emotional needs, and genre preferences. Focus on:
- Core emotional needs (joy, connection, growth, etc.)
- Life themes that would resonate
- Genre categories that fulfill this need
- Reader experience goals

IMPORTANT: Use different words than the user's query. Focus on concepts, not literal phrases.

Example: 
Query: "I want to be happy" 
Output: "Uplifting fiction, feel-good stories, personal growth narratives, inspirational content, positive psychology, romance with happy endings, comedic literature, motivational self-help, heartwarming memoirs, adventure stories with triumphant outcomes, books about overcoming adversity, finding love, achieving dreams, emotional healing"`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.8,
      });

      const expansion = response.choices[0]?.message?.content?.trim();
      return expansion || this.getDefaultThemes(userQuery);
    } catch (error) {
      console.error("Error expanding query semantics:", error);
      return this.getDefaultThemes(userQuery);
    }
  }

  private getDefaultThemes(userQuery: string): string {
    const query = userQuery.toLowerCase();

    if (
      query.includes("happy") ||
      query.includes("joy") ||
      query.includes("good")
    ) {
      return "uplifting fiction, feel-good stories, positive psychology, inspirational content, heartwarming narratives, comedy, romance with happy endings, personal growth, motivational literature";
    }
    if (query.includes("love") || query.includes("romance")) {
      return "romantic fiction, love stories, relationship narratives, emotional connection, heartwarming romance, contemporary romance, romantic comedy";
    }
    if (query.includes("adventure") || query.includes("exciting")) {
      return "adventure fiction, thrilling narratives, exploration stories, quest narratives, action-packed novels, heroic journeys";
    }
    if (query.includes("learn") || query.includes("grow")) {
      return "personal development, self-improvement, educational content, skill building, motivational literature, inspirational biographies";
    }

    return "engaging narratives, meaningful stories, character development, emotional depth, thought-provoking content, well-crafted fiction";
  }

  async generateQueryEmbedding(userQuery: string): Promise<number[]> {
    // Expand the query to capture semantic intent
    const expandedQuery = await this.expandQuerySemantics(userQuery);

    // Generate embedding from ONLY the expanded themes, NOT the original query
    // This prevents literal matching on user's exact words
    const thematicQuery = `Themes and concepts: ${expandedQuery}`;

    return this.generateEmbedding(thematicQuery);
  }

  async generateBookEmbedding(book: BookData): Promise<number[]> {
    // Enhanced semantic embedding with themes, mood, and emotional content
    const semanticText = `Book: ${book.title} by ${book.author}.
    
Story and themes: ${book.description}

Genres and categories: ${book.genres.join(", ")}

Emotional tone and themes: This book explores themes of ${this.extractThemesFromGenres(
      book.genres
    )}. 
The story conveys feelings and experiences related to ${this.extractMoodFromDescription(
      book.description,
      book.genres
    )}.

Reader experience: Someone would read this book if they are seeking ${this.extractReaderIntent(
      book.genres,
      book.description
    )}.`;

    return this.generateEmbedding(semanticText);
  }

  private extractThemesFromGenres(genres: string[]): string {
    const themeMap: Record<string, string> = {
      fiction: "human experiences, relationships, personal growth",
      romance: "love, relationships, emotional connection, happiness",
      mystery:
        "problem-solving, intrigue, discovery, intellectual satisfaction",
      fantasy: "adventure, imagination, escapism, heroism",
      "science fiction": "future possibilities, technology, human potential",
      "self-help":
        "personal improvement, motivation, achieving goals, happiness",
      biography: "inspiration, human achievement, overcoming challenges",
      philosophy: "wisdom, understanding life, finding meaning",
      psychology:
        "understanding human nature, mental well-being, personal insight",
      health: "wellness, self-care, physical and mental well-being",
      business: "success, achievement, professional growth",
      history: "understanding the past, learning from experience",
      poetry: "beauty, emotion, artistic expression, deep feelings",
      humor: "joy, laughter, light-heartedness, entertainment",
      adventure: "excitement, courage, exploration, personal challenges",
      drama: "human conflict, emotional depth, life struggles",
      thriller: "excitement, tension, adrenaline, intense experiences",
    };

    const themes = genres
      .map((genre) => {
        const normalizedGenre = genre.toLowerCase();
        return (
          themeMap[normalizedGenre] || "human experiences and personal growth"
        );
      })
      .join(", ");

    return themes;
  }

  private extractMoodFromDescription(
    description: string,
    genres: string[]
  ): string {
    const desc = description.toLowerCase();

    // Look for emotional indicators in description
    if (
      desc.includes("happy") ||
      desc.includes("joy") ||
      desc.includes("uplifting") ||
      desc.includes("inspiring")
    ) {
      return "happiness, joy, positivity, inspiration";
    }
    if (
      desc.includes("love") ||
      desc.includes("romance") ||
      desc.includes("relationship")
    ) {
      return "love, connection, emotional fulfillment";
    }
    if (
      desc.includes("adventure") ||
      desc.includes("journey") ||
      desc.includes("discover")
    ) {
      return "excitement, discovery, personal growth";
    }
    if (
      desc.includes("overcome") ||
      desc.includes("challenge") ||
      desc.includes("struggle")
    ) {
      return "resilience, personal strength, overcoming obstacles";
    }
    if (
      desc.includes("mystery") ||
      desc.includes("secret") ||
      desc.includes("solve")
    ) {
      return "curiosity, intellectual engagement, problem-solving satisfaction";
    }

    // Default based on genres
    const genreStr = genres.join(" ").toLowerCase();
    if (genreStr.includes("romance"))
      return "love, emotional warmth, connection";
    if (genreStr.includes("self-help"))
      return "empowerment, personal growth, improvement";
    if (genreStr.includes("humor") || genreStr.includes("comedy"))
      return "joy, laughter, entertainment";
    if (genreStr.includes("fantasy") || genreStr.includes("adventure"))
      return "wonder, excitement, escapism";

    return "emotional engagement, personal reflection, meaningful experiences";
  }

  private extractReaderIntent(genres: string[], description: string): string {
    const genreStr = genres.join(" ").toLowerCase();
    const desc = description.toLowerCase();

    if (
      genreStr.includes("self-help") ||
      desc.includes("improve") ||
      desc.includes("better")
    ) {
      return "personal improvement, self-development, becoming happier and more fulfilled";
    }
    if (genreStr.includes("romance") || desc.includes("love")) {
      return "emotional connection, love stories, relationship inspiration";
    }
    if (genreStr.includes("humor") || genreStr.includes("comedy")) {
      return "laughter, entertainment, mood lifting, joy";
    }
    if (genreStr.includes("inspiration") || desc.includes("inspire")) {
      return "motivation, inspiration, hope, positive change";
    }
    if (genreStr.includes("adventure") || genreStr.includes("fantasy")) {
      return "escapism, adventure, imagination, excitement";
    }
    if (genreStr.includes("mystery") || genreStr.includes("thriller")) {
      return "intellectual challenge, suspense, engaging puzzles";
    }

    return "engaging stories, emotional experiences, entertainment and insight";
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
    // Pre-filter books for quality - prioritize books with covers and good descriptions
    const qualityBooks = books.filter(({ book }) =>
      this.meetQualityThreshold(book)
    );

    // If we don't have enough quality books, include some lower quality ones
    const booksToProcess = qualityBooks.length >= limit ? qualityBooks : books;

    console.log(`Processing ${booksToProcess.length} books for similarity`);

    const similarities = booksToProcess.map(({ book, embedding }) => {
      const cosineSimilarity = this.calculateCosineSimilarity(
        queryEmbedding,
        embedding
      );

      // Apply semantic boosting based on genre relevance and thematic matching
      const semanticBoost = this.calculateSemanticBoost(book);
      const boostedSimilarity = cosineSimilarity * (1 + semanticBoost);

      return {
        book,
        similarity: boostedSimilarity,
      };
    });

    // Sort by boosted similarity (descending)
    const sortedSimilarities = similarities.sort(
      (a, b) => b.similarity - a.similarity
    );

    // Add diversity to prevent always returning the same books
    const topCandidatesCount = Math.min(limit * 3, sortedSimilarities.length);
    const topBooks = sortedSimilarities.slice(0, topCandidatesCount);

    // Use a weighted random selection to balance similarity with diversity
    const selectedBooks = [];
    const usedAuthors = new Set<string>();

    // First pass: select books prioritizing different authors
    for (const book of topBooks) {
      if (selectedBooks.length >= limit) break;

      // Prefer books from authors we haven't selected yet
      if (!usedAuthors.has(book.book.author)) {
        selectedBooks.push(book);
        usedAuthors.add(book.book.author);
      }
    }

    // Second pass: fill remaining spots with high-similarity books
    for (const book of topBooks) {
      if (selectedBooks.length >= limit) break;

      // Add if not already selected
      if (
        !selectedBooks.find((selected) => selected.book.id === book.book.id)
      ) {
        selectedBooks.push(book);
      }
    }

    // Add some randomness by shuffling the final selection
    for (let i = selectedBooks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedBooks[i], selectedBooks[j]] = [
        selectedBooks[j],
        selectedBooks[i],
      ];
    }

    return selectedBooks;
  }

  private meetQualityThreshold(book: BookData): boolean {
    // Must have a cover image (strong indicator of popularity/quality)
    if (!book.coverUrl) return false;

    // Must have a decent description
    if (book.description.length < 50) return false;

    // Must have at least one genre
    if (book.genres.length === 0) return false;

    // Must not be a generic placeholder
    if (
      book.title.toLowerCase().includes("unknown") ||
      book.author.toLowerCase().includes("unknown")
    )
      return false;

    return true;
  }

  private calculateSemanticBoost(book: BookData): number {
    let boost = 0;

    // MAJOR boost for books with cover images (indicates popularity/quality)
    if (book.coverUrl) {
      boost += 0.4; // Strong signal of a well-documented, popular book
    } else {
      boost -= 0.2; // Penalize books without covers
    }

    // MAJOR boost for books with substantial, quality descriptions
    if (book.description.length > 200) {
      boost += 0.3; // Well-documented books are typically more popular
    } else if (book.description.length > 100) {
      boost += 0.15;
    } else if (book.description.length < 50) {
      boost -= 0.25; // Heavy penalty for poor descriptions
    }

    // Boost books with multiple genres (better categorized = more popular)
    if (book.genres.length >= 3) {
      boost += 0.2;
    } else if (book.genres.length === 0) {
      boost -= 0.2;
    }

    // Boost books with positive/uplifting themes (but not literal titles)
    const positiveKeywords = [
      "joy",
      "love",
      "inspire",
      "hope",
      "success",
      "overcome",
      "achieve",
      "dream",
      "positive",
      "uplifting",
      "heartwarming",
      "feel-good",
      "triumph",
      "healing",
      "growth",
      "transform",
    ];

    const description = book.description.toLowerCase();
    const genres = book.genres.join(" ").toLowerCase();
    const title = book.title.toLowerCase();

    positiveKeywords.forEach((keyword) => {
      // Boost if keyword is in description or genres
      if (description.includes(keyword) || genres.includes(keyword)) {
        boost += 0.05;
      }
      // Small penalty if it's ONLY in the title (likely too literal)
      if (
        title.includes(keyword) &&
        !description.includes(keyword) &&
        !genres.includes(keyword)
      ) {
        boost -= 0.1;
      }
    });

    // MASSIVE boost for popular/mainstream genres
    const popularGenres = [
      "fiction",
      "romance",
      "mystery",
      "thriller",
      "fantasy",
      "science fiction",
      "self-help",
      "biography",
      "memoir",
      "history",
      "contemporary fiction",
      "literary fiction",
      "young adult",
      "adventure",
      "humor",
      "comedy",
    ];

    book.genres.forEach((genre) => {
      if (
        popularGenres.some((popularGenre) =>
          genre.toLowerCase().includes(popularGenre)
        )
      ) {
        boost += 0.15; // Mainstream genres are more likely to be popular
      }
    });

    // Penalize books with generic/template-like descriptions
    const genericPhrases = [
      "a book about",
      "this story",
      "this book tells",
      "in this book",
    ];
    if (genericPhrases.some((phrase) => description.includes(phrase))) {
      boost -= 0.1;
    }

    // Boost books with rich, detailed descriptions (sign of popularity)
    if (
      description.includes("bestseller") ||
      description.includes("award") ||
      description.includes("acclaimed") ||
      description.includes("international")
    ) {
      boost += 0.25;
    }

    return Math.min(boost, 0.8); // Cap boost at 80%
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

  async generateCompletion(
    prompt: string,
    temperature: number = 0.7
  ): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature,
      });

      return response.choices[0]?.message?.content?.trim() || "";
    } catch (error) {
      console.error("Error generating completion:", error);
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();
