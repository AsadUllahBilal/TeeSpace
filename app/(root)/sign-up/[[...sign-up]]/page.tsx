"use client";

import { SignUp } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { isLoaded } = useUser();

  if(!isLoaded) {
    return (
      <div className="w-full min-h-full flex items-center justify-center  PUT /api/users/user_326CDrJeDvw4HFCnqm0xLy70Qua 200 in 1401ms
 GET /profile 200 in 659ms">
        <Skeleton className="w-[400px] h-[500px] rounded-lg bg-gray-200" />
      </div>
    )
  }
  return (
    <main className="w-full min-h-full flex items-center justify-center py-10">
      <SignUp />
    </main>
  );
}
