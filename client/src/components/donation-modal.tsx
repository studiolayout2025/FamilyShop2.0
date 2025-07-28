import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from "@/lib/stripe";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Heart, X } from "lucide-react";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function DonationForm({ onClose, amount }: { onClose: () => void; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
      });

      if (error) {
        toast({
          title: "Erro no Pagamento",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Doação Realizada com Sucesso!",
          description: "Muito obrigado pelo seu apoio ao projeto!",
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao processar doação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1 bg-accent text-white hover:bg-emerald-700"
        >
          {isLoading ? "Processando..." : `Doar R$ ${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [amount, setAmount] = useState<number>(25);
  const [message, setMessage] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleCreateDonation = async () => {
    if (amount < 1) {
      toast({
        title: "Valor Inválido",
        description: "O valor mínimo para doação é R$ 1,00",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/create-donation-payment", {
        amount: amount.toString(),
        message: message.trim() || undefined
      });
      
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar doação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setClientSecret(null);
    setAmount(25);
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={resetModal}>
      <Card className="w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Contribua com o Projeto</h3>
            <p className="text-slate-600">Sua doação nos ajuda a manter e melhorar a plataforma</p>
          </div>
          
          {!clientSecret ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-2">
                  Valor da Doação (R$)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="25.00"
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                  Mensagem (Opcional)
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Deixe uma mensagem de apoio..."
                  className="w-full resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetModal}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateDonation}
                  disabled={isLoading}
                  className="flex-1 bg-accent text-white hover:bg-emerald-700"
                >
                  {isLoading ? "Criando..." : "Continuar"}
                </Button>
              </div>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <DonationForm onClose={resetModal} amount={amount} />
            </Elements>
          )}
        </CardContent>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={resetModal}
          className="absolute top-2 right-2 p-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </Card>
    </div>
  );
}
