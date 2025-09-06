import connectDB from '@/lib/mongo';
import Category from '@/models/Category';
import { ICategory } from '@/types';
import CategoryForm from '@/components/CategoryForm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditCategoryPage({ params }: PageProps) {
  await connectDB();
  
  const category = await Category.findById(params.id);
  
  if (!category) {
    notFound();
  }
  
  const categoryData: ICategory = JSON.parse(JSON.stringify(category));
  
  return (
    <CategoryForm category={categoryData} />
  );
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Edit Category - Admin Panel',
  };
}