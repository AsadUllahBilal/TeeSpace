"use client";

import React, { ReactNode } from "react";
import logo from "@/public/TeeSpace.png";
import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, UserRound } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

const NavLink = ({href, children}: {href: string, children: ReactNode}) => {
  const pathName = usePathname();

  const isActive = pathName === href;

  return (
    <Link href={href}>
      <li className={`font-bold uppercase hover:text-primary-green transition-all duration-300 ${isActive ? "text-primary-green" : "text-black"}`}>{children}</li>
    </Link>
  )
}

const Navbar = () => {
  const { user, isLoaded } = useUser();
  return (
    <header className="w-full h-[100px] flex items-center justify-between px-2 nav-br:px-10 border-b-[1px] border-gray-300 sticky top-0 bg-white z-50 shadow-2xl">
      <div className="flex items-center justify-center gap-9">
        <Link href="/">
          <Image src={logo} alt="Web Logo" className="w-40" />
        </Link>
        <ul className="hidden nav-br:flex items-center justify-center gap-3">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/shop">Shop</NavLink>
          <NavLink href="/about">About</NavLink>
          <NavLink href="/contact-us">Contact Us</NavLink>
        </ul>
      </div>
      <div className="flex items-center justify-center gap-3">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none cursor-pointer" asChild>
              <Image
                src={user.imageUrl}
                alt="Profile Pic"
                width={30}
                height={30}
                className="object-cover rounded-full"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-gray-300">
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  MyAccount
                </DropdownMenuItem>
              </Link>
              <Link href="/profile/orders">
                <DropdownMenuItem className="cursor-pointer">
                  Orders
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none cursor-pointer" asChild>
              <UserRound />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href="/sign-in">
                <DropdownMenuItem className="cursor-pointer">
                  Login
                </DropdownMenuItem>
              </Link>
              <Link href="/sign-up">
                <DropdownMenuItem className="cursor-pointer">
                  Register
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Link href="/cart">
          <div className="relative">
            <ShoppingBag />
            <div className="absolute h-2 w-2 rounded-full bg-primary-green top-0 right-0"></div>
          </div>
        </Link>
        <div className="flex nav-br:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none cursor-pointer" asChild>
              <Button className="bg-gray-300 text-black font-bold border-none outline-none hover:bg-gray-400 transition-all duration-300 cursor-pointer">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-gray-300">
              <Link href="/">
                <DropdownMenuItem className="cursor-pointer">
                  Home
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/shop">
                <DropdownMenuItem className="cursor-pointer">
                  Shop
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/about">
                <DropdownMenuItem className="cursor-pointer">
                  About
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href="/contact-us">
                <DropdownMenuItem className="cursor-pointer">
                  Contact Us
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
