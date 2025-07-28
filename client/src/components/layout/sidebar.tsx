import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { DonationModal } from "@/components/donation-modal";
import { 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Settings, 
  BarChart3, 
  Shield,
  Heart,
  X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);

  const isSpecialUser = user?.role === 'developer' || user?.role === 'analyst';
  const isDeveloper = user?.role === 'developer';

  const handleDonationClick = (amount?: number) => {
    setIsDonationModalOpen(true);
  };

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out mt-16 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Menu</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="space-y-6">
            
            {/* Navigation Menu */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Menu Principal</h3>
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Package className="w-5 h-5 mr-3" />
                  <span>Produtos</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <DollarSign className="w-5 h-5 mr-3" />
                  <span>Minhas Vendas</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  <span>Minhas Compras</span>
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Configurações</span>
                </Button>
              </nav>
            </div>

            {/* Special Account Features */}
            {isSpecialUser && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Área Especial</h3>
                <nav className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    <span>Relatórios</span>
                  </Button>
                  
                  {isDeveloper && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Shield className="w-5 h-5 mr-3" />
                      <span>Controle Total</span>
                    </Button>
                  )}
                </nav>
              </div>
            )}

            {/* Donation Section */}
            <div className="bg-gradient-to-r from-accent to-emerald-600 rounded-xl p-4">
              <div className="text-white text-center">
                <Heart className="w-8 h-8 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Apoie o Projeto</h4>
                <p className="text-sm opacity-90 mb-3">Ajude-nos a crescer e melhorar nossa plataforma</p>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => handleDonationClick(10)}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                    variant="ghost"
                  >
                    Doar R$ 10
                  </Button>
                  <Button
                    onClick={() => handleDonationClick(25)}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                    variant="ghost"
                  >
                    Doar R$ 25
                  </Button>
                  <Button
                    onClick={() => handleDonationClick(100)}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                    variant="ghost"
                  >
                    Doar R$ 100
                  </Button>
                  <Button
                    onClick={() => handleDonationClick()}
                    className="w-full bg-white text-accent py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm font-semibold"
                  >
                    Valor Personalizado
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </aside>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />
    </>
  );
}
