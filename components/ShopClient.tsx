"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ListFilter, X, Search, Loader2 } from "lucide-react";
import ProductsGrid from "@/components/ProductGrid";
import { IProduct, ICategory } from "@/types";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Heading } from "./ui/heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "./ui/scroll-area";
import { Slider } from "./ui/slider";
import { IconCancel } from "@tabler/icons-react";

interface ShopClientProps {
  initialProducts: IProduct[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  searchParams: { [key: string]: string };
  categories: ICategory[];
  availableColors: string[];
  hasMore?: boolean;
}

export default function ShopClient({
  initialProducts,
  currentPage,
  totalPages,
  totalProducts,
  categories,
  availableColors,
  hasMore = false,
}: ShopClientProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(params.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(params.get("category") || "");
  const [minPrice, setMinPrice] = useState(params.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") || "");
  const [selectedColor, setSelectedColor] = useState(params.get("color") || "");
  const [priceRange, setPriceRange] = useState<number[]>([
    Number(params.get("min_price")) || 10,
    Number(params.get("max_price")) || 500,
  ]);

  // Load more functionality
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [currentPageState, setCurrentPageState] = useState(currentPage);
  const [hasMoreProducts, setHasMoreProducts] = useState(hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ✅ Update local state when URL params change
  useEffect(() => {
    setSearchQuery(params.get("search") || "");
    setSelectedCategory(params.get("category") || "");
    setMinPrice(params.get("min_price") || "");
    setMaxPrice(params.get("max_price") || "");
    setSelectedColor(params.get("color") || "");
  }, [params]);

  // Reset products when initial products change (new search/filter)
  useEffect(() => {
    setProducts(initialProducts);
    setCurrentPageState(currentPage);
    setHasMoreProducts(hasMore);
  }, [initialProducts, currentPage, hasMore]);

  // ✅ Update filters in URL
  const updateFilters = (newParams: { [key: string]: string | undefined }) => {
    const currentParams = new URLSearchParams(params.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        currentParams.set(key, value);
      } else {
        currentParams.delete(key);
      }
    });

    currentParams.set("page", "1"); // reset pagination when filters change
    router.push(`/shop?${currentParams.toString()}`, { scroll: false });
  };

  // ✅ Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      search: searchQuery,
      category: undefined,
      min_price: undefined,
      max_price: undefined,
      color: undefined,
    });
  };

  // ✅ Category
  const handleCategoryChange = (categorySlug: string) => {
    updateFilters({ category: categorySlug });
  };

  // ✅ Price range
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    updateFilters({
      min_price: values[0].toString(),
      max_price: values[1].toString(),
    });
  };

  // ✅ Color
  const handleColorChange = (color: string) => {
    updateFilters({ color });
  };

  // ✅ Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedColor("");
    router.push("/shop", { scroll: false });
  };

  // ✅ Load more products
  const loadMoreProducts = async () => {
    if (isLoadingMore || !hasMoreProducts) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = currentPageState + 1;
      const searchParamsObj = new URLSearchParams();
      
      // Add current filters to the API call
      searchParamsObj.set('page', nextPage.toString());
      searchParamsObj.set('limit', '12');
      
      if (searchQuery) searchParamsObj.set('search', searchQuery);
      if (selectedCategory) searchParamsObj.set('category', selectedCategory);
      if (minPrice) searchParamsObj.set('min_price', minPrice);
      if (maxPrice) searchParamsObj.set('max_price', maxPrice);
      if (selectedColor) searchParamsObj.set('color', selectedColor);
      
      const response = await fetch(`/api/products/shop?${searchParamsObj.toString()}`);
      const data = await response.json();
      
      if (response.ok && data.products) {
        setProducts(prev => [...prev, ...data.products]);
        setCurrentPageState(nextPage);
        setHasMoreProducts(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // ✅ Check active filters
  const hasActiveFilters = selectedCategory || minPrice || maxPrice || selectedColor || searchQuery;

  // ✅ Pagination display
  const productsPerPage = 12;
  const indexOfFirst = 1;
  const indexOfLast = products.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-gray-700">
              Showing {indexOfFirst}–{indexOfLast} of {totalProducts}{" "}
              results
            </p>

            <Button
              className="bg-white border-[1px] border-gray-400 text-black font-bold flex items-center justify-center gap-1 hover:text-gray-500 hover:bg-white transition-all duration-300 cursor-pointer"
              size={"lg"}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {isFilterOpen ? <X size={16} /> : <ListFilter size={16} />} Filter
            </Button>
          </div>

          {isFilterOpen && (
            <div className="w-full min-h-[10vh] flex justify-center gap-2 flex-wrap">
              <Accordion type="single" collapsible className="w-[290px]">
                <AccordionItem value="item-1">
                  <div className="w-full flex items-center justify-between">
                    <Heading as="h4">Search</Heading>
                    <AccordionTrigger />
                  </div>
                  <AccordionContent>
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search products by name, category, price..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible className="w-[290px]">
                <AccordionItem value="item-1">
                  <div className="w-full flex items-center justify-between">
                    <Heading as="h4">Product Categories</Heading>
                    <AccordionTrigger />
                  </div>
                  <AccordionContent className="w-full">
                    <ScrollArea className="w-full flex flex-col">
                      {categories.map((cat) => (
                        <Button
                          className={`group bg-transparent text-gray-400 text-[15px] shadow-none outline-none transition-all duration-300 cursor-pointer flex items-center justify-between w-full border-none hover:bg-white ${
                              selectedCategory === cat.slug
                                ? "border-[1px] border-gray-300 underline text-primary-green"
                                : "hover:bg-transparent hover:text-primary-green hover:underline hover:border-[1px] hover:border-gray-300"
                        }`}
                          key={cat._id}
                          onClick={() => handleCategoryChange(cat.slug)}
                        >
                          {cat.name}{" "}
                        </Button>
                      ))}
                    </ScrollArea>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible className="w-[290px]">
                <AccordionItem value="item-1">
                  <div className="w-full flex items-center justify-between">
                    <Heading as="h4">Filter By Price</Heading>
                    <AccordionTrigger />
                  </div>
                  <AccordionContent className="w-full">
                    <div className="space-y-4 mt-2">
                      <Slider
                        value={priceRange}
                        min={10}
                        max={500}
                        step={10}
                        onValueChange={setPriceRange}
                        className="mt-2"
                      />
                      <div className="flex justify-between">
                        <div className="text-gray-400">
                            Price:
                            <span className="text-black font-medium">${priceRange[0]}</span>-
                        <span className="text-black font-medium">${priceRange[1]}</span>
                        </div>
                        <Button variant={"secondary"} className="hover:bg-[#2EBB77] hover:text-white transition-all duration-300 font-bold cursor-pointer" onClick={() => handlePriceRangeChange(priceRange)}>Filter</Button>
                      </div>
                    </div>

                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <Accordion type="single" collapsible className="w-[290px]">
                <AccordionItem value="item-1">
                  <div className="w-full flex items-center justify-between">
                    <Heading as="h4">Filter By Color</Heading>
                    <AccordionTrigger />
                  </div>
                  <AccordionContent className="w-full flex flex-col gap-2">
                    {availableColors.map((color) => (
                      <Button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`group bg-transparent text-gray-400 text-[15px] shadow-none outline-none transition-all duration-300 cursor-pointer flex items-center justify-between w-full border-none hover:bg-white ${
                              selectedColor === color
                                ? "border-[1px] border-gray-300 underline text-primary-green"
                                : "hover:bg-transparent hover:text-primary-green hover:underline hover:border-[1px] hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{
                              backgroundColor: color.toLowerCase(),
                              border:
                                color.toLowerCase() === "white"
                                  ? "1px solid #e5e5e5"
                                  : "none",
                            }}
                          />
                          <span>{color}</span>
                        </div>
                      </Button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
          {hasActiveFilters && (
            <div className="mb-6 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => updateFilters({ search: "" })}
                    className="ml-2"
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Category:{" "}
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <button
                    onClick={() => updateFilters({ category: "" })}
                    className="ml-2"
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Price: ${minPrice || "0"} - ${maxPrice || "∞"}
                  <button
                    onClick={() =>
                      updateFilters({ min_price: "", max_price: "" })
                    }
                    className="ml-2"
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </button>
                </span>
              )}
              {selectedColor && (
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Color: {selectedColor}
                  <button
                    onClick={() => updateFilters({ color: "" })}
                    className="ml-2"
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid */}
          <ProductsGrid
            products={products}
            title=""
            showViewAll={false}
          />

          {/* Load More Button */}
          {hasMoreProducts && (
            <div className="flex justify-center mt-12">
              <Button
                onClick={loadMoreProducts}
                disabled={isLoadingMore}
                size="lg"
                className="bg-primary-green hover:bg-primary-green/90 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Products'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
