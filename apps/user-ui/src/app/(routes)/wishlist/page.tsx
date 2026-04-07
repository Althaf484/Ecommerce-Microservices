"use client ";
import React from "react";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import Link from "next/link";
const WishlistPage = () => {
  const { user } = useUser();
//   const location = useLocationTracking();
//   const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);

  return (
    <div className="w-full bg-white">
      <div className="md:w-[80%] w-[95%] mx-auto min-h-screen">
        {/* Breadcrumb */}
        <div className="pb-[50px]">
          <h1 className="md:pt-[50px] font-[500] text-[44px] leading-[1] mb-[16px] font-jost">
            Wishlist
          </h1>
          <Link href="/" className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">Wishlist</span>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
