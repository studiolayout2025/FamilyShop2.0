import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AuthProps {
  onClose: () => void;
}

export default function Auth({ onClose }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name, accessCode);
      }
      onClose();
      toast({
        title: isLogin ? "Login realizado com sucesso!" : "Conta criada com sucesso!",
        description: "Bem-vindo ao Family Shop",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="max-w-md w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {isLogin ? "Entrar na sua conta" : "Criar sua conta"}
            </h2>
            <p className="text-slate-600">Acesse o melhor marketplace da família</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha segura"
                className="w-full"
              />
            </div>
            
            {!isLogin && (email === "lopesbiel2024@gmail.com" || email === "exocore81@gmail.com") && (
              <div>
                <Label htmlFor="accessCode" className="block text-sm font-medium text-slate-700 mb-2">
                  Código de Acesso Especial
                </Label>
                <Input
                  id="accessCode"
                  type="password"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Digite o código de acesso"
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Esta é uma conta especial. Digite o código de acesso fornecido.
                </p>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLoading ? "Processando..." : isLogin ? "Entrar" : "Cadastrar"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-medium hover:underline ml-1 p-0"
              >
                {isLogin ? "Cadastre-se" : "Entrar"}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
