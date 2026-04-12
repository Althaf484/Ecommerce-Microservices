"use client";

import { Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white">E-Shop</h2>
          <p className="mt-3 text-sm text-gray-400">
            Your one-stop destination for premium products. Fast delivery, best
            prices, and quality guaranteed.
          </p>

          <div className="flex gap-4 mt-5">
            <FaFacebook className="cursor-pointer hover:text-white" />
            <FaInstagram className="cursor-pointer hover:text-white" />
            <FaTwitter className="cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">All Products</li>
            <li className="hover:text-white cursor-pointer">New Arrivals</li>
            <li className="hover:text-white cursor-pointer">Best Sellers</li>
            <li className="hover:text-white cursor-pointer">Discounts</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Contact Us</li>
            <li className="hover:text-white cursor-pointer">FAQs</li>
            <li className="hover:text-white cursor-pointer">Shipping</li>
            <li className="hover:text-white cursor-pointer">Returns</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
          <p className="text-sm text-gray-400 mb-3">
            Subscribe to get latest offers & updates.
          </p>

          <div className="flex items-center bg-gray-900 rounded-lg overflow-hidden">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent px-3 py-2 w-full text-sm outline-none"
            />
            <button className="bg-white text-black px-4 py-2 text-sm font-medium hover:bg-gray-200 flex items-center gap-1">
              <Mail size={16} />
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} E-Shop. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
