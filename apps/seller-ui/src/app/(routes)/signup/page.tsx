"use client";
import { useMutation } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { countries } from "apps/seller-ui/src/utils/countries";
import { CreateShop } from "apps/seller-ui/src/shared/modules/auth/create-shop";
import { FaStripe } from "react-icons/fa";

const Signup = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(0);
  const [sellerId, setSellerId] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/seller-registration`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-seller`,
        {
          ...sellerData,
          otp: otp.join(""),
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
  });

  const onSubmit = (data: any) => {
    signupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Only allow numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
    setCanResend(false);
    setTimer(60);
    startResendTimer();
  };

  const handleOtpSubmit = () => {
    verifyOtpMutation.mutate();
  };

  const connectStripe = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`,
        { sellerId },
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Stripe Connection Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((step, index) => (
            <React.Fragment key={step}>
              {/* Step Circle */}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  activeStep >= step
                    ? "bg-black text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step}
              </div>

              {/* Connector Line */}
              {index < 2 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    activeStep > step ? "bg-black" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-center gap-12 text-xs text-gray-600 mb-4">
          <span>Create Account</span>
          <span>Setup Shop</span>
          <span>Connect Bank</span>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <hr className="flex-grow border-gray-300" />
        </div>

        {activeStep === 1 && (
          <>
            <h3 className="text-2xl font-semibold text-center mb-4">
              Create Account
            </h3>
            {showOtp ? (
              <div className="space-y-4">
                {/* OTP Inputs */}
                <div>
                  <label className="block text-sm text-center font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>

                  <div className="flex items-center justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                      />
                    ))}
                  </div>
                </div>

                {/* OTP Submit & Resend */}
                <div className="flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    disabled={verifyOtpMutation.isPending}
                    onClick={handleOtpSubmit}
                    className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
                  >
                    {verifyOtpMutation.isPending
                      ? "Verifying..."
                      : "Verify OTP"}
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={resendOtp}
                      className="text-blue-600 font-medium hover:underline text-sm"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Resend OTP in{" "}
                      <span className="font-medium">{timer}s</span>
                    </p>
                  )}
                  {verifyOtpMutation?.isError &&
                    verifyOtpMutation.error instanceof AxiosError && (
                      <p className="text-red-500 text-sm mt-2 text-center">
                        {verifyOtpMutation.error.response?.data?.message ||
                          "OTP verification failed"}
                      </p>
                    )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Your Name"
                  />
                  {errors.name?.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message as string}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email?.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register("phone_number", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^\d{10,15}$/,
                        message: "Invalid phone number",
                      },
                      minLength: {
                        value: 10,
                        message: "Phone number must be at least 10 digits",
                      },
                      maxLength: {
                        value: 15,
                        message: "Phone number must be at most 15 digits",
                      },
                    })}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone_number ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="677599975788"
                  />
                  {errors.phone_number?.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone_number.message as string}
                    </p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    {...register("country", {
                      required: "Country is required",
                    })}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.country ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country?.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country.message as string}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="********"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password?.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>

                {/* Signup button */}
                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
                >
                  {signupMutation.isPending ? "Signing up..." : "Sign up"}
                </button>

                {signupMutation?.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      {signupMutation.error.response?.data?.message ||
                        "Signup failed"}
                    </p>
                  )}
              </form>
            )}
          </>
        )}

        {activeStep === 2 && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}

        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Withdraw Method</h3>
            <br />
            <button
              onClick={connectStripe}
              className="w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg"
            >
              <FaStripe className="text-xl" />
              Connect Stripe
            </button>
          </div>
        )}

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
