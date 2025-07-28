import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Search, ShoppingCart, LogOut, Menu } from "lucide-react";

interface NavbarProps {
  onToggleSidebar: () => void;
  cartCount?: number;
}

export default function Navbar({ onToggleSidebar, cartCount = 0 }: NavbarProps) {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchTerm);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </Button>
            
            <div className="ml-4 flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-slate-800">Family Shop</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </form>
            
            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
            
            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-slate-700 font-medium">
                    {user.name}
                  </span>
                  {user.role !== 'user' && (
                    <Badge variant="secondary" className="hidden md:inline-flex">
                      {user.role === 'developer' ? 'Dev' : 'Analista'}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
