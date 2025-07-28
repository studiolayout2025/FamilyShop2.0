import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, DollarSign, TrendingUp, Users, Package } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: notifications = [], refetch: refetchNotifications } = useQuery<Notification[]>({
    queryKey: ['/api/admin/notifications'],
    enabled: user?.role === 'developer' || user?.role === 'analyst',
  });

  const markAsRead = async (notificationId: string) => {
    try {
      await apiRequest("POST", `/api/admin/notifications/${notificationId}/read`);
      refetchNotifications();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao marcar notificação como lida",
        variant: "destructive",
      });
    }
  };

  const resetAllProducts = async () => {
    if (!confirm("Tem certeza que deseja resetar TODOS os produtos? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      await apiRequest("POST", "/api/products/reset");
      toast({
        title: "Sucesso",
        description: "Todos os produtos foram resetados",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao resetar produtos",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== 'developer' && user?.role !== 'analyst') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Negado</h2>
            <p className="text-slate-600">Você não tem permissão para acessar esta área.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Painel {user.role === 'developer' ? 'do Desenvolvedor' : 'do Analista'}
        </h1>
        <p className="text-slate-600">
          {user.role === 'developer' 
            ? 'Controle total da plataforma e monitoramento de atividades'
            : 'Visualização de relatórios e análises da plataforma'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Vendas Hoje</p>
                <p className="text-2xl font-bold text-slate-800">R$ 1.245</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Produtos Ativos</p>
                <p className="text-2xl font-bold text-slate-800">127</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-slate-800">89</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Crescimento</p>
                <p className="text-2xl font-bold text-slate-800">+12%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Notificações Recentes</span>
              <Badge variant="secondary">
                {notifications.filter(n => !n.isRead).length} não lidas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhuma notificação</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.isRead 
                        ? 'bg-slate-50 border-slate-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {notification.type === 'sale' && <DollarSign className="w-4 h-4 text-green-500" />}
                          {notification.type === 'violation' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(notification.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs"
                        >
                          Marcar como lida
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Developer Controls */}
        {user.role === 'developer' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Controles de Desenvolvedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Zona de Perigo</h4>
                <p className="text-sm text-red-600 mb-4">
                  As ações abaixo são irreversíveis e afetam toda a plataforma.
                </p>
                
                <Button
                  onClick={resetAllProducts}
                  variant="destructive"
                  className="w-full"
                >
                  Resetar Todos os Produtos
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Moderação</h4>
                <p className="text-sm text-yellow-600 mb-4">
                  Ferramentas para moderar conteúdo e usuários.
                </p>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Visualizar Produtos Reportados
                  </Button>
                  <Button variant="outline" className="w-full">
                    Gerenciar Usuários Bloqueados
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Relatórios</h4>
                <p className="text-sm text-blue-600 mb-4">
                  Gere relatórios detalhados sobre a plataforma.
                </p>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Relatório de Vendas
                  </Button>
                  <Button variant="outline" className="w-full">
                    Relatório de Usuários
                  </Button>
                  <Button variant="outline" className="w-full">
                    Relatório Financeiro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
