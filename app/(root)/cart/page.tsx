"use client";

import React from "react";
import PageBanner from "@/components/PageBanner";
import { Heading } from "@/components/ui/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCartStore } from "@/lib/cartStore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const CartPage = () => {
  const { user } = useUser();
  const { cart, cartCount, cartTotal, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } =
    useCartStore();

  // Function to truncate description to 30 words
  const truncateDescription = (description: string) => {
    if (!description) return "";

    const words = description.split(" ");
    if (words.length <= 30) {
      return description;
    }

    return words.slice(0, 30).join(" ") + "...";
  };

  if(!user) {
    return(
      <div className="w-full min-h-full">
        <PageBanner bannerName="Cart" />
        <Heading as="h4" className="text-center my-10">
          Shopping Cart
        </Heading>
        <p className="text-gray-400 text-center mb-8">Please Login To View Cart. <Link href="/sign-in"><span className="text-primary-green font-medium">Login</span></Link></p>
      </div>
    )
  }
  return (
    <div className="w-full min-h-full">
      <PageBanner bannerName="Cart" />
      <Heading as="h4" className="text-center my-10">
        Shopping Cart
      </Heading>
      <div className="w-full lg:px-[5rem] px-2 mb-8">
        <div>
          <Table className="border-[1px] border-gray-300 relative">
            <TableHeader className="bg-gray-300">
              <TableRow>
                <TableHead className="font-bold">Action</TableHead>
                <TableHead className="font-bold">Product</TableHead>
                <TableHead className="font-bold">Price</TableHead>
                <TableHead className="font-bold">Quantity</TableHead>
                <TableHead className="font-bold text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="relative">
              {cart.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center font-medium">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                cart.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="relative">
                      <span className="cursor-pointer" onClick={() => removeFromCart(product.id)}>
                        <X size={22} className="text-gray-300"/>
                      </span>
                    </TableCell>
                    <TableCell className="font-medium relative">
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 && (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            className="w-20 h-20 object-cover rounded"
                            width={80}
                            height={80}
                          />
                        )}
                        <div>
                          <div>{product.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {truncateDescription(product.description || "")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="relative">${product.price.toFixed(2)}</TableCell>
                    <TableCell className="relative">
                      <div className="w-[140px] flex items-center justify-center gap-1 bg-gray-100 rounded-md">
                        <Button
                          size={"lg"}
                          className="bg-transparent font-bold text-gray-400 hover:text-black transition-all duration-300 shadow-none cursor-pointer"
                          variant={"secondary"}
                          onClick={() => increaseQuantity(product.id)}
                        >
                          <Plus size={20} />
                        </Button>
                        <Button
                          size={"lg"}
                          className="bg-transparent font-bold text-black shadow-none cursor-pointer"
                          variant={"secondary"}
                        >
                          {cartCount}
                        </Button>
                        <Button
                          size={"lg"}
                          className="bg-transparent font-bold text-gray-400 hover:text-black transition-all duration-300 shadow-none cursor-pointer"
                          variant={"secondary"}
                          onClick={() => decreaseQuantity(product.id)}
                        >
                          <Minus size={20} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="relative">
                      <p className="text-[20px] font-bold">${cartTotal}</p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center flex-col cart-br:flex-row justify-start gap-2 mt-3">
          <Link href="/shop">
          <Button variant={"myOwnBtn"} className="bg-black text-white hover:bg-[#2EBB77] transition-all duration-300 cursor-pointer" size={"lg"}>Continue Shopping</Button>
          </Link>
          <Button className="flex items-center justify-center gap-2 text-black underline bg-transparent hover:bg-transparent hover:text-primary-green transition-all duration-300 cursor-pointer" onClick={() => clearCart()} size={"lg"}><X size={14} /> Clear Cart</Button>
        </div>
      </div>
      <div className="cart-br:w-[500px] w-[300px] p-4 rounded-lg shadow-lg mx-auto my-8">
        <div className="w-full flex items-center justify-between">
          <h4 className="text-[18px] font-bold">Product</h4>
          <h4 className="text-[18px] font-bold">SubTotal</h4>
        </div>
        <div className="w-full">
          {cart.map((c) => (
            <div key={c.id} className="w-full flex items-center justify-between">
              <h4 className="text-[16px] font-medium text-gray-400 flex items-center justify-center gap-2">{c.title}<span className="text-black">x {cartCount}</span></h4>
              <p className="text-black font-medium">${c.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
        <hr className="my-2" />
        <div className="w-full flex items-center justify-between">
          <h4 className="text-[18px] font-medium">SubTotal</h4>
          <p className="text-black font-medium">${cartTotal.toFixed(2)}</p>
        </div>
        <hr className="my-2" />
        <div className="w-full flex items-center justify-between">
          <h4 className="text-[18px] font-bold">Total</h4>
          <p className="text-black font-bold">${cartTotal.toFixed(2)}</p>
        </div>
        <hr className="my-2" />
        <Link href="/checkout">  
        <Button variant={"myOwnBtn"} className="w-full bg-[#2EBB77] text-white hover:bg-[#25925d] transition-all duration-300 cursor-pointer mt-3" size={"lg"}>Proceed To Checkout</Button>
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
