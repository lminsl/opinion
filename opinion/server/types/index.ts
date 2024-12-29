import { Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: string;
  publishDate: Date;
  scrapedAt: Date;
}

export interface ScrapeRequestBody {
  url: string;
}