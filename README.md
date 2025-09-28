# AI-Powered Goodreads Clone

A Next.js application that provides personalized book recommendations using AI, built according to the PRD specifications.

## Features

- **AI-Powered Recommendations**: Uses OpenAI's embedding models and GPT-4o-mini for personalized book suggestions
- **Open Library Integration**: Fetches book data from the Open Library API
- **Personal Bookshelves**: Organize books into Read, To Read, and Currently Reading categories
- **Feedback Loop**: Rate recommendations to improve future suggestions
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **AI Services**: OpenAI API (text-embedding-3-small, gpt-4o-mini)
- **Data Source**: Open Library API
- **Deployment**: Ready for Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or MongoDB Atlas)
- OpenAI API key

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd ai-goodreads
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-goodreads
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Replace with your actual values:
   - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/ai-goodreads`
   - Get OpenAI API key from https://platform.openai.com/

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the application**:
   Navigate to http://localhost:3000

## Usage

### Getting Recommendations

1. **From Homepage**: Enter a description of what you're looking for or click one of the preset options
2. **Example queries**:
   - "I want something like The Martian but funnier"
   - "Cozy fantasy with romance"
   - "Page-turning thrillers"

### Managing Books

1. **Add to Shelves**: Click "Add to To Read" on any recommended book
2. **View Bookshelves**: Use the navigation to see your organized books
3. **Provide Feedback**: Use "Like these" or "Not for me" to improve recommendations

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
