import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // choose the weights you need
  variable: "--font-plus-jakarta", // custom CSS variable
});
export const metadata: Metadata = {
  title: "TeeSpace",
  description: "A best website for buying exclusive T-shirts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={plusJakarta.variable}>
          <NextTopLoader color="#2EBB77" showSpinner={false}/>
          <Toaster/>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
