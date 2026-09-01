import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import {
  accounts as initialAccounts,
  ads as initialAds,
  categories as initialCategories,
  contentTypes as initialContentTypes,
  contents as initialContents,
  movieRequests as initialMovieRequests,
  ratings as initialRatings,
  users as initialUsers,
} from '../data/mockData';
import type {
  Account,
  Ad,
  AuthResult,
  AuthSession,
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
  accounts: Account[];
  session: AuthSession | null;
  isAuthenticated: boolean;
  currentUser: User | null;
  isSubscribed: boolean;
  login: (email: string, password: string) => AuthResult;
  signup: (name: string, email: string, password: string) => AuthResult;
  logout: () => void;
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
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [session, setSession] = useState<AuthSession | null>(null);

  const currentUser = session?.user ?? null;
  const isAuthenticated = session !== null;
  const isSubscribed = session
    ? session.isSharedAccess || session.user.isSubscribed
    : false;

  const login = (email: string, password: string): AuthResult => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
    if (!account) {
      return { success: false, error: 'No account found with that email. Please sign up first.' };
    }
    const user = users.find((u) => u.id === account.userId);
    if (!user) {
      return { success: false, error: 'That account is not linked to a valid user.' };
    }
    if (account.password === password) {
      setSession({ user, isSharedAccess: false });
      return { success: true };
    }
    // Shared-password login: someone else's password unlocks access if that other
    // account's subscriber has actively shared their plan with this user.
    const ownerAccount = accounts.find((other) => {
      if (other.id === account.id || other.password !== password) return false;
      const ownerUser = users.find((u) => u.id === other.userId);
      return Boolean(
        ownerUser?.subscription?.isActive &&
          ownerUser.subscription.sharedWithUserIds.includes(user.id),
      );
    });
    if (ownerAccount) {
      setSession({ user, isSharedAccess: true, grantedByUserId: ownerAccount.userId });
      return { success: true };
    }
    return { success: false, error: 'Incorrect password.' };
  };

  const signup = (name: string, email: string, password: string): AuthResult => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!trimmedName || !normalizedEmail || !password) {
      return { success: false, error: 'Name, email, and password are all required.' };
    }
    if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with that email already exists.' };
    }
    const id = `user-${Date.now()}`;
    const newUser: User = {
      id,
      name: trimmedName,
      email: normalizedEmail,
      isSubscribed: false,
    };
    const newAccount: Account = {
      id: `acct-${Date.now()}`,
      userId: id,
      email: normalizedEmail,
      password,
    };
    setUsers((prev) => [...prev, newUser]);
    setAccounts((prev) => [...prev, newAccount]);
    setSession({ user: newUser, isSharedAccess: false });
    return { success: true };
  };

  const logout = () => setSession(null);

  const value: AppState = {
    contents,
    categories,
    contentTypes,
    movieRequests,
    ratings,
    ads,
    users,
    accounts,
    session,
    isAuthenticated,
    currentUser,
    isSubscribed,
    login,
    signup,
    logout,
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
          requestedBy: currentUser?.id ?? 'unknown',
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
        if (!currentUser) return prev;
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
