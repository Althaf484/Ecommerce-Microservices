import { useMutation } from "@tanstack/react-query";
import { shopCategories } from "apps/seller-ui/src/utils/categories";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";

export const CreateShop = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const shopCreateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`,
        data,
        { withCredentials: true },
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
  });

  const onSubmit = async (data: any) => {
    const shopData = {
      ...data,
      sellerId,
    };
    shopCreateMutation.mutate(shopData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h3 className="text-2xl font-semibold text-center mb-4">
          Setup new shop
        </h3>

        <label className="block text-gray-700 mb-1">Name *</label>
        <input
          type="text"
          placeholder="shop name"
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          {...register("name", { required: "Shop name is required" })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.name.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">
          Bio (Max 100 characters) *
        </label>
        <textarea
          placeholder="shop bio"
          rows={3}
          className={`w-full border rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.bio ? "border-red-500" : "border-gray-300"
          }`}
          {...register("bio", {
            required: "Shop bio is required",
            validate: (value) =>
              (value.trim() !== "" && value.trim().length <= 100) ||
              "Shop bio must be between 1 and 100 characters long",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.bio.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Address *</label>
        <input
          type="text"
          placeholder="shop address"
          className={`w-full border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
          {...register("address", { required: "Shop address is required" })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.address.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Opening Hours *</label>
        <input
          type="text"
          placeholder="e.g. 9:00 AM - 9:00 PM"
          className={`w-full border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.opening_hours ? "border-red-500" : "border-gray-300"
          }`}
          {...register("opening_hours", {
            required: "Opening hours are required",
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.opening_hours.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Website</label>
        <input
          type="text"
          placeholder="shop website"
          className={`w-full border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.website ? "border-red-500" : "border-gray-300"
          }`}
          {...register("website", {
            pattern: {
              value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*\/?$/,
              message: "Please enter a valid URL",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.website.message)}
          </p>
        )}

        <label className="block text-gray-700 mb-1">Category *</label>
        <select
          className={`w-full border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.category ? "border-red-500" : "border-gray-300"
          }`}
          {...register("category", { required: "Shop category is required" })}
        >
          <option value="">Select a category</option>
          {shopCategories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mb-2">
            {String(errors.category.message)}
          </p>
        )}

        <button
          type="submit"
          className="w-full text-lg bg-blue-600 text-white py-2 rounded-lg mt-4"
        >
          Create
        </button>
      </form>
    </div>
  );
};
