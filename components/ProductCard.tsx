import Link from 'next/link';
import { IProduct } from '@/types';
import Image from 'next/image';

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Helper function to get the first image or a placeholder
  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/images/placeholder-product.jpg';
  };

  return (
    <div
      className="group w-[260px] min-h-[328px] rounded-2xl flex flex-col items-center justify-center gap-3 hover:shadow-2xl p-6 hover:scale-105 transition-all duration-300 relative"
    >
      <div className="relative flex items-center justify-center">
        <Link href={`/shop/${product.slug}`}>
          <Image
            src={getImageUrl()}
            alt={product.title}
            className="rounded-2xl w-full h-[282px] object-cover"
            width={212}
            height={282}
          />
        </Link>
        <div className="flex items-center justify-center gap-2 absolute top-[90%] opacity-0 group-hover:top-[80%] group-hover:opacity-100 transition-all duration-300 font-bold">
          {product.sizes.slice(0, 3).map((s, i) => (
            <div
              key={i}
              className="w-10 h-10 grid place-items-center rounded-full bg-white shadow-md cursor-pointer hover:bg-primary-green transition-all"
            >
              {s}
            </div>
          ))}
          {product.sizes.length > 3 && (
            <div className="w-10 h-10 grid place-items-center rounded-full bg-white shadow-md cursor-pointer hover:bg-primary-green transition-all">
              +{product.sizes.length - 3}
            </div>
          )}
        </div>
      </div>

      <Link href={`/shop/${product.slug}`}>
        <h1 className="font-bold text-[17px] hover:text-primary-green transition-all duration-300 text-center line-clamp-2">
          {product.title}
        </h1>
      </Link>

      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">${product.price}</span>
        {product.stockQuantity === 0 && (
          <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">
            Out of Stock
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {product.colors.slice(0, 6).map((c, i) => {
          // Handle both color names and hex values
          const colorValue = c.startsWith('#') ? c : 
            c === 'red' ? '#ef4444' :
            c === 'blue' ? '#3b82f6' :
            c === 'green' ? '#22c55e' :
            c === 'yellow' ? '#eab308' :
            c === 'purple' ? '#a855f7' :
            c === 'pink' ? '#ec4899' :
            c === 'black' ? '#000000' :
            c === 'white' ? '#ffffff' :
            c === 'gray' ? '#6b7280' :
            c === 'orange' ? '#f97316' : '#6b7280';
          
          return (
            <div
              key={i}
              style={{ backgroundColor: colorValue }}
              className="w-4 h-4 rounded-full border border-gray-300"
              title={c}
            ></div>
          );
        })}
        {product.colors.length > 6 && (
          <span className="text-xs text-gray-500">
            +{product.colors.length - 6}
          </span>
        )}
      </div>
    </div>
  );
}