"use client";

import PageBanner from "@/components/PageBanner";
import React from "react";
import { Heading } from "@/components/ui/heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CountrySelectorPage from "@/components/country-selector-page";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useCartStore } from "@/lib/cartStore";
import { Button } from "@/components/ui/button";

// Local types not needed; country/state selection handled by child component

// Remove incorrect type used as value; component fetches its own data

const CheckoutPage = () => {
  const { user } = useUser();
  const { cart, cartCount, cartTotal, clearCart } = useCartStore();
  const [form, setForm] = useState({
    fullName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    phoneNumber: "",
    email: "",
    country: "",
    state: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form, value: string) => setForm((s) => ({ ...s, [field]: value }));

  const placeOrder = async () => {
    if (!user) return alert("Please sign in to place an order.");
    if (cart.length === 0) return alert("Your cart is empty.");
    setSubmitting(true);
    try {
      const items = cart.map((c) => ({
        productId: c.id,
        title: c.title,
        price: c.price,
        quantity: c.quantity,
        image: c.images?.[0],
      }));
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items,
          subtotal: cartTotal,
          total: cartTotal,
        })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to place order');
      }
      clearCart();
      alert('Order placed successfully');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to place order';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="w-full min-h-full">
      <PageBanner bannerName="Checkout" />
      <div className="w-full min-h-full order-br:p-10 p-2 flex order-br:flex-nowrap flex-wrap items-start gap-4">
        <Card className="order-br:w-1/2 w-full min-h-full">
          <CardHeader>
            <Heading as="h4">Billing Details</Heading>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                required
                className="mt-2"
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                required
                className="mt-2"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <CountrySelectorPage
                showTitle={false}
                onCountryChange={(code) => update('country', code)}
                onStateChange={(code) => update('state', code)}
              />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Label htmlFor="streetAddress">Street Address *</Label>
              <Textarea
                id="streetAddress"
                name="streetAddress"
                placeholder="Enter your Street address"
                required
                className="mt-2"
                value={form.streetAddress}
                onChange={(e) => update('streetAddress', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Label htmlFor="town/city">Town/City *</Label>
              <Input
                id="town/city"
                name="town/city"
                placeholder="Enter your Town/City"
                required
                className="mt-2"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Label htmlFor="postalCode/ZIP">PostalCode/ZIP *</Label>
              <Input
                id="postalCode/ZIP"
                name="postalCode/ZIP"
                placeholder="Enter your postalCode/ZIP"
                type="number"
                required
                className="mt-2"
                value={form.postalCode}
                onChange={(e) => update('postalCode', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Label htmlFor="phonenumber">Phone Number *</Label>
              <Input
                id="phonenumber"
                name="phonenumber"
                placeholder="Enter your phonenumber"
                required
                type="number"
                className="mt-2"
                value={form.phoneNumber}
                onChange={(e) => update('phoneNumber', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Label htmlFor="emailAddress">Email Address *</Label>
              <Input
                id="emailAddress"
                name="emailAddress"
                placeholder="Enter your emailAddress"
                required
                type="email"
                className="mt-2"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <div className="order-br:w-1/2 w-full min-h-full">
          <Heading as="h4" className="mb-3">
            Your Order
          </Heading>
          <div className="w-full min-h-full bg-gray-300 rounded-lg p-4">
            <div className="w-full min-h-full bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="text-[17px] font-bold">Product</h4>
                <h4 className="text-[17px] font-bold">Subtotal</h4>
              </div>
              <hr className="my-2" />
              <div className="flex items-center justify-between my-4">
                {cart.map((c) => (
                  <div
                    key={c.id}
                    className="w-full flex items-center justify-between"
                  >
                    <h4 className="text-[16px] font-medium text-gray-400 flex items-center justify-center gap-2">
                      {c.title}
                      <span className="text-black">x {cartCount}</span>
                    </h4>
                    <p className="text-black font-medium">
                      ${c.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <hr className="my-2" />
              <div className="w-full flex items-center justify-between my-4">
                <h4 className="text-[18px] font-medium">SubTotal</h4>
                <p className="text-black font-medium">
                  ${cartTotal.toFixed(2)}
                </p>
              </div>
              <hr className="my-2" />
              <div className="w-full flex items-center justify-between my-4">
                <h4 className="text-[18px] font-bold">Total</h4>
                <p className="text-black font-bold">${cartTotal.toFixed(2)}</p>
              </div>
              <hr className="my-2" />
              <Button
                variant={"myOwnBtn"}
                className="w-full bg-[#2EBB77] text-white hover:bg-[#25925d] transition-all duration-300 cursor-pointer mt-3"
                size={"lg"}
                disabled={submitting}
                onClick={placeOrder}
              >
                {submitting ? 'Placing order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
