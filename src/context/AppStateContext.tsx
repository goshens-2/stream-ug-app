import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ADMIN_EMAIL,
  accounts as initialAccounts,
  categories as initialCategories,
  contentTypes as initialContentTypes,
  contents as initialContents,
  favorites as initialFavorites,
  movieRequests as initialMovieRequests,
  notifications as initialNotifications,
  ratings as initialRatings,
  searchLogs as initialSearchLogs,
  users as initialUsers,
  viewHistory as initialViewHistory,
} from '../data/mockData';
import {
  addFavorite as addFavoriteApi,
  deleteOwnProfile,
  fetchAllProfiles,
  fetchCategories,
  fetchContentTypes,
  fetchContents,
  fetchFavorites,
  fetchMovieRequests,
  fetchNotifications,
  fetchProfile,
  fetchRatings,
  fetchSearchLogs,
  fetchViewHistory,
  insertCategory,
  insertContent,
  insertContentType,
  insertMovieRequest,
  insertNotification,
  insertSearchLog,
  markNotificationRead as markNotificationReadApi,
  removeFavorite as removeFavoriteApi,
  setProfileAdmin,
  updateAuthPassword,
  updateMovieRequestStatus as updateMovieRequestStatusApi,
  updateProfileName,
  upsertContent,
  upsertRating,
  upsertViewHistory,
} from '../api';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import type {
  Account,
  AuthResult,
  AuthSession,
  Category,
  Content,
  ContentType,
  Favorite,
  MovieRequest,
  Notification,
  Rating,
  SearchLogEntry,
  User,
  ViewHistoryEntry,
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
  favorites: Favorite[];
  viewHistory: ViewHistoryEntry[];
  searchLogs: SearchLogEntry[];
  notifications: Notification[];
  session: AuthSession | null;
  isAuthenticated: boolean;
  currentUser: User | null;
  /** True while the initial Supabase Auth session is being resolved on load. */
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (username: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  addContent: (content: NewContent) => Promise<AuthResult>;
  updateContent: (content: Content) => Promise<AuthResult>;
  addContentType: (contentType: NewContentType) => void;
  addCategory: (category: NewCategory) => void;
  submitMovieRequest: (title: string, note?: string) => void;
  updateMovieRequestStatus: (
    id: string,
    status: MovieRequest['status'],
    fulfilledContentId?: string,
  ) => void;
  rateContent: (contentId: string, score: number) => void;
  isFavorite: (contentId: string) => boolean;
  toggleFavorite: (contentId: string) => void;
  recordView: (contentId: string, progressSeconds: number, durationSeconds: number) => void;
  logSearch: (query: string, matchedContentId?: string) => void;
  markNotificationRead: (id: string) => void;
  changeUsername: (name: string) => Promise<AuthResult>;
  changePassword: (password: string) => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
  /** Admin-only: promotes/demotes another user's admin flag (`profiles.is_admin`). */
  setUserAdmin: (userId: string, isAdmin: boolean) => Promise<AuthResult>;
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
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites);
  const [viewHistory, setViewHistory] = useState<ViewHistoryEntry[]>(initialViewHistory);
  const [searchLogs, setSearchLogs] = useState<SearchLogEntry[]>(initialSearchLogs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);

  // Load database-backed app data only after a Supabase user session exists.
  // The catalog and personal records are protected by authenticated RLS policies.
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user.id) return;
    let cancelled = false;

    void fetchContents().then((data) => !cancelled && setContents(data));
    void fetchCategories().then((data) => !cancelled && setCategories(data));
    void fetchContentTypes().then((data) => !cancelled && setContentTypes(data));
    void fetchMovieRequests().then((data) => !cancelled && setMovieRequests(data));
    void fetchRatings().then((data) => !cancelled && setRatings(data));
    void fetchFavorites().then((data) => !cancelled && setFavorites(data));
    void fetchViewHistory().then((data) => !cancelled && setViewHistory(data));
    void fetchSearchLogs().then((data) => !cancelled && setSearchLogs(data));
    void fetchNotifications().then((data) => !cancelled && setNotifications(data));
    // Only returns more than the caller's own row for a signed-in admin (see
    // the "Admins can view all profiles" RLS policy), so this is safe to
    // call unconditionally; non-admins just get their own profile back.
    void fetchAllProfiles()
      .then((data) => !cancelled && setUsers(data))
      .catch(() => {
        // Not signed in yet, or RLS restricted the read — keep mock users.
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

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

  const signup = async (username: string, email: string, password: string): Promise<AuthResult> => {
    const trimmedName = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!trimmedName || !normalizedEmail || !password) {
      return { success: false, error: 'Username, email, and password are all required.' };
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
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error:
          'This email is reserved for the admin account. Set VITE_MOCK_ADMIN_PASSWORD in your .env ' +
          'to enable admin login (see README), or sign up with a different email.',
      };
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
    favorites,
    viewHistory,
    searchLogs,
    notifications,
    session,
    isAuthenticated,
    currentUser,
    authLoading,
    login,
    signup,
    logout,
    addContent: async (content) => {
      const now = new Date().toISOString();
      const localContent: Content = { ...content, id: `content-${Date.now()}`, createdAt: now, updatedAt: now };
      try {
        const created = await insertContent(localContent);
        setContents((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unable to publish this movie.' };
      }
    },
    updateContent: async (content) => {
      const updated = { ...content, updatedAt: new Date().toISOString() };
      try {
        await upsertContent(updated);
        setContents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Unable to save movie changes.' };
      }
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
    updateMovieRequestStatus: (id, status, fulfilledContentId) => {
      setMovieRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, fulfilledContentId: fulfilledContentId ?? r.fulfilledContentId } : r)),
      );
      void updateMovieRequestStatusApi(id, status, fulfilledContentId);

      // Notify the requester when their request is fulfilled, so they can
      // find the uploaded content from "My Watchlist".
      if (status === 'fulfilled') {
        const request = movieRequests.find((r) => r.id === id);
        const contentId = fulfilledContentId ?? request?.fulfilledContentId;
        const requestedBy = request?.requestedBy;
        if (requestedBy && requestedBy !== 'unknown') {
          const content = contentId ? contents.find((c) => c.id === contentId) : undefined;
          const localNotification: Notification = {
            id: `notif-${Date.now()}`,
            userId: requestedBy,
            type: 'request_fulfilled',
            message: content
              ? `Your requested title "${content.title}" is now available to watch!`
              : `Your requested title "${request?.title}" is now available to watch!`,
            contentId,
            read: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications((prev) => [localNotification, ...prev]);
          void insertNotification({
            userId: requestedBy,
            type: 'request_fulfilled',
            message: localNotification.message,
            contentId,
          }).then((created) => {
            if (created.id === localNotification.id) return;
            setNotifications((prev) => prev.map((n) => (n.id === localNotification.id ? created : n)));
          });
        }
      }
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
    isFavorite: (contentId) => {
      if (!currentUser) return false;
      return favorites.some((f) => f.userId === currentUser.id && f.contentId === contentId);
    },
    toggleFavorite: (contentId) => {
      if (!currentUser) return;
      const userId = currentUser.id;
      const existing = favorites.find((f) => f.userId === userId && f.contentId === contentId);
      if (existing) {
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        void removeFavoriteApi(userId, contentId);
        return;
      }
      const localFavorite: Favorite = {
        id: `fav-${Date.now()}`,
        userId,
        contentId,
        createdAt: new Date().toISOString(),
      };
      setFavorites((prev) => [localFavorite, ...prev]);
      void addFavoriteApi(userId, contentId).then((created) => {
        if (created.id === localFavorite.id) return;
        setFavorites((prev) => prev.map((f) => (f.id === localFavorite.id ? created : f)));
      });
    },
    recordView: (contentId, progressSeconds, durationSeconds) => {
      if (!currentUser) return;
      const userId = currentUser.id;
      setViewHistory((prev) => {
        const existingIndex = prev.findIndex((v) => v.userId === userId && v.contentId === contentId);
        const localEntry: ViewHistoryEntry = {
          id: existingIndex >= 0 ? prev[existingIndex].id : `view-${Date.now()}`,
          userId,
          contentId,
          progressSeconds,
          durationSeconds,
          updatedAt: new Date().toISOString(),
        };
        if (existingIndex >= 0) {
          const copy = [...prev];
          copy[existingIndex] = localEntry;
          return copy;
        }
        return [localEntry, ...prev];
      });
      void upsertViewHistory({ userId, contentId, progressSeconds, durationSeconds });
    },
    logSearch: (query, matchedContentId) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const localEntry: SearchLogEntry = {
        id: `search-${Date.now()}`,
        userId: currentUser?.id,
        query: trimmed,
        matchedContentId,
        createdAt: new Date().toISOString(),
      };
      setSearchLogs((prev) => [localEntry, ...prev]);
      void insertSearchLog({ userId: currentUser?.id, query: trimmed, matchedContentId });
    },
    markNotificationRead: (id) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      void markNotificationReadApi(id);
    },
    changeUsername: async (name) => {
      const trimmed = name.trim();
      if (!currentUser) return { success: false, error: 'You must be signed in.' };
      if (!trimmed) return { success: false, error: 'Username is required.' };

      if (isSupabaseConfigured) {
        try {
          await updateProfileName(currentUser.id, trimmed);
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : 'Unable to update username.' };
        }
      }
      setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, name: trimmed } : u)));
      setSession((prev) => (prev ? { user: { ...prev.user, name: trimmed } } : prev));
      return { success: true };
    },
    changePassword: async (password) => {
      if (!currentUser) return { success: false, error: 'You must be signed in.' };
      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters.' };
      }

      if (isSupabaseConfigured) {
        try {
          await updateAuthPassword(password);
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : 'Unable to change password.' };
        }
        return { success: true };
      }

      setAccounts((prev) => prev.map((a) => (a.userId === currentUser.id ? { ...a, password } : a)));
      return { success: true };
    },
    deleteAccount: async () => {
      if (!currentUser) return { success: false, error: 'You must be signed in.' };
      const userId = currentUser.id;

      if (isSupabaseConfigured) {
        try {
          await deleteOwnProfile(userId);
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : 'Unable to delete account.' };
        }
        void supabase.auth.signOut();
        return { success: true };
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setAccounts((prev) => prev.filter((a) => a.userId !== userId));
      setSession(null);
      return { success: true };
    },
    setUserAdmin: async (userId, isAdmin) => {
      if (!currentUser?.isAdmin) return { success: false, error: 'You must be an admin.' };

      if (isSupabaseConfigured) {
        try {
          await setProfileAdmin(userId, isAdmin);
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : 'Unable to update user.' };
        }
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isAdmin } : u)));
      return { success: true };
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
