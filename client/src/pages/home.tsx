import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/product-card";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl?: string;
  sellerId: string;
}

export default function Home() {
  const [filters, setFilters] = useState({
    category: "",
    maxPrice: "",
    searchTerm: ""
  });
  const [cart, setCart] = useState<string[]>([]);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      return response.json();
    }
  });

  const addToCart = (productId: string) => {
    setCart(prev => [...prev, productId]);
    toast({
      title: "Produto adicionado!",
      description: "Item adicionado ao carrinho com sucesso.",
    });
  };

  const applyFilters = () => {
    // Query will automatically refetch due to dependency on filters
  };

  const categories = [
    "Eletrônicos",
    "Roupas",
    "Casa e Decoração", 
    "Esportes",
    "Livros",
    "Beleza",
    "Automotivo"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Bem-vindo ao Family Shop!</h1>
            <p className="text-xl opacity-90 mb-6">Descubra produtos incríveis de vendedores confiáveis</p>
            <Button 
              onClick={() => navigate("/create-product")}
              className="bg-white text-slate-800 font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Vender seus Produtos
            </Button>
          </div>
          <div className="hidden md:block">
            <div className="w-64 h-64 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center">
              <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preço máximo</label>
                <Select value={filters.maxPrice} onValueChange={(value) => setFilters(prev => ({ ...prev, maxPrice: value }))}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Qualquer preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer preço</SelectItem>
                    <SelectItem value="50">Até R$ 50</SelectItem>
                    <SelectItem value="200">Até R$ 200</SelectItem>
                    <SelectItem value="500">Até R$ 500</SelectItem>
                    <SelectItem value="1000">Até R$ 1.000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
                <Input
                  placeholder="Nome do produto..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-48"
                />
              </div>
            </div>
            
            <Button
              onClick={applyFilters}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Aplicar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="w-full h-48 bg-slate-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-slate-200 rounded animate-pulse mb-3" />
                <div className="h-6 bg-slate-200 rounded animate-pulse mb-3" />
                <div className="h-10 bg-slate-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="text-slate-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
            <p>Tente ajustar os filtros ou seja o primeiro a cadastrar um produto!</p>
          </div>
        </Card>
      )}

      {/* Load More Button */}
      {products.length > 0 && (
        <div className="text-center mt-12">
          <Button variant="outline" className="border-2 border-primary text-primary font-semibold py-3 px-8 rounded-lg hover:bg-primary hover:text-white transition-all duration-300">
            Carregar Mais Produtos
          </Button>
        </div>
      )}

    </div>
  );
}
