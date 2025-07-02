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

  const addItem = useCartStore((state) => state.addItem);

  async function toggleFavorite() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Erro ao remover favorito");
      }

      setIsFavorited(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao remover dos favoritos.");
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
      stock: 1, // você pode ajustar isso conforme sua lógica de estoque
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
            className={`absolute top-2 right-2 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 ${
              loading ? "text-red-300 cursor-not-allowed" : "text-red-600 hover:text-red-700"
            }`}
          >
            <Heart
              size={24}
              strokeWidth={2}
              fill={!loading ? "red" : "none"}
            />
          </button>
        </div>

        <div className="space-y-3">
          <Link href={`/produto/${product.slug}`}>
            <h3 className="font-semibold line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          <div className="text-xl font-bold text-primary">
            R$ {product.price.toFixed(2)}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
              Adicionar
            </Button>

            <Link href={`/produto/${product.slug}`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center justify-center"
              >
                Ver
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
