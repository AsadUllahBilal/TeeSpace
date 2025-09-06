// app/debug/populate.tsx
import connectDB from "@/lib/mongo";
import Product from "@/models/Product";
import Category from "@/models/Category";

export default async function DebugPopulate() {
  try {
    await connectDB();
    
    // Check the actual data structure
    const productsWithoutPopulate = await Product.find({}).limit(2).lean();
    console.log('Products without populate:', productsWithoutPopulate);
    
    // Try populate with different syntax
    let productsWithPopulate;
    try {
      productsWithPopulate = await Product.find({})
        .populate({
          path: 'category',
          model: 'Category' // explicitly specify the model
        })
        .limit(2)
        .lean();
      console.log('Products with populate (method 1):', productsWithPopulate);
    } catch (error) {
      console.error('Populate method 1 failed:', error);
    }
    
    // Try another populate method
    try {
      productsWithPopulate = await Product.find({})
        .populate('category')
        .limit(2)
        .lean();
      console.log('Products with populate (method 2):', productsWithPopulate);
    } catch (error) {
      console.error('Populate method 2 failed:', error);
    }
    
    // Check what's in the category field
    const sampleProduct = await Product.findOne({});
    console.log('Sample product category field:', sampleProduct?.category);
    console.log('Type of category field:', typeof sampleProduct?.category);
    
    return (
      <div className="p-8">
        <h1>Populate Debug Information</h1>
        <p>Check browser console for detailed logs</p>
        <div className="mt-4">
          <h2>Sample Product:</h2>
          <pre>{JSON.stringify(sampleProduct, null, 2)}</pre>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1>Populate Debug Error</h1>
        <pre>{error.toString()}</pre>
      </div>
    );
  }
}