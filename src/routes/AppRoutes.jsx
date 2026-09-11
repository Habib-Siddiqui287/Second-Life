import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DonorLayout from '../layouts/DonorLayout';
import ReceiverLayout from '../layouts/ReceiverLayout';
import AdminLayout from '../layouts/AdminLayout';

// Protectors
import { ProtectedRoute, RoleProtectedRoute } from './ProtectedRoute';

// Public Pages
import Home from '../pages/public/Home';
import HowItWorks from '../pages/public/HowItWorks';
import Categories from '../pages/public/Categories';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Donor Pages
import DonorDashboard from '../pages/donor/DonorDashboard';
import CreateDonationWizard from '../pages/donor/CreateDonationWizard';
import MyDonations from '../pages/donor/MyDonations';
import DonationDetail from '../pages/donor/DonationDetail';
import DonorRequests from '../pages/donor/DonorRequests';
import DonorConnections from '../pages/donor/DonorConnections';
import DonorImpact from '../pages/donor/DonorImpact';
import DonorNotifications from '../pages/donor/DonorNotifications';
import DonorSettings from '../pages/donor/DonorSettings';

// Receiver Pages
import ReceiverDashboard from '../pages/receiver/ReceiverDashboard';
import BrowseDonations from '../pages/receiver/BrowseDonations';
import ReceiverDonationDetail from '../pages/receiver/ReceiverDonationDetail';
import MyRequests from '../pages/receiver/MyRequests';
import ReceiverConnections from '../pages/receiver/ReceiverConnections';
import SavedItems from '../pages/receiver/SavedItems';
import ReceiverImpact from '../pages/receiver/ReceiverImpact';
import ReceiverNotifications from '../pages/receiver/ReceiverNotifications';
import ReceiverSettings from '../pages/receiver/ReceiverSettings';

// Admin Pages
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
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* Public view for donations & details */}
        <Route path="/donations" element={<BrowseDonations />} />
        <Route path="/donations/:id" element={<ReceiverDonationDetail />} />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Donor Protected Routes */}
      <Route
        path="/donor"
        element={
          <RoleProtectedRoute allowedRoles={['DONOR']}>
            <DonorLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<DonorDashboard />} />
        <Route path="donations" element={<MyDonations />} />
        <Route path="donations/create" element={<CreateDonationWizard />} />
        <Route path="donations/:id" element={<DonationDetail />} />
        <Route path="requests" element={<DonorRequests />} />
        <Route path="connections" element={<DonorConnections />} />
        <Route path="saved" element={<SavedItems />} />
        <Route path="impact" element={<DonorImpact />} />
        <Route path="notifications" element={<DonorNotifications />} />
        <Route path="settings" element={<DonorSettings />} />
      </Route>

      {/* Receiver Protected Routes */}
      <Route
        path="/receiver"
        element={
          <RoleProtectedRoute allowedRoles={['RECEIVER']}>
            <ReceiverLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<ReceiverDashboard />} />
        <Route path="browse" element={<BrowseDonations />} />
        <Route path="donations/:id" element={<ReceiverDonationDetail />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="connections" element={<ReceiverConnections />} />
        <Route path="saved" element={<SavedItems />} />
        <Route path="impact" element={<ReceiverImpact />} />
        <Route path="notifications" element={<ReceiverNotifications />} />
        <Route path="settings" element={<ReceiverSettings />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <RoleProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="donors" element={<AdminDonors />} />
        <Route path="receivers" element={<AdminReceivers />} />
        <Route path="organizations" element={<AdminOrganizations />} />
        <Route path="verification" element={<AdminVerification />} />
        <Route path="donations" element={<AdminDonations />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="connections" element={<AdminConnections />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="messages" element={<AdminContactMessages />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
