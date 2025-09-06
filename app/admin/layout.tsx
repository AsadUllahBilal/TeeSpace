import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/admin/AppSidebar";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongo";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce admin-only access
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  await connectDB();
  const dbUser = await User.findOne({ clerkId: userId }).lean();
  if (!dbUser || dbUser.role !== "admin") {
    redirect("/");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
     <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <Header/>
          {children}
        </SidebarInset>
      </SidebarProvider>
  );
}