import { IProduct } from '@/types';
import ProductCard from './ProductCard';

interface ProductsGridProps {
  products: IProduct[];
  title?: string;
  showViewAll?: boolean;
}

export default function ProductsGrid({ 
  products, 
  title = "Featured Products",
  showViewAll = true 
}: ProductsGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
        <p className="text-center text-gray-500">No products found.</p>
      </div>
    );
  }

  return (
    <section className="w-full">
      {title && (
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          {showViewAll && (
            <a 
              href="/products" 
              className="text-primary-green hover:underline font-semibold"
            >
              View All →
            </a>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}