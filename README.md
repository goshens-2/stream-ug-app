# STREAM UG

STREAM UG is a movie/media streaming web app with two sides: an **Admin Panel**
for managing content and a **User Panel** for browsing and watching content.

This repository contains the initial MVP skeleton, built with **React + TypeScript + Vite**
and client-side routing via **react-router-dom**. All data is currently backed by
in-memory mock data (see `src/data/mockData.ts`) so the app is demonstrable
immediately; it is structured so a real backend/API can be plugged in later.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run lint     # lint with oxlint
```

## Project structure

```
src/
  types/                 Shared data models (Content, Category, ContentType,
                          MovieRequest, Rating, User, Subscription, Ad, ...)
  data/mockData.ts        Sample/mock data covering every required category
  context/AppStateContext.tsx
                          In-memory app state (content, ratings, requests,
                          subscription status) shared across Admin & User panels
  utils/recommendations.ts
                          Recommendation algorithm scaffold based on ratings
                          and category affinity
  components/             Shared UI: Navbar, layouts, ContentCard, CategoryRow,
                          WatermarkedVideo, TrailerMarquee (autoplay-on-scroll),
                          RatingStars, AdBanner
  pages/user/              User Panel pages: Home (category rows, trailer
                          marquee, ads), Content detail/watch page, Movie
                          request form
  pages/admin/             Admin Panel pages: Dashboard, Content list,
                          Content upload/edit form (incl. watermark settings),
                          Content Types manager, Categories view, Movie
                          requests review
```

## Feature coverage

**Admin Panel**
- Upload/edit content: title, description, content type, trailer, full video,
  watermark settings, category (`pages/admin/AdminContentFormPage.tsx`)
- Create/manage content types (`pages/admin/AdminContentTypesPage.tsx`)
- View content grouped by category (`pages/admin/AdminCategoriesPage.tsx`,
  `pages/admin/AdminContentListPage.tsx`)
- View & update movie requests submitted by users (`pages/admin/AdminRequestsPage.tsx`)

**User Panel**
- Browse content grouped by category, covering all requested categories
  (translated movies, local music/audio, comedy, cartoons, sports & football
  analysis, non-translated movies, anime, campus entertainment, local
  soaps/series, news, talk shows, Nigerian/Indian/Korean/Chinese movies,
  telenovelas)
- Watch page with watermark overlay and star ratings
- Submit movie requests

**Cross-cutting features**
- Subscription toggle stands in for password-sharing/subscription state
  (`Subscription` type supports shared user lists)
- Watermarks rendered over video playback (`WatermarkedVideo`)
- Trailer marquee: trailers auto-play as non-subscribed users scroll them
  into view (`TrailerMarquee`, using `IntersectionObserver`)
- Ad banner placeholders shown to non-subscribed users (`AdBanner`)
- Movie ratings (`RatingStars`) feed a simple recommendation scaffold
  (`utils/recommendations.ts`) that can be replaced with a real algorithm later
- Non-subscribed users can browse the full app; only trailers (not full
  videos) are playable until they subscribe

This is an MVP scaffold: forms currently write to in-memory state only, and
mock media URLs are used as placeholders. Wiring these to a real backend/API
and persistent storage is expected as a follow-up.
