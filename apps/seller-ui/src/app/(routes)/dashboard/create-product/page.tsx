"use client";
import ImagePlaceHolder from "apps/seller-ui/src/shared/components/image-placeholder";
import { ChevronRightIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const page = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([]);
  const [loading, setloading] = useState(false);

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }
    setImages(updatedImages);
    setValue("images", updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      return updatedImages;
    });
    setValue("images", images);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    >
      {/* Heading and Breadcrumbs */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="flex text-[#80deea] cursor-pointer">Dashboard</span>
        <ChevronRightIcon size={20} className="opacity-[.8]" />
        <span>Create Product</span>
      </div>

      {/* Content Layout */}
      <div className="py-2 w-full flex gap-6">
        {/* Left Side - Image upload section */}
        <div className="md:w-[35%]">
          {images?.length >= 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              index={0}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {images.slice(0).map((_, index) => (
            
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              key={index}
              small
              index={index + 1}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3"></div>
    </form>
  );
};

export default page;
