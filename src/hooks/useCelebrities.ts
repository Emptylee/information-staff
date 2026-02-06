import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Celebrity, NewsItem } from '@/lib/types';

interface CelebritiesState {
  celebrities: Celebrity[];
  selectedCelebrityId: string | null;
  newsFeed: NewsItem[];
  addCelebrity: (celebrity: Celebrity) => void;
  removeCelebrity: (id: string) => void;
  selectCelebrity: (id: string | null) => void;
  setNewsFeed: (news: NewsItem[]) => void;
}

// Default celebrities
const DEFAULT_CELEBRITIES: Celebrity[] = [
  {
    id: '1',
    name: 'Donald Trump',
    description: '45th President of the United States',
    avatarUrl: 'https://images.unsplash.com/photo-1580128660010-fd027e1e587a?q=80&w=100&auto=format&fit=crop',
    keywords: ['Trump', 'Donald Trump', 'MAGA'],
  },
  {
    id: '2',
    name: 'Elon Musk',
    description: 'CEO of Tesla, SpaceX, and CTO of X',
    avatarUrl: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?q=80&w=100&auto=format&fit=crop',
    keywords: ['Elon Musk', 'Tesla', 'SpaceX', 'Twitter', 'X'],
  },
  {
    id: '3',
    name: 'Li Xiaolai',
    description: 'Bitcoin Tycoon, Author',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
    keywords: ['Li Xiaolai', 'Bitcoin', 'Blockchain'],
  },
];

export const useCelebrities = create<CelebritiesState>()(
  persist(
    (set) => ({
      celebrities: DEFAULT_CELEBRITIES,
      selectedCelebrityId: null,
      newsFeed: [],
      addCelebrity: (celebrity) =>
        set((state) => ({ celebrities: [...state.celebrities, celebrity] })),
      removeCelebrity: (id) =>
        set((state) => ({ 
          celebrities: state.celebrities.filter(c => c.id !== id),
          // If the removed person was selected, deselect them
          selectedCelebrityId: state.selectedCelebrityId === id ? null : state.selectedCelebrityId 
        })),
      selectCelebrity: (id) => set({ selectedCelebrityId: id }),
      setNewsFeed: (news) => set({ newsFeed: news }),
    }),
    {
      name: 'celebrities-storage', // unique name
      partialize: (state) => ({ celebrities: state.celebrities }), // Only persist celebrities list
    }
  )
);
