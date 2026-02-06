import { NewsItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';

interface NewsFeedProps {
  items: NewsItem[];
}

export function NewsFeed({ items }: NewsFeedProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>No news found. Click Refresh to get the latest updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-lg font-semibold leading-tight">
                {item.title || "No Title"}
              </CardTitle>
              <Badge variant="secondary" className="shrink-0">
                {item.source}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3" />
              {new Date(item.publishedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4 prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </div>
            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
              <a href={item.originalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-3 w-3" />
                Read Original
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
