# AI-Powered Goodreads Clone

A Next.js application that provides personalized book recommendations using AI, featuring a comprehensive book database and intelligent feedback system.

## Features

- **AI-Powered Recommendations**: Uses OpenAI's GPT-4 for personalized book suggestions with natural language queries
- **Comprehensive Book Database**: 282+ curated books across diverse genres and authors
- **Personal Bookshelves**: Organize books into Read, Currently Reading, and Want to Read categories with visual progress tracking
- **Intelligent Feedback System**: Rate recommendations with detailed feedback to improve future suggestions
- **Enhanced Search**: Advanced search functionality with dropdown suggestions and sticky navigation
- **Profile Management**: Customizable user profiles with reading preferences and personalized settings
- **Golden Gradient AI Interface**: Visually appealing AI recommendation box with subtle golden gradient styling
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS, optimized for all devices
- **Production Ready**: Deployed on Vercel with proper environment configuration

## Tech Stack

- **Frontend**: Next.js 15.5.4 with TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes with comprehensive REST endpoints
- **Database**: MongoDB with Mongoose ODM
  - UserState model for reading progress and bookshelves
  - UserPreferences model for personalized settings
  - RecommendationFeedback model for AI learning
- **AI Services**: OpenAI API (GPT-4) for intelligent recommendations
- **Book Data**: Curated internal database with 282+ unique books
- **Deployment**: Vercel with production environment configuration
- **Styling**: Custom Tailwind CSS with golden gradient effects and responsive design

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

### Getting AI Recommendations

1. **From Homepage**: Use the golden gradient AI recommendation box to enter natural language queries
2. **Preset Options**: Quick access buttons for common moods and preferences
3. **Example queries**:
   - "I want something like The Martian but funnier"
   - "Cozy fantasy with romance"
   - "Page-turning thrillers"
   - "Literary fiction about family relationships"

### Managing Your Library

1. **Add to Shelves**: Click "Add to Want to Read" on any recommended book
2. **View Bookshelves**: Navigate to your personal library with organized shelves
3. **Update Reading Status**: Move books between Read, Currently Reading, and Want to Read
4. **Rate Books**: Provide star ratings to improve future recommendations
5. **Search Your Books**: Use the enhanced search functionality to find books in your collection

### Providing Feedback

1. **Rate Recommendations**: Use "Like these recommendations" or "Not for me" buttons
2. **Detailed Feedback**: Provide specific feedback on why recommendations worked or didn't
3. **Profile Preferences**: Update your reading preferences in the profile section
4. **AI Learning**: The system continuously improves based on your feedback patterns

### Profile Customization

1. **Personal Information**: Update your profile picture and reading preferences
2. **Reading Preferences**: Set preferred genres, book lengths, and reading goals
3. **Privacy Settings**: Control what information is shared and displayed

## Key Features & Implementation

### Database Architecture
- **Comprehensive Book Collection**: 282+ carefully curated books with complete metadata
- **Deduplication System**: Automated removal of duplicate entries for data integrity
- **Diverse Content**: Books spanning multiple genres, time periods, and cultural perspectives
- **Rich Metadata**: Each book includes title, author, genres, descriptions, cover URLs, and tags

### User Experience Enhancements
- **Sticky Navigation**: Always-accessible navigation bar with improved search functionality
- **Visual Design**: Custom golden gradient styling for the AI recommendation interface
- **Responsive Layout**: Optimized for desktop, tablet, and mobile viewing
- **Clean UI**: Removed non-functional elements for a streamlined experience
- **Dark Mode Prevention**: Consistent light theme experience across all devices

### AI & Personalization
- **Natural Language Processing**: Advanced query understanding for conversational book discovery
- **Feedback Learning**: Sophisticated feedback collection system that improves recommendations
- **User Preference Tracking**: Detailed preference models including genre, length, and mood preferences
- **Historical Pattern Recognition**: AI learns from past interactions to predict future preferences

### Production Deployment
- **Vercel Integration**: Fully configured for production deployment with environment variables
- **Performance Optimization**: Fast loading times with Next.js optimization features
- **Error Handling**: Comprehensive error management and graceful degradation
- **Scalable Architecture**: Built to handle growing user bases and expanding book databases

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
