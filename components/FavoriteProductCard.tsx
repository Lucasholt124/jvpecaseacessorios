"use client";

import { useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface Props {
  product: Product;
}

export default function FavoriteProductCard({ product }: Props) {
  const [isFavorited, setIsFavorited] = useState(true);
  const [loading, setLoading] = useState(false);

  const { addItem } = useCartStore();

  async function toggleFavorite() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Erro ao remover favorito");
      }

      setIsFavorited(false);
    } catch (error) {
      alert((error as Error).message || "Erro ao atualizar favoritos");
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
      stock: 1,
    });
  }

  if (!isFavorited) return null;

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="relative aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <button
            onClick={toggleFavorite}
            disabled={loading}
            aria-label="Remover dos favoritos"
            className="absolute top-2 right-2 p-2 rounded text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            type="button"
          >
            <Heart fill="red" strokeWidth={2} size={24} />
          </button>
        </div>

        <div className="space-y-3">
          <Link href={`/produto/${product.slug}`}>
            <h3 className="font-semibold line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1" type="button" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Adicionar
            </Button>

            {/* Link envolvendo o botão para evitar erro do 'as' */}
            <Link href={`/produto/${product.slug}`} passHref legacyBehavior>
              <a>
                <Button variant="outline" size="sm" type="button">
                  Ver
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
