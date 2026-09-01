import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserLayout } from './components/UserLayout';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { HomePage } from './pages/user/HomePage';
import { ContentDetailPage } from './pages/user/ContentDetailPage';
import { MovieRequestPage } from './pages/user/MovieRequestPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminContentListPage } from './pages/admin/AdminContentListPage';
import { AdminContentFormPage } from './pages/admin/AdminContentFormPage';
import { AdminContentTypesPage } from './pages/admin/AdminContentTypesPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route index element={<HomePage />} />
              <Route path="watch/:contentId" element={<ContentDetailPage />} />
              <Route path="requests" element={<MovieRequestPage />} />
            </Route>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="content" element={<AdminContentListPage />} />
              <Route path="content/new" element={<AdminContentFormPage />} />
              <Route path="content/:contentId" element={<AdminContentFormPage />} />
              <Route path="content-types" element={<AdminContentTypesPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="requests" element={<AdminRequestsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
