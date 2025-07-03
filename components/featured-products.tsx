// components/FeaturedProducts.tsx

import { getFeaturedProducts } from "@/lib/sanity";
import { getProductRating } from "@/lib/reviews";
import dynamic from "next/dynamic";


interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  images: string[];
  stock: number;
  category: string;
}

interface Rating {
  averageRating: number;
  totalReviews: number;
}

interface ProductWithRating {
  product: Product;
  rating?: Rating;
}

const FeaturedCarousel = dynamic(() => import("@/components/FeaturedCarousel"), {
  ssr: false,
});

export default async function FeaturedProducts() {
  const data: Product[] = await getFeaturedProducts();

  const productsWithRatings: ProductWithRating[] = await Promise.all(
    data.slice(0, 8).map(async (product) => {
      const rating = await getProductRating(product._id);
      return { product, rating };
    })
  );

  if (productsWithRatings.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Produtos em Destaque</h2>
          <p className="text-gray-100 mb-8">Adicione produtos no Sanity Studio para vê-los aqui</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-yellow-500">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Produtos em Destaque</h2>
          <p className="text-white max-w-2xl mx-auto text-lg">
            Confira nossos produtos mais populares e com melhor avaliação
          </p>
        </div>

        <FeaturedCarousel productsWithRatings={productsWithRatings} />

      </div>
    </section>
  );
}
