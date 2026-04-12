import ProductDetails from "apps/user-ui/src/shared/modules/product/product-details";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { Metadata } from "next";
import React from "react";

async function fetchProductDetails(slug: string) {
  try {
    const response = await axiosInstance.get(
      `/product/api/get-product/${slug}`,
    );
    return response.data?.product || null;
  } catch (error) {
    console.error("Fetch product error:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }; // FIXED
}): Promise<Metadata> {
  const { slug } = await params; // FIXED (no await)

  const product = await fetchProductDetails(slug);

  return {
    title: product?.title || "Product",
    description: product?.short_description || "High quality products",
    openGraph: {
      title: product?.title || "Product",
      description: product?.short_description || "High quality products",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product?.title || "Product",
      description: product?.short_description || "High quality products",
      images: [product?.images?.[0]?.url || "/default-image.jpg"],
    },
  };
}

const page = async ({ params }: { params: { slug: string } }) => {
  const { slug } = await params; // FIXED (no await)

  const productDetails = await fetchProductDetails(slug);


  return <ProductDetails productDetails={productDetails} />
};

export default page;
