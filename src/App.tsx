import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserLogin } from './pages/UserLogin';
import { UserRegister } from './pages/UserRegister';
import { AdminLogin } from './pages/AdminLogin';
import { AccessDenied } from './pages/AccessDenied';
import { ReportModal } from './components/ReportModal';
import { ComplaintDetailsModal } from './components/ComplaintDetailsModal';
import { AdminComplaintModal } from './components/AdminComplaintModal';
import { Complaint } from './types';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [adminSelectedComplaintId, setAdminSelectedComplaintId] = useState<string | null>(null);

  // Sync navigation with browser history
  const navigate = (path: string) => {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check URL params for direct complaint view e.g. /complaint/PH-2026-0001
  useEffect(() => {
    const matchUserComplaint = currentPath.match(/^\/complaint\/(PH-[A-Za-z0-9-]+|[a-zA-Z0-9_-]+)$/);
    if (matchUserComplaint) {
      setSelectedComplaintId(matchUserComplaint[1]);
    }

    const matchAdminComplaint = currentPath.match(/^\/admin\/complaint\/(PH-[A-Za-z0-9-]+|[a-zA-Z0-9_-]+)$/);
    if (matchAdminComplaint) {
      setAdminSelectedComplaintId(matchAdminComplaint[1]);
    }
  }, [currentPath]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700">Connecting to PotholeTrack System...</p>
        </div>
      </div>
    );
  }

  // Routing Logic
  const renderRoute = () => {
    // Admin login page
    if (currentPath === '/admin/login') {
      if (user?.role === 'admin') {
        return <AdminDashboard onOpenComplaint={(id) => setAdminSelectedComplaintId(id)} />;
      }
      return <AdminLogin onNavigate={navigate} />;
    }

    // Admin dashboard or admin routes
    if (currentPath.startsWith('/admin')) {
      if (!user) {
        return <AdminLogin onNavigate={navigate} />;
      }
      if (user.role !== 'admin') {
        // Normal user trying to access admin portal
        return <AccessDenied onNavigate={navigate} />;
      }
      return <AdminDashboard onOpenComplaint={(id) => setAdminSelectedComplaintId(id)} />;
    }

    // Citizen register page
    if (currentPath === '/register') {
      if (user) {
        return (
          <UserDashboard
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenComplaintDetails={(id) => setSelectedComplaintId(id)}
          />
        );
      }
      return <UserRegister onNavigate={navigate} />;
    }

    // Citizen login page
    if (currentPath === '/login') {
      if (user) {
        if (user.role === 'admin') {
          return <AdminDashboard onOpenComplaint={(id) => setAdminSelectedComplaintId(id)} />;
        }
        return (
          <UserDashboard
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenComplaintDetails={(id) => setSelectedComplaintId(id)}
          />
        );
      }
      return <UserLogin onNavigate={navigate} />;
    }

    // Default: Dashboard or landing
    if (user) {
      if (user.role === 'admin') {
        return <AdminDashboard onOpenComplaint={(id) => setAdminSelectedComplaintId(id)} />;
      }
      return (
        <UserDashboard
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenComplaintDetails={(id) => setSelectedComplaintId(id)}
        />
      );
    }

    // Default if unauthenticated: prompt citizen login
    return <UserLogin onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      <main className="flex-1">
        {renderRoute()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-700">PotholeTrack</span> — Municipal Road Hazard & Maintenance Management System
          </div>
          <div className="flex items-center gap-4">
            <span>Server: Active</span>
            <span>•</span>
            <button
              onClick={() => navigate('/admin/login')}
              className="hover:text-amber-600 transition font-semibold"
            >
              Administrator Login
            </button>
          </div>
        </div>
      </footer>

      {/* Report Pothole Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onComplaintCreated={(newComplaint) => {
          // Modal stays open to display the generated unique Complaint ID
        }}
      />

      {/* Citizen Complaint Details Modal */}
      <ComplaintDetailsModal
        complaintId={selectedComplaintId}
        onClose={() => {
          setSelectedComplaintId(null);
          if (currentPath.startsWith('/complaint/')) {
            navigate('/dashboard');
          }
        }}
      />

      {/* Administrator Complaint Review & Management Modal */}
      <AdminComplaintModal
        complaintId={adminSelectedComplaintId}
        onClose={() => {
          setAdminSelectedComplaintId(null);
          if (currentPath.startsWith('/admin/complaint/')) {
            navigate('/admin/dashboard');
          }
        }}
        onComplaintUpdated={(updated) => {
          // updated
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
