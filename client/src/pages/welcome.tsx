import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface WelcomeProps {
  onGetStarted: () => void;
}

export default function Welcome({ onGetStarted }: WelcomeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="fixed inset-0 z-50 animated-bg flex items-center justify-center">
      <div className={`text-center text-white p-8 blur-backdrop rounded-2xl shadow-2xl max-w-md mx-4 transition-all duration-1000 ${isVisible ? 'animate-fade-in' : 'opacity-0 transform translate-y-20'}`}>
        <div className="mb-6">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">Family Shop</h1>
          <p className="text-xl opacity-90">Loja da Família</p>
        </div>
        
        <p className="text-lg mb-8 opacity-80">Seu marketplace moderno e seguro onde toda família pode vender e comprar com confiança</p>
        
        <Button 
          onClick={onGetStarted}
          className="bg-white text-slate-800 font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105"
        >
          Começar Agora
        </Button>
      </div>
      
      <style>{`
        .animated-bg {
          background: linear-gradient(-45deg, hsl(207, 90%, 54%), hsl(270, 70%, 50%), hsl(158, 64%, 52%), hsl(200, 80%, 60%);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        .blur-backdrop {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
