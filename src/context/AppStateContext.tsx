import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  accounts as initialAccounts,
  categories as initialCategories,
  contentTypes as initialContentTypes,
  contents as initialContents,
  movieRequests as initialMovieRequests,
  ratings as initialRatings,
  users as initialUsers,
} from '../data/mockData';
import {
  fetchCategories,
  fetchContentTypes,
  fetchContents,
  fetchMovieRequests,
  fetchProfile,
  fetchRatings,
  insertCategory,
  insertContent,
  insertContentType,
  insertMovieRequest,
  updateMovieRequestStatus as updateMovieRequestStatusApi,
  upsertContent,
  upsertRating,
} from '../api';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import type {
  Account,
  AuthResult,
  AuthSession,
  Category,
  Content,
  ContentType,
  MovieRequest,
  Rating,
  User,
} from '../types';

/** Input for creating new content; `id`/timestamps are assigned by the DB (or the mock fallback). */
type NewContent = Omit<Content, 'id' | 'createdAt' | 'updatedAt'>;
/** Input for creating a new content type; `id` is assigned by the DB (or the mock fallback). */
type NewContentType = Omit<ContentType, 'id'>;
/** Input for creating a new category; `id` is assigned by the DB (or the mock fallback). */
type NewCategory = Omit<Category, 'id'>;

