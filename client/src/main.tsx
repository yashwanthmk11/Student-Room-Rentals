import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthPage } from './pages/AuthPage';
import { MatchingPage } from './pages/MatchingPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { SavedPage } from './pages/SavedPage';
import './style.css';

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          borderBottom: '1px solid #eee'
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 600 }}>
          Campus Rooms
        </Link>
        <nav style={{ display: 'flex', gap: 12, fontSize: 14, alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            Discover rooms
          </Link>
          <Link to="/saved" style={{ textDecoration: 'none' }}>
            Saved rooms
          </Link>
          <Link to="/matching" style={{ textDecoration: 'none' }}>
            Roommate match
          </Link>
          <Link to="/owner" style={{ textDecoration: 'none' }}>
            Owner dashboard
          </Link>
          {user ? (
            <>
              <span style={{ color: '#555' }}>{user.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              Log in / Sign up
            </Link>
          )}
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/matching" element={<MatchingPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/owner" element={<OwnerDashboardPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);


