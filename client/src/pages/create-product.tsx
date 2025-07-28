import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Upload } from "lucide-react";

export default function CreateProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const categories = [
    "Eletrônicos",
    "Roupas",
    "Casa e Decoração", 
    "Esportes",
    "Livros",
    "Beleza",
    "Automotivo"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !description || !price || !category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Erro",
        description: "Digite um preço válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/products", {
        name,
        description,
        price: priceValue.toString(),
        category,
        imageUrl: imageUrl || undefined
      });

      toast({
        title: "Produto Criado!",
        description: "Seu produto foi publicado com sucesso",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar produto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar à página inicial
        </Button>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Criar Novo Produto</h1>
        <p className="text-slate-600">Preencha as informações do seu produto para começar a vender</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Nome do Produto *
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome do produto"
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Descrição *
              </Label>
              <Textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva seu produto detalhadamente"
                className="w-full resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                  Preço (R$) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                  Categoria *
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl" className="block text-sm font-medium text-slate-700 mb-2">
                URL da imagem (opcional)
              </Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                Cole o link de uma imagem do seu produto (JPG, PNG ou GIF)
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 mb-2">Informações sobre comissão</h4>
              <p className="text-sm text-slate-600">
                A plataforma cobra uma comissão fixa de <strong>R$ 15,00</strong> por venda realizada. 
                Por exemplo, se seu produto for vendido por R$ 100, você receberá R$ 85.
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary text-white hover:bg-blue-700"
              >
                {isLoading ? "Criando..." : "Publicar Produto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}