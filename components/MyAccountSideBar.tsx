import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

const SideBarLink = ({href, children}: {href: string, children: React.ReactNode}) => {
    const pathname = usePathname();

    const isActive = pathname === href;

    return (
        <Link href={href}>
          <Button
            className={`bg-transparent border-none outline-none w-full flex items-center justify-center font-bold text-[16px] shadow-none hover:bg-[#f6fafc] cursor-pointer transition-all duration-300 ${isActive ? "text-primary-green bg-[#f6fafc]" : "text-black"}`}
            size={"lg"}
          >
            {children}
          </Button>
        </Link>
    )
  };

const MyAccountSideBar = () => {
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <div className="w-full first-br:w-[300px] first-br:pr-12 first-br:border-r-[1px] border-gray-300">
      <h1 className="text-2xl font-bold py-5 border-b-[1px] border-gray-300">
        My Account
      </h1>
      <div className="mt-10">
        <SideBarLink href="/profile">Account Details</SideBarLink>
        <SideBarLink href="/profile/orders">Orders</SideBarLink>
        <Button
          className="bg-transparent border-none outline-none w-full flex items-center justify-center font-bold text-[16px] text-black shadow-none hover:bg-[#f6fafc] hover:shadow hover:text-primary-green cursor-pointer transition-all duration-300"
          onClick={handleSignOut}
          size={"lg"}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default MyAccountSideBar;
