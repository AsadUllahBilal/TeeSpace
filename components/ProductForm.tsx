'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IProduct, ICategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, X, Upload, ImageIcon, Trash2, Undo, Palette } from 'lucide-react';
import Image from 'next/image';

interface ProductFormProps {
  product?: IProduct;
  categories: ICategory[];
}

// Predefined color options with names and hex values
const colorOptions = [
  { name: 'Red', value: 'red', hex: '#ef4444' },
  { name: 'Blue', value: 'blue', hex: '#3b82f6' },
  { name: 'Green', value: 'green', hex: '#22c55e' },
  { name: 'Yellow', value: 'yellow', hex: '#eab308' },
  { name: 'Purple', value: 'purple', hex: '#a855f7' },
  { name: 'Pink', value: 'pink', hex: '#ec4899' },
  { name: 'Black', value: 'black', hex: '#000000' },
  { name: 'White', value: 'white', hex: '#ffffff' },
  { name: 'Gray', value: 'gray', hex: '#6b7280' },
  { name: 'Orange', value: 'orange', hex: '#f97316' },
];

// Predefined size options
const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product?.images || []);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [customColorInput, setCustomColorInput] = useState('');
  const [isCustomColorDialogOpen, setIsCustomColorDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category 
      ? (typeof product.category === 'object' ? product.category._id : product.category)
      : '',
    stockQuantity: product?.stockQuantity || 0,
  });

  const [selectedColors, setSelectedColors] = useState<string[]>(
    product?.colors ? (Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors)) : []
  );

  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    product?.sizes ? (Array.isArray(product.sizes) ? product.sizes : JSON.parse(product.sizes)) : []
  );

  // Fix for image previews - create object URLs and clean up
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  useEffect(() => {
    // Create object URLs for new images
    const newPreviews = images.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
    
    // Clean up object URLs when component unmounts or images change
    return () => {
      newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [images]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleColor = (colorValue: string) => {
    setSelectedColors(prev =>
      prev.includes(colorValue)
        ? prev.filter(c => c !== colorValue)
        : [...prev, colorValue]
    );
  };

  const addCustomColor = () => {
    if (customColorInput.trim()) {
      // Check if it's a hex color
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (hexRegex.test(customColorInput)) {
        // Add hex color directly
        if (!selectedColors.includes(customColorInput)) {
          setSelectedColors(prev => [...prev, customColorInput]);
        }
      } else {
        // Add color name
        if (!selectedColors.includes(customColorInput.toLowerCase())) {
          setSelectedColors(prev => [...prev, customColorInput.toLowerCase()]);
        }
      }
      setCustomColorInput('');
      setIsCustomColorDialogOpen(false);
    }
  };

  const getColorDisplay = (color: string) => {
    // Check if it's a hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(color)) {
      return color;
    }
    
    // Check if it's a predefined color
    const predefinedColor = colorOptions.find(c => c.value === color);
    if (predefinedColor) {
      return predefinedColor.name;
    }
    
    // Return the color name with first letter capitalized
    return color.charAt(0).toUpperCase() + color.slice(1);
  };

  const getColorHex = (color: string) => {
    // If it's already a hex color, return it
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(color)) {
      return color;
    }
    
    // Check if it's a predefined color
    const predefinedColor = colorOptions.find(c => c.value === color);
    if (predefinedColor) {
      return predefinedColor.hex;
    }
    
    // Return a default color for custom color names
    return '#6b7280'; // gray
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newImages = Array.from(e.target.files);
    setImages(prev => [...prev, ...newImages]);
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    // Remove the image from state
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
    setDeletedImages(prev => [...prev, imageUrl]);
  };

  const restoreImage = (imageUrl: string) => {
    setExistingImages(prev => [...prev, imageUrl]);
    setDeletedImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!formData.title || !formData.category || selectedColors.length === 0 || selectedSizes.length === 0) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price.toString());
      data.append('category', formData.category);
      data.append('colors', JSON.stringify(selectedColors));
      data.append('sizes', JSON.stringify(selectedSizes));
      data.append('stockQuantity', formData.stockQuantity.toString());
      
      // Add existing images to keep (only those not marked for deletion)
      existingImages.forEach(image => data.append('keepImages', image));
      
      // Add deleted images list
      data.append('deletedImages', JSON.stringify(deletedImages));
      
      // Add new images
      images.forEach(image => data.append('images', image));

      let response;
      if (product) {
        // Update existing product
        response = await fetch(`/api/product/${product._id}`, {
          method: 'PUT',
          body: data,
        });
      } else {
        // Create new product
        response = await fetch('/api/products', {
          method: 'POST',
          body: data,
        });
      }

      const result = await response.json();

      if (result.success) {
        router.push('/admin/shop');
        router.refresh();
      } else {
        setError(result.error || 'Failed to save product');
      }
    } catch (err) {
      setError('An error occurred while saving the product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6 px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {product ? 'Edit Product' : 'Add New Product'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {product ? 'Update your product details' : 'Create a new product for your store'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Name *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product..."
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colors *</CardTitle>
            <p className="text-sm text-muted-foreground">Select available colors for this product</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4">
              {colorOptions.map(color => (
                <div
                  key={color.value}
                  className={`flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedColors.includes(color.value)
                      ? 'ring-2 ring-primary'
                      : 'hover:bg-accent'
                  }`}
                  onClick={() => toggleColor(color.value)}
                >
                  <div
                    className="w-8 h-8 rounded-full border"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-xs mt-1">{color.name}</span>
                </div>
              ))}
              
              <Dialog open={isCustomColorDialogOpen} onOpenChange={setIsCustomColorDialogOpen}>
                <DialogTrigger asChild>
                  <div className="flex flex-col items-center p-2 rounded-lg border cursor-pointer hover:bg-accent transition-all">
                    <div className="w-8 h-8 rounded-full border flex items-center justify-center bg-muted">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1">Custom</span>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Color</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Enter a color name (e.g., "Navy Blue") or hex code (e.g., "#1e40af")
                    </p>
                    <Input
                      value={customColorInput}
                      onChange={(e) => setCustomColorInput(e.target.value)}
                      placeholder="Color name or hex code"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomColor();
                        }
                      }}
                    />
                    {customColorInput && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full border"
                          style={{ 
                            backgroundColor: customColorInput.startsWith('#') 
                              ? customColorInput 
                              : '#6b7280' 
                          }}
                        />
                        <span className="text-sm">
                          Preview: {customColorInput}
                        </span>
                      </div>
                    )}
                    <Button onClick={addCustomColor} className="w-full">
                      Add Color
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {selectedColors.length > 0 && (
              <div className="mt-4">
                <Label>Selected Colors:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedColors.map(color => (
                    <Badge 
                      key={color} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                      {getColorDisplay(color)}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColor(color);
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sizes *</CardTitle>
            <p className="text-sm text-muted-foreground">Select available sizes for this product</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map(size => (
                <Button
                  key={size}
                  type="button"
                  variant={selectedSizes.includes(size) ? "default" : "outline"}
                  className="h-10 w-10 p-0"
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
            
            {selectedSizes.length > 0 && (
              <div className="mt-4">
                <Label>Selected Sizes:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSizes.map(size => (
                    <Badge 
                      key={size} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {size}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleSize(size)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <p className="text-sm text-muted-foreground">Upload product images (multiple allowed)</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Debug info - remove in production */}
            <div className="text-xs text-muted-foreground">
              <p>Existing images: {existingImages.length}</p>
              <p>New images: {images.length}</p>
              <p>Deleted images: {deletedImages.length}</p>
            </div>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div>
                <Label>Current Images</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image 
                        src={image} 
                        alt={`Product ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-md"
                        width={80}
                        height={80}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingImage(image)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Deleted images (can be restored) */}
            {deletedImages.length > 0 && (
              <div>
                <Label>Removed Images</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {deletedImages.map((image, index) => (
                    <div key={index} className="relative group opacity-50">
                      <Image 
                        src={image} 
                        alt={`Removed ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-md"
                        width={80}
                        height={80}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="default"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => restoreImage(image)}
                      >
                        <Undo className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New image upload */}
            <div className="space-y-2">
              <Label htmlFor="images">Add New Images</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="images"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="max-w-sm"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            
            {images.length > 0 && (
              <div>
                <Label>New Images to Upload</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image 
                        src={imagePreviews[index]} 
                        alt={`New ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-md"
                        width={80}
                        height={80}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeNewImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {existingImages.length === 0 && images.length === 0 && (
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No images selected</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}