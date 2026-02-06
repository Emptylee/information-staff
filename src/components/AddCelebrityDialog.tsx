import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCelebrities } from "@/hooks/useCelebrities";
import { Search, Loader2, UserPlus, User } from "lucide-react";
import { Celebrity } from "@/lib/types";
import { searchPerson } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AddCelebrityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCelebrityDialog({ open, onOpenChange }: AddCelebrityDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<Celebrity | null>(null);
  const { addCelebrity } = useCelebrities();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    
    try {
      const result = await searchPerson(searchQuery);
      setSearchResult(result);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Could not find the person. Please check your API keys and network.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmAdd = () => {
    if (searchResult) {
      addCelebrity(searchResult);
      onOpenChange(false);
      setSearchResult(null);
      setSearchQuery('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Person</DialogTitle>
          <DialogDescription>
            Search for a public figure to follow their latest updates.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSearch} className="flex gap-2 my-4">
          <Input
            placeholder="Enter name (e.g. Sam Altman)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>

        {searchResult && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={searchResult.avatarUrl} />
                <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{searchResult.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {searchResult.description}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleConfirmAdd} className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Confirm & Follow
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
