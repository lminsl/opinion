import express, { Request, Response, RequestHandler } from 'express';
import mongoose, { Schema } from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { IArticle } from './types';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/article-scraper';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Article Schema
const articleSchema = new Schema<IArticle>({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: String,
  url: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  publishDate: { type: Date, required: true },
  scrapedAt: { type: Date, default: Date.now }
});

const Article = mongoose.model<IArticle>('Article', articleSchema);

// Route handlers
const getArticles: RequestHandler = async (_req, res) => {
  try {
    const articles = await Article.find().sort({ publishDate: -1 });
    console.log(`Found ${articles.length} articles`);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
};

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Article Scraper API is running!' });
});

app.get('/articles', getArticles);

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Available endpoints:');
      console.log('- GET /articles');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();