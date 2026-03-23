import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import SetupPage from "@/pages/Setup";
import LoginPage from "@/pages/Login";
import AdminPage from "@/pages/admin/AdminPage";
import CashierPOS from "@/pages/cashier/CashierPOS";

const queryClient = new QueryClient();

function AppContent() {
  const { isSetup, currentUser } = useApp();

  if (!isSetup) return <SetupPage />;
  if (!currentUser) return <LoginPage />;
  if (currentUser.role === 'admin') return <AdminPage />;
  return <CashierPOS />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
