import type {
  Account,
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

/** Sample content types the admin has defined. */
export const contentTypes: ContentType[] = [
  { id: 'ct-movie', name: 'Movie', description: 'Standalone feature film' },
  { id: 'ct-series', name: 'Series', description: 'Multi-episode show' },
  { id: 'ct-music-video', name: 'Music Video', description: 'Short-form music content' },
  { id: 'ct-documentary', name: 'Documentary' },
  { id: 'ct-show', name: 'TV Show' },
];

/** Sample categories used to group content on the User Panel. */
export const categories: Category[] = [
  { id: 'cat-translated', name: 'Translated Movies', slug: 'translated-movies' },
  { id: 'cat-local-music', name: 'Local Music Videos / Audios', slug: 'local-music' },
  { id: 'cat-comedy', name: 'Comedy Shows', slug: 'comedy-shows' },
  { id: 'cat-cartoons', name: 'Cartoons', slug: 'cartoons' },
  { id: 'cat-sports', name: 'Sports & Football Analysis', slug: 'sports-football-analysis' },
  { id: 'cat-non-translated', name: 'Non-translated Movies', slug: 'non-translated-movies' },
  { id: 'cat-anime', name: 'Anime', slug: 'anime' },
  { id: 'cat-campus', name: 'Campus Entertainment', slug: 'campus-entertainment' },
  { id: 'cat-soaps', name: 'Local Soaps / Series', slug: 'local-soaps-series' },
  { id: 'cat-news', name: 'News', slug: 'news' },
  { id: 'cat-talk-shows', name: 'Talk Shows', slug: 'talk-shows' },
  { id: 'cat-intl-movies', name: 'Nigerian & Indian & Korean & Chinese Movies', slug: 'international-movies' },
  { id: 'cat-telenovelas', name: 'Telenovelas', slug: 'telenovelas' },
];

const now = new Date().toISOString();

const posterFor = (seed: string) => `https://picsum.photos/seed/${seed}/400/560`;
const sampleVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const defaultWatermark = {
  enabled: true,
  text: 'STREAM UG',
  opacity: 0.5,
  position: 'bottom-right' as const,
};

/** Sample content library, at least one item per category. */
export const contents: Content[] = [
  {
    id: 'content-1',
    title: 'The Return Home',
    description: 'A translated drama about a family reuniting after years apart.',
    contentTypeId: 'ct-movie',
    categoryId: 'cat-translated',
    posterUrl: posterFor('return-home'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 118,
    releaseYear: 2022,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-2',
    title: 'Kampala Nights (Music Video)',
    description: 'A local artist music video celebrating Kampala nightlife.',
    contentTypeId: 'ct-music-video',
    categoryId: 'cat-local-music',
    posterUrl: posterFor('kampala-nights'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 4,
    releaseYear: 2023,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-3',
    title: 'Laugh Uganda Live',
    description: 'A stand-up comedy special recorded live in Kampala.',
    contentTypeId: 'ct-show',
    categoryId: 'cat-comedy',
    posterUrl: posterFor('laugh-uganda'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 62,
    releaseYear: 2021,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-4',
    title: 'Jungle Friends',
    description: 'An animated series for the whole family.',
    contentTypeId: 'ct-series',
    categoryId: 'cat-cartoons',
    posterUrl: posterFor('jungle-friends'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 22,
    releaseYear: 2020,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-5',
    title: 'Cranes Matchday Analysis',
    description: 'Weekly breakdown of the Uganda Cranes latest match.',
    contentTypeId: 'ct-show',
    categoryId: 'cat-sports',
    posterUrl: posterFor('cranes-analysis'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 35,
    releaseYear: 2024,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-6',
    title: 'Original Language Feature',
    description: 'A non-translated feature film in its original language.',
    contentTypeId: 'ct-movie',
    categoryId: 'cat-non-translated',
    posterUrl: posterFor('original-language'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 101,
    releaseYear: 2019,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-7',
    title: 'Blade of the East',
    description: 'An action-packed anime following a young swordsman.',
    contentTypeId: 'ct-series',
    categoryId: 'cat-anime',
    posterUrl: posterFor('blade-of-east'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 24,
    releaseYear: 2023,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-8',
    title: 'Campus Vibes',
    description: 'A reality show following campus life and entertainment.',
    contentTypeId: 'ct-show',
    categoryId: 'cat-campus',
    posterUrl: posterFor('campus-vibes'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 40,
    releaseYear: 2024,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-9',
    title: 'Neighbours of Mengo',
    description: 'A beloved local soap opera following a Kampala neighborhood.',
    contentTypeId: 'ct-series',
    categoryId: 'cat-soaps',
    posterUrl: posterFor('neighbours-mengo'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 26,
    releaseYear: 2022,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-10',
    title: 'UG Evening News',
    description: 'Daily news roundup covering national and regional stories.',
    contentTypeId: 'ct-show',
    categoryId: 'cat-news',
    posterUrl: posterFor('ug-evening-news'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 30,
    releaseYear: 2024,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-11',
    title: 'The Sit Down',
    description: 'A talk show featuring conversations with local celebrities.',
    contentTypeId: 'ct-show',
    categoryId: 'cat-talk-shows',
    posterUrl: posterFor('the-sit-down'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 45,
    releaseYear: 2023,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-12',
    title: 'Lagos to Lahore',
    description: 'A crowd favorite blending Nigerian and Indian storytelling.',
    contentTypeId: 'ct-movie',
    categoryId: 'cat-intl-movies',
    posterUrl: posterFor('lagos-to-lahore'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 132,
    releaseYear: 2021,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'content-13',
    title: 'Hearts in Havana',
    description: 'A dramatic telenovela full of romance and betrayal.',
    contentTypeId: 'ct-series',
    categoryId: 'cat-telenovelas',
    posterUrl: posterFor('hearts-havana'),
    trailerUrl: sampleVideo,
    videoUrl: sampleVideo,
    watermark: defaultWatermark,
    durationMinutes: 42,
    releaseYear: 2020,
    createdAt: now,
    updatedAt: now,
  },
];

/** Sample ratings used to seed the recommendation scaffold. */
export const ratings: Rating[] = [
  { id: 'rating-1', contentId: 'content-1', userId: 'user-1', score: 5, createdAt: now },
  { id: 'rating-2', contentId: 'content-7', userId: 'user-1', score: 4, createdAt: now },
  { id: 'rating-3', contentId: 'content-12', userId: 'user-2', score: 5, createdAt: now },
];

/** Sample movie requests submitted by users, visible to admins. */
export const movieRequests: MovieRequest[] = [
  {
    id: 'request-1',
    title: 'Queen of Katwe 2',
    note: 'Would love a sequel to the original!',
    requestedBy: 'user-1',
    status: 'pending',
    createdAt: now,
  },
  {
    id: 'request-2',
    title: 'Latest Korean drama season',
    requestedBy: 'user-2',
    status: 'approved',
    createdAt: now,
  },
  {
    id: 'request-3',
    title: 'Hearts in Havana',
    note: 'Heard great things about this telenovela!',
    requestedBy: 'user-2',
    status: 'fulfilled',
    createdAt: now,
    fulfilledContentId: 'content-13',
  },
];

/** Sample favorites/watchlist entries. */
export const favorites: Favorite[] = [
  { id: 'fav-1', userId: 'user-1', contentId: 'content-7', createdAt: now },
  { id: 'fav-2', userId: 'user-2', contentId: 'content-12', createdAt: now },
];

/** Sample view history, used for "Continue Watching" / "Recently Viewed". */
export const viewHistory: ViewHistoryEntry[] = [
  {
    id: 'view-1',
    userId: 'user-1',
    contentId: 'content-1',
    progressSeconds: 42,
    durationSeconds: 118 * 60,
    updatedAt: now,
  },
  {
    id: 'view-2',
    userId: 'user-1',
    contentId: 'content-12',
    progressSeconds: 132 * 60,
    durationSeconds: 132 * 60,
    updatedAt: now,
  },
];

/** Sample search history, used to power "most searched movie" admin analytics. */
export const searchLogs: SearchLogEntry[] = [
  { id: 'search-1', userId: 'user-1', query: 'blade of the east', matchedContentId: 'content-7', createdAt: now },
  { id: 'search-2', userId: 'user-2', query: 'lagos to lahore', matchedContentId: 'content-12', createdAt: now },
  { id: 'search-3', userId: 'user-1', query: 'lagos to lahore', matchedContentId: 'content-12', createdAt: now },
];

/** Sample notifications, e.g. alerting a user their request was fulfilled. */
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-2',
    type: 'request_fulfilled',
    message: 'Your requested title "Hearts in Havana" is now available to watch!',
    contentId: 'content-13',
    read: false,
    createdAt: now,
  },
];

/**
 * Reserved email for the app's admin account. Signing in with this email
 * (mock mode) or having this email's Supabase profile flagged `is_admin`
 * (Supabase mode) routes into the Admin Panel — see the "Admin access"
 * section of the README.
 */
export const ADMIN_EMAIL = 'admin@stream.com';

/** Sample users. */
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Aisha Namutebi',
    email: 'aisha@example.com',
    isAdmin: true,
  },
  {
    id: 'user-2',
    name: 'Brian Okello',
    email: 'brian@example.com',
  },
  {
    id: 'user-admin',
    name: 'Admin',
    email: ADMIN_EMAIL,
    isAdmin: true,
  },
];

/**
 * Sample login credentials, one per user (mock mode only; Supabase mode uses
 * Supabase Auth instead — see README).
 *
 * The admin account's password is intentionally *not* hardcoded here. Set
 * `VITE_MOCK_ADMIN_PASSWORD` in your `.env` (see `.env.example`) to bootstrap
 * a local password for `admin@stream.com`; without it, the mock admin
 * account has no usable password and can't be logged into.
 */
export const accounts: Account[] = [
  { id: 'acct-1', userId: 'user-1', email: 'aisha@example.com', password: 'password123' },
  { id: 'acct-2', userId: 'user-2', email: 'brian@example.com', password: 'brianpass' },
  ...(import.meta.env.VITE_MOCK_ADMIN_PASSWORD
    ? [{ id: 'acct-admin', userId: 'user-admin', email: ADMIN_EMAIL, password: import.meta.env.VITE_MOCK_ADMIN_PASSWORD }]
    : []),
];
