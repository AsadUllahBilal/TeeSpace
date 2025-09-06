"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { Breadcrumbs } from "./breadcrumbs";

const PageBanner = ({bannerName}: {bannerName: string}) => {
    const pathname = usePathname();
  return (
    <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black">{bannerName}</h1>
        <p className="text-center font-medium mt-10">
          <Link href="/">
            <span className="text-gray-500 hover:text-primary-green transition-all duration-300">
              Home
            </span>
          </Link>
          {pathname}
        </p>
      </div>
    </div>
  );
};

export default PageBanner;
