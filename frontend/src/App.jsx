import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { ContentStudio } from './pages/content_studio/ContentStudio';
import { Profile } from './pages/profile/Profile';
import { Recipients } from './pages/recipients/Recipients';
import { ImportRecipients } from './pages/recipients/ImportRecipients';
import { Audiences } from './pages/audiences/Audiences';
import { CreateAudience } from './pages/audiences/CreateAudience';
import { AudienceDetails } from './pages/audiences/AudienceDetails';
import { Campaigns } from './pages/campaigns/Campaigns';
import { CreateCampaign } from './pages/campaigns/CreateCampaign';
import { CampaignDetails } from './pages/campaigns/CampaignDetails';
import CampaignDelivery from './pages/campaigns/CampaignDelivery';
import { DeliveryTrackingHub } from './pages/delivery/DeliveryTrackingHub';
import { Templates } from './pages/templates/Templates';
import { ContentLibrary } from './pages/content_library/ContentLibrary';
import { Settings } from './pages/settings/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />


          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/delivery-tracking" element={<DeliveryTrackingHub />} />
              <Route path="/content-studio" element={<ContentStudio />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/recipients" element={<Recipients />} />
              <Route path="/recipients/import" element={<ImportRecipients />} />
              <Route path="/audiences" element={<Audiences />} />
              <Route path="/audiences/create" element={<CreateAudience />} />
              <Route path="/audiences/:id" element={<AudienceDetails />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/create" element={<CreateCampaign />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />
              <Route path="/campaigns/:id/delivery" element={<CampaignDelivery />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/content-library" element={<ContentLibrary />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
