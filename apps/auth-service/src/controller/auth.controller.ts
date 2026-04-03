import { NextFunction, Request, Response } from "express";
import {
  checkOtpRestrictions,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
//Register a new user

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exist with this email!"));
    }

    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res
      .status(200)
      .json({ mesage: "OTP sent to email. Please verify your account." });
  } catch (error) {
    return next(error);
  }
};

//verify user
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      throw new ValidationError("Missing required fields!");
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError("User already exist with this email!"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(String(password), 10);
    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    res
      .status(201)
      .json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    return next(error);
  }
};

//login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Missing required fields!");
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new AuthError("Invalid email or password!");
    }

    //checking password is correct or not
    const isPasswordValid = await bcrypt.compare(
      String(password),
      user.password!,
    );
    if (!isPasswordValid) {
      throw new AuthError("Invalid email or password!");
    }

    //Generate access and refresh tokrn

    const accessToken = jwt.sign(
      { id: user.id, role: user },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: user },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" },
    );

    //store the tokens in cokies
    setCookie(res, "accessToken", accessToken);
    setCookie(res, "refreshToken", refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
};

//user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await handleForgotPassword(req, res, next, "user");
};

//vverify otp for forgot password
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

//Reset user password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      throw new ValidationError("Email and new password are required!");
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      throw new ValidationError("No account found with this email!");
    }

    // compare new password with old password
    const isSamePassword = await bcrypt.compare(
      String(newPassword),
      user.password!,
    );
    if (isSamePassword) {
      throw new ValidationError(
        "New password must be different from old password!",
      );
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    return next(error);
  }
};
