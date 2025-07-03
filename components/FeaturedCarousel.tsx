"use client";

import React, { useState, useRef, useEffect } from "react";
import ProductCard from "./product-card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  compareAtPrice?: number;
  images: any[];
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

interface FeaturedCarouselProps {
  productsWithRatings: ProductWithRating[];
}

export default function FeaturedCarousel({ productsWithRatings }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);
  const animationRef = useRef<number>();

  const productsCount = productsWithRatings.length;
  const itemsToShow = 1;

  const getItemWidth = () => {
    if (!containerRef.current) return 0;
    // Pega a largura do primeiro filho para usar no cálculo
    const firstChild = containerRef.current.children[0] as HTMLElement;
    return firstChild ? firstChild.clientWidth : 0;
  };

  const setSliderPosition = (translateX: number) => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${translateX}px)`;
    }
  };

  // Atualiza posição ao mudar índice
  useEffect(() => {
    const width = getItemWidth();
    prevTranslate.current = -currentIndex * width;
    setSliderPosition(prevTranslate.current);
  }, [currentIndex, productsCount]);

  function getPositionX(event: React.TouchEvent | React.MouseEvent): number {
    if ("touches" in event) return event.touches[0].clientX;
    return event.clientX;
  }

  function animation() {
    setSliderPosition(currentTranslate.current);
    if (isDragging.current) {
      animationRef.current = requestAnimationFrame(animation);
    }
  }

  function touchStart(event: React.TouchEvent | React.MouseEvent) {
    isDragging.current = true;
    startX.current = getPositionX(event);
    animationRef.current = requestAnimationFrame(animation);
  }

  function touchMove(event: React.TouchEvent | React.MouseEvent) {
    if (!isDragging.current) return;
    const currentPosition = getPositionX(event);
    currentTranslate.current = prevTranslate.current + currentPosition - startX.current;
  }

  function touchEnd() {
    cancelAnimationFrame(animationRef.current!);
    isDragging.current = false;

    const movedBy = currentTranslate.current - prevTranslate.current;
    const width = getItemWidth();

    if (movedBy < -50 && currentIndex < productsCount - itemsToShow) {
      setCurrentIndex((i) => i + 1);
    } else if (movedBy > 50 && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      setSliderPosition(prevTranslate.current);
    }

    currentTranslate.current = 0;
  }

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const next = () => {
    if (currentIndex < productsCount - itemsToShow) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="relative w-full overflow-hidden select-none">
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-out cursor-grab"
        onTouchStart={touchStart}
        onTouchMove={touchMove}
        onTouchEnd={touchEnd}
        onMouseDown={touchStart}
        onMouseMove={touchMove}
        onMouseUp={touchEnd}
        onMouseLeave={() => isDragging.current && touchEnd()}
      >
        {productsWithRatings.map(({ product, rating }) => (
          <div key={product._id} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/4 px-2">
            <ProductCard product={product} rating={rating} />
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        disabled={currentIndex === 0}
        aria-label="Anterior"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-80 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={next}
        disabled={currentIndex >= productsCount - itemsToShow}
        aria-label="Próximo"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-80 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={24} />
      </button>

      <div className="flex justify-center mt-4 space-x-3">
        {Array.from({ length: productsCount - itemsToShow + 1 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ir para o slide ${idx + 1}`}
            className={`w-4 h-4 rounded-full transition-colors ${
              idx === currentIndex ? "bg-blue-600" : "bg-gray-400 hover:bg-gray-600"
            }`}
          />
        ))}

      </div>
    </div>
  );
}
