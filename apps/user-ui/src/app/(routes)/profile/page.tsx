"use client";
import useUser from "apps/user-ui/src/hooks/useUser";
import { Loader2 } from "lucide-react";
import React from "react";

const page = () => {
  const { user, isLoading } = useUser();
  return (
    <div className="bg-gray-50 p-6 pb-14">
      <div className="max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            <span className="text-blue-600">
              {isLoading ? (
                <Loader2 className="inline animate-spin w-5 h-5" />
              ) : (
                `${user?.email || "User"}`
              )}
            </span>{" "}
            👋
          </h1>
        </div>

        {/* Profile Overview Grid */}
        <div  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"></div>
      </div>
    </div>
  );
};

export default page;
