// components/ArticleDisplay.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_BASE_URL = 'http://localhost:3001/api';

const ArticleDisplay = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/articles`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      setArticles(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async () => {
    if (!scrapeUrl) return;
    
    try {
      setScraping(true);
      const response = await fetch(`${API_BASE_URL}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: scrapeUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to scrape article');
      }

      await fetchArticles();
      setScrapeUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setScraping(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Article Archive</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mb-4">
          <Input
            type="url"
            placeholder="Enter URL to scrape..."
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleScrape}
            disabled={scraping || !scrapeUrl}
          >
            {scraping ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : 'Scrape'}
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <Card key={article._id || article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">
                  {article.title}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {article.source} • {new Date(article.publishDate).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{article.summary}</p>
                <Button
                  variant="outline"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No articles found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDisplay;