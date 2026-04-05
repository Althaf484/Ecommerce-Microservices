"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Heart,
  ShoppingCart,
  ChevronDown,
  AlignLeft,
} from "lucide-react";
import { navItems } from "../../../configs/constants";
import useUser from "apps/user-ui/src/hooks/useUser";

const HeaderBottom = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const { user, isLoading } = useUser();

  console.log("Logged in user in header:", user);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`w-full bg-white shadow-md transition-all z-50 ${
        isSticky ? "fixed top-0 left-0" : "relative"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded"
            >
              <AlignLeft size={20} />
              <span>All Departments</span>
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <div className="absolute mt-2 w-48 bg-white border rounded shadow-lg">
                <ul>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Electronics
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Fashion
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Home & Garden
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Sports
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    Books
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="hover:text-gray-700 font-medium"
              >
                {item.title}
              </Link>
            ))}
          </div>

          {/* Right: Profile, Wishlist, Cart */}
          {isSticky && (
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
                  0
                </span>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative hover:text-gray-700">
                <ShoppingCart size={20} />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  9
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
