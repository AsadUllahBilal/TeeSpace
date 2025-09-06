import connectDB from '@/lib/mongo';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { IProduct, ICategory } from '@/types';
import ProductForm from '@/components/ProductForm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: PageProps) {
  await connectDB();
  
  const categories = await Category.find().sort({ name: 1 });
  const categoriesData: ICategory[] = JSON.parse(JSON.stringify(categories));
  
  const product = await Product.findById(params.id).populate('category');
  
  if (!product) {
    notFound();
  }
  
  const productData: IProduct = JSON.parse(JSON.stringify(product));
  
  return (
    <div className="container mx-auto py-6">
      <ProductForm product={productData} categories={categoriesData} />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Edit Product - Admin Panel',
  };
}