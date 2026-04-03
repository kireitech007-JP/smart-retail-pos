import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import SetupPage from "@/pages/Setup";
import LoginPage from "@/pages/Login";
import AdminPage from "@/pages/admin/AdminPage";
import CashierPOS from "@/pages/cashier/CashierPOS";
import SqlEditorPage from "@/pages/SqlEditorPage";

const queryClient = new QueryClient();

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Error: {this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { isSetup, currentUser, loading, error } = useApp();
  const [mounted, setMounted] = useState(false);
  
  // Enable Supabase Realtime untuk sync antar perangkat
  const { manualSync, isConnected } = useSupabaseRealtime({
    enableAutoSync: true,
    syncInterval: 30000 // Sync setiap 30 detik
  });

  useEffect(() => {
    setMounted(true);
    console.log('AppContent mounted, isSetup:', isSetup, 'currentUser:', currentUser);
  }, [isSetup, currentUser]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-500">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold">INITIALIZING APP...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Initialization Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isSetup) {
    return <SetupPage />;
  }
  
  if (!currentUser) {
    return <LoginPage />;
  }
  
  if (currentUser.role === 'superadmin') {
    return <SqlEditorPage />;
  }
  
  if (currentUser.role === 'admin') {
    return <AdminPage />;
  }
  
  return <CashierPOS />;
}

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppProvider>
            <AppContent />
          </AppProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
