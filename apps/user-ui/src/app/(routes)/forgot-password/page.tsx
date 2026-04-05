"use client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import React, { useRef, useState } from "react";
import { set, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

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

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`,
        { email },
      );
      return response.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep("otp");
      setServerError(null);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to send OTP. Please try again.";
      setServerError(errorMessage);
    },
  });

  const resendOtp = () => {
    if (userEmail) {
      requestOtpMutation.mutate({ email: userEmail });
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    }
  };

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`,
        { email: userEmail, otp: otp.join("") },
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to verify OTP. Please try again.";
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-password-user`,
        { email: userEmail, newPassword: password },
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("email");
      toast.success(
        "Password reset successful! Please login with your new password.",
      );
      setServerError(null);
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to reset password. Please try again.";
      setServerError(errorMessage);
    },
  });

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

  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };

  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        {step === "email" && (
          <>
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Forgot Password
            </h2>

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-4">
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
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={requestOtpMutation.isPending}
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
              >
                {requestOtpMutation.isPending ? "Sending OTP..." : "Submit"}
              </button>

              {/* Server error */}
              {serverError && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {serverError}
                </p>
              )}
            </form>
          </>
        )}

        {step === "otp" && (
          <>
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
                  onClick={() => verifyOtpMutation.mutate()}
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
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
                    Resend OTP in <span className="font-medium">{timer}s</span>
                  </p>
                )}
                {verifyOtpMutation?.isError &&
                  verifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2 text-center">
                      {(
                        verifyOtpMutation.error.response?.data as {
                          message?: string;
                        }
                      )?.message || "OTP verification failed"}
                    </p>
                  )}
              </div>
            </div>
          </>
        )}

        {step === "reset" && (
          <>
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Reset Password
            </h2>
            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300" />
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmitPassword)}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
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
                  placeholder="New Password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
              >
                {resetPasswordMutation.isPending
                  ? "Resetting Password..."
                  : "Reset Password"}
              </button>

              {/* Server error */}
              {serverError && (
                <p className="text-red-500 text-sm mt-2 text-center">
                  {serverError}
                </p>
              )}
            </form>
          </>
        )}
        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Go back to?{" "}
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

export default ForgotPassword;
