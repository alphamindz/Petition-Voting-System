import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import RegisterWizardPage from './pages/RegisterWizardPage';
import LoginPage from './pages/LoginPage';
import ProtestsListPage from './pages/ProtestsListPage';
import ProtestDetailPage from './pages/ProtestDetailPage';
import CreateProtestPage from './pages/CreateProtestPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import DashboardPage from './pages/DashboardPage';
import PetitionsPage from './pages/PetitionsPage';
import PetitionDetailPage from './pages/PetitionDetailPage';
import CreatePetitionPage from './pages/CreatePetitionPage';
import EditPetitionPage from './pages/EditPetitionPage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterWizardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/protests" element={<ProtestsListPage />} />
              <Route path="/protests/:id" element={<ProtestDetailPage />} />
              <Route path="/petitions" element={<PetitionsPage />} />
              <Route path="/petitions/:id" element={<PetitionDetailPage />} />

              {/* Protected Citizen Routes */}
              <Route
                path="/protests/create"
                element={
                  <ProtectedRoute>
                    <CreateProtestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-petition"
                element={
                  <ProtectedRoute>
                    <CreatePetitionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-petition/:id"
                element={
                  <ProtectedRoute>
                    <EditPetitionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
