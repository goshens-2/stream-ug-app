import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserLayout } from './components/UserLayout';
import { AppStateProvider } from './context/AppStateContext';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { LandingPage } from './pages/landing/LandingPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminContentFormPage } from './pages/admin/AdminContentFormPage';
import { AdminContentListPage } from './pages/admin/AdminContentListPage';
import { AdminContentTypesPage } from './pages/admin/AdminContentTypesPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AccountSettingsPage } from './pages/user/AccountSettingsPage';
import { CategoryPage } from './pages/user/CategoryPage';
import { ContentDetailPage } from './pages/user/ContentDetailPage';
import { ExplorePage } from './pages/user/ExplorePage';
import { HomePage } from './pages/user/HomePage';
import { MovieRequestPage } from './pages/user/MovieRequestPage';
import { SearchPage } from './pages/user/SearchPage';
import { TrailersPage } from './pages/user/TrailersPage';
import { WatchlistPage } from './pages/user/WatchlistPage';

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
              <Route path="category/:categoryId" element={<CategoryPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="watch/:contentId" element={<ContentDetailPage />} />
              <Route path="requests" element={<MovieRequestPage />} />
              <Route path="trailers" element={<TrailersPage />} />
              <Route path="watchlist" element={<WatchlistPage />} />
              <Route path="explore/:key" element={<ExplorePage />} />
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
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
