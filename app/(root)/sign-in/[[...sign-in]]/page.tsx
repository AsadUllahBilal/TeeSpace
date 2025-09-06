"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { SignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export default function Page() {
  const { isLoaded } = useUser();

  if(!isLoaded) {
    return (
      <div className="w-full min-h-full flex items-center justify-center py-10">
        <Skeleton className="w-[400px] h-[500px] rounded-lg bg-gray-200" />
      </div>
    )
  }
  return (
    <main className="w-full min-h-full flex items-center justify-center py-10">
      <SignIn />
    </main>
  );
}
