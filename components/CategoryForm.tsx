'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ICategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft, Save, RefreshCw } from 'lucide-react';

interface CategoryFormProps {
  category?: ICategory;
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    slug: category?.slug || '',
  });

  // Function to generate slug from name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Auto-generate slug when name changes (if slug hasn't been manually edited)
  useEffect(() => {
    if (formData.name && !isSlugManuallyEdited && !category) {
      const newSlug = generateSlug(formData.name);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.name, isSlugManuallyEdited, category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Only allow lowercase letters, numbers, and hyphens
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    setFormData(prev => ({ ...prev, slug }));
    setIsSlugManuallyEdited(true);
  };

  const handleRegenerateSlug = () => {
    if (formData.name) {
      const newSlug = generateSlug(formData.name);
      setFormData(prev => ({ ...prev, slug: newSlug }));
      setIsSlugManuallyEdited(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form
    if (!formData.name.trim()) {
      setError('Category name is required');
      setLoading(false);
      return;
    }

    if (!formData.slug.trim()) {
      setError('Slug is required');
      setLoading(false);
      return;
    }

    try {
      const url = category 
        ? `/api/categories/${category._id}`
        : '/api/categories';
      
      const method = category ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/categories');
        router.refresh();
      } else {
        setError(result.error || 'Failed to save category');
      }
    } catch (err) {
      setError('An error occurred while saving the category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-6 px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {category ? 'Edit Category' : 'Create New Category'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {category ? 'Update your category details' : 'Add a new category to organize your products'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Electronics, Clothing, Books"
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">URL Slug *</Label>
                {formData.name && !category && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRegenerateSlug}
                    className="h-8 gap-1 text-xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Regenerate
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="e.g., electronics, clothing, books"
                  disabled={loading}
                  className="flex-1"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-slug"
                  checked={!isSlugManuallyEdited}
                  onCheckedChange={(checked) => setIsSlugManuallyEdited(!checked)}
                  disabled={!!category}
                />
                <Label htmlFor="auto-slug" className="text-sm cursor-pointer">
                  Auto-generate slug from name
                </Label>
              </div>
              
              <p className="text-sm text-muted-foreground">
                This will be used in the URL. Use lowercase letters, numbers, and hyphens only.
                {!category && ' The slug will auto-update as you type the category name.'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this category..."
                rows={4}
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {category ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}