"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { ReactTyped } from "react-typed";
import hero1 from "@/data/hero-2.png";
import hero2 from "@/data/hero-33.png";
import hero3 from "@/data/hero-3.png";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Heading } from "@/components/ui/heading";
import { styleData, infoData, homeLast } from "@/data";
import Link from "next/link";
import { IProduct } from "@/types";
import ProductCard from "@/components/ProductCard";

const images = [hero1, hero2, hero3];

interface HomeClientProps {
  initialProducts: IProduct[];
  hasMore: boolean;
}

export default function HomeClient({ initialProducts, hasMore: initialHasMore }: HomeClientProps) {
  const [index, setIndex] = useState(0);
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [hasMoreProducts, setHasMoreProducts] = useState(initialHasMore);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000); // change every 3s
    return () => clearInterval(interval);
  }, []);

  // Load more products function
  const loadMoreProducts = async () => {
    if (isLoadingMore || !hasMoreProducts) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      const response = await fetch(`/api/products/home?page=${nextPage}&limit=8&randomize=true`);
      const data = await response.json();
      
      if (response.ok && data.products) {
        setProducts(prev => [...prev, ...data.products]);
        setCurrentPage(nextPage);
        setHasMoreProducts(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <main className="min-h-screen w-full">
      <section className="w-full h-full md:px-10 px-3 py-10 flex md:flex-row flex-col md:items-center items-start justify-center gap-10">
        <div className="md:w-1/2 max-w-full h-full flex flex-col items-start justify-center">
          <span className="bg-[#f4ebf9] text-[#B479D9] border-none outline-none font-bold uppercase rounded-full px-3 py-2 text-[15px]">
            visit our shop
          </span>
          <h1 className="hero-br:text-5xl text-3xl font-bold max-w-[400px] mt-5">
            Make the most
          </h1>
          <h1 className="hero-br:text-5xl text-3xl font-bold max-w-[450px]">
            <ReactTyped
              strings={["favourite custom", "desired ideas", "of our T-shirt"]}
              typeSpeed={60}
              backSpeed={40}
              loop
            />
          </h1>
          <h1 className="hero-br:text-5xl text-3xl font-bold max-w-[450px]">
            Products
          </h1>
          <p className="text-gray-400 text-[17px] font-medium mt-7">
            Discover stylish, high-quality t-shirts designed for comfort and
            confidence. From casual classics to trendy designs, we've got your
            perfect fit.
          </p>
          <Link href="/shop">
            <Button
              variant={"myOwnBtn"}
              className="cursor-pointer mt-8 flex items-center justify-center gap-2 bg-[#2EBB77]"
            >
              Shop Now <ArrowRight />
            </Button>
          </Link>
          <div className="flex sm-br:items-center sm-br:justify-center justify-start gap-6 mt-7 sm-br:flex-nowrap flex-wrap">
            <div>
              <h1 className="hero-br:text-5xl text-3xl font-bold">12k+</h1>
              <p className="text-gray-400 text-[17px] font-medium mt-2">
                Collections
              </p>
            </div>
            <div className="w-[1px] h-14 bg-gray-300 sm-br:block hidden" />
            <div>
              <h1 className="hero-br:text-5xl text-3xl font-bold">26k+</h1>
              <p className="text-gray-400 text-[17px] font-medium mt-2">
                items trusted to deliver
              </p>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 w-full h-[500px] relative overflow-hidden">
          {images.map((img, i) => (
            <Image
              key={i}
              src={img}
              alt={`Hero Image ${i + 1}`}
              fill
              priority={i === 0}
              className={`object-cover transition-opacity duration-1000 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </section>
      
      <div className="w-full px-5 py-12 flex lg:items-center items-start justify-between lg:flex-row flex-col gap-6">
        {infoData.map((d, i) => (
          <div
            key={i}
            className="lg:w-[430px] w-full flex items-center md-br:flex-row flex-col lg:justify-center justify-start gap-4"
          >
            <Image
              src={d.image}
              alt="top quality image"
              className="rounded-full"
              width={100}
              height={100}
            />
            <div>
              <h1 className="font-bold text-2xl">{d.title}</h1>
              <p className="text-[15px] text-gray-400 mt-4">{d.des}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="w-full px-8 py-10">
        <Heading as="h3">What's your style?</Heading>
        <div className="flex items-center style-br:justify-between justify-center mt-10 flex-wrap">
          {styleData.map((d, i) => (
            <div
              key={i}
              className="group w-[250px] rounded-2xl flex flex-col items-center justify-center gap-4 p-4 transition-all duration-300 hover:transform hover:-translate-y-4 hover:bg-[#2EBB77]"
            >
              <d.icon className="h-10 w-10 text-primary-green transition-colors duration-300 group-hover:text-white" />
              <Heading
                as="h4"
                className="transition-colors duration-300 group-hover:text-white"
              >
                {d.title}
              </Heading>
              <p className="text-center text-gray-400 transition-colors duration-300 group-hover:text-white">
                {d.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Featured Products Section */}
        <div className="mt-16">
          <div className="flex justify-between items-center mb-8">
            <Heading as="h3">Featured Products</Heading>
            <Link href="/shop" className="text-primary-green hover:underline font-semibold">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMoreProducts && (
            <div className="flex justify-center mt-12">
              <Button
                onClick={loadMoreProducts}
                disabled={isLoadingMore}
                size="lg"
                variant={"myOwnBtn"}
                className="cursor-pointer"
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
        
        <div className="w-full flex items-center sm:justify-between justify-center flex-wrap mt-14 sm:gap-0 gap-8">
          {homeLast.map((last, i) => (
            <div key={i} className="w-[290px] flex flex-col items-center justify-center gap-3">
              <last.icon className="w-10 h-10 text-primary-green"/>
              <Heading as="h4">{last.title}</Heading>
              <p className="text-gray-400">{last.des}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
