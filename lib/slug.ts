import slugify from 'slugify';

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

/**
 * Generate a unique slug by checking against existing slugs
 * @param baseText - The base text to convert to a slug
 * @param existingSlugs - Array of existing slugs to check against
 * @param excludeId - Optional ID to exclude from uniqueness check
 * @returns A unique slug
 */
export function generateUniqueSlug(
  baseText: string, 
  existingSlugs: string[], 
  excludeId?: string
): string {
  let baseSlug = generateSlug(baseText);
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug already exists (excluding the current item if editing)
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Validate if a string is a valid slug format
 * @param slug - The slug to validate
 * @returns True if valid slug format
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}
