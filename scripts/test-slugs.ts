/**
 * Test script to verify slug generation functionality
 */

import { generateSlug, generateUniqueSlug, isValidSlug } from '../lib/slug';

function testSlugGeneration() {
  console.log('Testing slug generation...\n');

  // Test basic slug generation
  const testCases = [
    'Cool T-Shirt',
    'Amazing Product!',
    'Product with Special Characters @#$%',
    'Product with Numbers 123',
    'UPPERCASE PRODUCT',
    'product with spaces',
    'Product---with---dashes',
    'Product with émojis 🎉',
  ];

  console.log('Basic slug generation:');
  testCases.forEach(title => {
    const slug = generateSlug(title);
    console.log(`"${title}" -> "${slug}"`);
  });

  console.log('\nSlug validation:');
  const validationTests = [
    'valid-slug',
    'another-valid-slug-123',
    'Invalid Slug!',
    'invalid@slug',
    'valid_slug_with_underscores',
    'valid-slug-with-dashes',
  ];

  validationTests.forEach(slug => {
    const isValid = isValidSlug(slug);
    console.log(`"${slug}" -> ${isValid ? 'Valid' : 'Invalid'}`);
  });

  console.log('\nUnique slug generation:');
  const existingSlugs = ['cool-t-shirt', 'amazing-product', 'product-123'];
  const newTitles = ['Cool T-Shirt', 'Amazing Product', 'Product 123', 'Cool T-Shirt'];

  newTitles.forEach(title => {
    const uniqueSlug = generateUniqueSlug(title, existingSlugs);
    console.log(`"${title}" -> "${uniqueSlug}"`);
    existingSlugs.push(uniqueSlug); // Add to existing for next iteration
  });

  console.log('\nSlug generation test completed!');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSlugGeneration();
}

export default testSlugGeneration;
