import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ads as initialAds,
  categories as initialCategories,
  contentTypes as initialContentTypes,
  contents as initialContents,
  movieRequests as initialMovieRequests,
  ratings as initialRatings,
  users as initialUsers,
} from '../data/mockData';
import type {
  Ad,
  Category,
  Content,
  ContentType,
  MovieRequest,
  Rating,
  User,
} from '../types';

interface AppState {
  contents: Content[];
  categories: Category[];
  contentTypes: ContentType[];
  movieRequests: MovieRequest[];
  ratings: Rating[];
  ads: Ad[];
  users: User[];
  currentUser: User;
  isSubscribed: boolean;
  toggleSubscription: () => void;
  addContent: (content: Content) => void;
  updateContent: (content: Content) => void;
  addContentType: (contentType: ContentType) => void;
  submitMovieRequest: (title: string, note?: string) => void;
  updateMovieRequestStatus: (id: string, status: MovieRequest['status']) => void;
  rateContent: (contentId: string, score: number) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<Content[]>(initialContents);
  const [categories] = useState<Category[]>(initialCategories);
  const [contentTypes, setContentTypes] = useState<ContentType[]>(initialContentTypes);
  const [movieRequests, setMovieRequests] = useState<MovieRequest[]>(initialMovieRequests);
  const [ratings, setRatings] = useState<Rating[]>(initialRatings);
  const [ads] = useState<Ad[]>(initialAds);
  const [users] = useState<User[]>(initialUsers);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const currentUser: User = useMemo(
    () => ({ ...users[0], isSubscribed }),
    [users, isSubscribed],
  );

  const value: AppState = {
    contents,
    categories,
    contentTypes,
    movieRequests,
    ratings,
    ads,
    users,
    currentUser,
    isSubscribed,
    toggleSubscription: () => setIsSubscribed((prev) => !prev),
    addContent: (content) => setContents((prev) => [content, ...prev]),
    updateContent: (content) =>
      setContents((prev) => prev.map((c) => (c.id === content.id ? content : c))),
    addContentType: (contentType) =>
      setContentTypes((prev) => [...prev, contentType]),
    submitMovieRequest: (title, note) =>
      setMovieRequests((prev) => [
        {
          id: `request-${Date.now()}`,
          title,
          note,
          requestedBy: currentUser.id,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]),
    updateMovieRequestStatus: (id, status) =>
      setMovieRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      ),
    rateContent: (contentId, score) =>
      setRatings((prev) => {
        const existingIndex = prev.findIndex(
          (r) => r.contentId === contentId && r.userId === currentUser.id,
        );
        const newRating: Rating = {
          id: existingIndex >= 0 ? prev[existingIndex].id : `rating-${Date.now()}`,
          contentId,
          userId: currentUser.id,
          score,
          createdAt: new Date().toISOString(),
        };
        if (existingIndex >= 0) {
          const copy = [...prev];
          copy[existingIndex] = newRating;
          return copy;
        }
        return [newRating, ...prev];
      }),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
