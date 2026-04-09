"use client";
import React from "react";
import { Search, User, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import HeaderBottom from "./header-bottom";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";

const Header = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);

  return (
    <header className="bg-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Brand */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-gray-700"
            >
              Eshop
            </Link>
          </div>

          {/* Middle: Search */}
          <div className="flex-1 mx-4">
            <div className="relative text-gray-600">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search products..."
                className="block w-full bg-gray-100 text-gray-900 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right: Profile, Wishlist, Cart */}
          <div className="flex items-center space-x-6">
            {!isLoading && user ? (
              <Link
                href="/profile"
                className="flex items-center space-x-2 hover:text-gray-700"
              >
                <User size={20} />
                <span className="hidden sm:inline text-gray-900">
                  Hello,{" "}
                  <span className="font-semibold">
                    {user?.name?.split(" ")[0]}
                  </span>
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 hover:text-gray-700"
              >
                <User size={20} />
                <span className="hidden sm:inline text-gray-900">
                  Hello{" "}
                  <span className="font-semibold">
                    {isLoading ? "..." : "Sign In"}
                  </span>
                </span>
              </Link>
            )}

            {/* Wishlist */}
            <Link href="/wishlist" className="relative hover:text-gray-700">
              <Heart size={20} />

              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {wishlist?.length}
              </span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative hover:text-gray-700">
              <ShoppingCart size={20} />

              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cart?.length}
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-[#99999938]" />
      <HeaderBottom />
    </header>
  );
};

export default Header;
