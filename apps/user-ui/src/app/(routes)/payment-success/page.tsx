"use client";

import React, { useEffect } from "react";
import { CheckCircle, Truck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "apps/user-ui/src/store";
import confetti from "canvas-confetti";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const router = useRouter();

  // clear cart and trigger confetti
  useEffect(() => {
    if (!sessionId) {
      useStore.setState({ cart: [] });

      //Confetti burst
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
    }
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white shadow-md border border-gray-200 rounded-lg max-w-md">
        <div className="text-green-500 mb-4">
          <CheckCircle className="w-16 h-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Payment Successful
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Tank you for your purchase. Your order has been placed sucessfully!
        </p>
        <button
          onClick={() => router.push(`/profile?active=My+Orders`)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2"
        >
          <Truck className="w-4 h-4" />
          Track Order
        </button>

        <div className="mt-8 text-xs text-gray-400">
          Payment Session ID: <span className="font-mono">{sessionId}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