interface AppState {
  contents: Content[];
  categories: Category[];
  contentTypes: ContentType[];
  movieRequests: MovieRequest[];
  ratings: Rating[];
  users: User[];
  accounts: Account[];
  session: AuthSession | null;
  isAuthenticated: boolean;
  currentUser: User | null;
  /** True while the initial Supabase Auth session is being resolved on load. */
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  addContent: (content: NewContent) => void;
  updateContent: (content: Content) => void;
  addContentType: (contentType: NewContentType) => void;
  addCategory: (category: NewCategory) => void;
  submitMovieRequest: (title: string, note?: string) => void;
  updateMovieRequestStatus: (id: string, status: MovieRequest['status']) => void;
  rateContent: (contentId: string, score: number) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [contents, setContents] = useState<Content[]>(initialContents);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [contentTypes, setContentTypes] = useState<ContentType[]>(initialContentTypes);
  const [movieRequests, setMovieRequests] = useState<MovieRequest[]>(initialMovieRequests);
  const [ratings, setRatings] = useState<Rating[]>(initialRatings);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);

  // When Supabase is configured (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY),
  // replace the mock data with live data from the database. Without those
  // env vars, the API layer resolves with the same mock data, so this is a
  // no-op and the app behaves exactly as before.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    void fetchContents().then((data) => !cancelled && setContents(data));
    void fetchCategories().then((data) => !cancelled && setCategories(data));
    void fetchContentTypes().then((data) => !cancelled && setContentTypes(data));
    void fetchMovieRequests().then((data) => !cancelled && setMovieRequests(data));
    void fetchRatings().then((data) => !cancelled && setRatings(data));

    return () => {
      cancelled = true;
    };
  }, []);

  // Auth: when Supabase is configured, hydrate the session from Supabase Auth
  // (instead of the mock `accounts`/`users` arrays) and keep it in sync via
  // `onAuthStateChange`. The signed-in user's profile is loaded from the
  // `profiles` table.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    const hydrateSession = async (authUserId: string | null) => {
      if (!authUserId) {
        if (!cancelled) setSession(null);
        return;
      }
      try {
        const profile = await fetchProfile(authUserId);
        if (cancelled) return;
        if (!profile) {
          // Auth succeeded but no profile row exists yet (e.g. the
          // `handle_new_user` trigger from supabase/schema.sql hasn't run).
          setSession(null);
          return;
        }
        setSession({ user: profile });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load Supabase profile for signed-in user:', err);
        if (!cancelled) setSession(null);
      }
    };

    void supabase.auth.getSession().then(({ data }) => {
      void hydrateSession(data.session?.user.id ?? null).finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      void hydrateSession(newSession?.user.id ?? null);
    });

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const currentUser = session?.user ?? null;
  const isAuthenticated = session !== null;

  const login = async (email: string, password: string): Promise<AuthResult> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

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
      setSession({ user });
      return { success: true };
    }
    return { success: false, error: 'Incorrect password.' };
  };

  const signup = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!trimmedName || !normalizedEmail || !password) {
      return { success: false, error: 'Name, email, and password are all required.' };
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { name: trimmedName } },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with that email already exists.' };
    }
    const id = `user-${Date.now()}`;
    const newUser: User = {
      id,
      name: trimmedName,
      email: normalizedEmail,
    };
    const newAccount: Account = {
      id: `acct-${Date.now()}`,
      userId: id,
      email: normalizedEmail,
      password,
    };
    setUsers((prev) => [...prev, newUser]);
    setAccounts((prev) => [...prev, newAccount]);
    setSession({ user: newUser });
    return { success: true };
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      void supabase.auth.signOut();
      return;
    }
    setSession(null);
  };

  const value: AppState = {
    contents,
    categories,
    contentTypes,
    movieRequests,
    ratings,
    users,
    accounts,
    session,
    isAuthenticated,
    currentUser,
    authLoading,
    login,
    signup,
    logout,
    addContent: (content) => {
      const now = new Date().toISOString();
      const localContent: Content = { ...content, id: `content-${Date.now()}`, createdAt: now, updatedAt: now };
      // Optimistically render with a local id, then reconcile with the
      // database-generated id/timestamps once the insert resolves.
      setContents((prev) => [localContent, ...prev]);
      void insertContent(localContent).then((created) => {
        if (created.id === localContent.id) return;
        setContents((prev) => prev.map((c) => (c.id === localContent.id ? created : c)));
      });
    },
    updateContent: (content) => {
      setContents((prev) => prev.map((c) => (c.id === content.id ? content : c)));
      void upsertContent(content);
    },
    addContentType: (contentType) => {
      const localContentType: ContentType = { ...contentType, id: `ct-${Date.now()}` };
      setContentTypes((prev) => [...prev, localContentType]);
      void insertContentType(contentType).then((created) => {
        if (created.id === localContentType.id) return;
        setContentTypes((prev) => prev.map((ct) => (ct.id === localContentType.id ? created : ct)));
      });
    },
    addCategory: (category) => {
      const localCategory: Category = { ...category, id: `cat-${Date.now()}` };
      setCategories((prev) => [...prev, localCategory]);
      void insertCategory(category).then((created) => {
        if (created.id === localCategory.id) return;
        setCategories((prev) => prev.map((c) => (c.id === localCategory.id ? created : c)));
      });
    },
    submitMovieRequest: (title, note) => {
      const requestedBy = currentUser?.id ?? 'unknown';
      const localRequest: MovieRequest = {
        id: `request-${Date.now()}`,
        title,
        note,
        requestedBy,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setMovieRequests((prev) => [localRequest, ...prev]);
      void insertMovieRequest({ title, note, requestedBy }).then((created) => {
        if (created.id === localRequest.id) return;
        setMovieRequests((prev) => prev.map((r) => (r.id === localRequest.id ? created : r)));
      });
    },
    updateMovieRequestStatus: (id, status) => {
      setMovieRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
      void updateMovieRequestStatusApi(id, status);
    },
    rateContent: (contentId, score) => {
      if (!currentUser) return;
      const userId = currentUser.id;
      setRatings((prev) => {
        const existingIndex = prev.findIndex((r) => r.contentId === contentId && r.userId === userId);
        const localRating: Rating = {
          id: existingIndex >= 0 ? prev[existingIndex].id : `rating-${Date.now()}`,
          contentId,
          userId,
          score,
          createdAt: new Date().toISOString(),
        };
        void upsertRating({ contentId, userId, score }).then((created) => {
          setRatings((current) => {
            const idx = current.findIndex((r) => r.contentId === contentId && r.userId === userId);
            if (idx < 0) return current;
            const copy = [...current];
            copy[idx] = created;
            return copy;
          });
        });
        if (existingIndex >= 0) {
          const copy = [...prev];
          copy[existingIndex] = localRating;
          return copy;
        }
        return [localRating, ...prev];
      });
    },
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
