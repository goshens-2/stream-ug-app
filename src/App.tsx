import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserLayout } from './components/UserLayout';
import { AdminLayout } from './components/AdminLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { HomePage } from './pages/user/HomePage';
import { ExplorePage } from './pages/user/ExplorePage';
import { SearchPage } from './pages/user/SearchPage';
import { ContentDetailPage } from './pages/user/ContentDetailPage';
import { MovieRequestPage } from './pages/user/MovieRequestPage';
import { TrailersPage } from './pages/user/TrailersPage';
import { WatchlistPage } from './pages/user/WatchlistPage';
import { AccountSettingsPage } from './pages/user/AccountSettingsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminContentListPage } from './pages/admin/AdminContentListPage';
import { AdminContentFormPage } from './pages/admin/AdminContentFormPage';
import { AdminContentTypesPage } from './pages/admin/AdminContentTypesPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/browse" element={<UserLayout />}>
              <Route index element={<HomePage />} />
              <Route path="explore/:id" element={<ExplorePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="watch/:contentId" element={<ContentDetailPage />} />
              <Route path="requests" element={<MovieRequestPage />} />
              <Route path="trailers" element={<TrailersPage />} />
              <Route path="watchlist" element={<WatchlistPage />} />
              <Route path="account" element={<AccountSettingsPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="content" element={<AdminContentListPage />} />
              <Route path="content/new" element={<AdminContentFormPage />} />
              <Route path="content/:contentId" element={<AdminContentFormPage />} />
              <Route path="content-types" element={<AdminContentTypesPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="requests" element={<AdminRequestsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
