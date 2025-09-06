"use client";

import { IProduct, IReview } from "@/types";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { Heading } from "./ui/heading";
import { Button } from "./ui/button";
import { Minus, Plus, Loader2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import StarRating from "./StarRating";
import { useCartStore } from "@/lib/cartStore";
import { useUser } from "@clerk/nextjs";
import { ToastContainer, toast, Bounce } from "react-toastify";

const ProductDetails = ({ product }: { product: IProduct }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isClickOnCart, setIsClickOnCart] = useState(true);
  const { user } = useUser();

  // Cart store
  const { addToCart, removeFromCart } = useCartStore();

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    reviewerName: "",
    rating: 0,
    comment: "",
  });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/review?productId=${product._id}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.data);
      } else {
        setError("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  }, [product._id]);

  // Fetch reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    if (!user) {
      toast.error("Please Login to add Review.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } else {
      e.preventDefault();

      if (!reviewForm.reviewerName.trim()) {
        setError("Please enter your name");
        return;
      }

      if (reviewForm.rating === 0) {
        setError("Please select a rating");
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        const response = await fetch("/api/review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product._id,
            reviewerName: reviewForm.reviewerName,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setSuccess("Review submitted successfully!");
          setReviewForm({ reviewerName: "", rating: 0, comment: "" });
          // Refresh reviews
          await fetchReviews();
          // Clear success message after 3 seconds
          setTimeout(() => setSuccess(""), 3000);
        } else {
          setError(data.error || "Failed to submit review");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        setError("Failed to submit review");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm((prev) => ({ ...prev, rating }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please Login to add Product to cart.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } else {
      addToCart({
        id: product._id,
        title: product.title,
        price: product.price,
        images: product.images,
        stockQuantity: product.stockQuantity,
        description: product.description,
      });
      setSuccess("Product added to cart!");
      setIsClickOnCart(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleRemoveFromCart = () => {
    removeFromCart(product._id);
    setIsClickOnCart(true);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="w-full min-h-full">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <div className="w-full flex lg:flex-row flex-col">
        <div className="lg:w-1/2 w-full min-h-[50vh] flex lg:flex-row flex-col-reverse gap-4">
          <div className="flex lg:flex-col flex-row items-center flex-wrap gap-4">
            {product.images.map((img: string, i: number) => (
              <Image
                key={i}
                src={img}
                alt={`ProductImage ${i + 1}`}
                className={`object-cover rounded cursor-pointer ${
                  activeIndex === i
                    ? "border-[1px] border-black"
                    : "border-none"
                }`}
                width={100}
                height={132}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
          <Image
            src={product.images[activeIndex]}
            alt={`ProductImage ${activeIndex}`}
            width={445}
            height={590}
            className="object-cover w-full h-[500px] rounded"
          />
        </div>
        <div className="lg:w-1/2 w-full lg:mt-0 mt-4 min-h-[50vh] flex flex-col gap-4 pl-3">
          <Heading as="h3">${product.price}</Heading>
          <Heading as="h3">{product.title}</Heading>
          <p className="text-gray-400">{product.description}</p>
          <Heading as="h4">Colors</Heading>
          <div className="flex items-center flex-wrap gap-2">
            {product.colors.map((c, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-[1px] border-gray-400"
                style={{ background: c }}
              />
            ))}
          </div>
          <Heading as="h4">Sizes</Heading>
          <div className="flex items-center flex-wrap gap-1">
            {product.sizes.map((s, i) => (
              <Button variant={"secondary"} className="cursor-pointer" key={i}>
                {s}
              </Button>
            ))}
          </div>
          <div className="w-full flex items-center justify-center gap-2">
            <div className="w-[30%] grid grid-cols-3 bg-gray-100 rounded-md">
              <Button
                size={"lg"}
                className="bg-transparent font-bold text-gray-400 hover:text-black transition-all duration-300 shadow-none cursor-pointer w-full"
                variant={"secondary"}
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stockQuantity}
              >
                <Plus size={20} />
              </Button>
              <Button
                size={"lg"}
                className="bg-transparent font-bold w-full text-black shadow-none cursor-pointer"
                variant={"secondary"}
              >
                {quantity}
              </Button>
              <Button
                size={"lg"}
                className="bg-transparent font-bold w-full text-gray-400 hover:text-black transition-all duration-300 shadow-none cursor-pointer"
                variant={"secondary"}
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </Button>
            </div>
            {isClickOnCart == true ? (
              <Button
                variant={"myOwnBtn"}
                className="w-[70%] cursor-pointer bg-[#2EBB77]"
                size={"lg"}
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
              >
                {product.stockQuantity === 0 ? "Out of Stock" : "Add To Cart"}
              </Button>
            ) : (
              <Button
                variant={"myOwnBtn"}
                className="w-[430px] cursor-pointer bg-[#2EBB77]"
                size={"lg"}
                onClick={handleRemoveFromCart}
                disabled={product.stockQuantity === 0}
              >
                Remove From Cart
              </Button>
            )}
          </div>
          {success && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div>
            <p className="mt-8 font-medium">
              Categories:{" "}
              <span className="text-gray-400">
                {typeof product.category === "object"
                  ? product.category?.name
                  : "N/A"}
              </span>
            </p>
            <p className="font-medium">
              Quantity:{" "}
              <span className="text-gray-400">{product.stockQuantity}</span>
            </p>
            <p className="font-medium">
              Average Rating:{" "}
              <span className="text-gray-400">{product?.averageRating}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="w-full min-h-full mt-10">
        <Heading as="h4" className="text-center mb-2">
          Reviews ({reviews.length})
        </Heading>
        <hr />
        <div className="w-full flex items-center justify-center">
          <div className="w-[800px] min-h-[10vh]">
            {/* Display Reviews */}
            <div className="mt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading reviews...</span>
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review._id}
                    className="w-full flex items-center justify-between mt-6 p-4 border rounded-lg"
                  >
                    <div className="flex gap-6">
                      <div className="w-[60px] h-[60px] bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {review.reviewerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <Heading as="h4" className="text-lg">
                          {review.reviewerName}
                        </Heading>
                        <p className="text-gray-400 mt-2">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size={20} />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              )}
            </div>

            <hr className="mt-8" />

            {/* Add Review Form */}
            <div className="w-full mt-8 flex flex-col items-start">
              <Heading as="h4">Add a Review</Heading>

              {error && (
                <Alert variant="destructive" className="mt-4 w-full">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4 w-full border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <form
                onSubmit={handleSubmitReview}
                className="w-full mt-4 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Name *
                  </label>
                  <Input
                    name="reviewerName"
                    value={reviewForm.reviewerName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Rating *
                  </label>
                  <StarRating
                    rating={reviewForm.rating}
                    onRatingChange={handleRatingChange}
                    interactive={true}
                    size={24}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Review
                  </label>
                  <Textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleInputChange}
                    placeholder="Share your thoughts about this product..."
                    className="w-full"
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  variant={"myOwnBtn"}
                  className="bg-[#2EBB77] cursor-pointer mt-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
