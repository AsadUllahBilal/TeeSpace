import Product from '@/models/Product';
import Category from '@/models/Category'; // Import to ensure Category model is registered
import { IProduct } from '@/types';
import { generateSlug } from './slug';

/**
 * Product service for handling product operations
 */
export class ProductService {
  /**
   * Get product by ID with enhanced error handling
   */
  static async getById(id: string): Promise<IProduct | null> {
    try {
      // Ensure Category model is registered
      Category;
      
      const product = await Product.findById(id).populate('category');
      return product ? JSON.parse(JSON.stringify(product)) : null;
    } catch (error) {
      console.error('Error fetching product by ID:', id, error);
      return null;
    }
  }

  /**
   * Get product by slug (using ID lookup for better reliability)
   */
  static async getBySlug(slug: string): Promise<IProduct | null> {
    try {
      // First find the product by slug to get its ID
      const productLookup = await Product.findOne({ slug }).select('_id').lean();
      
      if (!productLookup) {
        return null;
      }
      
      // Then fetch full product data using ID with population
      const product = await Product.findById(productLookup._id).populate('category');
      return product ? JSON.parse(JSON.stringify(product)) : null;
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      return null;
    }
  }

  /**
   * Get all products with pagination and filtering
   */
  static async getAll(options: {
    limit?: number;
    page?: number;
    category?: string;
    search?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
  } = {}) {
    const {
      limit = 10,
      page = 1,
      category,
      search,
      color,
      minPrice,
      maxPrice
    } = options;

    // Build query
    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (color) {
      const colors = color.split(",");
      query.colors = { $in: colors };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    const products = await Product.find(query)
      .populate("category")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    return {
      products: JSON.parse(JSON.stringify(products)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new product
   */
  static async create(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    await product.save();
    await product.populate('category');
    return JSON.parse(JSON.stringify(product));
  }

  /**
   * Update a product by ID
   */
  static async update(id: string, updateData: Partial<IProduct>): Promise<IProduct | null> {
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('category');
    
    return product ? JSON.parse(JSON.stringify(product)) : null;
  }

  /**
   * Delete a product by ID
   */
  static async delete(id: string): Promise<boolean> {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Generate a unique slug for a product
   */
  static async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug already exists
    while (await Product.findOne({ slug, _id: { $ne: excludeId } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  }

  /**
   * Get related products (same category, excluding current product)
   */
  static async getRelated(productId: string, categoryId: string, limit: number = 4): Promise<IProduct[]> {
    const products = await Product.find({
      category: categoryId,
      _id: { $ne: productId }
    })
    .populate('category')
    .limit(limit)
    .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(products));
  }

  /**
   * Search products by query
   */
  static async search(query: string, limit: number = 10): Promise<IProduct[]> {
    try {
      // Ensure Category model is registered
      Category;
      
      const products = await Product.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ]
      })
      .populate('category')
      .limit(limit)
      .sort({ createdAt: -1 });

      return JSON.parse(JSON.stringify(products));
    } catch (error) {
      console.error('Error searching products:', query, error);
      return [];
    }
  }
  
  /**
   * Universal product lookup - handles both slug and ID
   */
  static async findProduct(identifier: string): Promise<IProduct | null> {
    try {
      // Check if identifier is a valid MongoDB ObjectId (24 characters, hex)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
      
      if (isObjectId) {
        // If it looks like an ObjectId, try ID lookup first
        return await this.getById(identifier);
      } else {
        // Otherwise, assume it's a slug
        return await this.getBySlug(identifier);
      }
    } catch (error) {
      console.error('Error in universal product lookup:', identifier, error);
      return null;
    }
  }
}
