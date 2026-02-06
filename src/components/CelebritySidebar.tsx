import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCelebrities } from "@/hooks/useCelebrities";
import { cn } from "@/lib/utils";
import { Plus, User, Trash2 } from "lucide-react";

interface CelebritySidebarProps {
  onAddClick: () => void;
}

export function CelebritySidebar({ onAddClick }: CelebritySidebarProps) {
  const { celebrities, selectedCelebrityId, selectCelebrity, removeCelebrity } = useCelebrities();

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to stop following this person?")) {
        removeCelebrity(id);
    }
  };

  return (
    <div className="w-64 border-r h-screen flex flex-col bg-muted/10">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">Following</h2>
        <Button variant="ghost" size="icon" onClick={onAddClick}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          <Button
            variant={selectedCelebrityId === null ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => selectCelebrity(null)}
          >
            <span className="mr-2">🌍</span>
            All Updates
          </Button>
          
          {celebrities.map((celebrity) => (
            <div
              key={celebrity.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent group",
                selectedCelebrityId === celebrity.id && "bg-accent"
              )}
              onClick={() => selectCelebrity(celebrity.id)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={celebrity.avatarUrl} alt={celebrity.name} />
                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{celebrity.name}</p>
                {celebrity.jobTitle && <p className="text-xs text-muted-foreground truncate">{celebrity.jobTitle}</p>}
              </div>
              <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => handleRemove(e, celebrity.id)}
              >
                  <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
