"use client";

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MyAccountSideBar from "@/components/MyAccountSideBar";
import { Skeleton } from "@/components/ui/skeleton";
import Input from "@/components/customIPT";
import PageBanner from "@/components/PageBanner";

interface UserData {
  email: string;
  username: string;
  fullName: string;
}

const ProfilePage: React.FC = () => {
  const { user, isLoaded } = useUser();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
  });
  const [originalData, setOriginalData] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const { signOut } = useClerk();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/users/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setOriginalData(data);
          setFormData({
            username: data.username,
            fullName: data.fullName,
          });
        } else {
          setError("Failed to load user data");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchUserData();
    }
  }, [user, isLoaded]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !originalData) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Update MongoDB record
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Update Clerk user if username or fullName changed
      const updates: Partial<{ username: string; firstName: string; lastName: string }> = {};

      if (formData.username !== originalData.username) {
        updates.username = formData.username;
      }

      if (formData.fullName !== originalData.fullName) {
        const nameParts = formData.fullName.trim().split(" ");
        updates.firstName = nameParts[0] || "";
        updates.lastName = nameParts.slice(1).join(" ") || "";
      }

      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }

      setSuccess("Profile updated successfully!");

      // Update original data to reflect changes
      setOriginalData((prev) => (prev ? { ...prev, ...formData } : null));

      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err: unknown) {
      console.error("Update profile error:", err);
      const message = err instanceof Error ? err.message : "Failed to update profile. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    originalData &&
    (formData.username !== originalData.username ||
      formData.fullName !== originalData.fullName);

  const handleDeleteAccount = async () => {
    if (!user) return;
    console.log("Deleting account");
    

    try {
      // Delete from MongoDB first
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Server deletes Clerk user; sign out locally and redirect
        await signOut();
        router.push("/");
      } else {
        setError("Failed to delete account");
      }
    } catch (err: unknown) {
      console.error("Delete account error:", err);
      setError("Failed to delete account");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen animate-pulse">
        <div className="w-full h-[200px] px-10 py-10">
          <Skeleton className="w-full h-[200px] bg-gray-200 rounded-xl" />
        </div>
        <div className="w-full flex items-start justify-center gap-6 px-10 py-10 mt-10">
          <Skeleton className="w-[300px] h-[400px] bg-gray-200 rounded-xl" />
          <Skeleton className="flex-1 h-[400px] bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-full">
        <PageBanner bannerName="My Account" />
        <p className="text-gray-400 my-8">Please Login to view Profile. <Link href="/sign-in"><span className="text-primary-green">Login</span></Link></p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <PageBanner bannerName="My Account" />
      <div className="w-full min-h-full px-2 py-10 first-br:px-10 first-br:py-10 flex gap-12 flex-col first-br:flex-row">
        <MyAccountSideBar />
        <Card className="w-full min-h-full border-gray-300">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {success}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                value={originalData?.email || ''}
                disabled
                helperText="Email cannot be changed. Contact support if you need to update your email."
              />

              <Input
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter your username"
                required
                disabled={saving}
                helperText="Username must be unique and contain only letters, numbers, and underscores"
              />

              <Input
                label="Full Name"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={saving}
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" variant={"myOwnBtn"} className="bg-[#2EBB77] cursor-pointer" size={"lg"}>Save Changes</Button>
                <Button type="button" variant={"destructive"} size={"lg"} className="cursor-pointer" onClick={() => handleDeleteAccount()}>Delete Account</Button>
              </div>

              {!hasChanges && originalData && (
                <p className="text-sm text-gray-500 text-center">
                  No changes detected. Modify the fields above to enable saving.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;