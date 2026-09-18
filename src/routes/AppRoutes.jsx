import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ==================== LAYOUTS ====================
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DonorLayout from '../layouts/DonorLayout';
import ReceiverLayout from '../layouts/ReceiverLayout';
import AdminLayout from '../layouts/AdminLayout';

// ==================== PROTECTORS ====================
import { ProtectedRoute, RoleProtectedRoute } from './ProtectedRoute';

// ==================== PUBLIC PAGES ====================
import Home from '../pages/public/Home';
import HowItWorks from '../pages/public/HowItWorks';
import Categories from '../pages/public/Categories';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';

// ==================== AUTH PAGES ====================
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// ==================== DONOR PAGES ====================
import DonorDashboard from '../pages/donor/DonorDashboard';
import CreateDonationWizard from '../pages/donor/CreateDonationWizard';
import MyDonations from '../pages/donor/MyDonations';
import DonationDetail from '../pages/donor/DonationDetail';
import DonorRequests from '../pages/donor/DonorRequests';
import DonorConnections from '../pages/donor/DonorConnections';
import DonorImpact from '../pages/donor/DonorImpact';
import DonorNotifications from '../pages/donor/DonorNotifications';
import DonorSettings from '../pages/donor/DonorSettings';

// ==================== RECEIVER PAGES ====================
import ReceiverDashboard from '../pages/receiver/ReceiverDashboard';
import BrowseDonations from '../pages/receiver/BrowseDonations';
import ReceiverDonationDetail from '../pages/receiver/ReceiverDonationDetail';
import MyRequests from '../pages/receiver/MyRequests';
import ReceiverConnections from '../pages/receiver/ReceiverConnections';
import SavedItems from '../pages/receiver/SavedItems';
import ReceiverImpact from '../pages/receiver/ReceiverImpact';
import ReceiverNotifications from '../pages/receiver/ReceiverNotifications';
import ReceiverSettings from '../pages/receiver/ReceiverSettings';

// ==================== ADMIN PAGES ====================
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDonors from '../pages/admin/AdminDonors';
import AdminReceivers from '../pages/admin/AdminReceivers';
import AdminOrganizations from '../pages/admin/AdminOrganizations';
import AdminVerification from '../pages/admin/AdminVerification';
import AdminDonations from '../pages/admin/AdminDonations';
import AdminRequests from '../pages/admin/AdminRequests';
import AdminConnections from '../pages/admin/AdminConnections';
import AdminReports from '../pages/admin/AdminReports';
import AdminContactMessages from '../pages/admin/AdminContactMessages';
import AdminSettings from '../pages/admin/AdminSettings';

export default function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
          ===================================================== */}
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/how-it-works"
          element={<HowItWorks />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/donations"
          element={<BrowseDonations />}
        />

        <Route
          path="/donations/:id"
          element={<ReceiverDonationDetail />}
        />
      </Route>


      {/* =====================================================
          AUTH ROUTES
          ===================================================== */}
      <Route element={<AuthLayout />}>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

      </Route>


      {/* =====================================================
          DONOR ROUTES
          ===================================================== */}
      <Route
        path="/donor"
        element={
          <RoleProtectedRoute allowedRoles={['DONOR']}>
            <DonorLayout />
          </RoleProtectedRoute>
        }
      >

        {/* /donor */}
        <Route
          index
          element={<DonorDashboard />}
        />

        {/* /donor/donations */}
        <Route
          path="donations"
          element={<MyDonations />}
        />

        {/* /donor/donations/create */}
        <Route
          path="donations/create"
          element={<CreateDonationWizard />}
        />

        {/* /donor/donations/:id */}
        <Route
          path="donations/:id"
          element={<DonationDetail />}
        />

        {/* /donor/requests */}
        <Route
          path="requests"
          element={<DonorRequests />}
        />

        {/* /donor/connections */}
        <Route
          path="connections"
          element={<DonorConnections />}
        />
        <Route
          path="connections/:id"
          element={<DonorConnections />}
        />

        {/* /donor/saved */}
        <Route
          path="saved"
          element={<SavedItems />}
        />

        {/* /donor/impact */}
        <Route
          path="impact"
          element={<DonorImpact />}
        />

        {/* /donor/notifications */}
        <Route
          path="notifications"
          element={<DonorNotifications />}
        />

        {/* /donor/settings */}
        <Route
          path="settings"
          element={<DonorSettings />}
        />

      </Route>


      {/* =====================================================
          RECEIVER ROUTES
          ===================================================== */}
      <Route
        path="/receiver"
        element={
          <RoleProtectedRoute allowedRoles={['RECEIVER']}>
            <ReceiverLayout />
          </RoleProtectedRoute>
        }
      >

        {/* /receiver */}
        <Route
          index
          element={<ReceiverDashboard />}
        />

        {/* /receiver/browse */}
        <Route
          path="browse"
          element={<BrowseDonations />}
        />

        {/* /receiver/donations/:id */}
        <Route
          path="donations/:id"
          element={<ReceiverDonationDetail />}
        />

        {/* /receiver/requests */}
        <Route
          path="requests"
          element={<MyRequests />}
        />

        {/* /receiver/connections */}
        <Route
          path="connections"
          element={<ReceiverConnections />}
        />
        <Route
          path="connections/:id"
          element={<ReceiverConnections />}
        />

        {/* /receiver/saved */}
        <Route
          path="saved"
          element={<SavedItems />}
        />

        {/* /receiver/impact */}
        <Route
          path="impact"
          element={<ReceiverImpact />}
        />

        {/* /receiver/notifications */}
        <Route
          path="notifications"
          element={<ReceiverNotifications />}
        />

        {/* /receiver/settings */}
        <Route
          path="settings"
          element={<ReceiverSettings />}
        />

      </Route>


      {/* =====================================================
          ADMIN ROUTES
          ===================================================== */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >

        {/* /admin */}
        <Route
          index
          element={<AdminDashboard />}
        />

        {/* /admin/donors */}
        <Route
          path="donors"
          element={<AdminDonors />}
        />

        {/* /admin/receivers */}
        <Route
          path="receivers"
          element={<AdminReceivers />}
        />

        {/* /admin/organizations */}
        <Route
          path="organizations"
          element={<AdminOrganizations />}
        />

        {/* /admin/verification */}
        <Route
          path="verification"
          element={<AdminVerification />}
        />

        {/* /admin/donations */}
        <Route
          path="donations"
          element={<AdminDonations />}
        />

        {/* /admin/requests */}
        <Route
          path="requests"
          element={<AdminRequests />}
        />

        {/* /admin/connections */}
        <Route
          path="connections"
          element={<AdminConnections />}
        />

        {/* /admin/reports */}
        <Route
          path="reports"
          element={<AdminReports />}
        />

        {/* /admin/messages */}
        <Route
          path="messages"
          element={<AdminContactMessages />}
        />

        {/* /admin/settings */}
        <Route
          path="settings"
          element={<AdminSettings />}
        />

      </Route>


      {/* =====================================================
          FALLBACK
          ===================================================== */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}