import connectDB from '@/lib/mongo';
import Category from '@/models/Category';
import { ICategory } from '@/types';
import ProductForm from '@/components/ProductForm';

export default async function NewProductPage() {
  await connectDB();
  
  const categories = await Category.find().sort({ name: 1 });
  const categoriesData: ICategory[] = JSON.parse(JSON.stringify(categories));
  
  return (
    <div className="container mx-auto py-6">
      <ProductForm categories={categoriesData} />
    </div>
  );
}

export const metadata = {
  title: 'Add New Product - Admin Panel',
};