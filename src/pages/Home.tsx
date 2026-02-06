import { useState } from 'react';
import { CelebritySidebar } from '@/components/CelebritySidebar';
import { AddCelebrityDialog } from '@/components/AddCelebrityDialog';
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { useCelebrities } from "@/hooks/useCelebrities";
import { fetchLatestNews, summarizeNews } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { NewsFeed } from "@/components/NewsFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  
  const { celebrities, selectedCelebrityId, newsFeed, setNewsFeed } = useCelebrities();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSummary(''); // Clear old summary on refresh
    try {
      let targets = celebrities;
      if (selectedCelebrityId) {
        targets = celebrities.filter(c => c.id === selectedCelebrityId);
      }
      
      if (targets.length === 0) {
          toast({ title: "No targets", description: "Please add people to follow." });
          setIsRefreshing(false);
          return;
      }

      // Parallel fetch
      const results = await Promise.all(targets.map(c => fetchLatestNews(c)));
      // Flat and sort by date descending
      const allNews = results.flat().sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      
      setNewsFeed(allNews);
      toast({ 
        title: "Updated", 
        description: `Found ${allNews.length} new items from ${targets.length} sources.` 
      });
    } catch (error) {
      console.error(error);
      toast({ 
        title: "Error", 
        variant: "destructive", 
        description: "Failed to fetch news. Check API keys." 
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSummarize = async () => {
    if (newsFeed.length === 0) return;
    setIsSummarizing(true);
    try {
      const text = await summarizeNews(newsFeed.slice(0, 20)); // Limit to top 20 to save tokens
      setSummary(text);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to generate summary.", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  const selectedPerson = celebrities.find(c => c.id === selectedCelebrityId);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CelebritySidebar onAddClick={() => setIsAddDialogOpen(true)} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b p-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {selectedPerson ? selectedPerson.name : 'News Feed'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedPerson ? 'Latest updates' : 'Real-time updates from everyone'}
            </p>
          </div>
          <div className="flex gap-2">
            {newsFeed.length > 0 && (
              <Button 
                onClick={handleSummarize} 
                disabled={isSummarizing || isRefreshing}
                variant="secondary"
              >
                <Sparkles className={`mr-2 h-4 w-4 ${isSummarizing ? 'animate-pulse' : ''}`} />
                AI Summary
              </Button>
            )}
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              variant="outline"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            {summary && (
              <Card className="bg-muted/30 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Briefing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {summary}
                  </div>
                </CardContent>
              </Card>
            )}
            <NewsFeed items={newsFeed} />
          </div>
        </div>
      </main>

      <AddCelebrityDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
}
