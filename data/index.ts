import mixMatch from "@/data/mix-and-match-1.png";
import shipping from "@/data/shipping-1.png";
import topQuality from "@/data/top-quality-1.png";
import { Heading } from "@/components/ui/heading";
import { Shirt, AlignJustify, Layers, Cloud, Globe, Undo2, Headset, BadgeDollarSign } from "lucide-react";

export const infoData = [
  {
    title: "Top Quality",
    des: "Printed on 100% quality cotton for a vibrant finish and all-day comfort.",
    image: topQuality,
  },
  {
    title: "Mix and match",
    des: "Make stunning designs with beginner-friendly design tools and assets",
    image: mixMatch,
  },
  {
    title: "Shipping worldwide",
    des: "Order prints and get them delivered fast, free, and in recycled packaging.",
    image: shipping,
  },
];

export const styleData = [
  {
    title: "T-shirt",
    description:
      "Classic and versatile everyday wear, comfortable for casual outings or layering.",
    icon: Shirt,
  },
  {
    title: "Long-sleeves",
    description:
      "Lightweight coverage for cooler days, offering both comfort and style.",
    icon: AlignJustify,
  },
  {
    title: "Tanktop",
    description:
      "Breathable and perfect for workouts or warm weather, keeping it cool and simple.",
    icon: Layers,
  },
  {
    title: "Sweater",
    description:
      "Cozy and warm knitwear for chilly days, great for layering in winter.",
    icon: Cloud,
  },
];

export const products = [
  {
    id: 1,
    title: "Classic White T-Shirt",
    description: "A breathable cotton T-shirt perfect for everyday wear.",
    price: 19.99,
    category: "T-shirt",
    colors: ["white", "black", "blue"],
    sizes: ["S", "M", "L", "XL"],
    quantity: 120,
  },
  {
    id: 2,
    title: "Premium Black Hoodie",
    description: "Soft fleece hoodie with kangaroo pocket and adjustable hood.",
    price: 49.99,
    category: "Sweater",
    colors: ["black", "gray", "navy"],
    sizes: ["M", "L", "XL", "XXL"],
    quantity: 80,
  },
  {
    id: 3,
    title: "Casual Long-Sleeve Shirt",
    description:
      "Lightweight cotton long-sleeve for a casual yet stylish look.",
    price: 29.99,
    category: "Long-sleeves",
    colors: ["olive", "white", "brown"],
    sizes: ["S", "M", "L"],
    quantity: 95,
  },
  {
    id: 4,
    title: "Summer Tank Top",
    description: "Cool and comfy tank top, ideal for workouts or hot days.",
    price: 15.99,
    category: "Tanktop",
    colors: ["blue", "gray", "red"],
    sizes: ["S", "M", "L", "XL"],
    quantity: 60,
  },
  {
    id: 5,
    title: "Woolen Sweater",
    description: "Warm wool sweater perfect for winter layering.",
    price: 59.99,
    category: "Sweater",
    colors: ["beige", "green", "navy"],
    sizes: ["M", "L", "XL"],
    quantity: 40,
  },
  {
    id: 6,
    title: "Graphic Tee",
    description: "Trendy printed T-shirt with minimal graphic design.",
    price: 24.99,
    category: "T-shirt",
    colors: ["black", "white"],
    sizes: ["S", "M", "L"],
    quantity: 150,
  },
  {
    id: 7,
    title: "Denim Jacket",
    description: "Classic denim jacket with button front and pockets.",
    price: 69.99,
    category: "Jacket",
    colors: ["blue", "black"],
    sizes: ["M", "L", "XL"],
    quantity: 50,
  },
  {
    id: 8,
    title: "Polo Shirt",
    description: "Smart casual polo shirt with breathable cotton fabric.",
    price: 34.99,
    category: "Shirt",
    colors: ["white", "black", "green"],
    sizes: ["S", "M", "L", "XL"],
    quantity: 110,
  },
];

export const homeLast = [
    {
        title: "Worldwide Shipping",
        des: "Get free shipping over $65.",
        icon: Globe
    },
    {
        title: "Returns",
        des: "Within 30 days for an exchange.",
        icon: Undo2
    },
    {
        title: "Online Support",
        des: "Top notch customer service.",
        icon: Headset
    },
    {
        title: "Flexible Payment",
        des: "Pay with Multiple Credit Cards",
        icon: BadgeDollarSign
    },
]