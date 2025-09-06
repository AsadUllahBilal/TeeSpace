import connectDB from '@/lib/mongo';
import { ICategory } from '@/types';
import CategoryForm from '@/components/CategoryForm';

export default async function NewCategoryPage() {
  await connectDB();
  
  return (
    <CategoryForm />
  );
}

export const metadata = {
  title: 'Create New Category - Admin Panel',
};