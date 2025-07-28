import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Pages
import Welcome from "@/pages/welcome";
import Auth from "@/pages/auth";
import Home from "@/pages/home";
import Checkout from "@/pages/checkout";
import Admin from "@/pages/admin";
import CreateProduct from "@/pages/create-product";
import NotFound from "@/pages/not-found";

// Layout Components
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('familyShop_welcomeShown');
    
    if (!hasSeenWelcome && !isAuthenticated && !isLoading) {
      setShowWelcome(true);
    } else if (!isAuthenticated && !isLoading) {
      setShowAuth(true);
    }
  }, [isAuthenticated, isLoading]);

  const handleWelcomeComplete = () => {
    localStorage.setItem('familyShop_welcomeShown', 'true');
    setShowWelcome(false);
    setShowAuth(true);
  };

  const handleAuthComplete = () => {
    setShowAuth(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showWelcome) {
    return <Welcome onGetStarted={handleWelcomeComplete} />;
  }

  if (showAuth) {
    return <Auth onClose={handleAuthComplete} />;
  }

  if (!isAuthenticated) {
    return <Auth onClose={handleAuthComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onToggleSidebar={toggleSidebar} cartCount={0} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/admin" component={Admin} />
          <Route path="/create-product" component={CreateProduct} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Click overlay to close sidebar on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
