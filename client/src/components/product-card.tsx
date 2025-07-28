import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl?: string;
  sellerId: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(price));
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-48 bg-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFavorited(!isFavorited)}
          className={`absolute top-2 right-2 p-2 rounded-full ${isFavorited ? 'text-red-500 bg-white' : 'text-slate-400 bg-white bg-opacity-80 hover:text-red-500'} transition-colors`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-slate-800 line-clamp-2 flex-1 pr-2">
            {product.name}
          </h3>
        </div>
        
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-slate-800">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-slate-500 capitalize">
            {product.category}
          </span>
        </div>
        
        <Button
          onClick={handleAddToCart}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Adicionar ao Carrinho
        </Button>
      </CardContent>
    </Card>
  );
}
